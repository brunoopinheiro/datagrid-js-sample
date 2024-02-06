export const findPartialMatch = (comparisonArray, value) => {
  const isIncluded = comparisonArray.reduce((acc, curr) => {
    if (acc === true) return true;
    if (typeof curr !== "string") {
      return value === String(curr);
    }
    return curr.toUpperCase().includes(value.toUpperCase());
  }, false);

  return isIncluded;
};