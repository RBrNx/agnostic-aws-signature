const { buildStringToSign, buildCredentialScope, buildCanonicalRequest, hash } = require('../src/helpers');
const { testRequestHeaders, region, dateAsString } = require('./variables');

test('buildStringToSign returns a string containing relevant request info for AWS', () => {
  const canonicalRequest = buildCanonicalRequest('POST', '/dev/api', {}, testRequestHeaders, { data: 'test' });
  const hashedCanonicalRequest = hash(canonicalRequest);
  const credentialScope = buildCredentialScope(dateAsString, region, 'execute-api');

  expect(buildStringToSign(dateAsString, credentialScope, hashedCanonicalRequest)).toEqual(
    'AWS4-HMAC-SHA256\n20200702T153953Z\n20200702/eu-west-2/execute-api/aws4_request\nb59b943bf21efb7409ad0d2dde8180f9aba273669f0c8607bdd53763405edd84',
  );
});
