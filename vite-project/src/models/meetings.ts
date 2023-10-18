import { Contact } from '../common/types/contacts';
import {
  MeetingCapabilities,
  MeetingData,
  Meeting,
  MeetingViewer,
  MeetingRecording,
  PendingMeeting,
  ProviderMeetingSeries
} from '../common/types/meetings';
import { Moment, MomentType } from '../common/types/moments';
import { NotesAwareness } from '../common/types/notes';
import { ShareField, Share } from '../common/types/shares';
import { Task } from '../common/types/tasks';
import {
  TranscriptChapter,
  TranscriptLanguage,
  TranscriptSection,
  TranscriptSegment,
  TranscriptSpeaker,
  TranscriptSpeakerTime,
  TranscriptSuggestedSpeaker,
  TranscriptToken
} from '../common/types/transcript';
import { Model } from './common';

export type {
  Task,
  Moment,
  MomentType,
  ShareField as MomentShareField,
  Share as MomentShare,
  TranscriptSpeaker as Speaker,
  TranscriptSpeakerTime as SpeakerTime,
  MeetingCapabilities,
  TranscriptLanguage as MeetingLanguage,
  TranscriptToken as MeetingToken,
  TranscriptSection as MeetingSection,
  TranscriptSegment as MeetingSegment,
  MeetingViewer,
  MeetingRecording,
  MeetingData,
  Meeting,
  PendingMeeting,
  ProviderMeetingSeries
};

export interface TranscriptPositionToken {
  section: number;
  token: number;
}

export interface TranscriptPosition {
  start: TranscriptPositionToken;
  end: TranscriptPositionToken;
  anchorElement?: HTMLElement;
  focusElement?: HTMLElement;
}

export type MeetingAttendee = Contact;
export type MeetingCollaborator = Contact;

export interface MeetingTranscript {
  languages?: TranscriptLanguage[];
  sections: TranscriptSection[];
  speakers: TranscriptSpeaker[];
  chapters: TranscriptChapter[];
  suggested_speakers?: TranscriptSuggestedSpeaker[];
  speaker_times: TranscriptSpeakerTime[];
  interim_transcript: string;
}

export type ConferenceRecordingProvider =
  | 'twilio'
  | 'web_capture'
  | 'microsoft_office365';

export interface MeetingEvent extends Model {
  created_at: string;
  updated_at: string;
  title: string;
  provider: string;
  auto_join: boolean;
  url: string;
  status: string;
  starts_at: string;
  ends_at: string;
  can_auto_join: boolean;
  auto_join_reason: string;
  attendees: MeetingAttendee[];
  meeting_data: MeetingData;
}

export type MeetingAwareness = NotesAwareness;

export interface MeetingPlayer extends MeetingAwareness {
  active?: boolean;
  viewedAt?: string;
}

export interface MeetingProcessingCompletion {
  media: boolean;
  transcription: boolean;
  speakers: boolean;
  chapters: boolean;
  suggestions: boolean;
}