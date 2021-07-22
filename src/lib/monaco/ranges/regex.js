const getRegexRanges = async (model, regex) => {
  const ranges = [];
  const value = model.getValue();
  const lines = value.split("\n");
  let last = null;
  lines.forEach((line, i) => {
    if (regex.test(line)) {
      if (last !== null) {
        ranges.push({start: last + 1, end: i});
      }
      last = i;
    }
  });
  if (last !== null) {
    ranges.push({start: last + 1, end: lines.length});
  }
  return ranges;
};
export default getRegexRanges;
