import * as JSONC from "../../../_snowpack/pkg/jsonc-parser.js";
const jsonc = {
  id: "jsonc",
  name: "jsonc",
  display: "JSONC",
  packageName: "jsonc-parser",
  packageObject: JSONC,
  toJSON: (str) => JSONC.parse(str),
  fromJSON: (value) => JSON.stringify(value, void 0, 2)
};
export default jsonc;
