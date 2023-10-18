import colors from './colors';

const breakpoints = [32, 48, 64, 80].map((n) => n + 'em');

const space = [0, 4, 7, 14, 21, 28, 42, 56, 126];

const fontSizes = [12, 14, 16, 22, 32, 42, 48, 64, 72, 96];

const maxWidths = [640, 960, 1280];

const fontWeights = {
  normal: 400,
  medium: 500,
  bold: 600
};

const radii = [0, 4, 8];

const fonts = {
  0: '"Interx", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  mono: 'Menlo, monospace'
};

const shadows = [
  'none',
  'rgba(67, 90, 111, 0.15) 0px 0px 1px, rgba(67, 90, 111, 0.15) 0px 2px 4px -2px',
  '0px 4px 25px rgba(0, 0, 0, 0.05)',
  '0px -7px 40px rgba(0, 0, 0, 0.07), 0px 3px 6px rgba(0, 0, 0, 0.05)',
  '0px 1.44265px 2.30138px rgba(0, 0, 0, 0.0217013), 0px 3.64858px 5.82036px rgba(0, 0, 0, 0.0310596), 0px 7.44277px 11.873px rgba(0, 0, 0, 0.0389404), 0px 15.3307px 24.4561px rgba(0, 0, 0, 0.0482987), 0px 42px 67px rgba(0, 0, 0, 0.07)'
];

export default {
  breakpoints,
  space,
  fontSizes,
  fontWeights,
  fonts,
  colors,
  radii,
  shadows,
  maxWidths
};