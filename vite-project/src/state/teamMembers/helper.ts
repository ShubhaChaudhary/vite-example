import { useRecoilCallback } from 'recoil';
import api from '../../api';
import { track } from '../../utils/analytics';
import { teamMembersState } from '.';
import { Contact } from '../../common';
import { getAccessToken } from '../auth';

export const useTeamMemberHelpers = () => {
  const invite = useRecoilCallback(
    ({ set, snapshot }) =>
      async (emails: string) => {
        const token = await getAccessToken();
        const members = await snapshot.getPromise(teamMembersState);
        const { members: result } = await api.settings.createTeamMembers(
          token,
          {
            emails
          }
        );

        set(teamMembersState, {
          ...members,
          ...result.reduce(
            (result: Record<string, Contact>, member: Contact) => ({
              ...result,

              [member.id!]: member
            }),
            {}
          )
        });

        track('team.members.invite.created', { memberCount: members.length });
      },
    []
  );

  const resendInvite = useRecoilCallback(
    ({ set, snapshot }) =>
      async (memberId: string) => {
        const token = await getAccessToken();
        const members = await snapshot.getPromise(teamMembersState);

        await api.settings.resendTeamMemberInvite(token, {
          id: memberId
        });

        set(teamMembersState, {
          ...members,

          [memberId]: {
            ...members[memberId],

            deleted_at: undefined
          }
        });

        track('team.members.invite.resent', { memberId });
      },
    []
  );

  const deactivate = useRecoilCallback(
    ({ set, snapshot }) =>
      async (memberId: string) => {
        const token = await getAccessToken();
        const members = await snapshot.getPromise(teamMembersState);

        await api.settings.deleteTeamMember(token, {
          id: memberId
        });

        set(teamMembersState, {
          ...members,

          [memberId]: {
            ...members[memberId],

            deleted_at: new Date().toISOString()
          }
        });

        track('team.member.deactivated', { memberId });
      },
    []
  );

  const activate = useRecoilCallback(
    ({ set, snapshot }) =>
      async (memberId: string) => {
        const token = await getAccessToken();
        const members = await snapshot.getPromise(teamMembersState);

        await api.settings.restoreTeamMember(token, {
          id: memberId
        });

        set(teamMembersState, {
          ...members,

          [memberId]: {
            ...members[memberId],

            deleted_at: undefined
          }
        });

        track('team.member.activated', { memberId });
      },
    []
  );

  const setAdmin = useRecoilCallback(
    ({ set, snapshot }) =>
      async (memberId: string, isAdmin: boolean) => {
        const token = await getAccessToken();
        const members = await snapshot.getPromise(teamMembersState);

        // Optimistically updated unlike the other team helpers.
        set(teamMembersState, {
          ...members,

          [memberId]: {
            ...members[memberId],

            is_admin: isAdmin
          }
        });

        await api.settings.setTeamMemberAdmin(token, {
          id: memberId,
          isAdmin
        });

        track('team.member.role_changed', {
          memberId: memberId,
          role: isAdmin ? 'team_admin' : 'team_member'
        });
      },
    []
  );

  return {
    invite,
    resendInvite,
    setAdmin,
    deactivate,
    activate
  };
};