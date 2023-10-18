import React, { ChangeEventHandler, FocusEventHandler } from 'react';
import tw from 'twin.macro';

interface TextareaProps {
  disabled?: boolean;
  className?: string;
  size?: '3xs' | '2xs' | 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  status?: 'alert';
  name?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  rounded?: 'md' | false;
  rows?: number;
  testId?: string;
  onChange?: ChangeEventHandler<HTMLTextAreaElement>;
  onBlur?: FocusEventHandler<HTMLTextAreaElement>;
  onFocus?: FocusEventHandler<HTMLTextAreaElement>;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      size = 'base',
      rounded = 'md',
      name,
      status,
      disabled,
      className,
      placeholder,
      value,
      defaultValue,
      rows,
      testId,
      onChange,
      onBlur,
      onFocus
    },
    ref
  ) => {
    return (
      <textarea
        ref={ref}
        disabled={disabled}
        className={className}
        placeholder={placeholder}
        value={value}
        name={name}
        defaultValue={defaultValue}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        rows={rows}
        data-testid={testId}
        css={[
          size === '3xs' && tw`px-1.5 py-0.5 text-xs`,
          size === '2xs' && tw`px-2 py-1 text-xs`,
          size === 'xs' && tw`px-3 py-1.5 text-xs`,
          size === 'sm' && tw`px-4 py-2 text-xs`,
          size === 'base' && tw`px-5 py-2 text-sm`,
          size === 'lg' && tw`px-5 py-2.5 text-sm`,
          size === 'xl' && tw`px-6 py-3 text-base`,
          rounded === 'md' && tw`rounded-md`,
          status === 'alert' &&
            tw`border-alert-6 hover:border-alert-7 text-alert-6 placeholder-alert-6`,
          !status &&
            `border-base-3 hover:border-base-5 text-base-13 placeholder-base-7`,
          tw`appearance-none bg-white outline-none border focus:ring-1 focus:ring-primary-500 focus:border-primary-500 disabled:cursor-not-allowed`
        ]}
      />
    );
  }
);

export default Textarea;