import * as JSON5 from 'json5';
import type { AltJSON } from './alt-json.d';

const json5: AltJSON = {
  name: 'json5',
  display: 'JSON5',
  toJSON: str => JSON5.parse(str) as JSONValue,
  fromJSON: value => JSON5.stringify(value, undefined, 2) as string,
};

export default json5;
