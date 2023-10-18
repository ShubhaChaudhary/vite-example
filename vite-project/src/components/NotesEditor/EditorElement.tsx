import React from 'react';
import { RenderElementProps } from 'slate-react';
import EditorSection from './EditorSection';
import EditorHeading from './EditorHeading';
import EditorText from './EditorText';
import EditorActions from './EditorActions';
import EditorAction from './EditorAction';
import EditorLink from './EditorLink';
import {
  NotesActionBlock,
  NotesActionsBlock,
  NotesHeadingBlock,
  NotesSectionBlock,
  NotesTextBlock
} from '../../models/notes';
import { NotesElement, NotesLink } from '../../common';

export interface EditorElementProps extends RenderElementProps {
  element: NotesElement;
}

const EditorElement: React.FC<EditorElementProps> = ({ element, ...props }) => {
  if (element.type === 'section') {
    return <EditorSection element={element as NotesSectionBlock} {...props} />;
  }

  if (element.type === 'heading') {
    return <EditorHeading element={element as NotesHeadingBlock} {...props} />;
  }

  if (element.type === 'actions') {
    return <EditorActions element={element as NotesActionsBlock} {...props} />;
  }

  if (element.type === 'action') {
    return <EditorAction element={element as NotesActionBlock} {...props} />;
  }

  if (element.type === 'link') {
    return <EditorLink element={element as NotesLink} {...props} />;
  }

  return <EditorText element={element as NotesTextBlock} {...props} />;
};

export default EditorElement;
