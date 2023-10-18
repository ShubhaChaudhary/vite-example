import { differenceInMilliseconds, isValid, parseISO } from 'date-fns';
import { useRecoilCallback } from 'recoil';
import { v4 as uuid } from 'uuid';
import api from '../../api';
import { Moment } from '../../models/meeting';
import { getAccessToken } from '../auth';
import { mediaPositionState } from '../media';
import { MeetingCursor, meetingState } from '../meetings';
import { highlightsState } from './atoms';
import { HighlightCursor, highlightState } from './selectors';

export const useHighlightHelpers = () => {
  const getDefaultPosition = useRecoilCallback(
    ({ snapshot }) =>
      async (cursor: MeetingCursor) => {
        const release = snapshot.retain();
        const meeting = await snapshot.getPromise(meetingState(cursor));
        const mediaPosition = await snapshot.getPromise(
          mediaPositionState(cursor)
        );

        release();

        const startedAtString =
          meeting.started_at || meeting.scheduled_start_at;
        const startedAt = startedAtString
          ? parseISO(startedAtString)
          : undefined;

        if (meeting.dubber_recording_id) {
          return mediaPosition;
        }

        if (
          meeting.status === 'in-progress' &&
          startedAt &&
          isValid(startedAt)
        ) {
          return Math.max(0, differenceInMilliseconds(new Date(), startedAt));
        }

        return 0;
      },
    []
  );

  const create = useRecoilCallback(
    ({ set }) =>
      async (cursor: MeetingCursor, data: Partial<Moment>) => {
        const [meetingId] = cursor;
        const token = await getAccessToken();
        const clientId = uuid();

        set(highlightsState(cursor), (highlights) => ({
          ...highlights,

          [clientId]: data
        }));

        const { moment } = await api.moments.createMoment(token, {
          meetingId,
          data: {
            ...data,

            client_id: clientId
          }
        });

        set(highlightsState(cursor), (highlights) => ({
          ...highlights,

          [clientId]: moment
        }));

        return clientId;
      },
    []
  );

  const destroy = useRecoilCallback(
    ({ set }) =>
      async (highlightCursor: HighlightCursor) => {
        const meetingId = highlightCursor[0];
        const momentId = highlightCursor[2];

        set(highlightState(highlightCursor), (highlight) => ({
          ...highlight,
          deleted: true
        }));

        if (!momentId) {
          return;
        }

        const token = await getAccessToken();

        await api.moments.deleteMoment(token, {
          meetingId,
          momentId
        });
      },
    []
  );

  return {
    getDefaultPosition,
    create,
    destroy
  };
};