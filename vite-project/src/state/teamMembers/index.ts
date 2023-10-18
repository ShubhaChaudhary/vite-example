import { atom, noWait, selector } from 'recoil';
import api from '../../api';
import { Ability } from '../../common/types/abilities';
import { Contact } from '../../common/types/contacts';
import { handleError } from '../../utils/errors';
import { maybeGetAccessToken } from '../auth';
import { currentUserFeatureState } from '../currentUser';

export const teamMembersFullServerState = selector({
  key: 'teamMembersFullServerState',
  get: async () => {
    const token = await maybeGetAccessToken();

    // Handle anonymous users on public meeting pages.
    if (!token) {
      return {
        members: [] as Contact[],
        capabilities: {
          abilities: [] as Ability[]
        }
      };
    }

    try {
      return api.settings.fetchTeamMembers(token, {
        deactivated: true
      });
    } catch (err: any) {
      handleError(err);

      return {
        members: [] as Contact[],
        capabilities: {
          abilities: [] as Ability[]
        }
      };
    }
  }
});

export const teamMembersServerState = selector<Record<string, Contact>>({
  key: 'teamMembersServerState',
  get: ({ get }) => {
    const { members } = get(teamMembersFullServerState);

    return members.reduce(
      (result: Record<string, Contact>, member: Contact) => ({
        ...result,
        [member.id!]: member
      }),
      {}
    );
  }
});

export const teamMembersState = atom<Record<string, Contact>>({
  key: 'teamMembersState',
  default: teamMembersServerState
});

export const teamMembersActiveState = selector<Contact[]>({
  key: 'teamMembersActiveState',
  get: ({ get }) => {
    return Object.values(get(teamMembersState)).filter(
      ({ deleted_at, last_sign_in_at }) =>
        !deleted_at && last_sign_in_at !== null
    );
  }
});

export const teamMembersDeactivatedState = selector<Contact[]>({
  key: 'teamMembersDeactivatedState',
  get: ({ get }) => {
    return Object.values(get(teamMembersState)).filter(
      (member) => !!member.deleted_at
    );
  }
});

export const teamMembersInvitedState = selector<Contact[]>({
  key: 'teamMembersInvitedState',
  get: ({ get }) => {
    return Object.values(get(teamMembersState)).filter(
      ({ deleted_at, created_by_invite, last_sign_in_at }) =>
        !deleted_at && created_by_invite && !last_sign_in_at
    );
  }
});

export const teamMembersLimitState = selector<number | null>({
  key: 'teamMembersLimitState',
  get: ({ get }) => {
    const feature = get(currentUserFeatureState('add_team_members'));

    return feature.limit.amount;
  }
});

export const teamMembersUsageState = selector<number>({
  key: 'teamMembersUsageState',
  get: ({ get }) => {
    const feature = get(currentUserFeatureState('add_team_members'));
    const members = get(noWait(teamMembersActiveState));

    return members.state === 'hasValue'
      ? members.contents.length
      : feature.limit.usage || 0;
  }
});