const { calculateSigningKey } = require('../src/helpers');
const { fakeSecretKey, dateAsString, region } = require('./variables');

test('calculateSigningKey returns an AWS Sig v4 Signing Key', () => {
  expect(calculateSigningKey(fakeSecretKey, dateAsString, region, 'execute-api')).toEqual(
    '7acecfed2001ab2b2fe4f6c69954f2666196b2556c0c69c5486c03f99f04aab8',
  );
});
