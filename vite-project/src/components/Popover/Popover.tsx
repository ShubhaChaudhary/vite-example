import React, { useState } from 'react';
import tw from 'twin.macro';
import { Popover as HeadlessPopover } from '@headlessui/react';
import styled from 'styled-components';

interface PopoverRenderProps {
  open: boolean;
  close: () => void;
  referenceElement: HTMLElement | null;
  setReferenceElement: (elem: HTMLElement | null) => void;
}

interface PopoverProps {
  className?: string;
  contentEditable?: boolean;
  children: (
    props: PopoverRenderProps
  ) => React.ReactElement<any, string | React.JSXElementConstructor<any>>;
}

const PopoverContent = styled.menu`
  ${tw`inline-flex relative p-0 m-0`}
`;

const Popover: React.FC<PopoverProps> = ({
  className,
  contentEditable,
  children
}) => {
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(
    null
  );

  return (
    <HeadlessPopover
      as={PopoverContent}
      contentEditable={contentEditable}
      className={className}
    >
      {({ open, close }) =>
        children({ open, close, referenceElement, setReferenceElement })
      }
    </HeadlessPopover>
  );
};

export default Popover;
  