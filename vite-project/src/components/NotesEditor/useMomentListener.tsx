import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { Transforms, Node, Path, Text, Element } from 'slate';
import { ReactEditor, useSlateStatic } from 'slate-react';
import { v4 as uuid } from 'uuid';
import { MomentType } from '../../models/meeting';
import { NotesSectionBlock } from '../../models/notes';
import {
  MeetingCursor,
  meetingMomentTypesByTitleState
} from '../../state/meetings';
import {
  noteEvents,
  NoteInsertActionEvent,
  NoteInsertMomentEvent,
  NoteInsertMomentsEvent,
  NoteInsertSectionEvent
} from '../../state/notes';
import { NotesEditor } from './withNotesEditor';
import md, { Node as MarkdownNode } from 'markdown-ast';
import { flatten } from 'lodash';
import { useTranslation } from 'react-i18next';
import { useFeature } from '../../state/currentUser';

const astToSlate = (ast: MarkdownNode): Text[] => {
  if (ast.type === 'text') {
    return [{ text: ast.text }];
  }

  if (ast.type === 'bold') {
    return ast.block.reduce(
      (result, ast) => [
        ...result,
        ...astToSlate(ast).map((node) => ({
          ...node,
          bold: true
        }))
      ],
      [] as Text[]
    );
  }

  if (ast.type === 'italic') {
    return ast.block.reduce(
      (result, ast) => [
        ...result,
        ...astToSlate(ast).map((node) => ({
          ...node,
          italic: true
        }))
      ],
      [] as Text[]
    );
  }

  return [];
};

const markdownToSlate = (markdown: string): Text[] => {
  const ast = md(markdown);

  return flatten(ast.map(astToSlate));
};

const useMomentsListener = (cursor: MeetingCursor) => {
  const { t } = useTranslation();
  const editor = useSlateStatic() as ReactEditor & NotesEditor;
  const momentTypesByTitle = useRecoilValue(
    meetingMomentTypesByTitleState(cursor)
  );

  const aiMetadataFeature = useFeature('ai_metadata');
  const actionMomentType: MomentType | undefined = momentTypesByTitle['Action'];

  // FOR POC ONLY: Ensure at least one 'Actions' section exists if ai_metadata enabled
  // TODO: Remove this once structure is properly implemented.
  useEffect(() => {
    if (!aiMetadataFeature.enabled || !editor.children.length) {
      return;
    }

    const i = editor.children.findIndex(
      (child) =>
        Element.isElement(child) &&
        child.type === 'section' &&
        Node.string(child) === 'Actions'
    );

    if (i !== -1) {
      return;
    }

    /*Transforms.insertNodes(
      editor,
      [
        {
          type: 'section',
          id: uuid(),
          children: [
            {
              type: 'heading',
              id: uuid(),
              children: [{ text: 'Actions' }]
            },
            {
              type: 'actions',
              id: uuid(),
              children: [
                {
                  type: 'action',
                  id: uuid(),
                  children: [{ text: '' }]
                }
              ]
            }
          ]
        }
      ],
      { at: [editor.children.length] }
    );*/
  }, [aiMetadataFeature.enabled]);

  useEffect(() => {
    const onBulkInsert = (event: NoteInsertMomentsEvent | undefined) => {
      if (!event || event.cursor[0] !== cursor[0]) {
        return;
      }

      const moments = event.moments;
      const actions: Node[] = moments
        .filter(({ moment_type_id }) => {
          return moment_type_id === actionMomentType?.encoded_id;
        })
        .map((moment) => {
          return {
            type: 'action',
            id: uuid(),
            momentId: moment.encoded_id,
            momentClientId: moment.encoded_id,
            children: markdownToSlate(moment.body || moment.transcript || '')
          };
        });

      const highlights: Node[] = moments
        .filter(({ moment_type_id }) => {
          return moment_type_id !== actionMomentType?.encoded_id;
        })
        .map((moment) => {
          return {
            type: 'text',
            id: uuid(),
            momentId: moment.encoded_id,
            children: markdownToSlate(moment.body || moment.transcript || '')
          };
        });

      if (actions.length) {
        Transforms.insertNodes(
          editor,
          [
            {
              type: 'section',
              id: uuid(),
              children: [
                {
                  type: 'heading',
                  id: uuid(),
                  children: [{ text: t('glossary:actions') }]
                },
                {
                  type: 'actions',
                  id: uuid(),
                  children: actions
                }
              ]
            }
          ],
          { at: [editor.children.length] }
        );
      }

      if (highlights.length) {
        Transforms.insertNodes(
          editor,
          [
            {
              type: 'section',
              id: uuid(),
              children: [
                {
                  type: 'heading',
                  id: uuid()
                },
                ...highlights
              ]
            }
          ],
          { at: [editor.children.length] }
        );
      }
    };

    const onInsert = (event: NoteInsertMomentEvent | undefined) => {
      if (!event || event.cursor[0] !== cursor[0]) {
        return;
      }

      const moment = event.moment;
      const i = editor.children.findIndex(
        (child) =>
          Element.isElement(child) &&
          child.type === 'section' &&
          child.id === event.sectionId
      );
      const momentBlock =
        moment.moment_type_id === actionMomentType?.encoded_id
          ? {
              type: 'actions',
              id: uuid(),
              children: [
                {
                  type: 'action',
                  id: uuid(),
                  momentId: moment.encoded_id,
                  momentClientId: moment.client_id,
                  children: [{ text: moment.body || moment.transcript || '' }]
                }
              ]
            }
          : {
              type: 'text',
              id: uuid(),
              momentId: moment.encoded_id,
              momentClientId: moment.client_id,
              children: [{ text: moment.body || moment.transcript || '' }]
            };

      // Insert at the bottom of the last section if no target was found.
      if (i === -1) {
        return Transforms.insertNodes(editor, momentBlock, { select: true });
      }

      // Otherwise insert at the bottom of the found section.
      const section = editor.children[i] as NotesSectionBlock;
      const sectionPath: Path = [i];

      // Merge with the last block if it's an actions block, otherwise insert the whole actions block.
      const lastChildIndex = section.children.length - 1;
      const lastChild =
        lastChildIndex >= 0 ? section.children[lastChildIndex] : undefined;

      if (momentBlock.type === 'actions' && lastChild?.type === 'actions') {
        return Transforms.insertNodes(editor, momentBlock.children, {
          at: [...sectionPath, lastChildIndex, lastChild.children.length]
        });
      }

      Transforms.insertNodes(editor, momentBlock, {
        at: [...sectionPath, section.children.length]
      });
    };

    const onInsertSection = (event: NoteInsertSectionEvent | undefined) => {
      if (!event || event.cursor[0] !== cursor[0]) {
        return;
      }

      ReactEditor.focus(editor);
      Transforms.insertNodes(
        editor,
        [
          {
            type: 'section',
            id: uuid(),
            children: [
              {
                type: 'heading',
                id: uuid(),
                children: [{ text: '' }]
              }
            ]
          }
        ],
        { at: [editor.children.length], select: true }
      );
    };

    const onInsertAction = (event: NoteInsertActionEvent | undefined) => {
      if (!event || event.cursor[0] !== cursor[0]) {
        return;
      }

      ReactEditor.focus(editor);
      Transforms.insertNodes(
        editor,
        [
          {
            type: 'actions',
            id: uuid(),
            children: [
              {
                type: 'action',
                id: uuid(),
                children: [{ text: '' }]
              }
            ]
          }
        ],
        { select: true }
      );
    };

    noteEvents.on('insertmoments', onBulkInsert);
    noteEvents.on('insertmoment', onInsert);
    noteEvents.on('insertsection', onInsertSection);
    noteEvents.on('insertaction', onInsertAction);

    return () => {
      noteEvents.off('insertmoments', onBulkInsert);
      noteEvents.off('insertmoment', onInsert);
      noteEvents.off('insertsection', onInsertSection);
      noteEvents.off('insertaction', onInsertAction);
    };
  }, [cursor]);
};

export default useMomentsListener;