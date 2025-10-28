import { createApp } from 'vue';
import { createAuth0, createAuthGuard } from '@auth0/auth0-vue';
import App from './App.vue';
import router from './router';
import './style.css';
import { fetchAuth0Config, TenantNotFoundError, TenantAccessDeniedError } from './services/configService';
import { runtimeConfigKey } from './composables/useRuntimeConfig';

async function bootstrapApp() {
  const host = document.querySelector('#app');

  if (!host) {
    throw new Error('Mount element #app not found.');
  }

  host.innerHTML = '<div class="app-status">Loading configuration...</div>';

  try {
    const runtimeConfig = await fetchAuth0Config();

    const app = createApp(App);

    app.provide(runtimeConfigKey, runtimeConfig);
    app.config.globalProperties.$runtimeConfig = runtimeConfig;

    app.use(
      createAuth0({
        domain: runtimeConfig.domain,
        clientId: runtimeConfig.clientId,
        authorizationParams: {
          audience: runtimeConfig.audience,
          redirect_uri: window.location.origin,
          scope: 'openid profile email read:messages',
        },
        cacheLocation: 'localstorage',
        useRefreshTokens: true,
      }),
    );

    const guard = createAuthGuard(app);

    router.beforeEach(async (to) => {
      if (!to.meta?.requiresAuth) {
        return true;
      }

      return guard(to);
    });

    app.use(router);
    app.mount('#app');
  } catch (error) {
    console.error('Failed to bootstrap application', error);

    if (error instanceof TenantAccessDeniedError || error?.status === 403) {
      host.innerHTML =
        '<div class="app-status warn">Please access the app with a tenant-specific URL (for example, https://demo.localhost:5173).</div>';
      return;
    }

    if (error instanceof TenantNotFoundError || error?.status === 500) {
      const tenantLabel = error?.tenantDomain ?? window.location.hostname;
      host.innerHTML = `<div class="app-status warn">No Auth0 configuration exists for tenant "${tenantLabel}". Verify the tenant domain and try again.</div>`;
      return;
    }

    host.innerHTML = `<div class="app-status error">Unable to load Auth0 configuration. ${error.message}</div>`;
  }
}

bootstrapApp();
