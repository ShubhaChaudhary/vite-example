import React, { useRef, useEffect } from 'react';
import { ReactEditor, useSlate } from 'slate-react';
import { Editor, Text, Transforms } from 'slate';
import { Range } from 'slate';
import tw from 'twin.macro';

const toggleFormat = (editor: Editor, format: string) => {
  const isActive = isFormatActive(editor, format);
  Transforms.setNodes(
    editor,
    { [format]: isActive ? null : true },
    { match: Text.isText, split: true }
  );
};

const isFormatActive = (editor: Editor, format: string) => {
  const [match] = Editor.nodes(editor, {
    match: (n) => n[format] === true,
    mode: 'all'
  });
  return !!match;
};

interface FormatButtonProps {
  format: string;
  children: React.ReactNode;
}

const FormatButton: React.FC<FormatButtonProps> = ({ format, children }) => {
  const editor = useSlate();
  const isActive = isFormatActive(editor, format);

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        toggleFormat(editor, format);
      }}
      css={[
        isActive ? tw`bg-gray-600` : tw`bg-gray-900`,
        tw`py-0.5 w-5 flex justify-center items-center text-xs rounded-sm hover:bg-gray-500 focus:bg-gray-500 text-white dark:bg-dark-6 dark:text-white`
      ]}
    >
      {children}
    </button>
  );
};

interface Props {
  parentRef: React.MutableRefObject<HTMLDivElement | null>;
}

const EditorFormatMenu: React.FC<Props> = ({ parentRef }) => {
  const ref = useRef<HTMLDivElement>(null);
  const editor = useSlate();

  useEffect(() => {
    if (!parentRef) {
      return;
    }

    const el = ref.current;
    const { selection } = editor;

    if (!el) {
      return;
    }

    if (
      !selection ||
      !ReactEditor.isFocused(editor) ||
      Range.isCollapsed(selection) ||
      Editor.string(editor, selection) === ''
    ) {
      el.removeAttribute('style');
      return;
    }

    const domSelection = window.getSelection()!;
    const domRange = domSelection.getRangeAt(0);
    if (!domRange) {
      return;
    }

    if (!parentRef.current) {
      return;
    }

    const parentRect = parentRef.current.getBoundingClientRect();
    const selectionRect = domRange.getBoundingClientRect();

    el.style.opacity = '1';
    el.style.top = `${
      selectionRect.top - parentRect.top - el.offsetHeight - 2
    }px`;
    el.style.left = `
      ${
        selectionRect.left -
        parentRect.left -
        el.offsetWidth / 2 +
        selectionRect.width / 2
      }px
    `;
  });

  return (
    <div
      ref={ref}
      css={tw`p-1 absolute -top-10000 -left-10000 opacity-0 z-10 rounded-md flex justify-center items-center space-x-1 bg-gray-900 transition transition-opacity duration-75`}
    >
      <FormatButton format="bold">
        <b>{'B'}</b>
      </FormatButton>

      <FormatButton format="italic">
        <i>{'I'}</i>
      </FormatButton>
    </div>
  );
};

export default EditorFormatMenu;