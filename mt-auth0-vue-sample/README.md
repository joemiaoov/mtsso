# Auth0 Runtime Config Vue Sample

This Vue 3 + Vite single-page app demonstrates how to fetch Auth0 settings **at runtime** from the Tsunami Config Service and only then initialise `@auth0/auth0-vue`. No static JSON configuration is bundled with the client.

- Runtime fetch from `https://tsunami-configservice-dev.azurewebsites.net/api/public/tenants` using the tenant domain.
- Auth0 plugin bootstrapped after the configuration call resolves.
- Public Home page and protected Profile page (route guard).
- Example of calling a protected API with an access token obtained via `getAccessTokenSilently`.

## Getting Started

```bash
npm install
npm run dev
```

> ?? The current Vite toolchain requires Node `^20.19.0` or `>=22.12.0`. Running on an older Node 20 build produces warnings (`EBADENGINE`) but the sample still works.

Open http://localhost:5173/ once Vite starts.

## Configuration Flow

1. `src/main.js` calls `fetchAuth0Config()` (see `src/services/configService.js`).
2. The Config Service endpoint resolves the tenant domain into Auth0 metadata (domain, clientId, etc.).
3. After the fetch succeeds, Vue creates the app, provides the runtime config, and installs the Auth0 plugin.
4. The `createAuthGuard` helper wires route protection based on `route.meta.requiresAuth`.

By default the tenant domain is `demo-dev.gsvlabsportal.com`. Override it by either:

- Adding `?tenantDomain=<custom-domain>` to the local dev URL.
- Setting a Vite env variable before starting Vite: `VITE_TENANT_DOMAIN=my-tenant.example.com npm run dev`.

## Calling a Protected API

`src/components/ProtectedApiDemo.vue` shows how to request an access token with the runtime-configured audience and call `${audience}/api/messages` via Axios. Update the audience or endpoint if your API lives elsewhere.

## Key Files

- `src/main.js` — Bootstraps Vue after runtime config resolves and installs Auth0.
- `src/services/configService.js` — Fetches tenant-specific Auth0 settings.
- `src/router/index.js` — Defines public/protected routes.
- `src/views/HomeView.vue` — Explains the runtime config flow and hosts the API demo.
- `src/views/ProfileView.vue` — Protected user profile view.

## Next Steps

- Replace the sample API call with your actual backend endpoint.
- Extend the runtime config payload if you need additional Auth0 parameters (e.g., `organization`, `scope`).
- Deploy the built assets (`npm run build`) behind your preferred hosting stack.