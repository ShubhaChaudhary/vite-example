mport React from 'react';
import { useRecoilValue } from 'recoil';
import { Node, Transforms } from 'slate';
import { ReactEditor, useSlateStatic } from 'slate-react';
import tw from 'twin.macro';
import { v4 as uuid } from 'uuid';

import { NotesEditor } from '../../components/NotesEditor/withNotesEditor';
import InputTile from '../../components/InputTile/InputTile';

import { Template } from '../../common/types/templates';
import { meetingNotesHasContentState } from '../../state/meetings';
import { templatesState } from '../../state/templates';
import { useModalHelpers } from '../../state/modals/helpers';
import { track } from '../../utils/analytics';

const TemplateSelector: React.FC = () => {
  const editor = useSlateStatic() as ReactEditor & NotesEditor;
  const cursor = editor.meetingCursor;
  const [meetingId] = cursor;

  const templates = useRecoilValue(templatesState);
  const hasContent = useRecoilValue(meetingNotesHasContentState(cursor));
  const modalHelpers = useModalHelpers();

  const replaceContentWithTemplate = (encoded_id: string) => {
    const template: Template | undefined = templates.find(
      (template) => template.encoded_id === encoded_id
    );

    const nodes: Node[] = (template?.sections || []).map((section: any) => ({
      id: uuid(),
      type: 'section',
      children:
        section.type === 'actions'
          ? [
              {
                id: uuid(),
                type: 'heading',
                children: [{ text: section.label }]
              },
              {
                id: uuid(),
                type: 'actions',
                children: [
                  {
                    id: uuid(),
                    type: 'action',
                    placeholder: section.placeholder,
                    children: [{ text: '' }]
                  }
                ]
              }
            ]
          : [
              {
                id: uuid(),
                type: 'heading',
                children: [{ text: section.label }]
              },
              {
                id: uuid(),
                type: 'text',
                placeholder: section.placeholder,
                children: [{ text: '' }]
              }
            ]
    }));

    if (template && nodes) {
      if (!hasContent) {
        Transforms.removeNodes(editor, { at: [0] });
      }
      Transforms.insertNodes(editor, nodes, { at: [editor.children.length] });

      track('meeting.notes.template.selected', {
        meetingId,
        template: template.title
      });
    }

    modalHelpers.closeModal('notesTemplates');
  };

  return (
    <div>
      <div css={tw`grid grid-cols-2 gap-4 place-items-stretch p-px`}>
        {templates
          .filter(({ sections }) => sections.length >= 1)
          .map(({ encoded_id, title, logo_url }) => (
            <InputTile
              title={title}
              key={`template_${encoded_id}`}
              onClick={() => replaceContentWithTemplate(encoded_id)}
            >
              <div css={[tw`h-24 -my-4 -mx-8`]}>
                {logo_url && <img src={logo_url} css={tw`h-24`} />}
              </div>
            </InputTile>
          ))}
      </div>
    </div>
  );
};

export default TemplateSelector;