import { useMemo } from 'react';
import { Editor, Element, Node, Point, Range } from 'slate';
import { ReactEditor, useSlate } from 'slate-react';

export const calculateSlashRange = (
  editor: ReactEditor,
  selection: Range
): Range | undefined => {
  const entry = Editor.above(editor, {
    at: selection,
    mode: 'lowest',
    match: Element.isElement
  });

  if (!entry) {
    return;
  }

  const [block] = entry;
  const text = Node.string(block);
  const slashIndex = text.lastIndexOf('/');

  if (slashIndex === -1) {
    return;
  }

  const anchor: Point = {
    path: selection.anchor.path,
    offset: slashIndex
  };

  const focus: Point = {
    path: selection.anchor.path,
    offset: text.length
  };

  return {
    anchor,
    focus
  };
};

const useSlashRange = (): Range | undefined => {
  const editor = useSlate();
  const selection = editor.selection;

  return useMemo(() => {
    if (!selection) {
      return;
    }

    return calculateSlashRange(editor, selection);
  }, [selection]);
};

export default useSlashRange;