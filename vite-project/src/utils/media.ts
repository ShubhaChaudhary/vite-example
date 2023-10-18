import { Howl } from 'howler';
import { findLastIndex, sortBy, throttle } from 'lodash';
import mitt from 'mitt';
import { track } from './analytics';
import logger from './logger';

// Limit time updates to once every quarter of a second to minimise state updates/re-renders
const TIME_UPDATE_THROTTLE_MS = 250;

const audioCache = new Map<string, Howl>();

export const audioEvents = mitt();

export interface AudioEvent {
  key: string;
  audio: Howl;
}

interface AudioOptions {
  url: string;
  bounds?: [number, number][];
}

export const initAudio = (
  key: string,
  { url, bounds, ...options }: AudioOptions
) => {
  if (audioCache.has(key)) {
    return {
      audio: audioCache.get(key)!,
      cleanupAudio: () => {}
    };
  }

  const audio = new Howl({
    src: [url],
    preload: true,
    html5: true,

    ...options
  });

  const onPlay = () => audioEvents.emit('play', { key, audio });
  const onPause = () => audioEvents.emit('pause', { key, audio });
  const onEnd = () => {
    track('meeting.media.end', {
      duration: audio.duration() * 1000
    });
  };

  const onError = (action: string) => (error: unknown) => {
    logger.error(new Error(`Error during audio ${action}: ${error}`));
    track('meeting.media.error', {
      time: (audio.seek() as number) * 1000,
      duration: audio.duration() * 1000
    });
  };

  const onLoadError = onError('load');
  const onPlaybackError = onError('playback');

  const forceTimeUpdate = throttle(() => {
    if (audio.playing()) {
      if (bounds) {
        const sortedBounds = sortBy(bounds, ([start]) => start);
        const pos = audio.seek() * 1000;
        const firstBound = sortedBounds[0];
        const lastBound = sortedBounds[sortedBounds.length - 1];
        const currentBoundIndex = findLastIndex(
          sortedBounds,
          ([start]) => pos >= start
        );
        const currentBound = sortedBounds[currentBoundIndex];
        const nextBound =
          currentBoundIndex + 1 < sortedBounds.length
            ? sortedBounds[currentBoundIndex + 1]
            : undefined;

        if (pos < firstBound[0]) {
          audio.seek(firstBound[0] / 1000);
        } else if (pos >= lastBound[1]) {
          audio.seek(firstBound[0] / 1000);
          audio.pause();
        } else if (pos >= currentBound[1] && nextBound) {
          audio.seek(nextBound[0] / 1000);
        }
      }

      audioEvents.emit('timeupdate', { key, audio });
    }
  }, TIME_UPDATE_THROTTLE_MS);

  let ticking = true;
  const onTick = () => {
    if (!ticking) {
      return;
    }

    forceTimeUpdate();
    requestAnimationFrame(onTick);
  };

  audio.on('play', onPlay);
  audio.on('pause', onPause);
  audio.on('end', onEnd);
  audio.on('playerror', onPlaybackError);
  audio.on('loaderror', onLoadError);
  onTick();

  audioCache.set(key, audio);
  audioEvents.emit('register', { key, audio });

  // Return a cleanup function
  return {
    audio,
    cleanupAudio: () => {
      if (!audioCache.has(key)) {
        return;
      }

      ticking = false;

      audio.off('play', onPlay);
      audio.off('pause', onPause);
      audio.off('end', onEnd);
      audio.off('playerror', onPlaybackError);
      audio.off('loaderror', onLoadError);
      audio.unload();

      audioCache.delete(key);
      audioEvents.emit('unregister', { key, audio });
    }
  };
};

export const getRegisteredAudio = (key: string) => audioCache.get(key);