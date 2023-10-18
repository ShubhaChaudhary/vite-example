import { atom, atomFamily, selectorFamily } from 'recoil';
import { AudioEvent, audioEvents } from '../../utils/media';
import { MeetingCursor } from '../meetings';

export const formatMeetingMediaKey = ([meetingId]: MeetingCursor) =>
  `meeting:${meetingId}`;

export const audioPlayingState = atomFamily<boolean, MeetingCursor>({
  key: 'audioPlayingState',
  default: false,
  effects_UNSTABLE: (cursor) => [
    ({ setSelf }) => {
      const key = formatMeetingMediaKey(cursor);
      const onPlay = (event: AudioEvent | undefined) => {
        if (event?.key !== key) {
          return;
        }

        setSelf(true);
      };

      const onPause = (event: AudioEvent | undefined) => {
        if (event?.key !== key) {
          return;
        }

        setSelf(false);
      };

      const onUnregister = (event: AudioEvent | undefined) => {
        if (event?.key !== key) {
          return;
        }

        setSelf(false);
      };

      audioEvents.on('play', onPlay);
      audioEvents.on('pause', onPause);
      audioEvents.on('unregister', onUnregister);

      return () => {
        audioEvents.off('play', onPlay);
        audioEvents.off('pause', onPause);
        audioEvents.off('unregister', onUnregister);
      };
    }
  ]
});

const defaultAudioPosition = 0;
export const audioPositionState = atomFamily<number, MeetingCursor>({
  key: 'audioPositionState',
  default: defaultAudioPosition,
  effects_UNSTABLE: (cursor) => [
    ({ setSelf }) => {
      let value = defaultAudioPosition;

      const key = formatMeetingMediaKey(cursor);
      const onUpdate = (event: AudioEvent | undefined) => {
        if (event?.key !== key) {
          return;
        }

        value = Math.floor(event.audio.seek() as number) * 1000;
        setSelf(value);
      };

      audioEvents.on('timeupdate', onUpdate);

      return () => {
        audioEvents.off('timeupdate', onUpdate);
      };
    }
  ]
});

const defaultAudioPlaybackSpeed = 1;
export const audioPlaybackSpeedState = atomFamily<number, MeetingCursor>({
  key: 'audioPlaybackSpeedState',
  default: defaultAudioPlaybackSpeed,
  effects_UNSTABLE: (cursor) => [
    ({ setSelf }) => {
      let value = defaultAudioPlaybackSpeed;

      const key = formatMeetingMediaKey(cursor);
      const onUpdate = (event: AudioEvent | undefined) => {
        if (event?.key !== key) {
          return;
        }

        value = event.audio.rate();
        setSelf(value);
      };

      audioEvents.on('ratechange', onUpdate);

      return () => {
        audioEvents.off('ratechange', onUpdate);
      };
    }
  ]
});

const defaultMediaHadInteractionState = false;
export const mediaHadInteractionState = atom<boolean>({
  key: 'mediaHasPlayedState',
  default: defaultMediaHadInteractionState
});

export const mediaJumpedState = atom<boolean>({
  key: 'mediaJumpedState',
  default: false
});

export const mediaPlayingState = selectorFamily<boolean, MeetingCursor>({
  key: 'mediaPlayingState',
  get:
    (cursor) =>
    ({ get }) => {
      return get(audioPlayingState(cursor));
    },
  set:
    (cursor) =>
    ({ set }, newValue) => {
      set(audioPlayingState(cursor), newValue);
    }
});

export const mediaPositionState = selectorFamily<number, MeetingCursor>({
  key: 'mediaPositionState',
  get:
    (cursor) =>
    ({ get }) => {
      return get(audioPositionState(cursor));
    },
  set:
    (cursor) =>
    ({ set }, newValue) => {
      set(audioPositionState(cursor), newValue);
    }
});

export const mediaPlaybackSpeedState = selectorFamily<number, MeetingCursor>({
  key: 'mediaPlaybackSpeedState',
  get:
    (cursor) =>
    ({ get }) => {
      return get(audioPlaybackSpeedState(cursor));
    },
  set:
    (cursor) =>
    ({ set }, newValue) => {
      set(audioPlaybackSpeedState(cursor), newValue);
    }
});