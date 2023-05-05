import React from 'react';
import styled from 'styled-components';


const Wrapper = styled('div')` 
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;

`

const Spinner = styled('span')` 
    width: 48px;
    height: 48px;
    border: 5px solid #FFF;
    border-bottom-color: transparent;
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
    @keyframes rotation {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
`

const ScreenLoading = () => {
    return (
        <>
            <Wrapper>
                <Spinner />
            </Wrapper>
        </>
    );
};

export default ScreenLoading;