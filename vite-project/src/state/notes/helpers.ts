import { useCallback } from 'react';
import {
  noteEvents,
  NoteInsertActionEvent,
  NoteInsertMomentEvent,
  NoteInsertMomentsEvent,
  NoteInsertSectionEvent,
  NoteUpdateAwarenessEvent,
  NoteUpdateReadOnlyEvent
} from '.';
import { Moment } from '../../models/meeting';
import { MeetingCursor } from '../meetings';

export const useNoteHelpers = () => {
  const updateAwareness = useCallback(
    (cursor: MeetingCursor, awareness: { email: string; name: string }[]) => {
      noteEvents.emit('updateawareness', {
        cursor,
        awareness
      } as NoteUpdateAwarenessEvent);
    },
    []
  );

  const updateReadOnly = useCallback(
    (cursor: MeetingCursor, readOnly: boolean) => {
      noteEvents.emit('updatereadonly', {
        cursor,
        readOnly
      } as NoteUpdateReadOnlyEvent);
    },
    []
  );

  const insertMoment = useCallback(
    (cursor: MeetingCursor, moment: Moment, sectionId?: string) => {
      noteEvents.emit('insertmoment', {
        cursor,
        moment,
        sectionId
      } as NoteInsertMomentEvent);
    },
    []
  );

  const insertMoments = useCallback(
    (cursor: MeetingCursor, moments: Moment[]) => {
      noteEvents.emit('insertmoments', {
        cursor,
        moments
      } as NoteInsertMomentsEvent);
    },
    []
  );

  const insertSection = useCallback((cursor: MeetingCursor) => {
    noteEvents.emit('insertsection', {
      cursor
    } as NoteInsertSectionEvent);
  }, []);

  const insertAction = useCallback((cursor: MeetingCursor) => {
    noteEvents.emit('insertaction', {
      cursor
    } as NoteInsertActionEvent);
  }, []);

  return {
    updateAwareness,
    updateReadOnly,
    insertMoment,
    insertMoments,
    insertAction,
    insertSection
  };
};