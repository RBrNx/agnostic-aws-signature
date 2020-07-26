import {
  hash,
  hmac,
  buildCanonicalUri,
  buildCanonicalQueryString,
  buildCanonicalHeaders,
  buildCanonicalSignedHeaders,
  buildCanonicalRequest,
  buildCredentialScope,
  buildStringToSign,
  calculateSigningKey,
  buildAuthorizationHeader,
  createAwsClient,
} from '../src/index';

const fakeAccessKey = 'ASIAWXW4R5NWN4CD3436';
const fakeSecretKey = 'zfq4t13xhfKdIlNkWpjU/4pns/wtAQk3NnGwwgVb';
const fakeSessionToken =
  'IQoJb3JpZ2luX2VjEL7//////////wEaCWV1LXdlc3QtMiJHMEUCIQDEOqnNcrOnns53BX2eojFfnaiB24xHgOe0BLnABYPDUQIgLzpytsdGoIU2weguyiRXeLQlDxzAKpzdiTXJUEQCIg4qygUIRxABGgw0NjMyNDUyNzM5NjQiDFO7+VOqpR3coVY0JiqnBXvhFVAz5QVdqoAbbjPK4jheK1Qu/f2/pPaR/FnxyHgiCtxpPzQbZBNXwsHQbvtDPtS8FI2MxNYPhNjFCcgTa0jf/Ro7BHYNtyViBh6CCog4FfJQCAHibQ3ohhskgnf53ngPIp3DVVgmt1HcyIeJzBizh3/11t8EODgO5c6yc7H+lXkZDcdeYsohaLt7sf/Ept08D3BTuB9gOvUNOMv/MTh6Ut9pjB/Zap1jirwLVqZU1Ivt/Gu4wai/AMC+xeoo9EJ9pkQDQ24fY8WY4wYNW1WE2darCwwUOSH5uFDjCtnBayUWV8FcpRxCI3MCxXU6yqRn2BxDnIiGcYTrPDzI1Z0AzRgTcV8/wEUAIbe17Ya/PZHbl3sEwyiE38GAgr7DKjShSoPPPpIELDPtIe6l6EyxJMDby/sMMKGBUkyoRLJldzlX4rjhFAEEQxNCJhpyvVMFEQlciHFzMPescH5nkHujGkVDM1kTa9UvznM8cA6s5onFrArc1AGc4WQU2jfGxdS1b5nT0zrF3rhjONvK+gkyrlcf80GjrAYggrV68cNkoZqeWw9zLEhnlFAIQqDMvwUCc28fmjPAC9QOrlzXyxq1YVyTxa+t3ec1TVK84s2dZpwu3L9MpJzl5lLdppIqjQ+o4X/3qTj+zrxCb1/6Bg8FtilXgcnDkWPhxTXcAdDwEcuS4OS/9UICVJvF/jF6XCIk1Bq3cRhMCNtBa9YfC276Dn5W32VfiHc09BOJzUElJMzVb+f3GiKfEPT6hhPL5XECy8R0emIopfGfUxFqzVodlBmU0q+TRI72/GY+H0GvZvh5v38uULm6bYL0e/jwy8g4C8QBQTB7QMRwpnLLBMv1wfRrBXg0Ghp4pSiPnknol8QJur8ZoR0sTYGurhtJMhE2+iUko9Iwicy99wU6zQKt/SJW70ucMnXkPg5KKGNFH4MTiQDfgxcKfOVdiJUN7RxO3BOETgSGnndhgjRiM7tCvBsx8bz+meCHEoGwH3nSzT9gqXU3uveuhaMPS1UUDf+lYWLuQMYIRXNBgO4rXfx6pedbGV4Bv6Jb5cYZEYUp/E/ECBlFn1jltkezwjP0x6GH26duiejH5efCWzRKqTHJu+4vijwv3zskRwhBPp6BiuYJy5Hc6LmJWlRFFkqGVistKZR2nTq7qPnhPlMxOK5VQUqcehGafj+o3U+BWa/griKPHvvX9hVV1XLOFthlLF+cEJN1HKqIjJ7/U5BQsg3SBu/IKlxquVL4TAh7OCItXJ/v2n18Du6ZiEfvAqbxQ5CWJW089T8J/7Bbbl0C+ztAW63LsJUKhmC1suY6XXnzGHddKqJfTWrXGV3VxFSI4lFPpnvwEnpuWBKPeis=';
const endpoint = 'https://xiey9y60ej.execute-api.eu-west-2.amazonaws.com/dev/api';
const region = 'eu-west-2';
const dateAsString = '20200702T153953Z';
const testRequestHeaders = {
  'content-type': 'application/json',
  accept: '*/*',
  'x-amz-date': '20200702T153953Z',
  host: 'execute-api.eu-west-2.amazonaws.com',
};

test('hash returns the SHA256 hash of a value', () => {
  expect(hash('test')).toEqual('9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08');
  expect(hash('9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08')).toEqual(
    '7b3d979ca8330a94fa7e9e1b466d8b99e0bcdea1ec90596c0dcc8d7ef6b4300c',
  );
  expect(hash(JSON.stringify({ objectTest: true }))).toEqual('496c7205edbf8c8c4b4c5e5146eadaccbd3c9bbece5882ce74ae36245c849bc0');
});

test('hmac returns the HmacSHA256 hash of a secret and a value', () => {
  expect(hmac('key', 'body')).toEqual('515aae133b435d4000956731f68ae5cf5eb85d4f0dc6a546d2bfcd3595ec1ae1');
  expect(hmac('key', '515aae133b435d4000956731f68ae5cf5eb85d4f0dc6a546d2bfcd3595ec1ae1')).toEqual(
    'ef3748583b20051061b11770b9f1f583e5c5bcc906bd9ae1669cbd139a0c95c3',
  );
  expect(hmac('secretKey', JSON.stringify({ objectTest: true }))).toEqual('e902b7264c035ef87b46a793ef160ea2926794557aac4b80a9cb204479a739e1');
});

test('buildCanonicalUri returns encoded uri', () => {
  expect(buildCanonicalUri('ABC abc 123')).toEqual('ABC%20abc%20123');
  expect(buildCanonicalUri('https://mozilla.org/?x=шеллы')).toEqual('https://mozilla.org/?x=%D1%88%D0%B5%D0%BB%D0%BB%D1%8B');
});

test('buildCanonicalQueryString returns an alphabetically sorted query string with encoded uri components', () => {
  expect(buildCanonicalQueryString({})).toEqual('');
  expect(buildCanonicalQueryString({ b: 1, a: 2 })).toEqual('a=2&b=1');
  expect(buildCanonicalQueryString({ accept: '*/*', 'content-type': 'application/json' })).toEqual('accept=*%2F*&content-type=application%2Fjson');
});

test('buildCanonicalHeaders returns a newline delimited string of alphabetically sorted request headers', () => {
  expect(buildCanonicalHeaders({ b: 1, a: 2 })).toEqual('a:2\nb:1\n');
  expect(buildCanonicalHeaders(testRequestHeaders)).toEqual(
    'accept:*/*\ncontent-type:application/json\nhost:execute-api.eu-west-2.amazonaws.com\nx-amz-date:20200702T153953Z\n',
  );
});

test('buildSignedCanonicalHeaders returns a semi-colon delimited list of alphabetically sorted header keys', () => {
  expect(buildCanonicalSignedHeaders({ b: 1, a: 2 })).toEqual('a;b');
  expect(buildCanonicalSignedHeaders(testRequestHeaders)).toEqual('accept;content-type;host;x-amz-date');
});

test('buildCanonicalRequest returns a valid AWS Sig v4 Canonical Request', () => {
  expect(buildCanonicalRequest('GET', '/dev/api', {}, testRequestHeaders, { data: 'test' })).toEqual(
    'GET\n/dev/api\n\naccept:*/*\ncontent-type:application/json\nhost:execute-api.eu-west-2.amazonaws.com\nx-amz-date:20200702T153953Z\n\naccept;content-type;host;x-amz-date\n4ea5c508a6566e76240543f8feb06fd457777be39549c4016436afda65d2330e',
  );
  expect(buildCanonicalRequest('GET', '/dev/api', { sort: 'asc', query: true }, testRequestHeaders, { data: 'test' })).toEqual(
    'GET\n/dev/api\nquery=true&sort=asc\naccept:*/*\ncontent-type:application/json\nhost:execute-api.eu-west-2.amazonaws.com\nx-amz-date:20200702T153953Z\n\naccept;content-type;host;x-amz-date\n4ea5c508a6566e76240543f8feb06fd457777be39549c4016436afda65d2330e',
  );
  expect(
    buildCanonicalRequest('POST', '/dev/api', {}, testRequestHeaders, {
      operationName: 'GET_INVITATION',
      variables: { uniqueCode: 'i6k307' },
      query: 'query GET_INVITATION($uniqueCode: String!) {\n  getInvitation(uniqueCode: $uniqueCode) {\n    uniqueCode\n    type\n  }\n}\n',
    }),
  ).toEqual(
    'POST\n/dev/api\n\naccept:*/*\ncontent-type:application/json\nhost:execute-api.eu-west-2.amazonaws.com\nx-amz-date:20200702T153953Z\n\naccept;content-type;host;x-amz-date\n4ea5c508a6566e76240543f8feb06fd457777be39549c4016436afda65d2330e',
  );
});

test('buildCredentialScope returns a credential scope string', () => {
  expect(buildCredentialScope(dateAsString, region, 'execute-api')).toEqual('20200702/eu-west-2/execute-api/aws4_request');
});

test('buildStringToSign returns a string containing relevant request info for AWS', () => {
  const canonicalRequest = buildCanonicalRequest('POST', '/dev/api', {}, testRequestHeaders, { data: 'test' });
  const hashedCanonicalRequest = hash(canonicalRequest);
  const credentialScope = buildCredentialScope(dateAsString, region, 'execute-api');

  expect(buildStringToSign(dateAsString, credentialScope, hashedCanonicalRequest)).toEqual(
    'AWS4-HMAC-SHA256\n20200702T153953Z\n20200702/eu-west-2/execute-api/aws4_request\nb59b943bf21efb7409ad0d2dde8180f9aba273669f0c8607bdd53763405edd84',
  );
});

test('calculateSigningKey returns an AWS Sig v4 Signing Key', () => {
  expect(calculateSigningKey(fakeSecretKey, dateAsString, region, 'execute-api')).toEqual(
    '7acecfed2001ab2b2fe4f6c69954f2666196b2556c0c69c5486c03f99f04aab8',
  );
});

test('buildAuthorizationHeader returns an AWS Sig v4 Auth headers', () => {
  const canonicalRequest = buildCanonicalRequest('POST', '/dev/api', {}, testRequestHeaders, { data: 'test' });
  const hashedCanonicalRequest = hash(canonicalRequest);
  const credentialScope = buildCredentialScope(dateAsString, region, 'execute-api');
  const stringToSign = buildStringToSign(dateAsString, credentialScope, hashedCanonicalRequest);
  const signingKey = calculateSigningKey(fakeSecretKey, dateAsString, region, 'execute-api');
  const signature = hmac(signingKey, stringToSign);

  expect(buildAuthorizationHeader(fakeAccessKey, credentialScope, testRequestHeaders, signature)).toEqual(
    'AWS4-HMAC-SHA256 Credential=ASIAWXW4R5NWN4CD3436/20200702/eu-west-2/execute-api/aws4_request, SignedHeaders=accept;content-type;host;x-amz-date, Signature=4279056b10deb760c5fdc276d0ee63a24a43bca2200ea25ab8494730cefad4a1',
  );
});

test('awsClient is returned with config', () => {
  const awsClient = createAwsClient(fakeAccessKey, fakeSecretKey, fakeSessionToken, { region, endpoint });

  expect(awsClient).toMatchObject({
    accessKey: fakeAccessKey,
    secretKey: fakeSecretKey,
    sessionToken: fakeSessionToken,
    region,
    endpoint: 'https://xiey9y60ej.execute-api.eu-west-2.amazonaws.com',
    pathComponent: '/dev/api',
  });
});
