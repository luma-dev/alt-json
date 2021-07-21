import * as monaco from 'monaco-editor';

export const getDarkTheme = (): monaco.editor.IStandaloneThemeData => {
  return {
    base: 'vs-dark',
    inherit: true,
    rules: [{ token: 'string.escape', foreground: '2de4ea' }],
    colors: {},
  };
};

export const lumaDarkThemeName = 'luma-dark';

export const registerDarkTheme = (): void => {
  monaco.editor.defineTheme(lumaDarkThemeName, getDarkTheme());
};
