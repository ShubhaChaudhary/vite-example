import {
    Transforms,
    Element,
    Node,
    Editor,
    NodeEntry,
    Text,
    Range
  } from 'slate';
  import { v4 as uuid } from 'uuid';
  import mitt, { Emitter } from 'mitt';
  import { MeetingCursor } from '../../state/meetings';
  import { useCursors } from 'slate-yjs';
  import { ReactEditor } from 'slate-react';
  import { NotesElement, NotesLink } from '../../common';
  
  // Fix up the children of the section.
  const normalizeSectionChildren = (
    editor: Editor,
    [, path]: NodeEntry<Node>
  ) => {
    let i = 0;
  
    for (const [child, childPath] of Node.children(editor, path)) {
      // All children in an element must be an element
      if (!Element.isElement(child)) {
        Transforms.wrapNodes(
          editor,
          { type: 'text', id: uuid(), children: [] },
          { at: childPath }
        );
        return false;
      }
  
      // Merge children with previous section if first element isn't a heading
      if (i === 0 && child.type !== 'heading' && childPath.length < 3) {
        const sectionEntry = Editor.above(editor, {
          at: childPath,
          match: (node) => Element.isElement(node) && node.type === 'section'
        });
  
        if (!sectionEntry) {
          return false;
        }
  
        const [sectionNode, sectionPath] = sectionEntry;
  
        // Ensure the first section always has a heading
        if (sectionPath[0] == 0) {
          Transforms.setNodes(editor, { type: 'heading' }, { at: childPath });
          return false;
        }
  
        if (!Element.isElement(sectionNode)) {
          return false;
        }
  
        Transforms.mergeNodes(editor, { at: sectionPath });
        return false;
      }
  
      // Disallow sections within sections
      if (childPath.length > 2) {
        Transforms.liftNodes(editor, { at: childPath });
        return false;
      }
  
      // No elements other than the first may be headings
      if (i !== 0 && child.type === 'heading') {
        Transforms.setNodes(editor, { type: 'text' }, { at: childPath });
        return false;
      }
  
      // All elements inside a section need to have a type
      if (!child.type) {
        Transforms.setNodes(editor, { type: 'text' }, { at: childPath });
        return false;
      }
  
      i++;
    }
  
    return true;
  };
  
  // Ensure links don't contain other links and other link normalization.
  const normalizeLink = (editor: Editor, [node, path]: NodeEntry<NotesLink>) => {
    const text = Node.string(node);
  
    if (text) {
      try {
        // Check it's a valid URL - throws an error otherwise
        new URL(text);
  
        // If the href is changed, update it.
        if (node.href !== text.trim()) {
          Transforms.setNodes(editor, { href: text.trim() }, { at: path });
  
          return false;
        }
      } catch (err: any) {
        // Don't set the href if the URL fails to parse (it's probably not a URL anymore/was copy pasted)
      }
    }
  
    for (const [child, childPath] of Node.children(editor, path)) {
      if (Element.isElement(child) && child.type === 'link') {
        Transforms.unwrapNodes(editor, { at: childPath });
  
        return false;
      }
    }
  
    return true;
  };
  
  // Ensuring text and heading blocks have valid children.
  const normalizeHeadingAndText = (editor: Editor, [, path]: NodeEntry<Node>) => {
    for (const [child, childPath] of Node.children(editor, path)) {
      // If the element is a text or heading, ensure it doesn't contain (block) elements as children.
      if (Element.isElement(child) && !editor.isInline(child)) {
        Transforms.unwrapNodes(editor, { at: childPath });
        return false;
      }
  
      if (Text.isText(child)) {
        const urlRegex = /(https?:\/\/[^ ]*)/;
        const match = child.text.match(urlRegex);
  
        if (match) {
          const href = match[0];
          const from = match.index || 0;
          const to = from + href.length;
  
          Transforms.wrapNodes(
            editor,
            { type: 'link', href, children: [] },
            {
              split: true,
              mode: 'lowest',
              at: {
                anchor: {
                  path: childPath,
                  offset: from
                },
  
                focus: {
                  path: childPath,
                  offset: to
                }
              }
            }
          );
  
          return false;
        }
      }
    }
  
    return true;
  };
  
  // Ensure each action list has valid children
  const normalizeActionChildren = (editor: Editor, [, path]: NodeEntry<Node>) => {
    let hasChild = false;
  
    for (const [child, childPath] of Node.children(editor, path)) {
      hasChild = true;
  
      // Each child of the action list must be an element
      if (!Element.isElement(child)) {
        Transforms.wrapNodes(
          editor,
          { type: 'action', id: uuid(), children: [] },
          { at: childPath }
        );
        return false;
      }
  
      // All elements in the action list must be an action
      if (child.type !== 'action') {
        Transforms.setNodes(editor, { type: 'action' }, { at: childPath });
        return false;
      }
  
      // All elements in the actions under the action list must be text
      for (const [subchild, subchildPath] of Node.children(editor, childPath)) {
        if (!Text.isText(subchild)) {
          Transforms.unwrapNodes(editor, { at: subchildPath });
          return false;
        }
      }
    }
  
    // Each action list must have at least one action to stay in the document
    if (!hasChild) {
      Transforms.removeNodes(editor, { at: path });
  
      return false;
    }
  
    return true;
  };
  
  export interface NotesEditor {
    meetingCursor: MeetingCursor;
    hideAwareness: boolean;
    hideBlockMenu: boolean;
    cursors: Emitter;
  }
  
  export interface CursorsUpdateEvent {
    cursors: ReturnType<typeof useCursors>['cursors'];
  }
  
  const isPasteableLink = (text: string) => {
    try {
      new URL(text);
  
      return true;
    } catch (err: any) {
      return false;
    }
  };
  
  interface NotesEditorOptions {
    cursor: MeetingCursor;
    hideBlockMenu?: boolean;
    hideAwareness?: boolean;
  }
  
  const withNotesEditor = (
    editor: ReactEditor,
    { cursor, hideBlockMenu = false, hideAwareness = false }: NotesEditorOptions
  ): Editor & NotesEditor => {
    const { normalizeNode, insertBreak, insertData } = editor;
    const notesEditor = editor as any as ReactEditor & NotesEditor;
  
    notesEditor.meetingCursor = cursor;
    notesEditor.hideBlockMenu = hideBlockMenu;
    notesEditor.hideAwareness = hideAwareness;
    notesEditor.normalizeNode = (entry: Node) => {
      const [node] = entry;
  
      // Constrain the children of sections.
      if (Element.isElement(node) && node.type === 'section') {
        if (!normalizeSectionChildren(notesEditor, entry)) {
          return;
        }
      }
  
      if (Element.isElement(node) && node.type === 'actions') {
        if (!normalizeActionChildren(notesEditor, entry)) {
          return;
        }
      }
  
      if (Element.isElement(node) && node.type === 'link') {
        if (!normalizeLink(notesEditor, entry)) {
          return;
        }
      }
  
      if (
        Element.isElement(node) &&
        (node.type === 'heading' || node.type === 'text')
      ) {
        if (!normalizeHeadingAndText(notesEditor, entry)) {
          return;
        }
      }
  
      // Fall back to the original `normalizeNode` to enforce other constraints.
      normalizeNode(entry);
    };
  
    notesEditor.isInline = (element: NotesElement) => {
      return element.type === 'link';
    };
  
    notesEditor.insertBreak = () => {
      insertBreak();
      Transforms.unsetNodes(notesEditor, ['momentId', 'momentClientId']);
    };
  
    notesEditor.insertData = (data) => {
      const text = data.getData('text/plain');
  
      if (
        notesEditor.selection &&
        Range.isExpanded(notesEditor.selection) &&
        isPasteableLink(text)
      ) {
        Transforms.wrapNodes(
          notesEditor,
          { type: 'link', href: text, children: [] },
          {
            at: notesEditor.selection,
            split: true,
            mode: 'lowest'
          }
        );
  
        return;
      }
  
      insertData(data);
    };
  
    notesEditor.cursors = mitt();
  
    return notesEditor;
  };
  
  export default withNotesEditor;
  