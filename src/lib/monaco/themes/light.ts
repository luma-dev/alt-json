import * as monaco from 'monaco-editor';

export const getLightTheme = (): monaco.editor.IStandaloneThemeData => {
  return {
    base: 'vs',
    inherit: true,
    rules: [{ token: 'string.escape', foreground: '32bdc1' }],
    colors: {},
  };
};

export const lumaLightThemeName = 'luma-light';

export const registerLightTheme = (): void => {
  monaco.editor.defineTheme(lumaLightThemeName, getLightTheme());
};
