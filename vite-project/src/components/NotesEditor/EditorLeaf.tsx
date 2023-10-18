import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Node } from 'slate';
import { ReactEditor, RenderElementProps, useSlateStatic } from 'slate-react';
import styled, { css } from 'styled-components';
import tw from 'twin.macro';
import { NotesHeadingBlock } from '../../models/notes';
import { handleError } from '../../utils/errors';
import EditorBlock from './EditorBlock';

const HeadingContent = styled.h2<{ placeholder: string }>`
  ${tw`text-xl font-bold relative w-full`}
  ${({ placeholder }) => css`
    &:after {
      ${tw`absolute top-0 left-0 opacity-25 pointer-events-none select-none`}
      content: "${placeholder}";
    }
  `}
`;

interface EditorHeadingProps extends RenderElementProps {
  element: NotesHeadingBlock;
}

const EditorHeading: React.FC<EditorHeadingProps> = ({
  attributes,
  children,
  element
}) => {
  const { t } = useTranslation();
  const editor = useSlateStatic();
  const [isFirstSection, setFirstSection] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(false);

  useEffect(() => {
    try {
      const path = ReactEditor.findPath(editor, element);

      setShowPlaceholder(!Node.string(element));
      setFirstSection(path?.length > 0 && path[0] === 0);
    } catch (err: any) {
      handleError(err);
    }
  }, [element]);

  const placeholder = element.placeholder
    ? element.placeholder
    : isFirstSection
    ? t('meetings:notes_untitled_section')
    : t('meetings:notes_section');

  return (
    <EditorBlock element={element} attributes={attributes}>
      <HeadingContent
        placeholder={showPlaceholder ? placeholder : ''}
        data-testid={'Meeting Notes - Heading'}
      >
        {children}
      </HeadingContent>
    </EditorBlock>
  );
};

export default EditorHeading;
