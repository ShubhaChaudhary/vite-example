import { Contact } from './contacts';
import { MeetingData } from './meetings';

export interface Event {
  id: number;
  encoded_id: string;
  created_at: string;
  updated_at: string;
  title: string;
  provider: '';
  auto_join: boolean;
  url?: string;
  status: 'upcoming';
  duration?: 0;
  starts_at: string;
  ends_at: string;
  can_auto_join: boolean;
  attendees: Contact[];
  meeting_data: MeetingData;
}