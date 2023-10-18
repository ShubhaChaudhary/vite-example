import { Listbox, Transition } from '@headlessui/react';
import { Selector } from '@styled-icons/heroicons-solid';
import { Checkmark } from '@styled-icons/ionicons-solid';
import React, { Fragment, useMemo, useState } from 'react';
import tw from 'twin.macro';
import styled from 'styled-components';
import { usePopper } from 'react-popper';
import { Placement } from '@popperjs/core';

interface SelectMenuOption {
  label: React.ReactNode;
  value: any;
  disabled?: boolean;
}

interface SelectMenuProps {
  id?: string;
  name?: string;
  value?: any;
  size?: '3xs' | '2xs' | 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  status?: 'alert';
  placement?: Placement;
  offset?: [number, number];
  placeholder?: string;
  defaultValue?: any;
  disabled?: boolean;
  options: SelectMenuOption[];
  optionsMinWidth?: 'max' | 'full';
  className?: string;
  testId?: string;
  button?: React.ReactNode;
  onChange: (value: any) => void;
}

const SelectMenuOptions = styled.ul<{
  placement: SelectMenuProps['placement'];
  minWidth?: 'max' | 'full';
}>`
  ${tw`z-20 max-h-60 overflow-auto min-w-max rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm`}
  ${({ minWidth }) => (minWidth === 'max' ? tw`min-w-max` : tw`min-w-full`)}
  &.leave {
    ${tw`transition ease-in duration-100`}
  }
  &.leave-from {
    ${tw`opacity-100`}
  }
  &.leave-to {
    ${tw`opacity-0`}
  }
`;

const SelectMenu: React.FC<SelectMenuProps> = ({
  id,
  name,
  value,
  options,
  optionsMinWidth,
  size = 'base',
  status,
  className,
  defaultValue = '',
  disabled,
  testId,
  button,
  placeholder,
  placement = 'bottom-start',
  offset = [0, 4],
  onChange
}) => {
  const selectedValue = useMemo(
    () => options.find(({ value: otherValue }) => value === otherValue),
    [value || defaultValue, options]
  );

  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(
    null
  );
  const [popperElement, setPopperElement] = useState<HTMLElement | null>(null);

  const { styles: popperStyles, attributes: popperAttributes } = usePopper(
    referenceElement,
    popperElement,
    {
      placement,
      modifiers: [
        {
          name: 'offset',
          options: {
            offset
          }
        },
        {
          name: 'preventOverflow',
          options: {
            altAxis: true,
            padding: 8
          }
        },
        {
          name: 'flip',
          options: {
            altBoundary: true
          }
        }
      ]
    }
  );

  return (
    <Listbox
      name={name}
      value={value || defaultValue}
      onChange={onChange}
      disabled={disabled}
      data-testid={testId}
    >
      {({ open }) => (
        <div css={tw`relative`} ref={setReferenceElement}>
          {button ? (
            button
          ) : (
            <Listbox.Button
              id={id}
              className={className}
              css={[
                size === '3xs' && tw`px-1.5 py-0.5 text-xs`,
                size === '2xs' && tw`px-2 py-1 text-xs`,
                size === 'xs' && tw`px-3 py-1.5 text-xs`,
                size === 'sm' && tw`px-4 py-2 text-xs`,
                size === 'base' && tw`px-5 py-2 text-sm`,
                size === 'lg' && tw`px-5 py-2.5 text-sm`,
                size === 'xl' && tw`px-6 py-3 text-base`,
                status === 'alert' &&
                  tw`border-alert-7 hover:border-alert-8 text-alert-7`,
                !status && tw`border-base-3 hover:border-base-5`,
                tw`relative w-full cursor-default rounded-md bg-white outline-none border focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-left pr-8 disabled:cursor-not-allowed`
              ]}
            >
              <span
                css={[
                  tw`block truncate`,
                  !selectedValue && tw`placeholder-base-7`
                ]}
              >
                {selectedValue?.label || placeholder}
              </span>
              <span
                css={tw`pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2`}
              >
                <Selector css={tw`h-5 w-5 text-gray-400`} aria-hidden="true" />
              </span>
            </Listbox.Button>
          )}

          <Transition
            show={open}
            as={Fragment}
            leave="leave"
            leaveFrom="leave-from"
            leaveTo="leave-to"
          >
            <Listbox.Options
              as={SelectMenuOptions}
              placement={placement}
              ref={setPopperElement}
              style={popperStyles.popper}
              minWidth={optionsMinWidth}
              {...popperAttributes.popper}
            >
              {options.map((option) => (
                <Listbox.Option
                  key={option.value}
                  as={Fragment}
                  value={option.value}
                >
                  {({ selected, active }) => (
                    <li
                      css={[
                        active
                          ? tw`text-white bg-primary-500`
                          : tw`text-gray-900`,
                        size === '3xs' && tw`pl-1.5 pr-4 py-0.5 text-xs`,
                        size === '2xs' && tw`pl-2 pr-5 py-1 text-xs`,
                        size === 'xs' && tw`pl-3 pr-7 py-1.5 text-xs`,
                        size === 'sm' && tw`pl-4 pr-9 py-2 text-xs`,
                        size === 'base' && tw`pl-5 pr-11 py-2 text-sm`,
                        size === 'lg' && tw`pl-5 pr-11 py-2.5 text-sm`,
                        size === 'xl' && tw`pl-6 pr-12 py-3 text-base`,
                        tw`relative cursor-default select-none leading-5`
                      ]}
                    >
                      <span
                        css={[
                          selected ? tw`font-semibold` : tw`font-normal`,
                          tw`block`
                        ]}
                      >
                        {option.label}
                      </span>

                      {selected ? (
                        <span
                          css={[
                            active ? tw`text-white` : tw`text-primary-500`,
                            tw`absolute inset-y-0 right-0 flex items-center pr-4`
                          ]}
                        >
                          <Checkmark css={tw`h-5 w-5`} aria-hidden="true" />
                        </span>
                      ) : null}
                    </li>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      )}
    </Listbox>
  );
};

export default SelectMenu;