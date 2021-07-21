import type { AltJSON } from './alt-json.d';

const json: AltJSON = {
  id: 'json',
  name: 'json',
  display: 'JSON',
  packageName: null,
  packageObject: JSON,
  toJSON: str => JSON.parse(str),
  fromJSON: value => JSON.stringify(value, undefined, 2),
};

export default json;
