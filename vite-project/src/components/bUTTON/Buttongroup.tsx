import styled from 'styled-components';
import tw from 'twin.macro';

interface ButtonGroupProps {
  shadow?: 'sm' | false;
}

const ButtonGroup = styled.span<ButtonGroupProps>`
  ${tw`relative z-0 inline-flex rounded-md`}
  ${({ shadow = 'sm' }) => shadow === 'sm' && tw`shadow-sm`}
`;

export default ButtonGroup;