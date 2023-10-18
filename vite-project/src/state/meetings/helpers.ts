import { useRecoilCallback } from 'recoil';
import uniqBy from 'lodash/uniqBy';
import omit from 'lodash/omit';
import { useCallback } from 'react';
import {
  meetingClientState,
  MeetingCursor,
  meetingState,
  meetingTranscriptUpdatesState,
  recordedMeetingsRequestIdState
} from '.';
import {
  Meeting,
  MeetingCollaborator,
  MeetingSection,
  TranscriptPosition
} from '../../models/meeting';
import api from '../../api';
import { track } from '../../utils/analytics';
import { handleError } from '../../utils/errors';
import { joinTokens, stringToTokens } from '../../utils/tokens';
import { getAccessToken } from '../auth';
import {
  UpdateMeetingParams,
  ChannelShareParams
} from '../../common/api/meetings';
import { UpdateEventParams } from '../../common/api/events';
import { APIError } from '../../common';
import { tagsRequestIdState } from '../tags';
import { highlightsState } from '../highlights';
import { highlightMomentTypeState } from '../highlights/selectors';
import { v4 as uuid } from 'uuid';

export type ChannelUpdates = ChannelShareParams['changes'];

export type EventUpdates = UpdateEventParams['updates'];

export type MeetingUpdates = UpdateMeetingParams['updates'] & {
  join_permitted?: boolean;
};

// TODO: move this type somewhere common if this pattern is to be adopted
type HelperResult = [result: any, err: Error | undefined];

export type BatchMeetingUpdates = {
  id: string;
  auto_join?: boolean;
  join_permitted?: boolean;
  all_in_series?: boolean;
  meeting_series_id?: number;
}[];

const MEETING_UPDATE_KEYS = [
  'all_in_series',
  'flags',
  'upload_data',
  'sections'
];

export const useMeetingHelpers = () => {
  const destroy = useRecoilCallback(
    ({ set }) =>
      async (cursor: MeetingCursor) => {
        const [id] = cursor;
        const token = await getAccessToken();

        try {
          await api.meetings.deleteMeeting(token, { id });

          set(meetingClientState(cursor), (meeting) => ({
            ...meeting,
            deleted_at: new Date().toISOString()
          }));

          // Trigger refresh of recording/pagination data
          set(recordedMeetingsRequestIdState, (id) => id + 1);
        } catch (err: any) {
          handleError(err);
        }
      },
    []
  );

  const update = useRecoilCallback(
    ({ set, snapshot }) =>
      async (
        cursor: MeetingCursor,
        updates: MeetingUpdates,
        optimistic = true
      ) => {
        const [id] = cursor;
        const token = await getAccessToken();
        const meeting = await snapshot.getPromise(meetingState(cursor));

        if (optimistic) {
          set(meetingClientState(cursor), {
            ...meeting,
            ...(omit(updates, MEETING_UPDATE_KEYS) as Partial<Meeting>)
          });
        }

        try {
          const { meeting: result } = await api.meetings.updateMeeting(token, {
            id,
            updates,
            include: 'web'
          });

          set(meetingClientState(cursor), (meeting) => ({
            ...meeting,
            ...result
          }));

          // Reset the updated sections when we update the meeting, as the updated sections will be stored against
          // the meeting already.
          set(meetingTranscriptUpdatesState(meeting.updates_channel), {
            sections: [],
            interim_transcript: undefined
          });

          track('meeting.updated', {
            meetingId: result.encoded_id,
            status: result.status,
            properties: Object.keys(updates)
          });
        } catch (err: any) {
          handleError(err);
          return Promise.reject(err);
        }
      },
    []
  );

  const filterSections = useRecoilCallback(
    ({ set }) =>
      async (cursor: MeetingCursor, include?: string) => {
        const [id] = cursor;
        const token = await getAccessToken();

        try {
          const { sections } = await api.meetings.fetchMeetingSections(token, {
            id,
            include
          });

          set(meetingClientState(cursor), (meeting) => ({
            ...meeting,
            sections
          }));
        } catch (err: any) {
          handleError(err);
        }
      },
    []
  );

  const hangup = useRecoilCallback(
    ({ snapshot, set }) =>
      async (cursor: MeetingCursor) => {
        const [id] = cursor;
        const token = await getAccessToken();
        const meeting = await snapshot.getPromise(meetingState(cursor));

        set(
          meetingClientState(cursor),
          (meeting) => ({ ...meeting, status: 'stopping' } as Meeting)
        );

        try {
          await api.meetings.hangupMeeting(token, { id });

          track('meeting.pinch.removed', {
            meetingId: meeting.encoded_id,
            duration: meeting.duration,
            provider: meeting.provider,
            attendeeCount: (meeting.attendees || []).length
          });
        } catch (err: any) {
          handleError(err);
        }
      },
    []
  );

  const setTags = useRecoilCallback(
    ({ set }) =>
      async (cursor: MeetingCursor, tags: string[]) => {
        const [meetingId] = cursor;
        const token = await getAccessToken();

        // Set the tags immediately.
        set(meetingClientState(cursor), (meeting) => ({
          ...meeting,
          tags
        }));

        try {
          const { meeting: result } = await api.meetings.updateMeetingTags(
            token,
            { id: meetingId, tags }
          );

          set(tagsRequestIdState, (id) => id + 1);

          set(meetingClientState(cursor), (meeting) => ({
            ...meeting,
            ...result
          }));
          track('meeting.setTags', {
            meetingId
          });
        } catch (err: any) {
          handleError(err);
        }
      },
    []
  );

  const startRecording = useRecoilCallback(
    () => async (cursor: MeetingCursor) => {
      const [meetingId] = cursor;
      const token = await getAccessToken();

      try {
        await api.meetings.startRecording(token, { id: meetingId });
      } catch (err: any) {
        handleError(err);
      }
    }
  );

  const setAutoJoin = useRecoilCallback(
    ({ set }) =>
      async (
        cursor: MeetingCursor,
        join: boolean,
        allInSeries: boolean,
        origin?: string
      ) => {
        const token = await getAccessToken();
        const [meetingId] = cursor;

        set(meetingClientState(cursor), (meeting) => ({
          ...meeting,
          auto_join: join,
          join_permitted: join
        }));

        track('meeting.join.toggled', {
          meetingId,
          join,
          allInSeries,
          origin
        });

        try {
          await api.meetings.updateMeetingJoin(token, {
            id: meetingId,
            autoJoin: join,
            allInSeries
          });
        } catch (err: any) {
          handleError(err);
        }
      },
    []
  );

  const labelSpeaker = useRecoilCallback(
    ({ set, snapshot }) =>
      async (
        cursor: MeetingCursor,
        index: number,
        startTime: number,
        endTime: number,
        displayName: string,
        email?: string
      ) => {
        const meeting = await snapshot.getPromise(meetingState(cursor));
        const speaker = {
          speaker_label: `${index}`,
          start_time: `${startTime}`,
          end_time: `${endTime}`,
          display_name: displayName,
          email
        };

        set(meetingClientState(cursor), {
          ...meeting,
          speakers: [
            { speaker_label: `${index}`, display_name: displayName, email },
            ...(meeting.speakers || [])
          ]
        });

        return update(cursor, { speakers: [speaker] }, false);
      },
    []
  );

  const realignTranscript = useRecoilCallback(
    ({ set, snapshot }) =>
      async (
        cursor: MeetingCursor,
        positions: TranscriptPosition[],
        replacement: string
      ) => {
        const meeting = await snapshot.getPromise(meetingState(cursor));
        const { sections } = meeting;

        const updatePositions = positions.reduce((acc, position) => {
          const { start, end } = position;
          const { section } = end;
          const positionTokens = { s: start.token, e: end.token };

          if (!acc[`${section}`]) {
            acc[`${section}`] = [];
          }
          acc[`${section}`].push(positionTokens);

          return acc;
        }, <{ [key: string]: { s: number; e: number }[] }>{});

        const replacementAsTokens = stringToTokens(replacement);

        // For each section that has updates, replace the token range with the
        // replacement and realign the timings
        const updatedSections = Object.keys(updatePositions).reduce(
          (acc, id: any) => {
            if (!sections || !sections[id]) {
              return acc;
            }

            const section = sections[id];
            const { tokens } = section;
            const updatedTokens = [...tokens];

            updatePositions[id].forEach(({ s, e }) => {
              if (!tokens[s]) {
                return;
              }

              const startTime = tokens[s].s_t;
              const endTime = tokens[e].e_t;
              const adjustment = Math.floor(
                (endTime - startTime) / replacementAsTokens.length
              );

              const readjustedTokens = replacementAsTokens.map(
                (token, index) => {
                  return {
                    ...token,
                    s_t:
                      index === 0
                        ? startTime
                        : startTime + token.s_t * adjustment,
                    e_t:
                      index === replacementAsTokens.length - 1
                        ? endTime
                        : endTime + token.e_t * adjustment,
                    m:
                      index === replacementAsTokens.length - 1 && tokens[e].m
                        ? true
                        : token.m
                  };
                }
              );

              updatedTokens.splice(s, e - s + 1, ...readjustedTokens);
            });

            acc[id] = {
              ...section,
              tokens: updatedTokens,
              transcript: joinTokens(updatedTokens)
            };
            return acc;
          },
          <{ [key: number]: MeetingSection }>{}
        );

        set(meetingClientState(cursor), {
          ...meeting,
          sections: (sections || []).map((section, index) => {
            return updatedSections[index] ? updatedSections[index] : section;
          })
        });

        return update(
          cursor,
          {
            sections: Object.keys(updatedSections).reduce((acc, id: any) => {
              acc[`${id}`] = updatedSections[id].transcript;
              return acc;
            }, <{ [key: string]: string }>{})
          },
          false
        );
      },
    []
  );

  const createCollaborators = useRecoilCallback(
    ({ set, snapshot }) =>
      async (
        cursor: MeetingCursor,
        collaborators: Partial<MeetingCollaborator>[],
        comment: string,
        role?: string
      ): Promise<HelperResult> => {
        const [id] = cursor;
        const token = await getAccessToken();
        const meeting = await snapshot.getPromise(meetingState(cursor));
        const emails = collaborators.map(({ email }) => email!);

        set(meetingClientState(cursor), {
          ...meeting,
          collaborators: uniqBy(
            [
              ...(meeting.collaborators || []),
              ...collaborators.map(
                (collaborator) =>
                  ({
                    ...collaborator,

                    primary_role: role
                  } as MeetingCollaborator)
              )
            ],
            'email'
          )
        });

        try {
          const result = await api.meetings.createCollaborators(token, {
            id,
            emails,
            comment,
            role
          });

          const resultsByEmail = result.reduce(
            (
              result: Record<string, MeetingCollaborator>,
              collaborator: MeetingCollaborator
            ) => ({
              ...result,

              [collaborator.email!]: collaborator
            }),
            {}
          );

          set(meetingClientState(cursor), (meeting) => ({
            ...meeting,

            collaborators: (meeting.collaborators || []).map(
              (collaborator) => ({
                ...collaborator,
                ...resultsByEmail[collaborator.email!]
              })
            )
          }));

          return [result, undefined];
        } catch (err: any) {
          // Revert the above state change on fail
          set(meetingClientState(cursor), {
            ...meeting,
            collaborators: (meeting.collaborators || []).filter(
              (other) => !other.id || !emails.includes(other.id)
            )
          });

          return [undefined, err];
        }
      },
    []
  );

  const updateCollaborator = useRecoilCallback(
    ({ set, snapshot }) =>
      async (
        cursor: MeetingCursor,
        collaboratorId: string,
        updates: Partial<MeetingCollaborator>
      ) => {
        const [meetingId] = cursor;
        const token = await getAccessToken();
        const meeting = await snapshot.getPromise(meetingState(cursor));

        set(meetingClientState(cursor), {
          ...meeting,
          collaborators: (meeting.collaborators || []).map((other) =>
            other.id === collaboratorId
              ? {
                  ...other,
                  ...updates
                }
              : other
          )
        });

        try {
          await api.meetings.updateCollaborator(token, {
            meetingId,
            userId: collaboratorId,
            role: updates.primary_role || 'editor'
          });
        } catch (err: any) {
          handleError(err);
        }
      },
    []
  );

  const removeCollaborator = useRecoilCallback(
    ({ set, snapshot }) =>
      async (
        cursor: MeetingCursor,
        collaborator: Partial<MeetingCollaborator>
      ): Promise<HelperResult> => {
        const [meetingId] = cursor;
        const token = await getAccessToken();
        const meeting = await snapshot.getPromise(meetingState(cursor));

        set(meetingClientState(cursor), {
          ...meeting,
          collaborators: (meeting.collaborators || []).filter(
            (other) => !other.id || other.id !== collaborator.id!
          )
        });

        try {
          await api.meetings.deleteCollaborator(token, {
            meetingId,
            userId: collaborator.id!
          });

          return [true, undefined];
        } catch (err: any) {
          // Revert the above state change
          set(meetingClientState(cursor), (meeting) => ({
            ...meeting,

            collaborators: [collaborator, ...(meeting.collaborators || [])]
          }));

          return [undefined, err];
        }
      },
    []
  );

  const dismissHasSuggestedComments = useRecoilCallback(
    ({ snapshot, set }) =>
      async (cursor: MeetingCursor) => {
        const meeting = await snapshot.getPromise(meetingState(cursor));

        set(meetingClientState(cursor), {
          ...meeting,
          has_suggested_comments: false
        });
      }
  );

  const reload = useRecoilCallback(
    ({ snapshot, set }) =>
      async (
        cursor: MeetingCursor,
        committer?: (
          data: Meeting,
          commit: (data: Partial<Meeting>) => void
        ) => void
      ) => {
        const release = snapshot.retain();
        const token = await getAccessToken();
        const [id, secretKey] = cursor;

        try {
          const { meeting } = await api.meetings.fetchMeeting(token, {
            id,
            secretKey,
            include: 'web'
          });

          const defaultCommitter = (
            data: Meeting,
            commit: (data: Partial<Meeting>) => void
          ) => {
            commit(data);
          };

          const commit = async (data: Partial<Meeting>) => {
            set(meetingClientState(cursor), data);

            // Reset the updated sections when we reload the meeting, as the updated sections will be stored against
            // the meeting already.
            if (meeting.sections && meeting.sections.length > 0) {
              set(meetingTranscriptUpdatesState(meeting.updates_channel), {
                sections: [],
                interim_transcript: undefined
              });
            }

            const moments = meeting.moments || [];
            const highlightMomentType = await snapshot.getPromise(
              highlightMomentTypeState(cursor)
            );

            release();

            if (!highlightMomentType) {
              return;
            }

            set(
              highlightsState(cursor),
              moments
                .filter(
                  (moment) =>
                    moment.accepted &&
                    moment.moment_type_id === highlightMomentType.encoded_id
                )
                .reduce(
                  (result, moment) => ({
                    ...result,

                    [moment.client_id || uuid()]: moment
                  }),
                  {}
                )
            );
          };

          if (committer) {
            committer(meeting, commit);
          } else {
            defaultCommitter(meeting, commit);
          }
        } catch (err: any) {
          if (err instanceof APIError && err.res.status === 404) {
            return;
          }

          handleError(err);
        }
      },
    []
  );

  const reloadStatus = useRecoilCallback(
    ({ set }) =>
      async (cursor: MeetingCursor) => {
        const [id] = cursor;
        const token = await getAccessToken();

        try {
          const { meeting: updates } = await api.meetings.fetchMeetingStatus(
            token,
            { id }
          );

          set(meetingClientState(cursor), (meeting) => ({
            ...meeting,
            ...updates
          }));
        } catch (err: any) {
          if (err instanceof APIError && err.res.status === 404) {
            return;
          }

          handleError(err);
        }
      },
    []
  );

  const trackEvent = useCallback(
    async (cursor: MeetingCursor, event: string) => {
      const token = await getAccessToken();
      const [id] = cursor;

      try {
        await api.meetings.trackMeetingEvent(token, { id, event });
      } catch (err: any) {
        handleError(err);
      }
    },
    []
  );

  const updateEvent = useRecoilCallback(
    ({ set }) =>
      async (cursor: MeetingCursor, changes: EventUpdates) => {
        const [meetingId] = cursor;
        const token = await getAccessToken();

        try {
          const { event } = await api.events.updateEvent(token, {
            id: meetingId,
            updates: changes
          });

          const { can_auto_join, auto_join, meeting_data } = event;

          set(meetingClientState(cursor), (meeting) => ({
            ...meeting,
            auto_join,
            can_auto_join,
            meeting_data
          }));
        } catch (err: any) {
          handleError(err);
        }
      },
    []
  );

  const channelShare = useRecoilCallback(
    ({ set }) =>
      async (cursor: MeetingCursor, changes: ChannelUpdates) => {
        const token = await getAccessToken();
        const [id] = cursor;

        const { meeting: result } = await api.meetings.channelShare(token, {
          id,
          changes
        });

        set(meetingClientState(cursor), (meeting) => ({
          ...meeting,
          ...result
        }));

        track('meeting.channels.updated', {
          meetingId: result.encoded_id,
          status: result.status
        });
      },
    []
  );

  return {
    destroy,
    update,
    reload,
    reloadStatus,
    filterSections,
    hangup,
    setTags,
    startRecording,
    setAutoJoin,
    labelSpeaker,
    realignTranscript,
    createCollaborators,
    removeCollaborator,
    updateCollaborator,
    dismissHasSuggestedComments,
    trackEvent,
    updateEvent,
    channelShare
  };
};