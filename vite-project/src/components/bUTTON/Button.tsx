import React, { KeyboardEventHandler, MouseEventHandler } from 'react';
import tw from 'twin.macro';
import Spinner from '../Spinner/Spinner';

interface ButtonProps {
  type?: 'primary' | 'base' | 'ghost' | 'alert' | 'gray';
  htmlType?: 'button' | 'submit';
  size?: '3xs' | '2xs' | 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  onClick?: MouseEventHandler<HTMLButtonElement>;
  onKeyDown?: KeyboardEventHandler<HTMLButtonElement>;
  onKeyUp?: KeyboardEventHandler<HTMLButtonElement>;
  rounded?: 'md' | false;
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  focus?: 'offset' | 'border' | false;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  testId?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      type = 'primary',
      htmlType = 'button',
      size = 'base',
      onClick,
      onKeyDown,
      onKeyUp,
      rounded = 'md',
      focus = 'offset',
      loading,
      loadingText,
      icon,
      disabled,
      className,
      testId,
      children
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={htmlType}
        onClick={onClick}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        disabled={disabled || loading}
        className={className}
        data-testid={testId}
        css={[
          type === 'primary' &&
            tw`bg-primary-500 border-transparent hover:bg-primary-600 text-white shadow-sm`,
          type === 'base' &&
            tw`bg-base-1 border-transparent hover:bg-base-2 text-base-16`,
          type === 'ghost' &&
            tw`bg-white border-base-2 hover:bg-base-1 text-primary shadow-sm`,
          type === 'alert' &&
            tw`bg-alert-7 border-transparent hover:bg-alert-8 text-white shadow-sm`,
          type === 'gray' &&
            tw`bg-gray-100 border-transparent hover:bg-gray-200 text-gray-700 shadow-sm`,
          size === '3xs' && tw`px-1.5 py-0.5 text-xs`,
          size === '2xs' && tw`px-2 py-1 text-xs`,
          size === 'xs' && tw`px-3 py-1.5 text-xs`,
          size === 'sm' && tw`px-4 py-2 text-xs`,
          size === 'base' && tw`px-5 py-2 text-sm`,
          size === 'lg' && tw`px-5 py-2.5 text-sm`,
          size === 'xl' && tw`px-6 py-3 text-base`,
          rounded === 'md' && tw`rounded-md`,
          focus === 'offset' &&
            tw`focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`,
          focus === 'border' &&
            tw`relative focus:z-10 focus:ring-1 focus:ring-primary-500 focus:border-primary-500`,
          tw`inline-flex items-center border font-medium disabled:bg-base-1 disabled:text-base-4 disabled:cursor-not-allowed focus:outline-none`
        ]}
      >
        {(loading || icon) && (
          <span
            css={[
              size === '3xs' && tw`w-3 h-3`,
              size === '2xs' && tw`w-3 h-3`,
              size === 'xs' && tw`w-3 h-3`,
              size === 'sm' && tw`w-3 h-3`,
              size === 'base' && tw`w-4 h-4`,
              size === 'lg' && tw`w-4 h-4`,
              size === 'xl' && tw`w-4 h-4`,
              ((loading && loadingText) || children) && tw`mr-1.5`,
              tw`inline-flex`
            ]}
          >
            {loading ? <Spinner css={tw`w-full h-full`} /> : icon}
          </span>
        )}
        {loading && loadingText ? loadingText : children}
      </button>
    );
  }
);

export default Button;