import YAML from 'yaml';
import type { AltJSON } from './alt-json.d';

const yaml: AltJSON = {
  id: 'yaml',
  name: 'yaml',
  display: 'YAML',
  packageName: 'yaml',
  packageObject: YAML,
  toJSON: str => YAML.parse(str) as JSONValue,
  fromJSON: value => YAML.stringify(value),
};

export default yaml;
