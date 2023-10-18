import { atom, atomFamily } from 'recoil';
import { v4 as uuid } from 'uuid';
import { Moment } from '../../common';
import { notify } from '../../utils/errors';
import { loadEffect, syncFromRealtime } from '../effects';
import { MeetingCursor, meetingState } from '../meetings';
import { highlightMomentTypeState } from './selectors';

export const highlightsState = atomFamily<
  Record<string, Partial<Moment>>,
  MeetingCursor
>({
  key: 'highlightsState',
  effects: (cursor) => [
    loadEffect(async ({ getPromise }) => {
      const { moments } = await getPromise(meetingState(cursor));
      const highlightMomentType = await getPromise(
        highlightMomentTypeState(cursor)
      );

      if (!highlightMomentType) {
        return [];
      }

      return (moments || [])
        .filter(
          (moment) =>
            moment.accepted &&
            moment.moment_type_id === highlightMomentType.encoded_id
        )
        .reduce((result, moment) => {
          const clientId = moment.client_id || uuid();

          return {
            ...result,

            [clientId]: {
              ...moment,

              client_id: clientId
            }
          };
        }, {});
    }),

    syncFromRealtime(async (msg, setSelf, getPromise) => {
      try {
        if (
          msg.event_type !== 'moment.created' &&
          msg.event_type !== 'moment.updated' &&
          msg.event_type !== 'moment.deleted'
        ) {
          return;
        }

        const highlightMomentType = await getPromise(
          highlightMomentTypeState(cursor)
        );
        const clientId = msg.event_data.client_id;
        const momentTypeId = msg.event_data.moment_type_id;

        if (
          !highlightMomentType ||
          !clientId ||
          momentTypeId !== highlightMomentType.encoded_id ||
          cursor[0] !== msg.entity_id
        ) {
          return;
        }

        setSelf((highlights) => ({
          ...highlights,
          [clientId]: {
            ...highlights[clientId],
            ...msg.event_data
          }
        }));
      } catch (err: any) {
        notify(err);
      }
    })
  ]
});

export const highlightDateState = atom<number>({
  key: 'highlightDateState',
  default: Date.now(),
  effects: [
    ({ setSelf }) => {
      const interval = setInterval(() => {
        setSelf(Date.now());
      }, 1000);

      return () => {
        clearInterval(interval);
      };
    }
  ]
});