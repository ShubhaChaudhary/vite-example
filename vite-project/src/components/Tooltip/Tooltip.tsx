import { Transition } from '@headlessui/react';
import { VirtualElement } from '@popperjs/core';
import React, { Fragment, ReactNode, useCallback, useState } from 'react';
import { usePopper } from 'react-popper';
import styled from 'styled-components';
import tw from 'twin.macro';

const TooltipDialog = styled.div<{
  delay?: number;
}>`
  width: max-content;
  ${tw`rounded bg-base-19 dark:bg-black text-xs text-white p-2 select-none max-w-xs pointer-events-none`}
  &.enter {
    ${tw`transition duration-100 ease-out`}
  }
  &.enter-from {
    ${tw`transform scale-95 opacity-0`}
  }
  &.enter-to {
    ${tw`transform scale-100 opacity-100`}
    ${({ delay }) => delay && `transition-delay: ${delay}ms;`}
  }
  &.leave {
    ${tw`transition duration-75 ease-out`}
  }
  &.leave-from {
    ${tw`transform scale-100 opacity-100`}
  }
  &.leave-to {
    ${tw`transform scale-95 opacity-0`}
  }
`;

const TooltipArrow = styled.div`
  ${tw`invisible`}
  &, &::before {
    ${tw`absolute w-2 h-2`}
    background: inherit;
  }
  &::before {
    ${tw`visible transform rotate-45`}
    content: '';
  }
  [data-popper-placement^='top'] & {
    bottom: -4px;
  }
  [data-popper-placement^='bottom'] & {
    top: -4px;
  }
  [data-popper-placement^='left'] & {
    right: -4px;
  }
  [data-popper-placement^='right'] & {
    left: -4px;
  }
`;

interface TooltipContentProps {
  referenceElement: VirtualElement | HTMLElement | null;
  boundaryElement?: HTMLElement | null;
  text: ReactNode;
  offset?: [number, number];
  placement?:
    | 'top'
    | 'left'
    | 'right'
    | 'bottom'
    | 'top-start'
    | 'top-end'
    | 'bottom-start'
    | 'bottom-end'
    | 'right-start'
    | 'right-end'
    | 'left-start'
    | 'left-end';
  flipPadding?: number;
  delay?: number;
}

const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  (
    {
      referenceElement,
      boundaryElement,
      text,
      placement = 'top',
      flipPadding,
      offset = [0, 12],
      delay
    },
    ref
  ) => {
    const [popperElement, setPopperElement] = useState<HTMLElement | null>(
      null
    );
    const [arrowElement, setArrowElement] = useState<HTMLElement | null>(null);
    const { styles, attributes } = usePopper(referenceElement, popperElement, {
      placement,
      modifiers: [
        { name: 'arrow', options: { element: arrowElement } },
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
            boundary: boundaryElement ? boundaryElement : undefined,
            altBoundary: true,
            padding: flipPadding ? flipPadding : 0
          }
        }
      ]
    });

    return (
      <div
        css={tw`z-20`}
        ref={setPopperElement}
        style={styles.popper}
        {...attributes.popper}
      >
        <TooltipDialog ref={ref} role={'tooltip'} delay={delay}>
          {text}

          <TooltipArrow ref={setArrowElement} style={styles.arrow} />
        </TooltipDialog>
      </div>
    );
  }
);

interface TooltipProps {
  text?: ReactNode;
  placement?: TooltipContentProps['placement'];
  boundaryElement?: HTMLElement | null;
  children: React.ReactNode;
  className?: string;
  followCursor?: boolean;
  offset?: [number, number];
  show?: boolean;
  flipPadding?: number;
  delay?: number;
  onMouseOver?: React.MouseEventHandler;
  onMouseOut?: React.MouseEventHandler;
}

const Tooltip: React.FC<TooltipProps> = ({
  text,
  placement,
  boundaryElement,
  children,
  className,
  followCursor,
  offset,
  show,
  flipPadding,
  delay,
  onMouseOver,
  onMouseOut
}) => {
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(
    null
  );

  const [virtualElement, setVirtualElement] = useState<VirtualElement | null>(
    null
  );

  const [hovering, setHovering] = useState(false);

  const handleMouseEnter = useCallback(
    (event: React.MouseEvent) => {
      setHovering(true);

      if (onMouseOver) {
        onMouseOver(event);
      }
    },
    [onMouseOver]
  );

  const handleMouseLeave = useCallback(
    (event: React.MouseEvent) => {
      setHovering(false);

      if (onMouseOut) {
        onMouseOut(event);
      }
    },
    [onMouseOut]
  );

  const handleMouseMove = useCallback(
    ({ clientX }: React.MouseEvent) => {
      if (!followCursor || !referenceElement) {
        return;
      }

      setVirtualElement({
        getBoundingClientRect: () =>
          ({
            width: 0,
            height: 0,
            top: referenceElement.offsetTop,
            right: clientX,
            bottom: referenceElement.offsetTop + referenceElement.offsetHeight,
            left: clientX
          } as any)
      });
    },
    [referenceElement, followCursor]
  );

  // Don't enable any tooltip behaviour if they've provided an empty tooltip text.
  // This makes it easy for consumers of this component to have conditional tooltips.
  if (!text) {
    return <>{children}</>;
  }

  return (
    <>
      <div
        ref={setReferenceElement}
        onMouseOver={handleMouseEnter}
        onMouseOut={handleMouseLeave}
        onMouseMove={handleMouseMove}
        className={className}
      >
        {children}
      </div>

      <Transition
        as={Fragment}
        show={show || hovering}
        unmount
        enter={'enter'}
        enterFrom={'enter-from'}
        enterTo={'enter-to'}
        leave={'leave'}
        leaveFrom={'leave-from'}
        leaveTo={'leave-to'}
      >
        <TooltipContent
          placement={placement}
          referenceElement={followCursor ? virtualElement : referenceElement}
          boundaryElement={boundaryElement}
          text={text}
          offset={offset}
          flipPadding={flipPadding}
          delay={delay}
        />
      </Transition>
    </>
  );
};

export default Tooltip;