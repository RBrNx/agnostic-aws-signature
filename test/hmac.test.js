import { hmac } from '../src/helpers';

test('hmac returns the HmacSHA256 hash of a secret and a value', () => {
  expect(hmac('key', 'body')).toMatchObject({
    sigBytes: 32,
    words: [1364897299, 994270528, 9791281, -158669361, 1589140815, 231122246, -759182027, -1779688735],
  });

  expect(hmac('key', 'body').toString()).toEqual('515aae133b435d4000956731f68ae5cf5eb85d4f0dc6a546d2bfcd3595ec1ae1');

  expect(hmac('key', '515aae133b435d4000956731f68ae5cf5eb85d4f0dc6a546d2bfcd3595ec1ae1').toString()).toEqual(
    'ef3748583b20051061b11770b9f1f583e5c5bcc906bd9ae1669cbd139a0c95c3',
  );

  expect(hmac('secretKey', JSON.stringify({ objectTest: true })).toString()).toEqual(
    'e902b7264c035ef87b46a793ef160ea2926794557aac4b80a9cb204479a739e1',
  );
});
