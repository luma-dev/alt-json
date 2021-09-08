import * as monaco from "../../../_snowpack/pkg/monaco-editor.js";
export const getDarkTheme = () => ({
  base: "vs-dark",
  inherit: true,
  rules: [{token: "string.escape", foreground: "2de4ea"}],
  colors: {}
});
export const lumaDarkThemeName = "luma-dark";
export const registerDarkTheme = () => {
  monaco.editor.defineTheme(lumaDarkThemeName, getDarkTheme());
};
