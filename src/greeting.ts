/* eslint-disable no-console */
import altJSONs from './lib/alt-json';

const say = (s: string): void => {
  console.log(
    '%catl-json%cluma.dev%c %s',
    'font-size: 1rem; background:white; padding: 2px 4px; color: black;',
    'font-size: 1rem; background:black; padding: 2px 4px; color: white;',
    'font-size: 1rem;',
    s,
  );
};

const exposeNotice = (name: string, obj: unknown): void => {
  console.log(
    '%catl-json%cluma.dev%c %cwindow%c.%c%s%c = %o',
    'font-size: 1rem; background:white; padding: 2px 4px; color: black;',
    'font-size: 1rem; background:black; padding: 2px 4px; color: white;',
    'font-size: 1rem;',
    'font-size: 1rem; font-style: bold',
    'font-size: 1rem;',
    'font-size: 1rem; color: #0cb4ff; font-weight: bold;',
    name,
    'font-size: 1rem;',
    obj,
  );
};

export const expose = (obj: { [key: string]: unknown }): void => {
  Object.keys(obj).forEach((key) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any)[key] = obj[key];
    exposeNotice(key, obj[key]);
  });
};

export const exposeAllAltJSONs = (): void => {
  altJSONs.forEach((a) => {
    expose({
      [a.name]: a.packageObject,
    });
  });
};

export const greeting = (): void => {
  say('Welcome!');
  say('You can use globally exposed tools here!');
};
/* eslint-enable no-console */
