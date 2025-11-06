# Auth0 Runtime Config Vue Sample

This Vue 3 + Vite single-page app fetches its Auth0 tenant settings from the Tsunami Config Service at runtime and only initialises `@auth0/auth0-vue` after those values are available. No Auth0 configuration is bundled into the client.

## Highlights
- Resolve the tenant domain from `?tenantDomain=`, `VITE_TENANT_DOMAIN`, or the current hostname before contacting the Config Service.
- Request tenant metadata from `https://tsunami-configservice-dev.azurewebsites.net/api/public/tenants?domain={tenantDomain}` and provide it to every component via Vue's dependency injection.
- Bootstrap `@auth0/auth0-vue` with the runtime configuration, using local storage caching and refresh tokens.
- Redirect unauthenticated users to Auth0 on first load and show a navigation shell once the session is established.
- Call protected Config Service endpoints with the runtime `tenantId`, bearer token, and `X-TENANT-ID` header to display both list and tree representations of the tenant configuration.

## Getting Started
```bash
npm install
npm run dev
```
The current Vite toolchain requires Node `^20.19.0` or `>=22.12.0`. Older Node 20 builds emit `EBADENGINE` warnings but the app still runs.

When the dev server is running:
1. Use a tenant-aware host such as `http://tsunami.localhost:5173/` (add a hosts entry that points to `127.0.0.1`).
2. Alternatively, open `http://localhost:5173/?tenantDomain=tsunami.localhost` or set `VITE_TENANT_DOMAIN=tsunami.localhost npm run dev`.
3. Sign in with an Auth0 user for the selected tenant and explore the protected pages.

## Runtime Configuration Flow
1. `src/main.js` resolves the tenant domain and calls `fetchAuth0Config()` from `src/services/configService.js`.
2. The Config Service responds with `tenantId`, Auth0 domain, client ID, audience, and metadata specific to the tenant.
3. Vue provides the runtime config via `runtimeConfigKey` and mounts the app only after the fetch succeeds.
4. `createAuth0()` installs the Auth0 plugin using the fetched domain and client ID, enabling refresh tokens and the configured audience.
5. `createAuthGuard()` enforces `route.meta.requiresAuth` on the protected routes.

## Protected Tenant Actions
- `src/components/ProtectedApiDemo.vue` shows the current access token and calls the protected tree endpoint (`/tenants/{tenantId}/orgs/0/properties/tree`). The results are rendered on the home page under "Tenant Config Tree".
- `src/views/TenantConfigListView.vue` uses the same access token to call the list endpoint (`/tenants/{tenantId}/orgs/0/properties`) once you select the "Tenant Config List" link in the navigation.
- `src/views/ProfileView.vue` displays the authenticated user's profile data provided by Auth0.

Both protected fetches include the `X-TENANT-ID` header and expect the runtime `tenantId`. An ID of `0` (returned for the `tsunami.localhost` tenant) is valid and handled correctly.

## Customising the Tenant Domain
The tenant domain can be supplied in three ways, checked in this order:
1. Pass a value to `fetchAuth0Config({ tenantDomain })`.
2. Set a Vite env variable before starting the dev server: `VITE_TENANT_DOMAIN=my-tenant.example.com npm run dev`.
3. Append `?tenantDomain=my-tenant.example.com` to the dev server URL.

If no explicit domain is provided, the app falls back to the current hostname.

## Next Steps
- Replace the Config Service base URL or endpoints with your own environment.
- Extend the runtime configuration payload if you need additional Auth0 parameters (for example, `organization` or different scopes).
- Run `npm run build` and deploy the generated assets behind your preferred hosting stack.
