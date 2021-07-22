import * as __SNOWPACK_ENV__ from '../../_snowpack/env.js';

export const onChangeTheme = (listener) => {
  try {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
      void listener(e.matches);
    });
  } catch (e) {
    if (__SNOWPACK_ENV__.MODE === "development") {
      console.error(e);
    }
  }
};
export const isDarkTheme = () => {
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch (e) {
    if (__SNOWPACK_ENV__.MODE === "development") {
      console.error(e);
    }
    return false;
  }
};
