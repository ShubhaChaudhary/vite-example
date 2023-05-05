import React from 'react';
import styled from 'styled-components';

const Wrapper = styled('div')` 
  display:flex;
  flex: 1;
  border: 2px solid #a073cd;
  margin:20px;
  background:  #d8bbff; 
  border-width: 1px; 
  border-radius: 0.5rem;
`

const Card = ({ children, className, testId }) => {
  return (
    <Wrapper
      className={className}
      data-testid={testId}
    >
      {children}
    </Wrapper>
  );
};

export default Card;