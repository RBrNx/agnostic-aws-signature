<p align="center">
  <img height="60" src="https://user-images.githubusercontent.com/7189823/69501658-06047600-0ed5-11ea-8f54-952bf1afd68c.png" alt="Library's logo">
</p>

<h3 align="center">
  Agnostic AWS Signature
</h3>

<p align="center">
  A lightweight, environment-agnostic implementation of the AWS Signature v4 Signing Process. Even works with React Native!
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/agnostic-aws-signature">
    <img src="https://img.shields.io/npm/v/agnostic-aws-signature?style=flat-square" alt="Current npm package version." />
  </a>
  <a href="https://www.npmjs.com/package/agnostic-aws-signature">
    <img src="https://img.shields.io/bundlephobia/min/agnostic-aws-signature?style=flat-square" alt="Bundle size" />
  </a>
  <a href="https://github.com/RBrNx/agnostic-aws-signature/blob/master/LICENSE">
    <img src="https://raw.githubusercontent.com/RBrNx/agnostic-aws-signature/master/shields/coverage.svg" alt="Test coverage" />
  </a>
  <a href="https://github.com/charpeni/react-native-url-polyfill/blob/master/LICENSE">
    <img src="https://img.shields.io/npm/l/agnostic-aws-signature?style=flat-square" alt="Agnostic AWS Signature is released under the ISC license." />
  </a>
</p>

<hr />

<br />

## Contents

- [Installation](#installation)
- [Usage Guide](#usage-guide)
  - [Signing A Request](#signing-a-request)
  - [Rolling your own implementation](#rolling-your-own-implementation)
  - [Usage with React Native](#usage-with-react-native)
- [API Reference](#api-reference)
- [Contributing](#contributing)
  - [Local Development](#local-development)
  - [Code Quality](#code-quality)

<br />

## Installation

You can install via Yarn or npm

```bash
yarn add agnostic-aws-signature
```

```bash
npm install agnostic-aws-signature
```

<br />

## Usage Guide

Just need to import it, easy peasy!

```javascript
import createAwsClient from 'agnostic-aws-signature'; // Either import the default export

import { createAwsClient } from 'agnostic-aws-signature'; // Or import the named export
```

<br />

#### Signing a Request

The key to communicating with an AWS Resource that requires use of the AWS Signature v4 process,
is to send a set of Signed Headers along with our request.

```javascript
import { Auth } from 'aws-amplify';
import createAwsClient from 'agnostic-aws-signature';

// createAwsClient requires a valid AWS AccessKey, SecretKey and SessionToken
// I recommened getting them from Amplify using Auth.currentCredentials();
const { accessKeyId, secretAccessKey, sessionToken } = await Auth.currentCredentials();

const awsClient = createAwsClient(accessKeyId, secretAccessKey, sessionToken, {
  region: 'eu-west-2', // Your AWS resource region
  endpoint: API_URL, // Your AWS resource url
});

const body = {
  firstName: 'Conor',
  role: 'Developer',
},

// Sign our Request to allow User access to AWS resource
const signedRequest = awsClient.signRequest({
  method: 'POST', // Method of your request
  headers: {
    // Whatever headers you need to send to the resource
    accept: '*/*',
    'content-type': 'application/json',
  },
  body, // Whatever body you need to send to the resource
});

// Use the newly signed headers
const response = await fetch(signedRequest.url, { headers: signedRequest.headers, body });
```

<br />

#### Rolling your own implementation

`agnostic-aws-sgignature` exposes all of the helper functions it uses to produce the signed headers,
so if you are following along with the [AWS Docs](https://docs.aws.amazon.com/general/latest/gr/sigv4_signing.html) or simply want to make some modifications to the process
you can roll your own implementation quite easily.

```javascript
import { Auth } from 'aws-amplify';
import { buildCanonicalRequest, calculateSigningKey, ... } from 'agnostic-aws-signature';

// Use any of the helper functions as you see fit
const canonicalRequest = buildCanonicalRequest(requestMethod, requestPath, queryParams, headers, body);
```

<br />

#### Usage with React Native

Since this library opts to use CryptoJS instead of relying on the Crypto module exposed by Node.js, it should work out of the box with React Native.
Unfortunately the React Native team opted to roll their own `URL` [implementation](https://github.com/facebook/react-native/issues/16434)
which does not support things like `new URL('https://www.google.com')`.

To get around this (and to therefore use `agnostic-aws-signature` with RN) I would recommend you install [react-native-url-polyfill](https://github.com/charpeni/react-native-url-polyfill) and use
either Option 1 or Option 2.

```javascript
import 'react-native-url-polyfill/auto';
```

<br/>

## API Reference

Here is a list of all of the functions exposed by this library

#### hash(_value_) => String

- `value {String}` Value to be hashed

Returns the SHA256 Hash of the `value`.

```javascript
const hashedString = hash('test'); // Returns '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'
```

<br />

#### hmac(_secret, value_) => CryptoJS Binary

- `secret {String}` Secret Key used in the HMAC-SHA256 Algorithm
- `value {String}` Value to be hashed

Returns the HMAC-SHA256 Hash of the `secret` and `value` in Binary Form.
Use the `toString()` method to convert to the Hex representation.

```javascript
const hmacBinary = hmac('secretkey', 'test'); // Returns '{ sigBytes: 32, words: [-1682038133, 846640694, -339234647, 161088799, -24662870, -1503298019, -322824905, -477709546] }'
const hmacString = hmacBinary.toString(); // Returns '9bbe228b3276b636ebc7b0a9f665fae1fe87acaaa6657e1decc21537e386bb16'
```

<br />

#### buildCanonicalUri(_uri_) => String

- `uri {String}` URI to be encoded

Returns the encoded URI as outlined in Step 2 of the AWS Docs - [Create a Canonical Request](https://docs.aws.amazon.com/general/latest/gr/sigv4-create-canonical-request.html)

```javascript
const canonicalUri = buildCanonicalUri('/documents and settings/'); // Returns '/documents%20and%20settings/'
```

<br />

#### buildCanonicalQueryString(_queryParams_) => String

- `queryParams {Object}` An Object containing any number of query parameters that will be converted to a query string

Returns the Query String as outlined in Step 3 of the AWS Docs - [Create a Canonical Request](https://docs.aws.amazon.com/general/latest/gr/sigv4-create-canonical-request.html)

```javascript
const queryString = buildCanonicalQueryString({ Action: 'ListUsers', Version: '2010-05-08' }); // Returns 'Action=ListUsers&Version=2010-05-08'
```

<br />

#### buildCanonicalHeaders(_headers_) => String

- `headers {Object}` An Object containing any number of headers that will be sent in the final request

Returns a string of Header Keys and Values as outlined in Step 4 of the AWS Docs - [Create a Canonical Request](https://docs.aws.amazon.com/general/latest/gr/sigv4-create-canonical-request.html)

```javascript
const headers = buildCanonicalHeaders({
  'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8', // Returns 'content-type:application/x-www-form-urlencoded; charset=utf-8\n
  HOST: 'iam.amazonaws.com',                                          // host:iam.amazonaws.com\n
  'x-amz-date': '20200830T123600Z',                                   // x-amz-date:20200830T123600Z\n'
});
```

<br />

#### buildCanonicalSignedHeaders(_headers_) => String

- `headers {Object}` An Object containing any number of headers that will be sent in the final request

Returns a string of semi-colon delimited Header Keys as outlined in Step 5 of the AWS Docs - [Create a Canonical Request](https://docs.aws.amazon.com/general/latest/gr/sigv4-create-canonical-request.html)

```javascript
const signedHeaders = buildCanonicalSignedHeaders({
  'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8', // Returns 'content-type;host;x-amz-date\n'
  HOST: 'iam.amazonaws.com',
  'x-amz-date': '20200830T123600Z',
});
```

<br />

#### buildCanonicalRequest(_method, path, queryParams, headers, payload_) => String

- `method {String}` The request method (GET, POST, etc)
- `path {String}` The request path (everything after the endpoint i.e '/api/route')
- `queryParams {Object}` An Object containing any number of query parameters that belong in the final request
- `headers {Object}` An Object containing any number of headers that belong in the final request
- `payload {Object|String}` The body of the request

Returns a string of the final canonical request that is pieced together from all of the parameters.
Outlined in Step 7 of the AWS Docs - [Create a Canonical Request](https://docs.aws.amazon.com/general/latest/gr/sigv4-create-canonical-request.html)

```javascript
const queryParams = { Action: 'ListUsers', Version: '2010-05-08' };
const headers = {
  'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
  HOST: 'iam.amazonaws.com',
  'x-amz-date': '20200830T123600Z',
};

const canonicalRequest = buildCanonicalRequest('GET', '/api/users', queryParams, headers, '');

// Returns 'GET\n
// /api/users\n
// Action=ListUsers&Version=2010-05-08\n
// content-type:application/x-www-form-urlencoded; charset=utf-8\n
// host:iam.amazonaws.com\n
// x-amz-date:20200830T123600Z\n
// \n
// content-type;host;x-amz-date\n
// e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
```

<br />

#### buildCredentialScope(_datetime, region, service_) => String

- `datetime {String}` The current datetime in an ISO8601 format.
- `region {String}` The region where the AWS Service you want to request exists
- `service {String}` An Object containing any number of query parameters that belong in the final request

Returns the credential scope for a request as outlined in Step 3 of the AWS Docs - [Create a String to Sign](https://docs.aws.amazon.com/general/latest/gr/sigv4-create-string-to-sign.html)

```javascript
const credentialScope = buildCredentialScope('20200830T123600Z', 'eu-west-2', 'execute-api'); // Returns '20200830/eu-west-2/execute-api/aws4_request\n'
```

<br />

#### buildStringToSign(_datetime, credentialScope, hashedCanonicalRequest_) => String

- `datetime {String}` The current datetime in an ISO8601 format.
- `credentialScope {String}` The credential scope built previously
- `hashedCanonicalRequest {String}` A SHA256 hash of the canonicalRequest built previously

Returns the 'string to sign' for a request as outlined in the AWS Docs - [Create a String to Sign](https://docs.aws.amazon.com/general/latest/gr/sigv4-create-string-to-sign.html)

```javascript
const queryParams = { Action: 'ListUsers', Version: '2010-05-08' };
const headers = {
  'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
  HOST: 'iam.amazonaws.com',
  'x-amz-date': '20200830T123600Z',
};

const canonicalRequest = buildCanonicalRequest('GET', '/api/users', queryParams, headers, '');
const credentialScope = buildCredentialScope('20200830T123600Z', 'eu-west-2', 'execute-api');
const hashedCanonicalRequest = hash(canonicalRequest);

const stringToSign = buildStringToSign('20200830T123600Z', credentialScope, hashedCanonicalRequest); 

// Returns 'AWS4-HMAC-SHA256\n
// 20200830T123600Z\n
// 20200830/eu-west-2/execute-api/aws4_request\n
// f122ea64ffc8fda0b9ffcbc71f07f7d2c23e19f2ad2db26fec414ff0a0a595b7'
```

<br />

#### calculateSigningKey(_secretKey, datetime, region, service_) => String

- `secretKey {String}` A valid AWS Secret Key
- `datetime {String}` The current datetime in an ISO8601 format.
- `region {String}` The region where the AWS Service you want to request exists
- `service {String}` An Object containing any number of query parameters that belong in the final request

Returns the signing key for a request as outlined in Step 1 of the AWS Docs - [Calculate the Signature](https://docs.aws.amazon.com/general/latest/gr/sigv4-calculate-signature.html)

```javascript
const signingKey = calculateSigningKey(mySecretKey, '20200830T123600Z', 'eu-west-2', 'execute-api'); 

// Returns 'AWS4-HMAC-SHA256\n
// 20200830T123600Z\n
// 20200830/eu-west-2/execute-api/aws4_request\n
// f122ea64ffc8fda0b9ffcbc71f07f7d2c23e19f2ad2db26fec414ff0a0a595b7'
```

<br />

#### buildAuthorizationHeader(_accessKey, credentialScope, headers, signature_) => String

- `accessKey {String}` A valid AWS Access Key
- `credentialScope {String}` The credential scope built previously
- `headers {Object}` An Object containing any number of headers that belong in the final request
- `signature {String}` The hex representation of a HMAC-SHA256 hash with `signingKey` and `stringToSign` as parameters (See Step 2 of [Calculate the Signature](https://docs.aws.amazon.com/general/latest/gr/sigv4-calculate-signature.html))

Returns the Authorization header for a request as outlined in Step 1 of the AWS Docs - [Add Signature to the Request](https://docs.aws.amazon.com/general/latest/gr/sigv4-add-signature-to-request.html)

```javascript
const credentialScope = buildCredentialScope('20200830T123600Z', 'eu-west-2', 'execute-api');
const headers = {
  'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
  HOST: 'iam.amazonaws.com',
  'x-amz-date': '20200830T123600Z',
};
const signingKey = calculateSigningKey(mySecretKey, '20200830T123600Z', 'eu-west-2', 'execute-api');
const signature = hmac(signingKey, stringToSign).toString();

const authorizationHeader = buildAuthorizationHeader(myAccessKey, credentialScope, headers, signature); 

// Returns 'AWS4-HMAC-SHA256 Credential=AKIDEXAMPLE/20200830/eu-west-2/execute-api/aws4_request, SignedHeaders=content-type;host;x-amz-date, Signature=5d672d79c15b13162d9279b0855cfba6789a8edb4c82c400e06b5924a6f2b5d7'
```

<br />

#### extractHostname(_url_) => String

- `url {String}` The URL we want to extract the hostname from

Returns the hostname of the provided URL.

```javascript
const hostname = extractHostname('https://docs.aws.amazon.com/general/latest/gr/sigv4-add-signature-to-request.html'); // Returns 'docs.aws.amazon.com'
```

<br />

#### getHeaderKeys(_headers_) => [String]

- `headers {Object}` An Object containing any number of headers that will be sent in the final request

Returns an array containing each header key lowercased

```javascript
const headers = {
  'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
  HOST: 'iam.amazonaws.com',
  'x-amz-date': '20200830T123600Z',
};

const headerKeys = getHeaderKeys(headers); // Returns [ 'content-type', 'host', 'x-amz-date' ]
```

<br/>

## Contributing

I am more than happy to accept any contributions anyone would like to make, whether that's raising an issue, suggesting an improvement or developing a new feature.

#### Local Development

It's easy to get up and running locally! Just clone the repo, install the node modules and away you go! 🚀

```bash
> git clone git@github.com:RBrNx/agnostic-aws-signature.git

> cd agnostic-aws-signature

> yarn install # Alternatively use `npm install`
```

#### Code Quality

To help keep the code styling consistent across the repo, I am using ESLint and Prettier, along with Git Hooks to ensure that any pull requests will meet the code quality standards.

While some of the hooks are specifically for code styling, there is a `pre-push` hook implemented that will run all of the Unit Tests before any commits are pushed. If any of the Unit Tests fail, or the overall Test Coverage drops below 95%, the push will fail