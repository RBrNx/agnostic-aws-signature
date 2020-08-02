import { createAwsClient } from '../src/index';
import { fakeAccessKey, fakeSecretKey, fakeSessionToken, region, endpoint } from './variables';

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
