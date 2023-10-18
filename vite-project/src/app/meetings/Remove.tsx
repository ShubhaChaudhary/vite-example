import React, { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { currentUserState } from '../../../state/currentUser';
import { MeetingCursor } from '../../../state/meetings';
import {
  IPCDubberIdentityMessage,
  IPCMeetingMessage
} from '../../../common/types/ipcMessages';

interface Props {
  cursor: MeetingCursor;
}

const RemoveMeeting: React.FC<Props> = ({ cursor }) => {
  const [currentUser] = useRecoilState(currentUserState);

  useEffect(() => {
    const meetingMessage: IPCMeetingMessage = {
      name: 'NOTES_MEETING',
      payload: { meetingId: cursor[0] }
    };

    window.parent.postMessage(meetingMessage, '*');
  }, [cursor[0]]);

  useEffect(() => {
    const dubberIdentityMessage: IPCDubberIdentityMessage = {
      name: 'NOTES_DUBBER_IDENTITY',
      payload: {
        tenantId: currentUser.dubber_identity.tid,
        userId: currentUser.dubber_identity.uid
      }
    };

    window.parent.postMessage(dubberIdentityMessage, '*');
  }, [currentUser]);

  return <></>;
};

export default RemoveMeeting;