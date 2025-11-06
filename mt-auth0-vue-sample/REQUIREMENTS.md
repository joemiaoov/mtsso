# Auth0 + Vue 3 Sample App (Vite) - Runtime Config from Config Service

## Summary
This project demonstrates obtaining Auth0 configuration at runtime from the Tsunami Config Service before mounting a Vue 3 single-page app. It serves as a multi-tenant reference where the tenant domain drives the runtime configuration.

## Goals
- Fetch tenant-specific Auth0 settings from the Config Service during bootstrap.
- Initialise `@auth0/auth0-vue` only after runtime configuration is available.
- Provide the runtime configuration to the Vue app via dependency injection and a global property.
- Redirect unauthenticated users to Auth0 automatically and expose protected navigation once authenticated.
- Call protected Config Service endpoints with the authenticated access token to display tenant configuration data in list and tree formats.

## Non-Goals
- Server-side rendering or persistence.
- Bundling static Auth0 configuration at build time.
- Implementing non-Config Service APIs.

## Functional Requirements
- Determine the tenant domain by checking an explicit argument, the `VITE_TENANT_DOMAIN` environment variable, the `tenantDomain` query string parameter, and finally the current hostname. Raise an error if no tenant domain can be derived.
- Delay mounting the Vue app until `fetchAuth0Config()` resolves. Show a loading indicator and render an error message if the call fails.
- Provide the resolved configuration using `app.provide(runtimeConfigKey, runtimeConfig)` and `app.config.globalProperties.$runtimeConfig`.
- Configure `createAuth0()` with the runtime domain and client ID, scope `openid profile email read:messages`, `cacheLocation: 'localstorage'`, and `useRefreshTokens: true`.
- Protect routes marked with `meta.requiresAuth` using `createAuthGuard()`.
- Render `AppNav` and `RouterView` only when the user is authenticated.
- `HomeView` displays the current runtime settings and triggers `loginWithRedirect` automatically when the app is ready but not authenticated.
- `ProtectedApiDemo`:
  - Shows the active access token after login.
  - Calls `fetchProtectedTenantConfigTree()` and renders the JSON response.
  - Treats a tenant ID of `0` as valid.
- `TenantConfigListView` calls `fetchProtectedTenantConfigList()` and renders the payload.
- `ProfileView` displays user information returned by Auth0.

## Runtime Config Service Integration
- Base URL: `https://tsunami-configservice-dev.azurewebsites.net/api`.
- Public endpoint: `GET /public/tenants?domain={tenantDomain}` returns `tenantId`, `customDomain`, `clientId`, and related metadata. Handle 403 by showing a tenant-specific domain warning and 404/500 missing tenant responses using `TenantAccessDeniedError` and `TenantNotFoundError`.
- Protected endpoints require:
  - `GET /tenants/{tenantId}/orgs/0/properties`
  - `GET /tenants/{tenantId}/orgs/0/properties/tree`
  - Headers include `Authorization: Bearer <token>` and `X-TENANT-ID: {tenantId}`.

## Technical Constraints
- Node.js `^20.19.0` or `>=22.12.0`.
- Use the built-in `fetch` API; no Axios dependency.
- The dev server runs with `npm run dev` and supports custom hosts such as `tsunami.localhost`.
- All strings and assets should remain ASCII unless tenant data requires otherwise.

## Testing and Validation
- Verify the happy path with a valid tenant domain (for example, `tsunami.localhost`).
- Confirm error messaging for unknown tenants, denied tenants, and missing runtime configuration.
- Ensure navigation redirects back to the original route after Auth0 login.
