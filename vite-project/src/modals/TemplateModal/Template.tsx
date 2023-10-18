mport React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import Modal from '../../components/Modal/Modal';
import { modalOpenState } from '../../state/modals';
import { useModalHelpers } from '../../state/modals/helpers';
import TemplateSelector from './TemplateSelector';

const TemplateModal: React.FC = () => {
  const { t } = useTranslation();
  const open = useRecoilValue(modalOpenState('notesTemplates'));
  const modalHelpers = useModalHelpers();
  const initialFocusRef = useRef<HTMLButtonElement | null>(null);

  return (
    <Modal
      open={open}
      title={t('meetings:notes_choose_template')}
      onClose={() => modalHelpers.closeModal('notesTemplates')}
      maxWidth={'lg'}
      initialFocusRef={initialFocusRef}
    >
      <TemplateSelector />
    </Modal>
  );
};

export default TemplateModal;