import * as YAML from 'yaml';
import type { AltJSON } from './alt-json.d';

const yaml: AltJSON = {
  name: 'yaml',
  display: 'YAML',
  toJSON: str => YAML.parse(str) as JSONValue,
  fromJSON: value => YAML.stringify(value),
};

export default yaml;
