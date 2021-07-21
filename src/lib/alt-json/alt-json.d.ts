export interface AltJSON {
  readonly id: string;
  readonly name: string;
  readonly display: string;
  readonly toJSON(str: string): JSONValue;
  readonly fromJSON(value: ReadonlyJSONValue): string;
  readonly packageName: string | null;
  readonly packageObject: unknown;
}
