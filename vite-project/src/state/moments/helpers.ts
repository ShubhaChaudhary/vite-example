import { useCallback } from 'react';
import { useRecoilCallback } from 'recoil';
import { createdMomentsState, MomentCursor, momentState } from '.';
import { Moment, Task } from '../../models/meeting';
import { track } from '../../utils/analytics';
import { MeetingCursor } from '../meetings';
import { useNoteHelpers } from '../notes/helpers';
import { v4 as uuid } from 'uuid';
import sortBy from 'lodash/sortBy';
import { Contact } from '../../common/types/contacts';
import { getAccessToken } from '../auth';
import api from '../../api';
import { uniqBy } from 'lodash';

export const useMomentHelpers = () => {
  const noteHelpers = useNoteHelpers();
  const create = useRecoilCallback(
    ({ set }) =>
      async (
        [meetingId]: MeetingCursor,
        momentCursor: MomentCursor,
        data: Partial<Moment>
      ) => {
        const [, clientId] = momentCursor;
        const token = await getAccessToken();

        set(momentState(momentCursor), (moment) => ({ ...moment, ...data }));

        const { moment } = await api.moments.createMoment(token, {
          meetingId,
          data: {
            ...data,

            client_id: clientId
          }
        });

        set(momentState(momentCursor), moment);

        syncCreatedMomentsState(momentCursor);

        return moment;
      },
    []
  );

  const syncCreatedMomentsState = useRecoilCallback(
    ({ snapshot, set }) =>
      async (momentCursor: MomentCursor) => {
        const moment = await snapshot.getPromise(momentState(momentCursor));

        if (moment) {
          set(createdMomentsState, (moments) =>
            uniqBy([...moments, moment as Moment], 'encoded_id')
          );
        }
      }
  );

  const updateAction = useRecoilCallback(
    ({ set }) =>
      async (
        [meetingId]: MeetingCursor,
        momentCursor: MomentCursor,
        data: Partial<Task>
      ) => {
        const [momentId] = momentCursor;

        set(momentState(momentCursor), (moment) => ({
          ...moment,
          task: {
            ...moment?.task!,
            ...data
          }
        }));

        const token = await getAccessToken();
        const { task, meeting } = await api.moments.updateAction(token, {
          meetingId,
          momentId: momentId!,
          updates: data
        });

        set(momentState(momentCursor), (moment) => ({
          ...moment,
          meeting: {
            ...meeting
          },
          task: {
            ...task,
            assignee_id: task.assignee?.id
          }
        }));

        syncCreatedMomentsState(momentCursor);

        return task;
      },
    []
  );

  const update = useRecoilCallback(
    ({ set, snapshot }) =>
      async (
        [meetingId]: MeetingCursor,
        momentCursor: MomentCursor,
        data: Partial<Moment>
      ) => {
        const [momentId] = momentCursor;

        set(momentState(momentCursor), (moment) => ({
          ...moment,
          ...data
        }));

        if (!momentId) {
          return snapshot.getPromise(momentState(momentCursor));
        }

        const token = await getAccessToken();
        const { moment: result } = await api.moments.updateMoment(token, {
          meetingId,
          momentId,
          updates: data
        });

        set(momentState(momentCursor), (moment) => ({
          ...moment,
          ...result
        }));

        return result;
      },
    []
  );

  const setComplete = useCallback(
    async (
      meetingCursor: MeetingCursor,
      momentCursor: MomentCursor,
      complete: boolean
    ) => {
      const [meetingId] = meetingCursor;
      const [momentId] = momentCursor;

      updateAction(meetingCursor, momentCursor, { complete });
      track('moment.task.complete', {
        meetingId,
        moment: momentId,
        complete
      });
    },
    []
  );

  const assignUser = useCallback(
    async (
      meetingCursor: MeetingCursor,
      momentCursor: MomentCursor,
      assignee: Contact | undefined
    ) => {
      const [meetingId] = meetingCursor;
      const [momentId] = momentCursor;
      const assigneeId = assignee ? (assignee.id as string) : null;

      updateAction(meetingCursor, momentCursor, {
        assignee,
        assignee_id: assigneeId
      });
      track('moment.task.assign', {
        meetingId,
        moment: momentId,
        assigneeId
      });
    },
    []
  );

  const normalize = useRecoilCallback(
    ({ set }) =>
      async (moments: Moment[]) => {
        for (const moment of moments) {
          set(momentState([moment.encoded_id, moment.client_id]), moment);
        }
      },
    []
  );

  const destroy = useRecoilCallback(
    ({ set }) =>
      async (meetingCursor: MeetingCursor, momentCursor: MomentCursor) => {
        const [meetingId] = meetingCursor;
        const [momentId] = momentCursor;

        set(momentState(momentCursor), (moment) => ({
          ...moment,
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

  const batch = useRecoilCallback(
    ({ set }) =>
      async (meetingCursor: MeetingCursor, updates: Partial<Moment>[]) => {
        const [meetingId] = meetingCursor;

        for (const update of updates) {
          set(momentState([update.encoded_id, update.client_id]), (moment) => ({
            ...moment,
            ...update
          }));
        }

        const token = await getAccessToken();

        const { moments: updatedMoments } = await api.moments.updateMoments(
          token,
          {
            meetingId,
            updates
          }
        );

        for (const updated of updatedMoments) {
          set(
            momentState([updated.encoded_id, updated.client_id]),
            (moment) => ({
              ...moment,
              ...updated
            })
          );
        }

        return updatedMoments;
      },
    []
  );

  const review = useCallback(
    async (meetingCursor: MeetingCursor, updates: Partial<Moment>[]) => {
      const moments = await batch(meetingCursor, updates);
      const accepted = sortBy(
        moments.filter(({ accepted }) => accepted),
        'position'
      );

      noteHelpers.insertMoments(meetingCursor, accepted);

      track('moment.reviewed', {
        meetingId: meetingCursor[0],
        accepted: accepted.length,
        rejected: moments.length - accepted.length
      });

      return moments;
    },
    []
  );

  const tag = useCallback(
    async (
      meetingCursor: MeetingCursor,
      data: Partial<Moment>,
      sectionId?: string
    ) => {
      const clientId = uuid();
      const moment = await create(meetingCursor, [undefined, clientId], data);

      noteHelpers.insertMoment(meetingCursor, moment, sectionId);
      track('moment.tagged', {
        meetingId: meetingCursor[0],
        momentId: moment.id,
        momentTypeId: moment.moment_type_id,
        sectionId
      });

      return moment;
    },
    []
  );

  return {
    create,
    update,
    updateAction,
    setComplete,
    assignUser,
    normalize,
    destroy,
    batch,
    review,
    tag
  };
};