import React, { Fragment, Suspense } from 'react';
import {
  Dialog as HeadlessDialog,
  Transition as HeadlessTransition
} from '@headlessui/react';
import { X } from '@styled-icons/heroicons-outline';
import tw from 'twin.macro';
import styled from 'styled-components';
import ModalTitle from './ModalTitle';
import ModalLoading from './ModalLoading';
import { useTranslation } from 'react-i18next';

interface ModalProps {
  open: boolean;
  title?: React.ReactNode;
  children?: React.ReactNode;
  initialFocusRef?: React.MutableRefObject<HTMLElement | null>;
  maxWidth?: 'max' | '3xl' | '2xl' | 'xl' | 'lg';
  overflow?: 'auto' | 'hidden' | 'visible';
  onClose?: () => void;
  onBack?: () => void;
}

const Dialog = styled.div`
  ${tw`fixed z-50 inset-0 overflow-y-auto`}
`;

const DialogOverlay = styled.div`
  ${tw`fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity`}
  &.enter {
    ${tw`ease-out duration-300`}
  }
  &.enter-from {
    ${tw`opacity-0`}
  }
  &.enter-to {
    ${tw`opacity-100`}
  }
  &.leave {
    ${tw`ease-in duration-200`}
  }
  &.leave-from {
    ${tw`opacity-100`}
  }
  &.leave-to {
    ${tw`opacity-0`}
  }
`;

const DialogContent = styled.div<{
  maxWidth: ModalProps['maxWidth'];
  overflow: ModalProps['overflow'];
  onBack?: () => void;
}>`
  ${tw`relative inline-block align-bottom bg-white rounded-lg p-6 text-left shadow-xl transform transition-all sm:my-8 sm:align-middle sm:w-full`}
  ${({ onBack }) => onBack && tw`pt-10`}
  ${({ overflow = 'hidden' }) => [
    overflow === 'hidden' && tw`overflow-hidden`,
    overflow === 'visible' && tw`overflow-visible`,
    overflow === 'auto' && tw`overflow-auto`
  ]}
  ${({ maxWidth = '2xl' }) => [
    maxWidth === 'max' && tw`sm:max-w-max`,
    maxWidth === '3xl' && tw`sm:max-w-3xl`,
    maxWidth === '2xl' && tw`sm:max-w-2xl`,
    maxWidth === 'xl' && tw`sm:max-w-xl`,
    maxWidth === 'lg' && tw`sm:max-w-lg`
  ]}
  &.enter {
    ${tw`ease-out duration-300`}
  }
  &.enter-from {
    ${tw`opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95`}
  }
  &.enter-to {
    ${tw`opacity-100 translate-y-0 sm:scale-100`}
  }
  &.leave {
    ${tw`ease-in duration-200`}
  }
  &.leave-from {
    ${tw`opacity-100 translate-y-0 sm:scale-100`}
  }
  &.leave-to {
    ${tw`opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95`}
  }
`;

const Modal: React.FC<ModalProps> = ({
  title,
  open,
  initialFocusRef,
  maxWidth,
  overflow,
  children,
  onClose,
  onBack
}) => {
  const { t } = useTranslation();

  /*
    This is really not ideal - this check is used to reject events bubbled from other 
    interactions (notification click) because this modal is not within the virtual DOM
    it appears tring to stop propogation (via e.stopPropogation() or e.nativeEvent.stopImmediaatePropogation())
    does not work.  This function just allows us to pass the second param to denote the
    event is originating from the modal.
  */
  const close = (_e: React.MouseEvent | boolean, isModalClick = false) => {
    if (!isModalClick) {
      return;
    }

    onClose && onClose();
  };

  return (
    <HeadlessTransition.Root show={open} as={Fragment}>
      <HeadlessDialog
        as={Dialog}
        static
        open={open}
        initialFocus={initialFocusRef}
        onClose={(e) => onClose && close(e, false)}
      >
        <div
          css={tw`flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0`}
        >
          <HeadlessTransition.Child
            as={Fragment}
            enter="enter"
            enterFrom="enter-from"
            enterTo="enter-to"
            leave="leave"
            leaveFrom="leave-from"
            leaveTo="leave-to"
          >
            <HeadlessDialog.Overlay
              as={DialogOverlay}
              onClick={(e: React.MouseEvent) => close(e, true)}
            />
          </HeadlessTransition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            css={tw`hidden sm:inline-block sm:align-middle sm:h-screen`}
            aria-hidden="true"
            // eslint-disable-next-line i18next/no-literal-string
          >
            &#8203;
          </span>

          <HeadlessTransition.Child
            as={DialogContent}
            overflow={overflow}
            maxWidth={maxWidth}
            onBack={onBack}
            enter="enter"
            enterFrom="enter-from"
            enterTo="enter-to"
            leave="leave"
            leaveFrom="leave-from"
            leaveTo="leave-to"
          >
            {onBack && (
              <button
                css={tw`absolute top-4 left-4 text-primary-500 hover:text-primary-600`}
                onClick={onBack}
              >
                {`<- ${t('back')}`}
              </button>
            )}

            {onClose && (
              <button
                type="button"
                css={tw`absolute top-4 right-4 bg-white rounded-md text-base-8 hover:text-base-9 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
                onClick={(e: React.MouseEvent) => close(e, true)}
              >
                <span css={tw`sr-only`}>{t('close')}</span>
                <X css={tw`h-6 w-6`} aria-hidden="true" />
              </button>
            )}

            {title && <ModalTitle>{title}</ModalTitle>}

            <Suspense fallback={<ModalLoading />}>{children}</Suspense>
          </HeadlessTransition.Child>
        </div>
      </HeadlessDialog>
    </HeadlessTransition.Root>
  );
};

export default Modal;