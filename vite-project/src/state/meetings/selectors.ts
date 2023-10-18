import { findLast, sortBy } from 'lodash';
import { selector, selectorFamily } from 'recoil';
import api from '../../api';
import {
  APIError,
  isAfterScheduledEnd,
  Meeting,
  MeetingCapabilities,
  MeetingViewer,
  MomentType,
  Pagination,
  Plan,
  ProviderMeetingSeries,
  SlimMeeting,
  TranscriptChapter
} from '../../common';
import {
  MeetingPlayer,
  MeetingProcessingCompletion,
  MeetingTranscript
} from '../../models/meeting';
import { getAccessToken, maybeGetAccessToken } from '../auth';
import { currentUserShowLiteExperienceState } from '../currentUser';
import {
  embeddedProviderContextState,
  embeddedProviderState,
  embeddedState
} from '../embedded';
import { highlightsListState } from '../highlights/selectors';
import { mediaPositionState } from '../media';
import { notesAwarenessState } from '../notes';
import { selectedTagState } from '../tags';
import {
  channelMeetingsChannelState,
  channelMeetingsPageState,
  channelMeetingsQueryState,
  channelMeetingsRequestIdState,
  meetingClientState,
  MeetingCursor,
  meetingFullServerState,
  meetingTranscriptUpdatesState,
  recordedMeetingsPageState,
  recordedMeetingsQueryState,
  recordedMeetingsRequestIdState
} from './atoms';

export const meetingRecordingUrlServerState = selectorFamily<
  string | undefined,
  MeetingCursor
>({
  key: 'meetingRecordingServerState',
  get:
    ([id]) =>
    async () => {
      const token = await maybeGetAccessToken();
      if (!token) {
        return '';
      }

      const { recording } = await api.meetings.fetchMeetingRecording(token, {
        id
      });

      return recording.recording_url;
    }
});

export const meetingRecordingUrlState = selectorFamily<
  string | undefined,
  MeetingCursor
>({
  key: 'meetingRecordingUrlState',
  get:
    (cursor) =>
    ({ get }) => {
      const { dubber_recording_id } = get(meetingState(cursor));
      if (!dubber_recording_id) {
        return undefined;
      }

      return get(meetingRecordingUrlServerState(cursor));
    }
});

// The number of times to retry in a backoff if a MS Teams series is 404ing
// (i.e. the backend hasn't found out the app has been installed yet).
const MS_TEAMS_SERIES_NOT_FOUND_RETRIES = 3;

export const msTeamsSeriesState = selectorFamily<ProviderMeetingSeries, string>(
  {
    key: 'msTeamsSeriesState',
    get: (provider_id) => async () => {
      const token = await maybeGetAccessToken();
      const load = async () => {
        const { meeting_series } =
          await api.meetings.fetchMSteamsProviderMeetingSeries(token, {
            provider_id,
            include: 'insights,meeting,meetings,moments,notes,plan,web'
          });

        return meeting_series;
      };

      for (let i = 0; i < MS_TEAMS_SERIES_NOT_FOUND_RETRIES; i++) {
        try {
          const series = await load();

          return series;
        } catch (err: any) {
          // If not found, wait a linear backoff period then try again.
          if (err instanceof APIError && err.res.status === 404) {
            await new Promise((resolve) => setTimeout(resolve, 5000 * (i + 1)));
            continue;
          }

          // Otherwise bubble the error up to the error boundary.
          throw err;
        }
      }

      return load();
    }
  }
);

const meetingServerState = selectorFamily<Meeting, MeetingCursor>({
  key: 'meetingServerState',
  get:
    (cursor) =>
    ({ get }) => {
      const { meeting } = get(meetingFullServerState(cursor));

      return meeting;
    }
});

export const meetingCapabilitiesState = selectorFamily<
  MeetingCapabilities,
  MeetingCursor
>({
  key: 'meetingCapabilitiesState',
  get:
    (cursor) =>
    ({ get }) => {
      const { capabilities } = get(meetingFullServerState(cursor));

      return capabilities;
    }
});

export const meetingRestrictedState = selectorFamily<boolean, MeetingCursor>({
  key: 'meetingRestrictedState',
  get:
    (cursor) =>
    ({ get }) =>
      get(meetingCapabilitiesState(cursor)).restricted
});

export const meetingMomentTypesState = selectorFamily<
  MomentType[],
  MeetingCursor
>({
  key: 'meetingMomentTypesState',
  get:
    (cursor) =>
    ({ get }) => {
      const { moment_types } = get(meetingFullServerState(cursor));

      return [
        ...moment_types,

        {
          encoded_id: 'unsorted',
          title: 'Note',
          taskable: false,
          trigger_phrases: []
        }
      ];
    }
});

export const meetingMomentTypesByTitleState = selectorFamily<
  Record<string, MomentType>,
  MeetingCursor
>({
  key: 'meetingMomentTypesByTitleState',
  get:
    (cursor) =>
    ({ get }) => {
      const momentTypes = get(meetingMomentTypesState(cursor));

      return momentTypes.reduce(
        (result: Record<string, MomentType>, momentType: MomentType) => ({
          ...result,

          [momentType.title]: momentType
        }),
        {}
      );
    }
});

export const meetingState = selectorFamily<Meeting, MeetingCursor>({
  key: 'meetingState',
  get:
    (cursor) =>
    ({ get }) => {
      return {
        ...get(meetingServerState(cursor)),
        ...get(meetingClientState(cursor))
      };
    },
  set:
    (cursor) =>
    ({ set }, value) => {
      set(meetingClientState(cursor), value);
    }
});

export const meetingTranscriptState = selectorFamily<
  MeetingTranscript,
  MeetingCursor
>({
  key: 'meetingTranscriptState',
  get:
    (cursor) =>
    ({ get }) => {
      const meeting = get(meetingState(cursor));
      const updates = get(meetingTranscriptUpdatesState(meeting.encoded_id));

      return {
        languages: updates.languages || meeting.languages || [],
        speaker_times: updates.speaker_times || meeting.speaker_times || [],
        speakers: updates.speakers || meeting.speakers || [],
        sections: [...(meeting.sections || []), ...(updates.sections || [])],
        suggested_speakers:
          updates.suggested_speakers || meeting.suggested_speakers || [],
        chapters: updates.chapters || meeting.chapters || [],
        interim_transcript:
          updates.interim_transcript || meeting.interim_transcript || ''
      };
    },
  set:
    (cursor) =>
    ({ get, set }, value) => {
      const meeting = get(meetingState(cursor));

      set(meetingTranscriptUpdatesState(meeting.encoded_id), value);
    }
});

export const meetingDurationState = selectorFamily<number, MeetingCursor>({
  key: 'meetingDurationState',
  get:
    (cursor) =>
    ({ get }) => {
      const { duration = 0 } = get(meetingState(cursor));
      return duration;
    }
});

/**
 * Check whether to enable the transport based on user & meeting plan,
 * and also the existence of the dubber_recording_id.
 */
export const meetingHasPlayableAudioState = selectorFamily<
  boolean,
  MeetingCursor
>({
  key: 'meetingHasPlayableAudioState',
  get:
    (cursor) =>
    ({ get }) => {
      const { dubber_recording_id } = get(meetingState(cursor));
      const moments = get(highlightsListState(cursor));
      const isMomentsUser = get(currentUserShowLiteExperienceState);
      const meetingPlan = get(meetingPlanState(cursor));

      return (
        !!dubber_recording_id &&
        (meetingPlan?.name === 'Moments' || isMomentsUser
          ? moments.length > 0
          : true)
      );
    }
});

export const meetingProcessingCompletionState = selectorFamily<
  MeetingProcessingCompletion,
  MeetingCursor
>({
  key: 'meetingProcessingCompletionState',
  get:
    (cursor) =>
    ({ get }) => {
      const { dubber_recording_id, speakers, chapters, sections, status } = get(
        meetingState(cursor)
      );

      return {
        media: status === 'completed' || !!dubber_recording_id,
        transcription:
          status === 'completed' ||
          (Array.isArray(sections) && sections.length > 0),
        speakers:
          status === 'completed' ||
          (Array.isArray(speakers) && speakers.length > 0),
        chapters:
          status === 'completed' ||
          (Array.isArray(chapters) && chapters.length > 0),
        suggestions: status === 'completed'
      };
    }
});

export const meetingIdState = selectorFamily<string, MeetingCursor>({
  key: 'meetingIdState',
  get:
    (cursor) =>
    ({ get }) =>
      get(meetingState(cursor)).encoded_id
});

export const meetingStatusState = selectorFamily<
  Meeting['status'],
  MeetingCursor
>({
  key: 'meetingStatustate',
  get:
    (cursor) =>
    ({ get }) =>
      get(meetingState(cursor)).status
});

export const meetingAfterScheduledEndState = selectorFamily<
  boolean,
  MeetingCursor
>({
  key: 'meetingAfterScheduledEndDate',
  get:
    (cursor) =>
    ({ get }) => {
      const meeting = get(meetingState(cursor));

      return isAfterScheduledEnd(new Date(), meeting);
    }
});

export const meetingPlayersState = selectorFamily<
  MeetingPlayer[],
  MeetingCursor
>({
  key: 'meetingPlayersState',
  get:
    (cursor) =>
    ({ get }) => {
      const {
        attendees = [],
        collaborators = [],
        viewers = []
      } = get(meetingState(cursor));

      const viewersByEmail = viewers.reduce(
        (result: Record<string, MeetingViewer>, viewer: MeetingViewer) => ({
          ...result,

          [viewer.email]: viewer
        }),
        {}
      );

      const notesAwareness = get(notesAwarenessState(cursor));
      const awarenessByEmail = notesAwareness.reduce(
        (
          result: Record<string, { name: string; email: string }>,
          item: { name: string; email: string }
        ) => ({
          ...result,

          [item.email]: item
        }),
        {}
      );

      const attendeePlayers: Partial<MeetingPlayer>[] = attendees
        .filter(
          ({ email }) =>
            email !== 'meet@notiv.com' && email !== 'meet-staging@notiv.com'
        )
        .map(({ display_name, email }) => ({
          email,
          name: display_name
        }));

      const collaboratorPlayers: Partial<MeetingPlayer>[] = collaborators.map(
        ({ email, display_name, avatar_url }) => ({
          email,
          name: display_name,
          avatarUrl: avatar_url
        })
      );

      const itemsByEmail = [...attendeePlayers, ...collaboratorPlayers].reduce(
        (
          result: Record<string, MeetingPlayer>,
          item: Partial<MeetingPlayer>
        ) => ({
          ...result,

          [item.email!]: {
            ...result[item.email!],
            ...item
          }
        }),
        {}
      );

      return sortBy(Object.values(itemsByEmail), 'email').map((item, i) => ({
        ...item,

        playerNumber: 1 + (i % 10),
        active: !!awarenessByEmail[item.email],
        viewedAt: viewersByEmail[item.email]?.viewed_at
      }));
    }
});

export const meetingPlayersByEmailState = selectorFamily<
  Record<string, MeetingPlayer>,
  MeetingCursor
>({
  key: 'meetingPlayersByEmailState',
  get:
    (cursor) =>
    ({ get }) => {
      const players = get(meetingPlayersState(cursor));

      return players.reduce(
        (result, player) => ({
          ...result,

          [player.email]: player
        }),
        {}
      );
    }
});

export const meetingChaptersState = selectorFamily<
  TranscriptChapter[],
  MeetingCursor
>({
  key: 'meetingChaptersState',
  get:
    (cursor) =>
    ({ get }) => {
      const { chapters = [] } = get(meetingState(cursor));

      if (chapters.length > 0) {
        return chapters;
      }

      return chapters;
    }
});

export const meetingShowChaptersState = selectorFamily<boolean, MeetingCursor>({
  key: 'meetingShowChaptersState',
  get:
    (cursor) =>
    ({ get }) => {
      return (
        get(meetingChaptersState(cursor)).length > 0 &&
        !get(meetingShowLiteExperienceState(cursor)) &&
        !get(currentUserShowLiteExperienceState)
      );
    }
});

export const meetingCurrentChapterState = selectorFamily<
  TranscriptChapter | undefined,
  MeetingCursor
>({
  key: 'meetingCurrentChaptersState',
  get:
    (cursor) =>
    ({ get }) => {
      const position = get(mediaPositionState(cursor));
      const chapters = get(meetingChaptersState(cursor));

      return findLast(chapters, ({ start_time }) => position >= start_time);
    }
});

export const meetingPlayerBySpeakerState = selectorFamily<
  Partial<MeetingPlayer>,
  [MeetingCursor, number]
>({
  key: 'meetingPlayerBySpeakerState',
  get:
    ([cursor, index]) =>
    ({ get }) => {
      const players = get(meetingPlayersState(cursor));
      const { speakers = [] } = get(meetingTranscriptState(cursor));
      const speaker = speakers.find(
        ({ speaker_label }) => parseInt(speaker_label, 10) === index
      );
      const player =
        speaker && speaker.email
          ? players.find(({ email }) => email === speaker.email)
          : undefined;

      if (player) {
        return player;
      }

      return {
        name: speaker?.display_name,
        email: speaker?.email,
        playerNumber: (players.length + 1 + index) % 10
      };
    }
});

export const channelMeetingsResultsState = selector<{
  meetings: SlimMeeting[];
  pagination?: Pagination;
}>({
  key: 'channelMeetingsResultsState',
  get: async ({ get }) => {
    get(channelMeetingsRequestIdState);
    const channel = get(channelMeetingsChannelState);

    if (channel === '') {
      return { meetings: [] };
    }

    const token = await getAccessToken();
    const page = get(channelMeetingsPageState);
    const query = get(channelMeetingsQueryState);
    const tag = get(selectedTagState);

    const { meetings, pagination } = await api.meetings.searchMeetings(token, {
      query: [`in:${channel}`, tag ? `tag:${tag}` : '', query]
        .filter(Boolean)
        .join(' '),
      page,
      include: 'web'
    });

    return {
      meetings,
      pagination
    } as any;
  }
});

export const channelMeetingsState = selector<SlimMeeting[]>({
  key: 'channelMeetingsState',
  get: ({ get }) => {
    return get(channelMeetingsResultsState)
      .meetings.map((meeting) => ({
        ...meeting,
        ...get(meetingClientState([meeting.encoded_id, undefined]))
      }))
      .filter(({ deleted_at }) => !deleted_at);
  }
});

export const channelMeetingsPaginationState = selector<Pagination>({
  key: 'channelMeetingsPaginationState',
  get: ({ get }) => {
    const { meetings, pagination } = get(channelMeetingsResultsState);

    if (pagination) {
      return pagination;
    }

    return {
      count: meetings.length,
      current_page: 1,
      total_pages: 1,
      prev_page: null,
      next_page: null,
      first_page: true,
      last_page: true
    };
  }
});

export const recordedMeetingsResultsState = selector<{
  meetings: SlimMeeting[];
  pagination?: Pagination;
}>({
  key: 'recordedMeetingsResultsState',
  get: async ({ get }) => {
    get(recordedMeetingsRequestIdState);

    const token = await getAccessToken();
    const page = get(recordedMeetingsPageState);
    const query = get(recordedMeetingsQueryState);
    const tag = get(selectedTagState);
    const { meetings, pagination } = await api.meetings.searchMeetings(token, {
      query: ['is:past', tag ? `tag:${tag}` : '', query]
        .filter(Boolean)
        .join(' '),
      page,
      status: 'completed,processing',
      include: 'web'
    });

    return {
      meetings,
      pagination
    };
  }
});

export const recordedMeetingsState = selector<SlimMeeting[]>({
  key: 'recordedMeetingsState',
  get: ({ get }) => {
    return get(recordedMeetingsResultsState)
      .meetings.map((meeting) => ({
        ...meeting,
        ...get(meetingClientState([meeting.encoded_id, undefined]))
      }))
      .filter(({ deleted_at }) => !deleted_at);
  }
});

export const recordedMeetingsPaginationState = selector<Pagination>({
  key: 'recordedMeetingsPaginationState',
  get: ({ get }) => {
    const { meetings, pagination } = get(recordedMeetingsResultsState);

    if (pagination) {
      return pagination;
    }

    return {
      count: meetings.length,
      current_page: 1,
      total_pages: 1,
      prev_page: null,
      next_page: null,
      first_page: true,
      last_page: true
    };
  }
});

export const meetingShowTransportState = selectorFamily<boolean, MeetingCursor>(
  {
    key: 'meetingShowTransportState',
    get:
      (cursor) =>
      ({ get }) => {
        const status = get(meetingStatusState(cursor));

        return status === 'processing' || status === 'completed';
      }
  }
);

/** Whether or not the titles should be shown in the UI. */
export const meetingShowTitleState = selector({
  key: 'meetingShowTitleState',

  // The title is always shown if we're not embedded in Teams.
  // If embedded in Teams, we only hide it if the context is the pre/post meeting tab content ("content").
  get: ({ get }) =>
    !(
      get(embeddedProviderState) === 'msteams' &&
      get(embeddedProviderContextState) === 'content'
    )
});

// Show meetingSeries in personal tab and pre/post meeting tab context
export const msteamsProviderState = selector({
  key: 'msteamsProviderState',
  get: ({ get }) => {
    const { embedded, provider } = get(embeddedState);
    return embedded && provider === 'msteams';
  }
});

export const meetingPlanState = selectorFamily<Plan | undefined, MeetingCursor>(
  {
    key: 'meetingPlanState',
    get:
      (cursor) =>
      ({ get }) => {
        const meeting = get(meetingState(cursor));

        return meeting.plan;
      }
  }
);

const MOMENTS_PLAN = 'Moments';
export const meetingShowLiteExperienceState = selectorFamily<
  boolean,
  MeetingCursor
>({
  key: 'meetingShowLiteExperienceState',
  get:
    (cursor) =>
    ({ get }) => {
      const plan = get(meetingPlanState(cursor));

      return plan?.name === MOMENTS_PLAN;
    }
});
