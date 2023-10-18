import { Tag } from './tag';
import { Meeting, MeetingTranscript, Moment, MomentShare } from './meeting';
import { Team } from './team';
import { User } from './user';

interface AppUpdatedMessage {
  event_type: 'app.updated';
  event_data: {};
}

interface MeetingUpdatedMessage {
  event_type: 'meeting.updated';
  event_data: Meeting;
}

interface MeetingCreatedMessage {
  event_type: 'meeting.created';
  event_data: Meeting;
}

interface MeetingDeletedMessage {
  event_type: 'meeting.deleted';
  event_data: Meeting;
}

interface MeetingTranscriptUpdatedMessage {
  event_type: 'meeting_transcript.updated';
  event_data: {
    encoded_id: string;
    changes: {
      appended: Partial<MeetingTranscript>;
      updated: Partial<MeetingTranscript>;
    };
  };
}

interface UserUpdatedMessage {
  event_type: 'user.updated';
  event_data: User;
}

interface CalendarSyncMessage {
  event_type: 'calendar.sync_started' | 'calendar.sync_finished';
  event_data: {
    calendar_sync_queued_at?: string;
    calendar_sync_started_at?: string;
    calendar_sync_finished_at?: string;
    calendar_sync_last_finished_at?: string;
  };
}

interface TeamUpdatedMessage {
  event_type: 'team.updated';
  event_data: {
    team: Team;
  };
}

// TODO remove or leave for channels 2.0
interface TeamChannelsUpdatedMessage {
  event_type: 'team.channels.updated';
  event_data: {
    channels: Tag[];
  };
}

interface MomentUpdatedMessage {
  event_type: 'moment.updated';
  event_data: Moment;
  entity_id: string;
}

interface MomentCreatedMessage {
  event_type: 'moment.created';
  event_data: Moment;
  entity_id: string;
}

interface MomentDeletedMessage {
  event_type: 'moment.deleted';
  event_data: Moment;
  entity_id: string;
}

interface MomentSuggestedMessage {
  event_type: 'moment.suggested';
  event_data: Moment;
  entity_id: string;
}

interface ShareUpdatedMessage {
  event_type: 'share.updated';
  event_data: MomentShare;
}

interface ShareErrorMessage {
  event_type: 'share.error';
  event_data: MomentShare;
}

export type RealtimeMessage =
  | AppUpdatedMessage
  | MeetingUpdatedMessage
  | MeetingCreatedMessage
  | MeetingDeletedMessage
  | MeetingTranscriptUpdatedMessage
  | UserUpdatedMessage
  | CalendarSyncMessage
  | TeamUpdatedMessage
  | TeamChannelsUpdatedMessage
  | MomentUpdatedMessage
  | MomentCreatedMessage
  | MomentDeletedMessage
  | MomentSuggestedMessage
  | ShareUpdatedMessage
  | ShareErrorMessage;