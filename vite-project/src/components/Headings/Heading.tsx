mport React from 'react';
import styled from 'styled-components';
import Caps from '../Caps/Caps';
import shouldForwardProp from '@styled-system/should-forward-prop';
import {
  color,
  ColorProps,
  fontFamily,
  FontFamilyProps,
  fontSize,
  FontSizeProps,
  fontWeight,
  FontWeightProps,
  lineHeight,
  LineHeightProps,
  space,
  SpaceProps,
  textAlign,
  TextAlignProps
} from 'styled-system';

type Props = FontSizeProps &
  FontWeightProps &
  LineHeightProps &
  SpaceProps &
  ColorProps &
  FontFamilyProps &
  TextAlignProps;

const Heading = styled.h2.withConfig({ shouldForwardProp })<Props>`
  ${fontSize}
  ${fontWeight}
  ${lineHeight}
  ${space}
  ${color}
  ${fontFamily}
  ${textAlign}
`;

Heading.defaultProps = {
  fontSize: 4,
  fontWeight: 'bold',
  lineHeight: 1.25,
  mt: 0,
  mb: 3,
  color: 'darker'
};

type HeadingProps = Parameters<typeof Heading>[0];
type CapsProps = Parameters<typeof Caps>[0];

export const Heading3 = (props: HeadingProps) => (
  <Heading as="h3" fontSize={3} {...props} />
);
export const Heading4 = (props: HeadingProps) => (
  <Heading as="h4" fontSize={2} fontWeight="medium" {...props} />
);
export const Heading5 = (props: HeadingProps) => (
  <Heading
    as="h5"
    fontSize={'inherit'}
    lineHeight={1.5}
    mb={1}
    color={'darker'}
    fontWeight="medium"
    {...props}
  />
);
export const Heading6 = (props: CapsProps) => (
  <Caps as="h6" fontSize={0} {...props} />
);

export default Heading;