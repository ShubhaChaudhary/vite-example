import styled from 'styled-components'

export const Wrapper = styled.div` 
  hight:30rem; 
  margin:0;
  padding:0; 
`

export const Section = styled.div` 
  display:flex;
  flex:1;
  @media (max-width: 800px) {
      flex-direction: column;
    }
`
export const CardDiv = styled.div` 
  display:flex;
  flex-direction:column;
  flex:1;
`
export const Right = styled.div` 
 flex:1;
 width:10rem;  
 hight:10rem;  
`

export const Left = styled.div` 
 flex:4;
`
export const SubCard = styled.div`
border: 2px solid #a073cd;
margin: 3px;
border-width: 1px; 
border-radius: 0.5rem;
padding: 0.5rem;
`
export const Container = styled.div`
  flex-direction:column;
`