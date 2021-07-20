// Snowpack Configuration File
// See all supported options: https://www.snowpack.dev/reference/configuration

/** @type {import("snowpack").SnowpackUserConfig } */
const config = {
  mount: {
    '.prebuild-static': { url: '/', static: true, resolve: false },
    '': '/',
  },
  plugins: [
    '@snowpack/plugin-sass',
  ],
  packageOptions: {
    polyfillNode: true,
  },
  devOptions: {
  },
  buildOptions: {
  },
};

export default config;
