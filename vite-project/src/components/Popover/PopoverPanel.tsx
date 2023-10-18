import React, { Fragment, KeyboardEventHandler, useState } from 'react';
import styled from 'styled-components';
import { Popover as HeadlessPopover, Transition } from '@headlessui/react';
import { usePopper } from 'react-popper';
import tw from 'twin.macro';

const PopoverPanelContentContainer = styled.div`
  ${tw`rounded-md shadow-lg bg-white ring-1 w-60 ring-black p-1 ring-opacity-5 focus:outline-none`}
  &.enter {
    ${tw`transition ease-out duration-100`}
  }
  &.enter-from {
    ${tw`transform opacity-0 scale-95`}
  }
  &.enter-to {
    ${tw`transform opacity-100 scale-100`}
  }
  &.leave {
    ${tw`transition ease-in duration-75`}
  }
  &.leave-from {
    ${tw`transform opacity-100 scale-100`}
  }
  &.leave-to {
    ${tw`transform opacity-0 scale-95`}
  }
`;

interface PopoverPanelContentProps {
  className?: string;
  referenceElement?: HTMLElement | null;
  offset?: [number, number];
  onKeyDown?: KeyboardEventHandler<HTMLDivElement>;
  onKeyUp?: KeyboardEventHandler<HTMLDivElement>;
  children?: React.ReactNode;
  placement?:
    | 'auto'
    | 'top'
    | 'top-start'
    | 'top-end'
    | 'right'
    | 'right-start'
    | 'right-end'
    | 'bottom'
    | 'bottom-start'
    | 'bottom-end'
    | 'left'
    | 'left-start'
    | 'left-end';
}

const PopoverPanelContent: React.FC<PopoverPanelContentProps> =
  React.forwardRef<HTMLDivElement, PopoverPanelContentProps>(
    (
      {
        children,
        referenceElement,
        placement = 'bottom',
        offset = [0, 8],
        onKeyUp,
        onKeyDown,
        className
      },
      ref
    ) => {
      const [popperElement, setPopperElement] = useState<HTMLElement | null>(
        null
      );

      const { styles, attributes } = usePopper(
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
            }
          ]
        }
      );

      return (
        <div
          ref={setPopperElement}
          style={styles.popper}
          {...attributes.popper}
          css={tw`z-10`}
        >
          <PopoverPanelContentContainer
            className={className}
            ref={ref}
            onKeyUp={onKeyUp}
            onKeyDown={onKeyDown}
          >
            {children}
          </PopoverPanelContentContainer>
        </div>
      );
    }
  );

interface PopoverPanelProps {
  className?: string;
  open: boolean;
  referenceElement?: HTMLElement | null;
  offset?: PopoverPanelContentProps['offset'];
  placement?: PopoverPanelContentProps['placement'];
  children?: React.ReactNode;
  onKeyDown?: KeyboardEventHandler<HTMLDivElement>;
  onKeyUp?: KeyboardEventHandler<HTMLDivElement>;
}

const PopoverPanel: React.FC<PopoverPanelProps> = ({
  open,
  className,
  referenceElement,
  offset,
  placement,
  children,
  onKeyDown,
  onKeyUp
}) => {
  return (
    <Transition
      show={open}
      as={Fragment}
      enter="enter"
      enterFrom="enter-from"
      enterTo="enter-to"
      leave="leave"
      leaveFrom="leave-from"
      leaveTo="leave-to"
    >
      <HeadlessPopover.Panel
        as={PopoverPanelContent}
        className={className}
        referenceElement={referenceElement}
        offset={offset}
        placement={placement}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        static
      >
        {children}
      </HeadlessPopover.Panel>
    </Transition>
  );
};

export default PopoverPanel;