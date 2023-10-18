import { atom, atomFamily } from 'recoil';
import api from '../../api';
import {
  FullMeeting,
  Meeting,
  MeetingCapabilities,
  MeetingSeriesData,
  MomentType
} from '../../common';
import { MeetingTranscript } from '../../models/meeting';
import { handleError } from '../../utils/errors';
import { maybeGetAccessToken } from '../auth';
import { currentUserFeatureState } from '../currentUser';
import { loadEffect, syncFromRealtime, syncWithStorage } from '../effects';

export type MeetingCursor = [string, string | undefined];

interface MeetingFull {
  meeting: Meeting;
  capabilities: MeetingCapabilities;
  moment_types: MomentType[];
}

export const channelMeetingsChannelState = atom<string>({
  key: 'channelMeetingsChannelState',
  default: ''
});

export const channelMeetingsRequestIdState = atom<number>({
  key: 'channelMeetingsRequestIdState',
  default: 1
});

export const channelMeetingsPageState = atom<number>({
  key: 'channelMeetingsPageState',
  default: 1
});

export const channelMeetingsQueryState = atom<string>({
  key: 'channelMeetingsQueryState',
  default: ''
});

export const recordedMeetingsRequestIdState = atom<number>({
  key: 'recordedMeetingsRequestIdState',
  default: 1
});

export const recordedMeetingsPageState = atom<number>({
  key: 'recordedMeetingsPageState',
  default: 1
});

export const recordedMeetingsQueryState = atom<string>({
  key: 'recordedMeetingsQueryState',
  default: ''
});

export const meetingUploadHasFileState = atom({
  key: 'meetingUploadHasFileState',
  default: false
});

export const meetingSeriesState = atomFamily<
  MeetingSeriesData[] | undefined,
  number | undefined
>({
  key: 'MeetingSeriesState',
  effects: (id) => [
    loadEffect(async ({ getPromise }) => {
      const embeddedMeetingSeriesFeature = await getPromise(
        currentUserFeatureState('embedded_meeting_series')
      );
      if (!id || !embeddedMeetingSeriesFeature.enabled) return;
      const token = await maybeGetAccessToken();
      const { meeting_series } = await api.meetings.fetchMeetingSeries(
        token,
        id
      );
      return meeting_series.meetings;
    })
  ]
});

export const meetingRequestIdState = atomFamily<number, MeetingCursor>({
  key: 'meetingRequestIdState',
  default: 0
});

export const meetingFullServerState = atomFamily<
  MeetingFull | FullMeeting,
  MeetingCursor
>({
  key: 'meetingFullServerState',
  effects: ([id, secretKey]) => [
    loadEffect(async () => {
      const token = await maybeGetAccessToken();
      const data = await api.meetings.fetchMeeting(token, {
        id,
        secretKey,
        include: 'insights,moments,notes,plan,web'
      });

      return data;
    })
  ]
});

export const meetingClientState = atomFamily<Partial<Meeting>, MeetingCursor>({
  key: 'meetingClientState',
  default: {},
  effects_UNSTABLE: ([id]) => [
    syncFromRealtime((msg, setSelf) => {
      if (
        (msg.event_type === 'meeting.updated' ||
          msg.event_type === 'meeting.deleted') &&
        msg.event_data.encoded_id === id
      ) {
        setSelf((meeting) => ({
          ...meeting,
          ...msg.event_data
        }));
      }
    })
  ]
});

export const meetingTranscriptUpdatesState = atomFamily<
  Partial<MeetingTranscript>,
  string
>({
  key: 'meetingTranscriptUpdatesState',
  default: {},
  effects_UNSTABLE: (meetingId) => [
    syncFromRealtime((msg, setSelf) => {
      if (
        msg.event_type == 'meeting_transcript.updated' &&
        msg.event_data.encoded_id === meetingId &&
        msg.event_data.changes
      ) {
        const { appended, updated } = msg.event_data.changes;

        setSelf((transcript) => ({
          ...transcript,
          ...(appended && typeof appended.sections !== 'undefined'
            ? {
                sections: [
                  ...(transcript.sections || []),
                  ...(appended.sections || [])
                ]
              }
            : {}),
          ...(updated && typeof updated.interim_transcript !== 'undefined'
            ? {
                interim_transcript: updated.interim_transcript
              }
            : {})
        }));
      }
    })
  ]
});

export const meetingFollowingAudioState = atom<boolean>({
  key: 'meetingFollowingAudioState',
  default: true
});

export const meetingBlockSelectorOpenState = atom<boolean>({
  key: 'meetingBlockSelectorOpenState',
  default: false
});

export const meetingFilterDisfluenciesState = atom<boolean>({
  key: 'meetingFilterDisfluenciesState',
  default: true
});

export const meetingShowingLastMomentState = atom<boolean>({
  key: 'meetingShowingLastMomentState',
  default: false
});

export const showEducationMessageState = atom<boolean>({
  key: 'showEducationMessageState',
  default: true,
  effects: [syncWithStorage('show_education_message')]
});

export const meetingShowTemplateOverlayState = atomFamily<
  boolean,
  MeetingCursor
>({
  key: 'meetingShowTemplateOverlayState',
  default: true
});

export const meetingNotesHasContentState = atomFamily<boolean, MeetingCursor>({
  key: 'meetingNotesHasContentState',
  default: false
});

const REFRESH_COLLABORATE_INTERVAL_MS = 3 * 60 * 60 * 1000;
export const meetingCollaborateTokenState = atomFamily<
  string | false,
  MeetingCursor
>({
  key: 'meetingCollaborateTokenState',
  effects: (cursor) => [
    loadEffect(async () => {
      const token = await maybeGetAccessToken();

      // Anonymous users should over see a read-only state.
      if (!token) {
        return false;
      }

      try {
        const { token: collaborateToken } =
          await api.meetings.createCollaborateToken(token, {
            id: cursor[0]
          });

        return collaborateToken;
      } catch (err: any) {
        handleError(
          new Error('Failed to generate collaborate token'),
          {},
          'info'
        );
      }

      return false;
    }),

    ({ setSelf }) => {
      // Refresh token every 3 hours (it expires every 4h).
      const interval = setInterval(async () => {
        try {
          const token = await maybeGetAccessToken();

          if (!token) {
            return setSelf(false);
          }

          const { token: collaborateToken } =
            await api.meetings.createCollaborateToken(token, {
              id: cursor[0]
            });

          setSelf(collaborateToken);
        } catch (err) {
          handleError(
            new Error('Failed to generate collaborate token'),
            {},
            'info'
          );
        }
      }, REFRESH_COLLABORATE_INTERVAL_MS);

      return () => {
        clearInterval(interval);
      };
    }
  ]
});