const { buildCredentialScope } = require('../src/helpers');
const { dateAsString, region } = require('./variables');

test('buildCredentialScope returns a credential scope string', () => {
  expect(buildCredentialScope(dateAsString, region, 'execute-api')).toEqual('20200702/eu-west-2/execute-api/aws4_request');
});
