import { Link} from 'react-router-dom'; 
import { Container, BottomLeft } from './styles'
import { WomenWebDevloper } from '../../../common/WomenWebDevloper'

export default function Overlay() {

  return (
    <Container>
      <BottomLeft>
        <Link to="/about" >About Me</Link>
      </BottomLeft>   
      <WomenWebDevloper />
    </Container>
  )
}

