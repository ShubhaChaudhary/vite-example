import React from 'react';
import tw from 'twin.macro';

interface MastheadProps {
  title?: React.ReactNode;
  meta?: React.ReactNode;
  metaSeries?: React.ReactNode;
  children: React.ReactNode;
  testId?: string;
}

const Masthead: React.FC<MastheadProps> = ({
  title,
  meta,
  metaSeries,
  children,
  testId
}) => {
  return (
    <div
      css={tw`bg-white border-b border-base-2 py-3 px-8 space-y-2 lg:space-y-0 lg:flex lg:items-center lg:justify-between`}
      data-testid={testId}
    >
      <div
        css={tw`min-w-0 flex-1 lg:flex space-y-1 lg:space-y-0 lg:space-x-4 lg:mr-10`}
      >
        {title}
        {meta}
        {metaSeries}
      </div>

      <div css={tw`flex items-center space-x-3`}>{children}</div>
    </div>
  );
};

export default Masthead;