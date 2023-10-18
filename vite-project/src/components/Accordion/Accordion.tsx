import { Disclosure } from '@headlessui/react';
import { ChevronDown, ChevronRight } from '@styled-icons/heroicons-solid';
import React, { ReactNode } from 'react';
import tw from 'twin.macro';

interface AccordionProps {
  className?: string;
  title: ReactNode;
  children?: React.ReactNode;
}

const Accordion: React.FC<AccordionProps> = ({
  className,
  title,
  children
}) => {
  return (
    <Disclosure as={'div'} className={className} defaultOpen={true}>
      {({ open }) => (
        <>
          <Disclosure.Button
            className={'group'}
            css={tw`flex items-center space-x-2 w-full p-2 bg-white border-b border-t border-base-2 focus:ring-inset focus:outline-none focus:ring-2 focus:ring-primary-500 -mt-px text-left`}
            data-testid={'Sidebar - Accordion'}
          >
            <div
              css={tw`p-1 bg-base-1 group-hover:bg-base-2 text-primary-500 rounded`}
            >
              {open ? (
                <ChevronDown css={[tw`w-5 h-5`]} />
              ) : (
                <ChevronRight css={[tw`w-5 h-5`]} />
              )}
            </div>
            <div css={tw`font-bold text-lg text-base-19`}>{title}</div>
          </Disclosure.Button>

          {children}
        </>
      )}
    </Disclosure>
  );
};

export default Accordion;

