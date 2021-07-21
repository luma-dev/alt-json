import type * as monaco from 'monaco-editor';
import { IndentRangeProvider } from 'monaco-editor/esm/vs/editor/contrib/folding/indentRangeProvider';

const getIndentRanges = async (model: monaco.editor.ITextModel): Promise<monaco.languages.FoldingRange[]> => {
  const indent = new IndentRangeProvider(model);
  const { _startIndexes, _endIndexes } = await indent.compute();

  const ranges: monaco.languages.FoldingRange[] = [];

  _startIndexes.forEach((start, i) => {
    const end = _endIndexes[i];
    ranges.push({ start, end });
  });
  return ranges;
};

export default getIndentRanges;
