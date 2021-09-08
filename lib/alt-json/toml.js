import * as TOML from "../../_snowpack/pkg/@iarna/toml.js";
const toml = {
  id: "toml",
  name: "toml",
  display: "TOML",
  packageName: "@iarna/toml",
  packageObject: TOML,
  toJSON: (str) => TOML.parse(str),
  fromJSON: (value) => {
    if (value === null)
      return "# TOML does not support top-level null";
    if (typeof value === "string")
      return "# TOML does not support top-level string";
    if (typeof value === "number")
      return "# TOML does not support top-level number";
    if (typeof value === "boolean")
      return "# TOML does not support top-level boolean";
    return TOML.stringify(value);
  }
};
export default toml;
