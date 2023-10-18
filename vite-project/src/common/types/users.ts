import { Feature, Subscription } from '.';

export type LocaleCode = 'en' | 'fr';

export interface CalendarIdentity {
  encoded_id: string;
  uid: string;
  provider: string;
  calendar_readable?: boolean;
  calendar_writable?: boolean;
  created_at: string;
  updated_at: string;
}

export interface DubberIdentity {
  encoded_id: string;
  uid: string;
  tid: string;
  provider: string;
  created_at: string;
  updated_at: string;
}

export interface SpeakerModel {
  enrolment_count: number;
  trained: boolean;
}

export interface CurrentUser {
  id: number;
  encoded_id: string;
  calendar_connected: boolean;
  onboarded_at: string;
  deleted_at?: string;
  time_zone: string;
  features: { [name: string]: Feature };
  email: string;
  email_provider?: string | null;
  first_name: string;
  last_name?: string | null;
  username: string;
  display_name?: string;
  dubber_identity: DubberIdentity;
  has_calendars?: boolean;
  role?: string;
  meeting_types?: string[];
  meeting_tasks?: string[];
  avatar_url?: string;
  created_by_invite: boolean;
  invitation_accepted_at?: string;
  invitation_sent_at?: string;
  last_sign_in_at?: string;
  phone_number?: string;
  feedback_url: string;
  mobile_user: boolean;
  attach_calendar_event_link: boolean;
  auto_join: boolean;
  auto_join_with: string;
  auto_join_without: string;
  notification_accepted?: boolean;
  notification_channels?: boolean;
  notification_missing_data?: boolean;
  notification_digest?: boolean;
  notification_processed?: boolean;
  notification_reminder?: boolean;
  notification_task?: boolean;
  calendar_sync_queued_at: string | null;
  calendar_sync_started_at: string | null;
  calendar_sync_finished_at: string | null;
  realtime_host_url: string;
  profile_complete: boolean;
  ws_token: string;
  channel_name: string;
  voice_profile: SpeakerModel;
  voice_enrolment_scripts_url: string;
  auth_token: null;
  early_access_features_url: string;
  industry?: string;
  first_promoter_auth_token?: string;
  admin: boolean;
  identities?: CalendarIdentity[];
  language?: string;
  subscription?: Subscription;
  subscription_active: boolean;
  subscription_will_renew: boolean;
}