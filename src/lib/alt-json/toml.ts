import * as TOML from '@iarna/toml';
import type { AltJSON } from './alt-json.d';

const toml: AltJSON = {
  name: 'toml',
  display: 'TOML',
  packageName: '@iarna/toml',
  packageObject: TOML,
  toJSON: str => TOML.parse(str) as JSONValue,
  fromJSON: value => {
    if (value === null) return '# TOML does not support top-level null';
    if (typeof value === 'string') return '# TOML does not support top-level string';
    if (typeof value === 'number') return '# TOML does not support top-level number';
    if (typeof value === 'boolean') return '# TOML does not support top-level boolean';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return TOML.stringify(value as any) as string;
  },
};

export default toml;
