const createColors = () => {
    const colors: Record<string, any> = {
      black: '#111',
      brand: '#00D582',
      brandGreen: '#00D582',
      brandIndigo: '#02333E',
      brandGrey: '#F7F8F7',
      waveColor: '#D9E0D9',
      dark: '#242924',
      darker: '#0c0e0c',
      light: '#6b7a6b',
      lighter: '#a0aca0',
      lightest: '#F3F4F4',
      lightestBorder: '#EDEEED',
      white: '#fff',
      darken: 'rgba(0, 0, 0, 0.25)',
      gray: '#eee',
      waveEmpty: '#F8F9F8',
      waveLoaded: '#bbc3bb',
      waveLoadedList: '#D9E0D9',
      linkLight: '#C4CFD2',
      linkLightHover: '#ffffff'
    };
  
    return colors;
  };
  
  const colors = createColors();
  
  export default colors;