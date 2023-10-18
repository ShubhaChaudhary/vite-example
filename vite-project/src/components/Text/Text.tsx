import React from 'react';
import shouldForwardProp from '@styled-system/should-forward-prop';
import styled from 'styled-components';
import {
  color,
  ColorProps,
  fontFamily,
  FontFamilyProps,
  fontSize,
  FontSizeProps,
  fontWeight,
  FontWeightProps,
  letterSpacing,
  LetterSpacingProps,
  lineHeight,
  LineHeightProps,
  space,
  SpaceProps,
  textAlign,
  TextAlignProps,
  width,
  WidthProps
} from 'styled-system';

interface CssProps {
  css?: Record<string, string | number>;
}

type Props = SpaceProps &
  ColorProps &
  FontFamilyProps &
  FontSizeProps &
  FontWeightProps &
  TextAlignProps &
  LineHeightProps &
  LetterSpacingProps &
  WidthProps &
  CssProps;

const Text = styled.p.withConfig({ shouldForwardProp })<Props>`
  ${space}
  ${color}
  ${fontFamily}
  ${fontSize}
  ${fontWeight}
  ${textAlign}
  ${lineHeight}
  ${letterSpacing}
  ${width}
  ${({ css = {} }: CssProps) => css}
`;

Text.defaultProps = {
  ml: 0,
  mr: 0,
  mt: 0,
  mb: 3,
  lineHeight: 1.6,
  fontFamily: 'inherit'
};

type LargeTextProps = Parameters<typeof Text>[0];

export const LargeText: React.FC<LargeTextProps> = ({ children, ...props }) => (
  <Text {...props} fontSize={2}>
    {children}
  </Text>
);

export default Text;