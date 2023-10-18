import { HistoryEditor } from 'slate-history';
import { ReactEditor } from 'slate-react';
import { CursorEditor, YjsEditor } from 'slate-yjs';
import {
  NotesActionBlock,
  NotesActionsBlock,
  NotesBlock,
  NotesHeadingBlock,
  NotesSectionBlock,
  NotesTextBlock,
  NotesText,
  NotesElement
} from '../common/types/notes';
import { NotesEditor } from '../components/NotesEditor/withNotesEditor';

export type {
  NotesBlock,
  NotesTextBlock,
  NotesText,
  NotesHeadingBlock,
  NotesSectionBlock,
  NotesActionsBlock,
  NotesActionBlock
};
declare module 'slate' {
  interface CustomTypes {
    Editor: NotesEditor &
      ReactEditor &
      HistoryEditor &
      YjsEditor &
      CursorEditor;
    Element: NotesElement;
    Text: NotesText;
  }
}