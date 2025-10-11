function createBuildUrlProxyHashResolver({
  hasher,
  contentResolver
}) {
  return {
    resolve({ originalUrl, type }) {
      return `${hasher.hashString(contentResolver.resolve(originalUrl))}.${type}`;
    }
  };
}
function createDevUrlProxyHashResolver({
  baseHashResolver
}) {
  return {
    resolve(input) {
      const { cssVariable, data } = input;
      return [cssVariable.slice(2), data.weight, data.style, baseHashResolver.resolve(input)].filter(Boolean).join("-");
    }
  };
}
export {
  createBuildUrlProxyHashResolver,
  createDevUrlProxyHashResolver
};
