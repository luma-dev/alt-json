import * as Architect from '@architect/parser';
import type { AltJSON } from './alt-json.d';

const arc: AltJSON = {
  id: 'arc',
  name: 'arc',
  display: 'Architect',
  packageName: '@architect/parser',
  packageObject: Architect,
  toJSON: str => Architect.default(str),
  fromJSON: value => Architect.stringify(value),
};

export default arc;
