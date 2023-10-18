import React from 'react';
import tw from 'twin.macro';

interface BasePageProps {
  children: React.ReactNode;
}

const BasePage = React.forwardRef<HTMLDivElement, BasePageProps>(
  ({ children }, ref) => {
    return (
      <div
        ref={ref}
        css={tw`bg-white w-full min-h-full flex flex-col items-center p-4 sm:p-6 lg:p-10`}
      >
        <div css={tw`w-full max-w-screen-xl flex flex-col flex-1 lg:flex-row`}>
          {children}
        </div>
      </div>
    );
  }
);

export default BasePage;