import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import tw from 'twin.macro';

import Spinner from '../../components/Spinner/Spinner';
import { authLoggedInState } from '../../state/auth';
import { NOTES_EMBEDDED_LOGOUT } from '../../state/embedded/messages';

const Authentication: React.FC = () => {
  const history = useHistory();
  const isLoggedIn = useRecoilValue(authLoggedInState);

  useEffect(() => {
    if (isLoggedIn) {
      history.replace('/meetings');
    } else {
      window.parent.postMessage(NOTES_EMBEDDED_LOGOUT, '*');
      window.location.href =
        'https://www.dubber.net/products/app/ms-teams-notes-by-dubber';
    }
  }, []);

  return (
    <div css={tw`flex justify-center items-center h-full`}>
      <Spinner css={tw`w-12 h-12`} />
    </div>
  );
};

export default Authentication;