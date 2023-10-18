import React from 'react';
import styled from 'styled-components';
import tw, { theme } from 'twin.macro';
import { Heading5 } from '../../../../components/Heading/Heading';

const Container = styled.div`
  width: 100%;
  ${tw`dark:max-w-2xl`}
  ${tw`px-8 mb-8`}
`;

interface Props {
  title?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  className?: string;
}

const Block: React.FC<Props> = ({ title, children, style, className }) => {
  return (
    <Container style={style} className={className}>
      {title && (
        <Heading5 color={theme`colors.base.13`} mb={3}>
          {title}
        </Heading5>
      )}
      {children}
    </Container>
  );
};

export default Block;