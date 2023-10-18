import { Disclosure, Transition } from '@headlessui/react';
import React, { Fragment } from 'react';
import styled from 'styled-components';
import tw, { theme } from 'twin.macro';

const lg = theme`screens.lg`;
const Panel = styled.div`
  ${tw`py-6 pl-11 pr-8 relative overflow-y-scroll lg:flex-1`}
  @media (min-width: ${lg}) {
    flex-basis: 0;
  }
  &.enter {
    ${tw`transition duration-100 ease-out`}
  }
  &.enter-from {
    ${tw`transform scale-95 opacity-0`}
  }
  &.enter-to {
    ${tw`transform scale-100 opacity-100`}
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

interface AccordionPanelProps {
  className?: string;
  children?: React.ReactNode;
}

const AccordionPanel: React.FC<AccordionPanelProps> = ({
  children,
  className
}) => {
  return (
    <Transition
      as={Fragment}
      enter={'enter'}
      enterFrom={'enter-from'}
      enterTo={'enter-to'}
      leave={'leave'}
      leaveFrom={'leave-from'}
      leaveTo={'leave-to'}
    >
      <Disclosure.Panel
        data-testid={'Sidebar - Accordion Panel'}
        className={className}
        as={Panel}
      >
        {children}
      </Disclosure.Panel>
    </Transition>
  );
};

export default AccordionPanel;