import { SpeakerModel } from '.';

export interface Contact {
  id?: string;
  display_name?: string;
  avatar_url?: string;
  email?: string;
  first_name?: string;
  primary_role?: 'organizer' | 'owner' | 'editor' | 'viewer';
  last_name?: string;
  invitation_sent_at?: string;
  invitation_accepted_at?: string;
  created_by_invite?: boolean;
  deleted_at?: string;
  last_sign_in_at?: string;
  voice_profile?: SpeakerModel;
  is_owner?: boolean;
  is_admin?: boolean;
}