export function NullReplacer(key, value) {
  return value === null
    ? undefined
    : value
}

export function GroupBy(array, funcProp) {
  if (!array) {
    return []
  }
  let result = array.reduce((acc, val) => {
    (acc[funcProp(val)] = acc[funcProp(val)] || []).push(val)
    return acc
  }, {})
  return result
};
