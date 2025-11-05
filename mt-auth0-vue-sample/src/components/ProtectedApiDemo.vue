<script setup>
import { ref, watch } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue';
import { useRuntimeConfig } from '../composables/useRuntimeConfig';
import { fetchProtectedTenantConfigTree } from '../services/configService';

const { isAuthenticated, getAccessTokenSilently } = useAuth0();
const runtimeConfig = useRuntimeConfig();

const loading = ref(false);
const accessToken = ref('');
const errorMessage = ref('');

const tenantConfigLoading = ref(false);
const tenantConfig = ref('');
const tenantConfigError = ref('');

async function fetchTenantConfig(token) {
  tenantConfigLoading.value = true;
  tenantConfig.value = '';
  tenantConfigError.value = '';

  try {
    const tenantId = runtimeConfig.tenantId;

    if (!tenantId) {
      throw new Error('Tenant ID is not available in the runtime configuration.');
    }

    const response = await fetchProtectedTenantConfigTree({
      tenantId,
      accessToken: token ?? accessToken.value,
    });

    tenantConfig.value = typeof response === 'string' ? response : JSON.stringify(response, null, 2);
  } catch (error) {
    tenantConfigError.value = error.message || 'Unable to load the tenant configuration.';
  } finally {
    tenantConfigLoading.value = false;
  }
}

async function fetchAccessToken() {
  loading.value = true;
  errorMessage.value = '';
  accessToken.value = '';

  try {
    const token = await getAccessTokenSilently();
    accessToken.value = token;
    await fetchTenantConfig(token);
  } catch (error) {
    errorMessage.value = error.message || 'Unable to retrieve the access token.';
  } finally {
    loading.value = false;
  }
}

watch(
  isAuthenticated,
  (authenticated) => {
    if (authenticated) {
      fetchAccessToken();
    } else {
      loading.value = false;
      accessToken.value = '';
      errorMessage.value = '';
      tenantConfigLoading.value = false;
      tenantConfig.value = '';
      tenantConfigError.value = '';
    }
  },
  { immediate: true }
);
</script>

<template>
  <section class="info-card">
    <h2>Access Token</h2>
    <p>
      The current Auth0 access token for this session appears below after you log in.
    </p>

    <div v-if="loading" class="api-output">
      <h3>Status</h3>
      <pre>Retrieving access token...</pre>
    </div>

    <div v-if="accessToken" class="api-output success">
      <h3>Access Token</h3>
      <pre>{{ accessToken }}</pre>
    </div>

    <div v-if="errorMessage" class="api-output error">
      <h3>Error</h3>
      <pre>{{ errorMessage }}</pre>
    </div>
  </section>

  <section v-if="isAuthenticated" class="info-card">
    <h2>Tenant Config Tree</h2>
    <p>
      The current tenant configuration tree fetched with your access token.
    </p>

    <div v-if="tenantConfigLoading" class="api-output">
      <h3>Status</h3>
      <pre>Fetching tenant configuration...</pre>
    </div>

    <div v-if="tenantConfig" class="api-output success">
      <h3>Tenant Configuration</h3>
      <pre>{{ tenantConfig }}</pre>
    </div>

    <div v-if="tenantConfigError" class="api-output error">
      <h3>Error</h3>
      <pre>{{ tenantConfigError }}</pre>
    </div>
  </section>
</template>
