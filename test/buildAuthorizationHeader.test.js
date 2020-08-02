const {
  buildCanonicalRequest,
  hash,
  buildCredentialScope,
  buildStringToSign,
  calculateSigningKey,
  hmac,
  buildAuthorizationHeader,
} = require('../src/helpers');
const { testRequestHeaders, dateAsString, region, fakeSecretKey, fakeAccessKey } = require('./variables');

test('buildAuthorizationHeader returns an AWS Sig v4 Auth headers', () => {
  const canonicalRequest = buildCanonicalRequest('POST', '/dev/api', {}, testRequestHeaders, { data: 'test' });
  const hashedCanonicalRequest = hash(canonicalRequest);
  const credentialScope = buildCredentialScope(dateAsString, region, 'execute-api');
  const stringToSign = buildStringToSign(dateAsString, credentialScope, hashedCanonicalRequest);
  const signingKey = calculateSigningKey(fakeSecretKey, dateAsString, region, 'execute-api');
  const signature = hmac(signingKey, stringToSign).toString();

  expect(buildAuthorizationHeader(fakeAccessKey, credentialScope, testRequestHeaders, signature)).toEqual(
    'AWS4-HMAC-SHA256 Credential=ASIAWXW4R5NWN4CD3436/20200702/eu-west-2/execute-api/aws4_request, SignedHeaders=accept;content-type;host;x-amz-date, Signature=a7870b1327b30ba634e5c715ab19dd39d7e200a38cd6e6f8fdca7fc48a27d218',
  );
});
