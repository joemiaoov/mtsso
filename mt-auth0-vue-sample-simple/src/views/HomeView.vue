<script setup>
import { computed, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { useAuth0 } from '@auth0/auth0-vue';
import { useRuntimeConfig } from '../composables/useRuntimeConfig';
import { fetchProtectedTenantConfigTree } from '../services/configService';

const { isAuthenticated, isLoading, loginWithRedirect, logout, user, getAccessTokenSilently } = useAuth0();
const runtimeConfig = useRuntimeConfig();

const configSummary = computed(() => ({
  domain: runtimeConfig.domain,
  clientId: runtimeConfig.clientId,
  audience: runtimeConfig.audience,
}));

const tenantLabel = computed(() => runtimeConfig.tenantName || '');
const userLabel = computed(() => user.value?.name || user.value?.email || '');

const autoLoginTriggered = ref(false);

const accessTokenLoading = ref(false);
const accessTokenValue = ref('');
const accessTokenError = ref('');

const tenantConfigLoading = ref(false);
const tenantConfigResult = ref('');
const tenantConfigError = ref('');

function handleLogin() {
  void loginWithRedirect();
}

function handleLogout() {
  logout({ logoutParams: { returnTo: window.location.origin } });
}

function resetAccessTokenState() {
  accessTokenLoading.value = false;
  accessTokenValue.value = '';
  accessTokenError.value = '';
}

function resetTenantConfigState() {
  tenantConfigLoading.value = false;
  tenantConfigResult.value = '';
  tenantConfigError.value = '';
}

async function fetchAccessToken() {
  if (accessTokenLoading.value) {
    return;
  }

  accessTokenLoading.value = true;
  accessTokenValue.value = '';
  accessTokenError.value = '';

  try {
    const token = await getAccessTokenSilently();
    accessTokenValue.value = token;
    await handleFetchTenantConfig(token);
  } catch (error) {
    accessTokenError.value = error.message || 'Unable to retrieve the access token.';
  } finally {
    accessTokenLoading.value = false;
  }
}

watch(
  [isLoading, isAuthenticated],
  ([loading, authenticated]) => {
    if (!loading && !authenticated && !autoLoginTriggered.value) {
      autoLoginTriggered.value = true;

      const loginOptions = {
        appState: {
          returnTo: window.location.pathname,
          tenantConfig: configSummary.value,
        },
      };

      if (runtimeConfig.audience) {
        loginOptions.authorizationParams = {
          audience: runtimeConfig.audience,
        };
      }

      void loginWithRedirect(loginOptions);
    }
  },
  { immediate: true }
);

watch(
  isAuthenticated,
  (authenticated) => {
    if (authenticated) {
      void fetchAccessToken();
    } else {
      resetAccessTokenState();
      resetTenantConfigState();
    }
  },
  { immediate: true }
);

async function handleFetchTenantConfig(providedToken) {
  if (tenantConfigLoading.value) {
    return;
  }

  tenantConfigLoading.value = true;
  tenantConfigResult.value = '';
  tenantConfigError.value = '';

  try {
    const tenantId = runtimeConfig.tenantId;

    if (tenantId === undefined || tenantId === null || tenantId === '') {
      throw new Error('Tenant ID is not available in the runtime configuration.');
    }

    const accessToken = providedToken ?? (await getAccessTokenSilently());
    const response = await fetchProtectedTenantConfigTree({
      tenantId,
      accessToken,
    });

    tenantConfigResult.value = typeof response === 'string' ? response : JSON.stringify(response, null, 2);
  } catch (error) {
    tenantConfigError.value = error.message || 'Unable to load the tenant configuration.';
  } finally {
    tenantConfigLoading.value = false;
  }
}
</script>

<template>
  <section class="page">
    <header class="app-header">
      <RouterLink to="/" class="brand">
        <div class="brand-text">
          <span class="brand-title">Tsunami Auth0 + Vue</span>
          <span v-if="tenantLabel" class="brand-subtitle">Tenant: {{ tenantLabel }}</span>
        </div>
      </RouterLink>

      <nav class="nav-links">
        <RouterLink to="/" class="nav-link">Home</RouterLink>
      </nav>

      <div class="auth-actions">
        <span v-if="isAuthenticated && userLabel" class="user-chip">{{ userLabel }}</span>
        <button
          v-if="!isAuthenticated && !isLoading"
          type="button"
          class="btn primary"
          @click="handleLogin"
        >
          Log in
        </button>
        <button
          v-else-if="isAuthenticated"
          type="button"
          class="btn"
          @click="handleLogout"
        >
          Log out
        </button>
        <span v-else class="loading-text">Checking session.</span>
      </div>
    </header>

    <h1>Runtime Auth0 Configuration Demo</h1>
    <p>
      This Vue 3 + Auth0 sample fetches its configuration from the Config Service at runtime
      before bootstrapping the app.
    </p>

    <div class="info-card">
      <h2>Current Tenant Settings</h2>
      <ul>
        <li><strong>Auth0 Domain:</strong> {{ configSummary.domain }}</li>
        <li><strong>Client ID:</strong> {{ configSummary.clientId }}</li>
        <li><strong>API Audience:</strong> {{ configSummary.audience }}</li>
      </ul>
      <p class="hint">
        Update the tenant by passing <code>?tenantDomain=&lt;custom-domain&gt;</code> in the URL or
        setting <code>VITE_TENANT_DOMAIN</code>.
      </p>
    </div>

    <div class="callout">
      <p v-if="isAuthenticated">You are logged in. Access tokens and tenant configuration load automatically.</p>
      <p v-else>Log in to let the sample fetch an access token and tenant configuration.</p>
    </div>

    <section class="info-card">
      <h2>Access Token</h2>
      <p>The current Auth0 access token for this session.</p>

      <div v-if="!isAuthenticated" class="api-output">
        <h3>Status</h3>
        <pre>Log in to retrieve the access token.</pre>
      </div>
      <template v-else>
        <div v-if="accessTokenLoading" class="api-output">
          <h3>Status</h3>
          <pre>Retrieving access token...</pre>
        </div>

        <div v-if="accessTokenValue" class="api-output success">
          <h3>Access Token</h3>
          <pre>{{ accessTokenValue }}</pre>
        </div>

        <div v-if="accessTokenError" class="api-output error">
          <h3>Error</h3>
          <pre>{{ accessTokenError }}</pre>
        </div>
      </template>
    </section>

    <section class="info-card">
      <h2>Tenant Config Tree</h2>
      <p>
        Fetch the tree-structured tenant configuration from the protected Config Service endpoint using your Auth0 access token.
      </p>
      <p class="hint">
        {{ isAuthenticated ? 'The tenant configuration loads automatically after you sign in.' : 'Log in to load the tenant configuration automatically.' }}
      </p>

      <div v-if="!isAuthenticated" class="api-output">
        <h3>Status</h3>
        <pre>Log in to load the tenant configuration tree.</pre>
      </div>
      <template v-else>
        <div v-if="tenantConfigLoading" class="api-output">
          <h3>Status</h3>
          <pre>Fetching tenant configuration...</pre>
        </div>

        <div v-if="tenantConfigResult" class="api-output success">
          <h3>Tenant Configuration</h3>
          <pre>{{ tenantConfigResult }}</pre>
        </div>

        <div v-if="tenantConfigError" class="api-output error">
          <h3>Error</h3>
          <pre>{{ tenantConfigError }}</pre>
        </div>
      </template>
    </section>
  </section>
</template>
