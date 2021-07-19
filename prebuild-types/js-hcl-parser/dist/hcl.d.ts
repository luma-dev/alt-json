declare module '../prebuild/js-hcl-parser/dist/hcl.js' {
  export function parse(s: string): JSONValue;
  export function parse(v: ReadonlyJSONValue): string;
}
