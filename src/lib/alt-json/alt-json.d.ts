export interface AltJSON {
  readonly name: string;
  readonly display: string;
  readonly toJSON(str: string): JSONValue;
  readonly fromJSON(value: ReadonlyJSONValue): string;
}
