const { buildCanonicalQueryString } = require('../src/helpers');

test('buildCanonicalQueryString returns an alphabetically sorted query string with encoded uri components', () => {
  expect(buildCanonicalQueryString({})).toEqual('');
  expect(buildCanonicalQueryString({ b: 1, a: 2 })).toEqual('a=2&b=1');
  expect(buildCanonicalQueryString({ accept: '*/*', 'content-type': 'application/json' })).toEqual('accept=*%2F*&content-type=application%2Fjson');
});
