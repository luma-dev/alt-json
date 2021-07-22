const json = {
  id: "json",
  name: "json",
  display: "JSON",
  packageName: null,
  packageObject: JSON,
  toJSON: (str) => JSON.parse(str),
  fromJSON: (value) => JSON.stringify(value, void 0, 2)
};
export default json;
