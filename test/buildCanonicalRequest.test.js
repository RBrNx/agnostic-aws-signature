const { buildCanonicalRequest } = require('../src/helpers');
const { testRequestHeaders } = require('./variables');

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
