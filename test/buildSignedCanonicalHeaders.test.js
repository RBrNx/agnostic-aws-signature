const { buildCanonicalSignedHeaders } = require('../src/helpers');
const { testRequestHeaders } = require('./variables');

test('buildSignedCanonicalHeaders returns a semi-colon delimited list of alphabetically sorted header keys', () => {
  expect(buildCanonicalSignedHeaders({ b: 1, a: 2 })).toEqual('a;b');
  expect(buildCanonicalSignedHeaders(testRequestHeaders)).toEqual('accept;content-type;host;x-amz-date');
});
