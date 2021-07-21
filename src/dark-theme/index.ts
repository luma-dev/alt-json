export type ListenerThemeChange = (isDark: boolean) => void | Promise<void>;

export const onChangeTheme = (listener: ListenerThemeChange): void => {
  try {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      void listener(e.matches);
    });
  } catch (e: unknown) {
    if (import.meta.env.MODE === 'development') {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }
};

export const isDarkTheme = (): boolean => {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch (e: unknown) {
    if (import.meta.env.MODE === 'development') {
      // eslint-disable-next-line no-console
      console.error(e);
    }
    return false;
  }
};
