const CONFIG_SERVICE_BASE_URL = 'https://tsunami-configservice-dev.azurewebsites.net/api';
const PUBLIC_TENANT_ENDPOINT_PATH = '/public/tenants';
const PROTECTED_TENANT_TREE_ENDPOINT_PATH = '/tenants/{tenantId}/orgs/0/properties/tree';
const DEFAULT_API_AUDIENCE = 'https://tsunami-api-endpoint';

export class TenantNotFoundError extends Error {
  constructor(tenantDomain, status, details) {
    super(`No Auth0 configuration found for tenant domain "${tenantDomain}".`);
    this.name = 'TenantNotFoundError';
    this.tenantDomain = tenantDomain;
    this.status = status;
    this.details = details;
  }
}

export class TenantAccessDeniedError extends Error {
  constructor(tenantDomain, status, details) {
    super('Access to the Auth0 configuration requires a tenant-specific domain.');
    this.name = 'TenantAccessDeniedError';
    this.tenantDomain = tenantDomain;
    this.status = status;
    this.details = details;
  }
}

function deriveTenantDomainFromHostname(hostname) {
  if (typeof hostname !== 'string' || hostname.length === 0) {
    return '';
  }

  // Use the hostname (e.g. tenant.localhost) as the tenant domain.
  const normalized = hostname.trim().toLowerCase();
  return normalized.length > 0 ? normalized : '';
}

function resolveTenantDomain(explicitDomain) {
  if (explicitDomain) {
    return explicitDomain;
  }

  const fromEnv = import.meta.env?.VITE_TENANT_DOMAIN;
  if (typeof fromEnv === 'string' && fromEnv.trim().length > 0) {
    return fromEnv.trim();
  }

  const urlSearchParams = new URLSearchParams(window.location.search);
  const fromQuery = urlSearchParams.get('tenantDomain');
  if (fromQuery) {
    return fromQuery;
  }

  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const fromHost = deriveTenantDomainFromHostname(hostname);
  if (fromHost) {
    return fromHost;
  }

  throw new Error('Unable to determine tenant domain from the current browser location.');
}

export function buildConfigServiceUrl(tenantDomain) {
  const domain = resolveTenantDomain(tenantDomain);
  return `${CONFIG_SERVICE_BASE_URL}${PUBLIC_TENANT_ENDPOINT_PATH}?domain=${encodeURIComponent(domain)}`;
}

function buildProtectedTenantEndpointPath(pathTemplate, tenantId) {
  if (tenantId === undefined || tenantId === null || tenantId === '') {
    throw new Error('A tenantId is required to build the protected tenant endpoint URL.');
  }

  const normalizedId = encodeURIComponent(String(tenantId));
  return pathTemplate.replace('{tenantId}', normalizedId);
}

function buildProtectedTenantConfigUrl(tenantId, pathTemplate) {
  const path = buildProtectedTenantEndpointPath(pathTemplate, tenantId);
  return `${CONFIG_SERVICE_BASE_URL}${path}`;
}

async function readResponseText(response) {
  try {
    return await response.text();
  } catch (readError) {
    console.warn('Failed to read Config Service error response body', readError);
    return '';
  }
}

function responseIndicatesMissingTenant(status, bodyText) {
  if (status === 404) {
    return true;
  }

  if (!bodyText) {
    return false;
  }

  const normalized = bodyText.toLowerCase();
  const mentionsTenant = normalized.includes('tenant');
  const mentionsMissing =
    normalized.includes('not found') || normalized.includes('does not exist') || normalized.includes('missing');

  return status === 500 && mentionsTenant && mentionsMissing;
}

/**
 * Fetch Auth0 configuration from the Config Service.
 */
export async function fetchAuth0Config(options = {}) {
  const { signal, tenantDomain } = options;
  const resolvedTenantDomain = resolveTenantDomain(tenantDomain);
  const url = `${CONFIG_SERVICE_BASE_URL}${PUBLIC_TENANT_ENDPOINT_PATH}?domain=${encodeURIComponent(resolvedTenantDomain)}`;

  const response = await fetch(url, { signal });

  if (!response.ok) {
    const responseText = await readResponseText(response);

    if (response.status === 403) {
      throw new TenantAccessDeniedError(resolvedTenantDomain, response.status, responseText);
    }

    if (responseIndicatesMissingTenant(response.status, responseText)) {
      throw new TenantNotFoundError(resolvedTenantDomain, response.status, responseText);
    }

    const errorMessage = responseText
      ? `Config Service responded with ${response.status}: ${response.statusText} (${responseText})`
      : `Config Service responded with ${response.status}: ${response.statusText}`;

    const error = new Error(errorMessage);
    error.status = response.status;
    error.responseBody = responseText;
    throw error;
  }

  const payload = await response.json();

  if (!payload?.customDomain || !payload?.clientId) {
    throw new Error('Config Service response is missing required Auth0 fields.');
  }

  return {
    tenantId: payload.tenantId,
    tenantName: payload.tenantName ?? payload.tenant_description ?? '',
    domain: payload.customDomain,
    clientId: payload.clientId,
    audience: DEFAULT_API_AUDIENCE,
    raw: payload,
  };
}

async function fetchProtectedTenantConfig(options, pathTemplate) {
  const { tenantId, accessToken, signal } = options ?? {};

  if (tenantId === undefined || tenantId === null || tenantId === '') {
    throw new Error('tenantId is required to fetch the protected tenant configuration.');
  }

  if (!accessToken) {
    throw new Error('An access token is required to fetch the protected tenant configuration.');
  }

  const url = buildProtectedTenantConfigUrl(tenantId, pathTemplate);
  const response = await fetch(url, {
    method: 'GET',
    signal,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
      'X-TENANT-ID': String(tenantId),
    },
  });

  if (!response.ok) {
    const bodyText = await readResponseText(response);
    const errorMessage = bodyText
      ? `Tenant config request failed with ${response.status}: ${response.statusText} (${bodyText})`
      : `Tenant config request failed with ${response.status}: ${response.statusText}`;

    const error = new Error(errorMessage);
    error.status = response.status;
    error.responseBody = bodyText;
    throw error;
  }

  return response.json();
}

export function getDefaultAudience() {
  return DEFAULT_API_AUDIENCE;
}

export function buildProtectedTenantConfigTreeUrl(tenantId) {
  return buildProtectedTenantConfigUrl(tenantId, PROTECTED_TENANT_TREE_ENDPOINT_PATH);
}

export async function fetchProtectedTenantConfigTree(options) {
  return fetchProtectedTenantConfig(options, PROTECTED_TENANT_TREE_ENDPOINT_PATH);
}
