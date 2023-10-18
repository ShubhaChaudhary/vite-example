export const availableLanguageSupport: string[] = ['en', 'fr', 'de'];

export const isBrowserSupportLanguage = () => {
  return availableLanguageSupport.includes(navigator.language.split(/-|_/)[0])
    ? navigator.language.split(/-|_/)[0]
    : null;
};