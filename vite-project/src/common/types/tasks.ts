import { Contact } from './contacts';

export interface TaskUpdates {
  assignee_id?: string | null;
}

export interface Task extends Partial<TaskUpdates> {
  id: number;
  encoded_id: string;
  due_at?: string;
  complete: boolean;
  assignee?: Contact;
}