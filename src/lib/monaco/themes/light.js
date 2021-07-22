import * as monaco from "../../../../_snowpack/pkg/monaco-editor.js";
export const getLightTheme = () => {
  return {
    base: "vs",
    inherit: true,
    rules: [{token: "string.escape", foreground: "32bdc1"}],
    colors: {}
  };
};
export const lumaLightThemeName = "luma-light";
export const registerLightTheme = () => {
  monaco.editor.defineTheme(lumaLightThemeName, getLightTheme());
};
