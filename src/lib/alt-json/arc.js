import * as Architect from "../../../_snowpack/pkg/@architect/parser.js";
class StringifyError extends Error {
  constructor() {
    super(...arguments);
    this.name = "StringifyError";
  }
}
const stringifyArcString = (value) => {
  const f = Number.parseFloat(value);
  if (Number.isNaN(f) && Number.isFinite(f))
    return JSON.stringify(value);
  if (value === "true")
    return '"true"';
  if (value === "false")
    return '"false"';
  if (/\\$/.test(value))
    throw new StringifyError("String literal that ends with backslash is not supported");
  if (/["\n\t\r\b\f]/.test(value))
    throw new StringifyError("String litral including characters that should be escaped is not supported");
  if (/^[a-zA-Z0-9$_*()?"'^!=|:&`~+-]+$/.test(value) && !/^".*"$|^\s.*$|^.*\s$/.test(value))
    return value;
  const guess = JSON.stringify(value).replace(/\\\\/g, "\\");
  if (guess.length === value.length + 2)
    return guess;
  throw new StringifyError("String literal that includes non-graphical Unicode character is not supported");
};
const stringifyArcLiteralArray = (value) => {
  if (value.every((e) => typeof e === "string" || typeof e === "number" || typeof e === "boolean")) {
    const arr = value.map((e) => {
      if (typeof e === "string")
        return stringifyArcString(e);
      return JSON.stringify(e);
    });
    return arr;
  }
  throw new StringifyError("Architect does not support array including object that types is neigther string, number nor boolean for entries");
};
const stringifyArcEntryRecord = (value) => {
  if (value === null)
    throw new Error("# Architect does not support null for each record value");
  if (typeof value === "string")
    return [stringifyArcString(value)];
  if (typeof value === "number")
    return [JSON.stringify(value)];
  if (typeof value === "boolean")
    return [JSON.stringify(value)];
  if (Array.isArray(value)) {
    return stringifyArcLiteralArray(value);
  }
  const records = Object.entries(value).map(([rKey, rVal]) => {
    const str = (() => {
      if (rVal === null)
        throw new StringifyError("Architect does not support null for each record");
      if (typeof rVal === "string")
        return stringifyArcString(rVal);
      if (typeof rVal === "number")
        return JSON.stringify(rVal);
      if (typeof rVal === "boolean")
        return JSON.stringify(rVal);
      if (Array.isArray(rVal)) {
        return stringifyArcLiteralArray(rVal).join(" ");
      }
      throw new StringifyError("Architect does not support object for each record");
    })();
    if (str === "")
      return stringifyArcString(rKey);
    return `${stringifyArcString(rKey)} ${str}`;
  });
  return records;
};
const stringifyArcEntry = (value) => {
  if (value === null)
    return "# Architect does not support null for entries";
  if (typeof value === "boolean")
    return JSON.stringify(value);
  if (typeof value === "number")
    return JSON.stringify(value);
  if (typeof value === "string")
    return stringifyArcString(value);
  if (Array.isArray(value))
    return stringifyArcLiteralArray(value).join(" ");
  const tables = Object.entries(value).map(([key, val]) => `${key}
${stringifyArcEntryRecord(val).map((e) => `  ${e}`).join("\n")}`);
  return tables.join("\n");
};
const stringifyArcSection = (key, value) => {
  if (!/^[a-zA-Z0-9_-]+$/.test(key)) {
    return `# Section name ${JSON.stringify(key)} is invalid`;
  }
  if (!Array.isArray(value)) {
    return `# [@${key}] Architect does not support non-array for root of section`;
  }
  const body = value.map((el) => {
    try {
      return stringifyArcEntry(el);
    } catch (e) {
      if (e instanceof StringifyError) {
        return `# ${e.message}`;
      }
      throw e;
    }
  });
  return `@${key}
${body.join("\n")}`;
};
const safeStringifyArc = (value) => {
  if (value === null)
    return "# Architect does not support top-level null";
  if (typeof value === "string")
    return "# Architect does not support top-level string";
  if (typeof value === "number")
    return "# Architect does not support top-level number";
  if (typeof value === "boolean")
    return "# Architect does not support top-level boolean";
  if (Array.isArray(value))
    return "# Architect does not support top-level array";
  const sections = Object.entries(value).map(([key, val]) => stringifyArcSection(key, val));
  return sections.join("\n\n");
};
const arc = {
  id: "arc",
  name: "arc",
  display: "Architect",
  packageName: "@architect/parser",
  packageObject: {Architect, safeStringifyArc},
  toJSON: (str) => Architect.default(str),
  fromJSON: (value) => safeStringifyArc(value)
};
export default arc;
