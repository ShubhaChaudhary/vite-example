import styled, { keyframes } from 'styled-components'

export const fade = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`

export const FadeIn = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  background:#bc9cdc;
  animation: ${fade} 4s normal forwards ease-in-out;
`

export const Container = styled.div`
  font-family: 'inherit';
  font-size: 16px;
`

export const BottomLeft = styled.div`
  position: absolute;
  top: 5vw;
  left: 5vw;
  width: 30ch;
  max-width: 40%;
  & > a{
    padding: 0;
    margin: 0 0 0.05em 0;
    font-family: 'Papyrus';
    font-weight: 400;
    text-decoration: none;
    font-size: min(3vw, 19em);
    line-height: 0.85em;
    color:rgba(27, 7, 44, 0.87);
  
  }
`



export const Hamburger = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  top: 5vw;
  right: 5vw;
  & > div {
    position: relative;
    width: 24px;
    height: 2px;
    background: #252525;
    margin-bottom: 6px;
  }
`

export const LeftMiddle = styled.div`
  position: absolute;
  bottom: 20%;
  right: 5vw;
  transform: rotate(90deg) translate3d(50%, 0, 0);
  transform-origin: 100% 50%;
`
