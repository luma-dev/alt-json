declare module '@architect/parser' {
  declare const parse: {
    stringify: (v: JSONValue) => string;
    (s: string): JSONValue;
  };
  export = parse;
}
