import type * as monaco from 'monaco-editor';

const getRegexRanges = async (
  model: monaco.editor.ITextModel,
  regexStart: RegExp,
  regexEnd: RegExp = regexStart,
): Promise<monaco.languages.FoldingRange[]> => {
  const ranges: monaco.languages.FoldingRange[] = [];
  const value = model.getValue();

  const lines = value.split('\n');

  let last: number | null = null as number | null;
  lines.forEach((line, i) => {
    if (last !== null) {
      if (regexEnd.test(line)) {
        ranges.push({ start: last + 1, end: i });
        last = null;
      }
    }
    if (last === null) {
      if (regexStart.test(line)) {
        last = i;
      }
    }
  });
  if (last !== null) {
    ranges.push({ start: last + 1, end: lines.length });
  }
  return ranges;
};

export default getRegexRanges;
