import SHA256 from 'crypto-js/sha256';
import HmacSHA256 from 'crypto-js/hmac-sha256';
import encHex from 'crypto-js/enc-hex';

const AWS_SHA_256 = 'AWS4-HMAC-SHA256';
const AWS4_REQUEST = 'aws4_request';
const AWS4 = 'AWS4';
const X_AMZ_DATE = 'x-amz-date';
const X_AMZ_SECURITY_TOKEN = 'x-amz-security-token';
const HOST = 'host';
const AUTHORIZATION = 'Authorization';

export const hash = (value) => SHA256(value).toString();

export const hmac = (secret, value) => HmacSHA256(value, secret, { asBytes: true });

export const buildCanonicalUri = (uri) => encodeURI(uri);

export const buildCanonicalQueryString = (queryParams) => {
  if (!queryParams) return '';

  let canonicalQueryString = '';
  const queryParamKeys = Object.keys(queryParams).sort();

  queryParamKeys.forEach((key) => {
    canonicalQueryString += `${key}=${encodeURIComponent(queryParams[key])}&`;
  });

  return canonicalQueryString.slice(0, -1);
};

export const buildCanonicalHeaders = (headers) => {
  let canonicalHeaders = '';
  const headerKeys = Object.keys(headers).sort();

  headerKeys.forEach((key) => {
    canonicalHeaders += `${key.toLowerCase()}:${headers[key]}\n`;
  });

  return canonicalHeaders;
};

export const buildCanonicalSignedHeaders = (headers) => {
  const headerKeys = Object.keys(headers).sort();

  return headerKeys.join(';');
};

export const buildCanonicalRequest = (method, path, queryParams, headers, payload) => {
  return `${method}\n${buildCanonicalUri(path)}\n${buildCanonicalQueryString(queryParams)}\n${buildCanonicalHeaders(
    headers,
  )}\n${buildCanonicalSignedHeaders(headers)}\n${hash(payload)}`;
};

export const buildCredentialScope = (datetime, region, service) => {
  return `${datetime.substr(0, 8)}/${region}/${service}/${AWS4_REQUEST}`;
};

export const buildStringToSign = (datetime, credentialScope, hashedCanonicalRequest) => {
  return `${AWS_SHA_256}\n${datetime}\n${credentialScope}\n${hashedCanonicalRequest}`;
};

export const calculateSigningKey = (secretKey, datetime, region, service) => {
  const hashedDate = hmac(AWS4 + secretKey, datetime.substr(0, 8));
  const hashedRegion = hmac(hashedDate, region);
  const hashedService = hmac(hashedRegion, service);
  const signingKey = hmac(hashedService, AWS4_REQUEST);

  return signingKey;
};

export const buildAuthorizationHeader = (accessKey, credentialScope, headers, signature) => {
  return `${AWS_SHA_256} Credential=${accessKey}/${credentialScope}, SignedHeaders=${buildCanonicalSignedHeaders(headers)}, Signature=${signature}`;
};

const extractHostname = (url) => {
  const { hostname } = new URL(url);

  return hostname;
};

export const createAwsClient = (accessKey, secretKey, sessionToken, config) => {
  const awsSigV4Client = {};
  const { serviceName, region, defaultAcceptType, defaultContentType, endpoint, debug = false } = config;
  const { origin, pathname } = new URL(endpoint);

  if (!accessKey || !secretKey) return awsSigV4Client;

  awsSigV4Client.accessKey = accessKey;
  awsSigV4Client.secretKey = secretKey;
  awsSigV4Client.sessionToken = sessionToken;
  awsSigV4Client.serviceName = serviceName || 'execute-api';
  awsSigV4Client.region = region || 'us-east-1';
  awsSigV4Client.defaultAcceptType = defaultAcceptType || 'application/json';
  awsSigV4Client.defaultContentType = defaultContentType || 'application/json';
  awsSigV4Client.endpoint = origin;
  awsSigV4Client.pathComponent = pathname;
  awsSigV4Client.debug = debug;

  awsSigV4Client.signRequest = (request) => {
    const { method, queryParams, headers, path = '' } = request;
    const { body } = request;

    const requestMethod = method.toUpperCase();
    const requestPath = awsSigV4Client.pathComponent + path;

    const headerKeys = Object.keys(request.headers).map((key) => key.toLowerCase());

    // If the user has not specified an override for Content type the use default
    if (!headerKeys.includes('content-type')) {
      headers['Content-Type'] = awsSigV4Client.defaultContentType;
      headerKeys.push('content-type');
    }

    // If the user has not specified an override for Accept type the use default
    if (!headerKeys.includes('accept')) {
      headers.Accept = awsSigV4Client.defaultAcceptType;
      headerKeys.push('accept');
    }

    // If there is no body remove the content-type header so it is not included in SigV4 calculation
    if (!body) {
      delete headers['Content-Type'];
      delete headers['content-type'];
    }

    const datetime = new Date()
      .toISOString()
      .replace(/\.\d{3}Z$/, 'Z')
      .replace(/[:-]|\.\d{3}/g, '');
    headers[X_AMZ_DATE] = datetime;
    headers[HOST] = extractHostname(awsSigV4Client.endpoint);

    const canonicalRequest = buildCanonicalRequest(requestMethod, requestPath, queryParams, headers, body);
    const hashedCanonicalRequest = hash(canonicalRequest);
    const credentialScope = buildCredentialScope(datetime, awsSigV4Client.region, awsSigV4Client.serviceName);
    const stringToSign = buildStringToSign(datetime, credentialScope, hashedCanonicalRequest);
    const signingKey = calculateSigningKey(awsSigV4Client.secretKey, datetime, awsSigV4Client.region, awsSigV4Client.serviceName);
    const signature = hmac(signingKey, stringToSign).toString(encHex);
    headers[AUTHORIZATION] = buildAuthorizationHeader(awsSigV4Client.accessKey, credentialScope, headers, signature);

    delete headers[HOST];

    if (awsSigV4Client.sessionToken) {
      headers[X_AMZ_SECURITY_TOKEN] = awsSigV4Client.sessionToken;
    }

    let url = awsSigV4Client.endpoint + requestPath;
    const queryString = buildCanonicalQueryString(queryParams);
    if (queryString) url += `?${queryString}`;

    // Need to re-attach Content-Type if it is not specified at this point
    if (!headerKeys.includes('content-type')) {
      headers['Content-Type'] = awsSigV4Client.defaultContentType;
      headerKeys.push('content-type');
    }

    if (awsSigV4Client.debug) {
      // eslint-disable-next-line no-console
      console.log({
        awsSigV4Client,
        canonicalRequest,
        hashedCanonicalRequest,
        credentialScope,
        stringToSign,
        signingKey,
        signature,
        headers,
      });
    }

    return {
      headers,
      url,
    };
  };

  return awsSigV4Client;
};
