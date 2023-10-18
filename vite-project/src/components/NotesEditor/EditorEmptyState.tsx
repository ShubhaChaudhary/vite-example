import React from 'react';
import { useRecoilState } from 'recoil';
import { ReactEditor, useSlateStatic } from 'slate-react';
import tw from 'twin.macro';

import { NotesEditor } from './withNotesEditor';
import Button from '../Button/Button';
import { useModalHelpers } from '../../state/modals/helpers';
import { meetingShowTemplateOverlayState } from '../../state/meetings';
import { track } from '../../utils/analytics';
import { useTranslation } from 'react-i18next';

const EditorEmptyState: React.FC = () => {
  const { t } = useTranslation();
  const editor = useSlateStatic() as ReactEditor & NotesEditor;
  const modalHelpers = useModalHelpers();
  const [showTemplateOverlay, setShowTemplateOverlay] = useRecoilState(
    meetingShowTemplateOverlayState(editor.meetingCursor)
  );

  const startFromScratch = () => {
    track('meeting.notes.templates.dismissed');
    setShowTemplateOverlay(false);
  };

  if (!showTemplateOverlay) {
    return null;
  }

  return (
    <div css={tw`absolute top-0 -inset-x-6 bg-white`}>
      <p css={tw`text-center text-base-12 text-sm font-medium px-6 mb-2`}>
        {t('meetings:notes_empty')}
      </p>

      <div css={tw`flex flex-initial justify-center gap-2 py-2`}>
        <Button
          type={'primary'}
          size={'sm'}
          onClick={() => modalHelpers.openModal('notesTemplates')}
        >
          {t('meetings:notes_choose_template')}
        </Button>

        <Button type={'ghost'} size={'sm'} onClick={startFromScratch}>
          {t('meetings:notes_start_from_scratch')}
        </Button>
      </div>
    </div>
  );
};

export default EditorEmptyState;