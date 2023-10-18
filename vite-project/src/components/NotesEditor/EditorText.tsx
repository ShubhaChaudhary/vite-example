import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { Node } from 'slate';
import {
  RenderElementProps,
  useFocused,
  useReadOnly,
  useSelected,
  useSlateStatic
} from 'slate-react';
import tw from 'twin.macro';
import { NotesTextBlock } from '../../models/notes';
import { useFeature } from '../../state/currentUser/helpers';
import { meetingNotesHasContentState } from '../../state/meetings';
import EditorBlock from './EditorBlock';

interface EditorTextProps extends RenderElementProps {
  element: NotesTextBlock;
}

const EditorText: React.FC<EditorTextProps> = ({
  attributes,
  children,
  element
}) => {
  const { t } = useTranslation();
  const editor = useSlateStatic();
  const selected = useSelected();
  const focused = useFocused();
  const cursor = editor.meetingCursor;
  const readOnly = useReadOnly();
  const [showPlaceholder, setShowPlaceholder] = useState(false);

  useEffect(() => {
    setShowPlaceholder(!Node.string(element) && focused && selected);
  }, [element, focused, selected]);

  const hasContent = useRecoilValue(meetingNotesHasContentState(cursor));
  const notesTemplates = useFeature('notes_templates');
  const placeholder = element.placeholder
    ? element.placeholder
    : !hasContent && notesTemplates.enabled
    ? t('meetings:notes_add_new_or_select')
    : t('meetings:notes_add_new');

  return (
    <EditorBlock element={element} attributes={attributes}>
      {showPlaceholder && !readOnly && (
        <span
          contentEditable={false}
          css={tw`absolute opacity-25 pointer-events-none select-none truncate w-11/12`}
          data-testid={'Notes Editor - Text'}
        >
          {placeholder}
        </span>
      )}

      <p css={tw`flex-1 break-words w-11/12`}>{children}</p>
    </EditorBlock>
  );
};

export default EditorText;