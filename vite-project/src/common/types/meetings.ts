import { Contact } from './contacts';
import { Ability } from './abilities';
import { Moment, MomentType } from './moments';
import { NotesSectionBlock } from './notes';
import { Channel } from './channels';
import { Subscription } from './teams';
import {
  TranscriptChapter,
  TranscriptLanguage,
  TranscriptSection,
  TranscriptSpeaker,
  TranscriptSpeakerTime,
  TranscriptSuggestedSpeaker
} from './transcript';

type MeetingProvider =
  | 'api'
  | 'dubber'
  | 'web_capture'
  | 'twilio'
  | 'browser'
  | 'microsoft_office365';

type MeetingProviderStatus = 'scheduled' | 'in-progress' | 'completed';

type MeetingStatus =
  | 'scheduled'
  | 'upcoming'
  | 'in-progress'
  | 'completed'
  | 'processing'
  | 'error'
  | 'ringing'
  | 'on-hold'
  | 'cancelled'
  | 'busy'
  | 'stopping'
  | 'uploading'
  | 'past';

export interface InviteMeeting {
  encoded_id: string;
  title: string;
  owner: Contact;
  status: MeetingStatus;
  provider: MeetingProvider;
  provider_status: MeetingProviderStatus;
  started_at?: string;
  ended_at?: string;
  scheduled_start_at?: string;
  scheduled_end_at?: string;
  completed_at?: string;
}

export interface MeetingSearchHighlight {
  start_time: number;
  text: string;
  type: 'transcript';
}

export interface SlimMeetingSearchHighlights {
  highlights: MeetingSearchHighlight[];
}

export interface SlimMeeting extends Partial<SlimMeetingSearchHighlights> {
  encoded_id: string;
  created_at: string;
  updated_at?: string;
  started_at?: string;
  ended_at?: string;
  deleted_at?: string;
  title: string;
  status: MeetingStatus;
  provider: MeetingProvider;
  provider_status: MeetingProviderStatus;
  has_audio?: boolean;
  has_video?: boolean;
  tags: string[];
}

export interface MeetingNotes {
  notes: NotesSectionBlock[];
  notes_state: string;
}

export interface MeetingInsights {
  transcript: string;
  languages?: TranscriptLanguage[];
  sections: TranscriptSection[];
  interim_transcript?: string;
  chapters: TranscriptChapter[];
  speakers?: TranscriptSpeaker[];
  speaker_times?: TranscriptSpeakerTime[];
  suggested_speakers: TranscriptSuggestedSpeaker[];
}

export interface MeetingComments {
  has_suggested_comments: boolean;
  moments: Moment[];
}

export interface MeetingSubscription {
  owner_subscription?: Subscription;
  owner_subscription_will_renew: boolean;
  owner_subscription_active: boolean;
}

export interface MeetingChannels {
  channels: Channel[];
}

export interface Meeting
  extends SlimMeeting,
    Partial<MeetingNotes>,
    Partial<MeetingInsights>,
    Partial<MeetingComments>,
    Partial<MeetingSubscription>,
    Partial<MeetingChannels> {
  updates_channel: string;
  updates_token: string;
  encoded_id: string;
  dubber_recording_id?: string;
  duration?: number;
  collaborators?: Contact[];
  viewers?: MeetingViewer[];
  primary_meeting_session_id?: number;
  owner?: Contact;
  meeting_data: MeetingData;
  can_auto_join: boolean;
  auto_join: boolean;
  join_scheduled: boolean;
  join_permitted: boolean;
  meeting_series_id?: number;
  attendees?: Contact[];
  scheduled_start_at?: string;
  scheduled_end_at?: string;
  completed_at?: string;
}

export interface MeetingCapabilities {
  restricted: boolean;
  edit: boolean;
  abilities: Ability[];
}

export interface FullMeeting {
  encoded_id?: string;
  meeting: Meeting;
  capabilities: MeetingCapabilities;
  moment_types: MomentType[];
}

export interface PendingMeeting {
  encoded_id: string;
  meeting_series_id?: number;
  scheduled_start_at: string;
  scheduled_end_at: string;
  title: string;
  attendee_count: number;
}

export interface MeetingRecording {
  self?: string;
  recording?: string;
  recording_url?: string;
}

export interface MeetingViewer {
  id: string;
  display_name: string;
  email: string;
  avatar_url?: string;
  viewed_at: string;
}

export interface MeetingData {
  conference_number?: string;
  conference_password?: string;
  conference_provider?: string;
  join_score?: number;
  meeting_id?: string;
  meeting_url?: string;
  scheduled_end_at?: string;
}

export interface MeetingSeriesData {
  encoded_id: string;
  provider_status: MeetingProviderStatus;
  scheduled_start_at?: string;
  scheduled_end_at?: string;
  duration?: number;
  started_at?: string;
  ended_at?: string;
}
export interface ProviderMeetingSeries {
  encoded_id: string;
  meetings: MeetingSeriesData[];
  meeting: FullMeeting;
}
export interface MeetingSeries {
  encoded_id: string;
  meetings: MeetingSeriesData[];
}