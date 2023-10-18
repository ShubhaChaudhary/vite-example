import { maxBy, sortBy } from 'lodash';
import { selectorFamily } from 'recoil';
import { Moment, MomentType } from '../../common';
import { MeetingCursor, meetingMomentTypesByTitleState } from '../meetings';
import { highlightsState } from './atoms';

export type HighlightCursor = [
  string,
  string | undefined,
  string | undefined,
  string | undefined
];

export const highlightMomentTypeState = selectorFamily<
  MomentType,
  MeetingCursor
>({
  key: 'highlightMomentType',
  get:
    (cursor) =>
    ({ get }) => {
      const momentTypesByTitle = get(meetingMomentTypesByTitleState(cursor));

      return momentTypesByTitle['Pin'];
    }
});

export const highlightsListState = selectorFamily<
  Partial<Moment>[],
  MeetingCursor
>({
  key: 'highlightsListState',
  get:
    (cursor) =>
    ({ get }) =>
      sortBy(
        Object.values(get(highlightsState(cursor))).filter(
          ({ deleted }) => !deleted
        ),
        'position'
      )
});

export const highlightsBoundsState = selectorFamily<
  [number, number][],
  MeetingCursor
>({
  key: 'highlightsBoundsState',
  get:
    (cursor) =>
    ({ get }) =>
      get(highlightsListState(cursor)).map(({ start_time, end_time }) => [
        start_time || 0,
        end_time || 0
      ])
});

export const highlightsLastState = selectorFamily<
  Partial<Moment> | undefined,
  MeetingCursor
>({
  key: 'highlightsLastState',
  get:
    (cursor) =>
    ({ get }) => {
      const list = get(highlightsListState(cursor));

      return maxBy(list, (moment) => {
        if (!moment.created_at) {
          return false;
        }

        return new Date(moment.created_at).getTime();
      });
    },
  cachePolicy_UNSTABLE: {
    eviction: 'most-recent'
  }
});

export const highlightState = selectorFamily<
  Partial<Moment> | undefined,
  HighlightCursor
>({
  key: 'highlightState',
  get:
    ([encodedId, secretKey, , clientId]) =>
    ({ get }) => {
      return clientId
        ? get(highlightsState([encodedId, secretKey]))[clientId]
        : undefined;
    },
  set:
    ([encodedId, secretKey, , clientId]) =>
    ({ set }, value) => {
      if (clientId) {
        set(highlightsState([encodedId, secretKey]), (highlights) => ({
          ...highlights,

          [clientId]: {
            ...highlights[clientId],
            ...value
          }
        }));
      }
    }
});