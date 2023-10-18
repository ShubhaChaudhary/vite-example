import { Howl } from 'howler';
import { clamp } from 'lodash';
import { useRecoilCallback } from 'recoil';
import {
  audioPlayingState,
  audioPositionState,
  formatMeetingMediaKey,
  mediaHadInteractionState,
  mediaJumpedState,
  mediaPlaybackSpeedState,
  mediaPositionState
} from '.';
import { track } from '../../utils/analytics';
import { getRegisteredAudio } from '../../utils/media';
import { MeetingCursor, meetingDurationState, meetingState } from '../meetings';

export const useMediaHelpers = () => {
  const withMedia = async (
    cursor: MeetingCursor,
    {
      withAudio
    }: {
      withAudio: (audio: Howl, soundId: number | undefined) => Promise<any>;
    }
  ) => {
    const key = formatMeetingMediaKey(cursor);
    const audio = getRegisteredAudio(key);

    if (audio) {
      const sounds = (audio as any)._sounds || [];
      const soundId = sounds.length > 0 ? sounds[0]._id : undefined;

      await withAudio(audio, soundId);
    }
  };

  const setPlaying = useRecoilCallback(
    ({ set, snapshot }) =>
      async (cursor: MeetingCursor, play: boolean) => {
        return withMedia(cursor, {
          withAudio: async (audio, soundId) => {
            const hadInteraction = await snapshot.getPromise(
              mediaHadInteractionState
            );
            const statePosition = await snapshot.getPromise(
              audioPositionState(cursor)
            );
            if (!hadInteraction && statePosition > 0) {
              audio.seek(statePosition / 1000);
            }

            if (play) {
              audio.play(soundId);
            } else {
              audio.pause(soundId);
            }

            set(audioPlayingState(cursor), audio.playing(soundId));
            set(mediaHadInteractionState, true);

            const position = (audio.seek() as number) * 1000;
            const meeting = await snapshot.getPromise(meetingState(cursor));

            track(play ? 'meeting.media.pause' : 'meeting.media.play', {
              time: position,
              duration: meeting.duration
            });
          }
        });
      },
    []
  );

  const setPlaybackSpeed = useRecoilCallback(
    ({ set }) =>
      async (cursor: MeetingCursor, speed: number) => {
        await withMedia(cursor, {
          withAudio: async (audio) => {
            audio.rate(speed);
          }
        });

        set(mediaPlaybackSpeedState(cursor), speed);
      },
    []
  );

  const restore = useRecoilCallback(
    ({ snapshot }) =>
      async (cursor: MeetingCursor) => {
        const position = await snapshot.getPromise(mediaPositionState(cursor));
        const speed = await snapshot.getPromise(
          mediaPlaybackSpeedState(cursor)
        );

        await withMedia(cursor, {
          withAudio: async (audio) => {
            audio.seek(position / 1000);
            audio.rate(speed);
          }
        });
      },
    []
  );

  const jump = useRecoilCallback(
    ({ set, snapshot }) =>
      async (
        cursor: MeetingCursor,
        time: number,
        origin?: string,
        play = true
      ) => {
        const duration = await snapshot.getPromise(
          meetingDurationState(cursor)
        );

        const clampedTime = clamp(time, duration);

        await withMedia(cursor, {
          withAudio: async (audio, soundId) => {
            audio.seek(clampedTime / 1000);
            set(audioPositionState(cursor), clampedTime);

            const hadInteraction = await snapshot.getPromise(
              mediaHadInteractionState
            );
            if (play && hadInteraction && !audio.playing(soundId)) {
              audio.play(soundId);
              set(audioPlayingState(cursor), true);
            }
          }
        });

        set(mediaJumpedState, true);

        track('meeting.media.jump', {
          origin,
          time: clampedTime
        });
      },
    []
  );

  const skip = useRecoilCallback(
    ({ set, snapshot }) =>
      async (cursor: MeetingCursor, amount: number, origin?: string) => {
        const position = await snapshot.getPromise(mediaPositionState(cursor));
        const { duration } = await snapshot.getPromise(meetingState(cursor));
        const newPosition =
          amount >= 0
            ? Math.min(duration!, position + amount)
            : Math.max(0, position + amount);

        await withMedia(cursor, {
          withAudio: async (audio) => {
            audio.seek(newPosition / 1000);
            set(audioPositionState(cursor), newPosition);
          }
        });

        track('meeting.media.skip', { origin });
      },
    []
  );

  const toggle = useRecoilCallback(
    ({ set }) =>
      async (cursor: MeetingCursor, origin?: string) => {
        await withMedia(cursor, {
          withAudio: async (audio, soundId) => {
            if (audio.playing(soundId)) {
              audio.pause(soundId);
            } else {
              audio.play(soundId);
            }

            set(audioPlayingState(cursor), audio.playing(soundId));
          }
        });

        track('meeting.media.toggle', { origin });
      },
    []
  );

  return {
    setPlaying,
    setPlaybackSpeed,
    restore,
    jump,
    skip,
    toggle
  };
};