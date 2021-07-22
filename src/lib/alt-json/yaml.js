import YAML from "../../../_snowpack/pkg/yaml.js";
const yaml = {
  id: "yaml",
  name: "yaml",
  display: "YAML",
  packageName: "yaml",
  packageObject: YAML,
  toJSON: (str) => YAML.parse(str),
  fromJSON: (value) => YAML.stringify(value)
};
export default yaml;
