declare function parse(s: string): string;
declare function stringify(v: string): string;

declare const HCL: {
  parse: typeof parse;
  stringify: typeof parse;
};
export default HCL;
