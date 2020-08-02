const { buildCanonicalHeaders } = require('../src/helpers');
const { testRequestHeaders } = require('./variables');

test('buildCanonicalHeaders returns a newline delimited string of alphabetically sorted request headers', () => {
  expect(buildCanonicalHeaders({ b: 1, a: 2 })).toEqual('a:2\nb:1\n');
  expect(buildCanonicalHeaders(testRequestHeaders)).toEqual(
    'accept:*/*\ncontent-type:application/json\nhost:execute-api.eu-west-2.amazonaws.com\nx-amz-date:20200702T153953Z\n',
  );
});
