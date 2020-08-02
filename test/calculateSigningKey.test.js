const { calculateSigningKey } = require('../src/helpers');
const { fakeSecretKey, dateAsString, region } = require('./variables');

test('calculateSigningKey returns an AWS Sig v4 Signing Key', () => {
  // Official AWS Examples
  // https://docs.aws.amazon.com/general/latest/gr/signature-v4-examples.html#signature-v4-examples-javascript
  expect(calculateSigningKey('wJalrXUtnFEMI/K7MDENG+bPxRfiCYEXAMPLEKEY', '20120215', 'us-east-1', 'iam').toString()).toEqual(
    'f4780e2d9f65fa895f9c67b32ce1baf0b0d8a43505a000a1a9e090d414db404d',
  );

  expect(calculateSigningKey(fakeSecretKey, dateAsString, region, 'execute-api').toString()).toEqual(
    '2043104976b5a59e0638e4e0cbc95a48921d6c585674f364f28d3dcd4a7266c4',
  );
});
