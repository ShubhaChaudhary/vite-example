import React from 'react';
import tw from 'twin.macro';
import Spinner from '../Spinner/Spinner';

const ModalLoading = () => {
  return (
    <div css={tw`w-full h-36 flex items-center justify-center`}>
      <Spinner css={tw`w-12 h-12`} />
    </div>
  );
};

export default ModalLoading;