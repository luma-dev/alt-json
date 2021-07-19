import json from './json';
import json5 from './json5';
import jsonc from './jsonc';
import yaml from './yaml';
import toml from './toml';
import hcl from './hcl';
import arc from './arc';
import type { AltJSON } from './alt-json.d';

const altJSONs: ReadonlyArray<AltJSON> = [json, json5, jsonc, yaml, toml, hcl, arc];

export default altJSONs;
