import HCL from "../../_prebuild_dynamic/js-hcl-parser/dist/hcl.js";
const hcl = {
  id: "hcl",
  name: "hcl",
  display: "HCL",
  packageName: "js-hcl-parser",
  packageObject: HCL,
  toJSON: (str) => JSON.parse(HCL.parse(str)),
  fromJSON: (value) => HCL.stringify(JSON.stringify(value))
};
export default hcl;
