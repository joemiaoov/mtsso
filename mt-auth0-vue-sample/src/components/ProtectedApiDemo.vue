<script setup>
import { ref, watch } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue';

const { isAuthenticated, getAccessTokenSilently } = useAuth0();

const loading = ref(false);
const accessToken = ref('');
const errorMessage = ref('');

async function fetchAccessToken() {
  loading.value = true;
  errorMessage.value = '';
  accessToken.value = '';

  try {
    const token = await getAccessTokenSilently();
    accessToken.value = token;
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
</template>