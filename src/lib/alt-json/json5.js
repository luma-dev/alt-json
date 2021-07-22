import JSON5 from "../../../_snowpack/pkg/json5.js";
const json5 = {
  id: "json5",
  name: "json5",
  display: "JSON5",
  packageName: "json5",
  packageObject: JSON5,
  toJSON: (str) => JSON5.parse(str),
  fromJSON: (value) => JSON5.stringify(value, void 0, 2)
};
export default json5;
