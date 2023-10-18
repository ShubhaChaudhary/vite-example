import React, { useCallback } from 'react';
import { RenderElementProps } from 'slate-react';
import tw from 'twin.macro';
import { NotesLink } from '../../common';

interface EditorLinkProps extends RenderElementProps {
  element: NotesLink;
}

const EditorLink: React.FC<EditorLinkProps> = ({
  element,
  attributes,
  children
}) => {
  const onClick = useCallback(
    (event: React.MouseEvent) => {
      if (!event.metaKey) {
        return;
      }

      event.preventDefault();
      window.open(element.href, '_blank');

      return false;
    },
    [element.href]
  );

  return (
    <a
      href={element.href}
      title={element.title}
      css={tw`underline text-primary-500 dark:text-white`}
      onClick={onClick}
      {...attributes}
    >
      {children}
    </a>
  );
};

export default EditorLink;