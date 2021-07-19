import type { AltJSON } from './alt-json.d';

const json: AltJSON = {
  name: 'json',
  display: 'JSON',
  toJSON: str => JSON.parse(str),
  fromJSON: value => JSON.stringify(value, undefined, 2),
};

export default json;
