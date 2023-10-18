import React, { Suspense } from 'react';
import { useRecoilValue } from 'recoil';
import ImportAudioModal from '../ImportAudioModal/ImportAudioModal';
import ShareMomentModal from '../ShareMomentModal/ShareMomentModal';
import { authLoggedInState } from '../../state/auth';
import AddTagsModal from '../AddTagsModal/AddTagsModal';
import CreateChannelModal from '../CreateChannelModal/CreateChannelModal';
import ShareMeetingModal from '../ShareMeetingModal/ShareMeetingModal';
import SuggestedMomentsModal from '../SuggestedMomentsModal/SuggestedMomentsModal';
import ConnectIntegrationModal from '../ConnectIntegrationModal/ConnectIntegrationModal';
import RemoveIntegrationModal from '../RemoveIntegrationModal/RemoveIntegrationModal';
import DeleteMomentModal from '../DeleteMomentModal/DeleteMomentModal';
import ShareMomentToChatModal from '../ShareMomentToChatModal/ShareMomentToChatModal';

const AppModals = () => {
  const isLoggedIn = useRecoilValue(authLoggedInState);

  if (!isLoggedIn) {
    return null;
  }

  return (
    <Suspense fallback={<div />}>
      <ImportAudioModal />
      <AddTagsModal />
      <CreateChannelModal />
      <ShareMeetingModal />
      <DeleteMomentModal />
      <ShareMomentModal />
      <SuggestedMomentsModal />
      <ConnectIntegrationModal />
      <RemoveIntegrationModal />
      <ShareMomentToChatModal />
    </Suspense>
  );
};

export default AppModals;