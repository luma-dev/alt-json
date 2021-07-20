// NOTE: index.d.ts in yaml is incorrect.
declare module 'yaml' {
  import * as YAML from 'yaml/index';

  export default YAML;
}
