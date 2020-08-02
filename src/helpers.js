/* eslint-disable security/detect-object-injection */
import SHA256 from 'crypto-js/sha256';
import HmacSHA256 from 'crypto-js/hmac-sha256';
import { AWS4_REQUEST, AWS_SHA_256, AWS4 } from './constants';

const hash = (value) => SHA256(value).toString();

const hmac = (secret, value) => HmacSHA256(value, secret);

const buildCanonicalUri = (uri) => encodeURI(uri);

const buildCanonicalQueryString = (queryParams) => {
  if (!queryParams) return '';

  let canonicalQueryString = '';
  const queryParamKeys = Object.keys(queryParams).sort();

  queryParamKeys.forEach((key) => {
    canonicalQueryString += `${key}=${encodeURIComponent(queryParams[key])}&`;
  });

  return canonicalQueryString.slice(0, -1);
};

const buildCanonicalHeaders = (headers) => {
  let canonicalHeaders = '';
  const headerKeys = Object.keys(headers).sort();

  headerKeys.forEach((key) => {
    canonicalHeaders += `${key.toLowerCase()}:${headers[key]}\n`;
  });

  return canonicalHeaders;
};

const buildCanonicalSignedHeaders = (headers) => {
  const headerKeys = Object.keys(headers).sort();

  return headerKeys.join(';');
};

const buildCanonicalRequest = (method, path, queryParams, headers, payload) => {
  return `${method}\n${buildCanonicalUri(path)}\n${buildCanonicalQueryString(queryParams)}\n${buildCanonicalHeaders(
    headers,
  )}\n${buildCanonicalSignedHeaders(headers)}\n${hash(payload)}`;
};

const buildCredentialScope = (datetime, region, service) => {
  return `${datetime.substr(0, 8)}/${region}/${service}/${AWS4_REQUEST}`;
};

const buildStringToSign = (datetime, credentialScope, hashedCanonicalRequest) => {
  return `${AWS_SHA_256}\n${datetime}\n${credentialScope}\n${hashedCanonicalRequest}`;
};

const calculateSigningKey = (secretKey, datetime, region, service) => {
  const hashedDate = hmac(AWS4 + secretKey, datetime.substr(0, 8));
  const hashedRegion = hmac(hashedDate, region);
  const hashedService = hmac(hashedRegion, service);
  const signingKey = hmac(hashedService, AWS4_REQUEST);

  return signingKey;
};

const buildAuthorizationHeader = (accessKey, credentialScope, headers, signature) => {
  return `${AWS_SHA_256} Credential=${accessKey}/${credentialScope}, SignedHeaders=${buildCanonicalSignedHeaders(headers)}, Signature=${signature}`;
};

const extractHostname = (url) => {
  const { hostname } = new URL(url);

  return hostname;
};

const getHeaderKeys = (headers) => {
  if (!headers) return [];

  return Object.keys(headers).map((key) => key.toLowerCase());
};

export {
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
  extractHostname,
  getHeaderKeys,
};
