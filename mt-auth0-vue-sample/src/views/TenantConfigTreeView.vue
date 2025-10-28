<script setup>
import { ref } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue';
import { useRuntimeConfig } from '../composables/useRuntimeConfig';
import { fetchProtectedTenantConfigTree } from '../services/configService';

const { getAccessTokenSilently } = useAuth0();
const runtimeConfig = useRuntimeConfig();

const loading = ref(false);
const configResult = ref('');
const errorMessage = ref('');

async function handleFetchTenantConfig() {
  loading.value = true;
  configResult.value = '';
  errorMessage.value = '';

  try {
    const tenantId = runtimeConfig.tenantId;

    if (tenantId === undefined || tenantId === null || tenantId === '') {
      throw new Error('Tenant ID is not available in the runtime configuration.');
    }

    const accessToken = await getAccessTokenSilently();
    const response = await fetchProtectedTenantConfigTree({
      tenantId,
      accessToken,
    });

    configResult.value = typeof response === 'string' ? response : JSON.stringify(response, null, 2);
  } catch (error) {
    errorMessage.value = error.message || 'Unable to load the tenant configuration.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <section class="page">
    <h1>Tenant Config Tree</h1>

    <div class="info-card">
      <p>
        Fetch the tree-structured tenant configuration from the protected Config Service endpoint using your Auth0 access token.
      </p>

      <button type="button" class="btn primary" :disabled="loading" @click="handleFetchTenantConfig">
        {{ loading ? 'Loading...' : 'Get Tenant Config' }}
      </button>

      <div v-if="loading" class="api-output">
        <h3>Status</h3>
        <pre>Fetching tenant configuration...</pre>
      </div>

      <div v-if="configResult" class="api-output success">
        <h3>Tenant Configuration</h3>
        <pre>{{ configResult }}</pre>
      </div>

      <div v-if="errorMessage" class="api-output error">
        <h3>Error</h3>
        <pre>{{ errorMessage }}</pre>
      </div>
    </div>
  </section>
</template>