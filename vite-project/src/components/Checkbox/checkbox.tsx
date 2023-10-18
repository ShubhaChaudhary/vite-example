import React from 'react';
import { Switch } from '@headlessui/react';
import { Check } from '@styled-icons/heroicons-solid';
import tw from 'twin.macro';

interface CheckboxProps {
  disabled?: boolean;
  type?: 'alert' | 'primary';
  contentEditable?: boolean;
  value?: boolean;
  onChange?: (value: boolean) => any;
  className?: string;
  alt?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  disabled,
  contentEditable,
  alt,
  className,
  value,
  type = 'primary',
  onChange
}) => {
  return (
    <Switch
      disabled={disabled}
      className={className}
      contentEditable={contentEditable}
      checked={!!value}
      onChange={(value) => onChange && onChange(value)}
      css={[
        value && type === 'alert' && tw`bg-alert-5 border-alert-5`,
        value && type === 'primary' && tw`bg-primary-500 border-primary-500`,
        !value && type === 'alert' && tw`border-alert-5`,
        !value && type === 'primary' && tw`border-base-2`,
        tw`border-2 rounded inline-flex justify-center items-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50`
      ]}
    >
      {alt && <span css={tw`sr-only`}>{alt}</span>}
      {value && <Check css={tw`w-full h-full text-white`} />}
    </Switch>
  );
};

export default Checkbox;