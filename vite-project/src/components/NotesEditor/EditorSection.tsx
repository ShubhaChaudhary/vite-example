import React from 'react';
import { RenderElementProps } from 'slate-react';
import { NotesSectionBlock } from '../../models/notes';

interface EditorSectionProps extends RenderElementProps {
  element: NotesSectionBlock;
}

const EditorSection: React.FC<EditorSectionProps> = ({
  attributes,
  children
}) => {
  return <div {...attributes}>{children}</div>;
};

export default EditorSection;