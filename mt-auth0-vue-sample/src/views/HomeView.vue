<script setup>
import { computed, ref, watch } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue';
import { useRuntimeConfig } from '../composables/useRuntimeConfig';
import ProtectedApiDemo from '../components/ProtectedApiDemo.vue';

const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
const runtimeConfig = useRuntimeConfig();

const configSummary = computed(() => ({
  domain: runtimeConfig.domain,
  clientId: runtimeConfig.clientId,
  audience: runtimeConfig.audience,
}));

const autoLoginTriggered = ref(false);

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
</script>

<template>
  <section class="page">
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
      <p v-if="isAuthenticated">You are logged in. Grab the current access token below.</p>
      <p v-else>Log in to retrieve an access token.</p>
    </div>

    <ProtectedApiDemo />
  </section>
</template>
