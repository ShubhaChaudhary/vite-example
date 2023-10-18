import React from 'react';
import tw from 'twin.macro';
import Spinner from '../components/Spinner/Spinner';

const ScreenLoading = () => {
  return (
    <>
      <div css={tw`flex items-center justify-center h-full dark:bg-dark-6`}>
        <Spinner css={tw`w-12 h-12`} />
      </div>
    </>
  );
};

export default ScreenLoading;