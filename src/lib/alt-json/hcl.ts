import * as HCL from '../../../prebuild/js-hcl-parser/dist/hcl.js';
import type { AltJSON } from './alt-json.d';
window.

const hcl: AltJSON = {
  name: 'hcl',
  display: 'HCL',
  toJSON: str => HCL.parse(str),
  fromJSON: value => HCL.stringify(value),
};

export default hcl;
