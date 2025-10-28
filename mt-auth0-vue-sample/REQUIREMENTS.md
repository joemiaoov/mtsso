# Auth0 + Vue 3 Sample App (Vite) — Runtime Config from Config Service

## Summary
A minimal Vue 3 SPA that **fetches Auth0 settings at runtime** from the Config Service and then initializes `@auth0/auth0-vue`. No static JSON config in the codebase. Demonstrates login/logout, protected routes, user profile, and calling a protected API with an access token.

## Goals
- ✅ Fetch Auth0 config at app start from the Config Service
- ✅ Initialize `@auth0/auth0-vue` **after** runtime config is loaded
- ✅ Public Home page
- ✅ Protected Profile page (route guard)
- ✅ API call with access token (e.g., `GET /api/messages`)
- ⛭ Optional: show current org/tenant label in navbar if present

### Non-Goals
- Server rendering, DB, or SSR
- Static, compile-time-only Auth0 config

## Stack
- Vue 3 + Vite
- vue-router
- @auth0/auth0-vue
- Axios (API example)
- Node 18+

---

## Runtime Config Service

### Endpoint
