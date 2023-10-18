import { uniqBy } from 'lodash';
import {
  atom,
  atomFamily,
  DefaultValue,
  selector,
  selectorFamily
} from 'recoil';
import api from '../../api';
import { Moment } from '../../models/meeting';
import { getAccessToken } from '../auth';
import {
  currentUserFeatureState,
  currentUserOptionalState
} from '../currentUser';
import { syncFromRealtime } from '../effects';
import { MeetingCursor, meetingState } from '../meetings';

// Moments can be looked up by encoded ID or client ID.
export type MomentCursor = [string | undefined, string | undefined];

export const momentClientState = atomFamily<
  Partial<Moment> | undefined,
  string
>({
  key: 'momentClientState',
  default: undefined
});

export const momentServerState = atomFamily<
  Partial<Moment> | undefined,
  string
>({
  key: 'momentServerState',
  default: undefined,
  effects_UNSTABLE: (id) => [
    syncFromRealtime((msg, setSelf) => {
      if (
        msg.event_type !== 'moment.created' &&
        msg.event_type !== 'moment.updated' &&
        msg.event_type !== 'moment.deleted'
      ) {
        return;
      }

      if (msg.event_data.encoded_id !== id) {
        return;
      }

      setSelf((moment) => ({
        ...moment,
        ...msg.event_data,

        task: {
          ...moment?.task!,
          ...msg.event_data.task,
          assignee: msg.event_data.task?.assignee && {
            ...msg.event_data.task?.assignee
          }
        }
      }));
    })
  ]
});

export const momentState = selectorFamily<
  Partial<Moment> | undefined,
  MomentCursor
>({
  key: 'momentState',
  get:
    ([id, clientId]) =>
    ({ get }) => {
      return {
        ...(clientId ? get(momentClientState(clientId)) : {}),
        ...(id ? get(momentServerState(id)) : {})
      };
    },
  set:
    ([id, clientId]) =>
    ({ set }, value) => {
      if (clientId) {
        set(momentClientState(clientId), value);
      }

      if (id) {
        set(momentServerState(id), value);
      }

      if (!clientId && !(value instanceof DefaultValue) && value?.client_id) {
        set(momentClientState(value?.client_id), value);
      }
    }
});

export const momentPositionState = selectorFamily<
  number | null | undefined,
  MomentCursor
>({
  key: 'momentPositionState',
  get:
    (cursor) =>
    ({ get }) =>
      get(momentState(cursor))?.position
});

export const meetingMomentsState = selectorFamily<Moment[], MeetingCursor>({
  key: 'meetingMomentsState',
  get:
    (cursor) =>
    ({ get }) => {
      const { moments = [] } = get(meetingState(cursor));

      return moments.map((moment) => ({
        ...moment,
        ...get(momentState([moment.encoded_id, moment.client_id]))
      }));
    }
});

export const meetingSuggestedMomentsState = selectorFamily<
  Moment[],
  MeetingCursor
>({
  key: 'meetingSuggestedMomentsState',
  get:
    (cursor) =>
    ({ get }) => {
      const moments = get(meetingMomentsState(cursor));
      const aiMetadataContinuousFeature = get(
        currentUserFeatureState('ai_metadata_continuous')
      );
      const aiMetadataReviewTriggeredMomentsFeature = get(
        currentUserFeatureState('ai_metadata_review_triggered_moments')
      );

      return moments.filter((moment) => {
        const providerValid =
          !!moment.provider &&
          (aiMetadataReviewTriggeredMomentsFeature.enabled
            ? true
            : moment.provider !== 'trigger');
        const acceptedValid = aiMetadataContinuousFeature.enabled
          ? moment.accepted !== true
          : moment.accepted !== true && moment.accepted !== false;

        return providerValid && acceptedValid;
      });
    }
});

export const actionsServerState = selector<Moment[]>({
  key: 'actionsServerState',
  get: async () => {
    const token = await getAccessToken();
    const { comments } = await api.moments.fetchActions(token);

    return comments;
  }
});

export const createdMomentsState = atom<Moment[]>({
  key: 'createdMomentsState',
  default: [],
  effects_UNSTABLE: [
    syncFromRealtime((msg, setSelf) => {
      if (msg.event_type === 'moment.created') {
        setSelf((moments) => [
          ...moments,
          {
            ...msg.event_data,
            meeting: {
              encoded_id: msg.entity_id
            }
          }
        ]);
      }
    })
  ]
});

export const createdActionsState = selector<Moment[]>({
  key: 'createdActionsState',
  get: ({ get }) => {
    return get(createdMomentsState).filter((moment) => !!moment.task);
  }
});

export const actionsState = selector<Moment[]>({
  key: 'actionsState',
  get: ({ get }) => {
    return uniqBy(
      [...get(actionsServerState), ...get(createdActionsState)],
      'encoded_id'
    )
      .map((moment) => ({
        ...moment,
        ...get(momentState([moment.encoded_id, moment.client_id]))
      }))
      .filter(({ deleted }) => !deleted)
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }
});

export const incompleteActionsState = selector<Moment[]>({
  key: 'incompleteActionsState',
  get: ({ get }) => {
    return get(actionsState).filter(({ task }) => task && !task.complete);
  }
});

export const yourIncompleteActionsState = selector<Moment[]>({
  key: 'yourIncompleteActionsState',
  get: ({ get }) => {
    const currentUser = get(currentUserOptionalState);
    return get(incompleteActionsState).filter(
      (action) =>
        action.task?.assignee?.display_name === currentUser?.display_name
    );
  }
});
