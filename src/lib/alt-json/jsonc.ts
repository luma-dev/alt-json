import { jsonc as JSONC } from 'jsonc';
import type { AltJSON } from './alt-json.d';

const jsonc: AltJSON = {
  name: 'jsonc',
  display: 'JSONC',
  toJSON: str => JSONC.parse(str) as JSONValue,
  fromJSON: value => JSONC.stringify(value, undefined, 2),
};

export default jsonc;
