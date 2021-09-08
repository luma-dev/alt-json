const getRegexRanges = async (model, regexStart, regexEnd = regexStart) => {
  const ranges = [];
  const value = model.getValue();
  const lines = value.split("\n");
  let last = null;
  lines.forEach((line, i) => {
    if (last !== null) {
      if (regexEnd.test(line)) {
        ranges.push({start: last + 1, end: i});
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
    ranges.push({start: last + 1, end: lines.length});
  }
  return ranges;
};
export default getRegexRanges;
