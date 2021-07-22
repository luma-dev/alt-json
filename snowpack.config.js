const config = {
  mount: {
    _prebuild_static: {url: "/", static: true, resolve: false},
    static: {url: "/", static: true, resolve: false},
    "": "/"
  },
  plugins: [
    "@snowpack/plugin-sass"
  ],
  packageOptions: {
    polyfillNode: true
  },
  devOptions: {},
  buildOptions: {}
};
export default config;