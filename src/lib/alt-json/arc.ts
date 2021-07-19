import * as parse from '@architect/parser';
import type { AltJSON } from './alt-json.d';

const hcl: AltJSON = {
  name: 'arc',
  display: 'Architect',
  toJSON: str => parse(str),
  fromJSON: value => parse.stringify(value),
};

export default hcl;
