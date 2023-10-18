import React from 'react';
import styled from 'styled-components';
import { Dialog as HeadlessDialog } from '@headlessui/react';
import tw from 'twin.macro';

const DialogTitle = styled.h3`
  ${tw`text-lg leading-6 font-semibold text-base-19 leading-normal mb-3 mr-3`}
`;

interface ModalTitleProps {
  children?: React.ReactNode;
}

const ModalTitle: React.FC<ModalTitleProps> = ({ children }) => (
  <HeadlessDialog.Title as={DialogTitle}>{children}</HeadlessDialog.Title>
);

export default ModalTitle;