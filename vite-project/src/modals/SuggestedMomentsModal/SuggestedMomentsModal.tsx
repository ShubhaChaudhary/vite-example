import React, { useRef } from 'react';
import Modal from '../../components/Modal/Modal';
import { useModalHelpers } from '../../state/modals/helpers';
import { useRecoilValue } from 'recoil';
import { modalOpenState } from '../../state/modals';
import SuggestedMoments from './SuggestedMoments';

const SuggestedMomentsModal: React.FC = () => {
  const modalHelpers = useModalHelpers();
  const open = useRecoilValue(modalOpenState('suggestedMoments'));
  const initialFocusRef = useRef<HTMLButtonElement | null>(null);

  return (
    <Modal
      open={open}
      maxWidth={'xl'}
      onClose={() => modalHelpers.closeModal('suggestedMoments')}
    >
      <SuggestedMoments initialFocusRef={initialFocusRef} />
    </Modal>
  );
};

export default SuggestedMomentsModal;