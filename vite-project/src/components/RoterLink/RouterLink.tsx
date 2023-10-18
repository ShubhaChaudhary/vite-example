import { Link } from 'react-router-dom';
import styled from 'styled-components';
import get from 'lodash/get';
import { alignItems, space, color, display } from 'styled-system';
import shouldForwardProp from '@styled-system/should-forward-prop';

interface Props {
  light?: boolean;
}

export const RouterLink = styled(Link).withConfig({ shouldForwardProp })<Props>`
  ${(props) => ({
    color: props.light
      ? get(props.theme, 'colors.linkLight')
      : get(props.theme, 'colors.blue'),
    textDecoration: 'none',
    '&:hover': {
      color: props.light
        ? get(props.theme, 'colors.linkLightHover')
        : get(props.theme, 'colors.blueDark')
    }
  })}
  ${alignItems}
  ${space}
  ${color}
  ${display}
`;

export default RouterLink;