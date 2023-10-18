import React from 'react';
import tw from 'twin.macro';

interface CardProps {
  className?: string;
  testId?: string;
  children?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className, testId }) => {
  return (
    <div
      className={className}
      css={tw`bg-white border border-base-2 shadow-sm rounded-lg p-4 sm:p-6`}
      data-testid={testId}
    >
      {children}
    </div>
  );
};

export default Card;