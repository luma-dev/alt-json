import * as JSONC from 'jsonc-parser';
import type { AltJSON } from './alt-json.d';

const jsonc: AltJSON = {
  name: 'jsonc',
  display: 'JSONC',
  packageName: 'jsonc-parser',
  packageObject: JSONC,
  toJSON: str => JSONC.parse(str) as JSONValue,
  fromJSON: value => JSON.stringify(value, undefined, 2),
};

export default jsonc;
