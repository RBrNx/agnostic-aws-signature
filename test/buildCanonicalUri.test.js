const { buildCanonicalUri } = require('../src/helpers');

test('buildCanonicalUri returns encoded uri', () => {
  expect(buildCanonicalUri('ABC abc 123')).toEqual('ABC%20abc%20123');
  expect(buildCanonicalUri('https://mozilla.org/?x=шеллы')).toEqual('https://mozilla.org/?x=%D1%88%D0%B5%D0%BB%D0%BB%D1%8B');
});
