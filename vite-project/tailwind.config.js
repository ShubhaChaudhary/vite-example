const defaultTheme = require('tailwindcss/defaultTheme');
const colors = require('tailwindcss/colors');

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        inherit: 'inherit',
        transparent: 'transparent',
        current: 'currentColor',
        black: '#000000',
        white: '#FFFFFF',
        gray: colors.neutral,
        momentYellow: '#FDD936',
        primary: {
          25: '#FAFCFF',
          50: '#EEF3FC',
          100: '#D9E5FA',
          200: '#B2CFFF',
          300: '#7EA6E7',
          400: '#5187DF',
          500: '#2669D7',
          600: '#1E54AC',
          700: '#173F82',
          800: '#123267',
          900: '#102B57',
          DEFAULT: '#2669D7'
        },
        base: {
          1: '#F2F3F4',
          2: '#E6E7E9',
          3: '#D9DBDE',
          4: '#CCCFD3',
          5: '#BFC3C8',
          6: '#B3B7BD',
          7: '#A6ABB2',
          8: '#999FA7',
          9: '#8D939C',
          10: '#808791',
          11: '#737B86',
          12: '#676F7B',
          13: '#5A6370',
          14: '#4D5765',
          15: '#404B5A',
          16: '#343F4F',
          17: '#273344',
          18: '#1A2739',
          19: '#0E1B2E',
          20: '#010F23'
        },
        alert: {
          1: '#FFEFF0',
          2: '#FFDCDD',
          3: '#FFBFC2',
          4: '#FF9499',
          5: '#FF5763',
          6: '#FF1C37',
          7: '#E9001A',
          8: '#BF0013',
          9: '#9A0015',
          10: '#7D0518'
        },
        warning: {
          1: '#FFF1E4',
          2: '#FFE8D2',
          3: '#FFE3C9',
          4: '#FFC793',
          5: '#FFA24B',
          6: '#E69347',
          7: '#CC8443',
          8: '#B3763F',
          9: '#805837',
          10: '#674A33'
        },
        success: {
          1: '#CFF4E4',
          2: '#9EE9CA',
          3: '#6EDFAF',
          4: '#3DD495',
          5: '#0DC97A',
          6: '#0AA467',
          7: '#087F54',
          8: '#055940',
          9: '#03342D',
          10: '#01181F',
          DEFAULT: '#0DC97A'
        },
        multiplayer: {
          1: '#fca5a5',
          2: '#fdba74',
          3: '#fde047',
          4: '#67e8f9',
          5: '#5eead4',
          6: '#93c5fd',
          7: '#a5b4fc',
          8: '#d8b4fe',
          9: '#f9a8d4',
          10: '#fda4af'
        },
        dark: {
          1: '#CBC2C2',
          2: '#FFFFFF',
          3: '#4D4A4A',
          4: '#333131',
          5: '#808080',
          6: '#201F1F'
        }
      },

      fontFamily: {
        sans: ['InterVariable', ...defaultTheme.fontFamily.sans]
      },

      inset: {
        '-10000': '-10000px'
      }
    }
  },
  variants: {
    extend: {
      display: ['group-hover'],
      backgroundColor: ['disabled'],
      opacity: ['disabled'],
      cursor: ['disabled']
    }
  },
  corePlugins: {
    preflight: false
  },
  plugins: [require('@tailwindcss/line-clamp')]
};