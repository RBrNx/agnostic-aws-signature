/* eslint-disable security/detect-object-injection */
import { X_AMZ_DATE, HOST, AUTHORIZATION, X_AMZ_SECURITY_TOKEN } from './constants';
import {
  extractHostname,
  buildCanonicalRequest,
  hash,
  buildCredentialScope,
  buildStringToSign,
  calculateSigningKey,
  hmac,
  buildAuthorizationHeader,
  buildCanonicalQueryString,
  getHeaderKeys,
} from './helpers';

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
    const { method, queryParams, headers = {}, path = '' } = request;
    const { body } = request;

    const requestMethod = method.toUpperCase();
    const requestPath = awsSigV4Client.pathComponent + path;

    // If the user has not specified an override for Content type the use default
    if (!getHeaderKeys(headers).includes('content-type')) {
      headers['Content-Type'] = awsSigV4Client.defaultContentType;
    }

    // If the user has not specified an override for Accept type the use default
    if (!getHeaderKeys(headers).includes('accept')) {
      headers.Accept = awsSigV4Client.defaultAcceptType;
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
    const signature = hmac(signingKey, stringToSign).toString();
    headers[AUTHORIZATION] = buildAuthorizationHeader(awsSigV4Client.accessKey, credentialScope, headers, signature);

    delete headers[HOST];

    if (awsSigV4Client.sessionToken) {
      headers[X_AMZ_SECURITY_TOKEN] = awsSigV4Client.sessionToken;
    }

    let url = awsSigV4Client.endpoint + requestPath;
    const queryString = buildCanonicalQueryString(queryParams);
    if (queryString) url += `?${queryString}`;

    // Need to re-attach Content-Type if it is not specified at this point
    if (!getHeaderKeys(headers).includes('content-type')) {
      headers['Content-Type'] = awsSigV4Client.defaultContentType;
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
