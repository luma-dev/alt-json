declare function parse(s: string): JSONValue;
declare function stringify(v: JSONValue): string;

export default {
  parse,
  stringify,
};
