import {IndentRangeProvider} from "../../../_snowpack/pkg/monaco-editor/esm/vs/editor/contrib/folding/indentRangeProvider.js";
const getIndentRanges = async (model) => {
  const indent = new IndentRangeProvider(model);
  const {_startIndexes, _endIndexes} = await indent.compute();
  const ranges = [];
  _startIndexes.forEach((start, i) => {
    const end = _endIndexes[i];
    ranges.push({start, end});
  });
  return ranges;
};
export default getIndentRanges;
