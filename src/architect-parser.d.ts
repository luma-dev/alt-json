declare module '@architect/parser' {
  export default function (s: string): JSONValue;
  export function stringify(v: ReadonlyJSONValue): string;
}
