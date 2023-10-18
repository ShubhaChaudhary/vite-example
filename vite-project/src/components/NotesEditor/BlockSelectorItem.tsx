import React, { MouseEvent } from 'react';
import tw from 'twin.macro';

interface BlockSelectorItemProps {
  active?: boolean;
  onMouseEnter?: (event: MouseEvent<HTMLButtonElement>) => void;
  onMouseLeave?: (event: MouseEvent<HTMLButtonElement>) => void;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
}

const BlockSelectorItem: React.FC<BlockSelectorItemProps> = ({
  onClick,
  onMouseEnter,
  onMouseLeave,
  active,
  children
}) => {
  return (
    <button
      type={'button'}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={'group'}
      css={[
        active ? tw`bg-gray-100 text-gray-900` : tw`text-gray-700`,
        tw`flex items-center px-4 py-2 text-sm font-medium `
      ]}
    >
      {children}
    </button>
  );
};

export default BlockSelectorItem;