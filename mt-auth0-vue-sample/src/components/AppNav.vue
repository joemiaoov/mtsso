<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useAuth0 } from '@auth0/auth0-vue';
import { useRuntimeConfig } from '../composables/useRuntimeConfig';

const { isAuthenticated, isLoading, loginWithRedirect, logout, user } = useAuth0();
const runtimeConfig = useRuntimeConfig();

const tenantLabel = computed(() => runtimeConfig.tenantName || '');
const userLabel = computed(() => user.value?.name || user.value?.email || '');

function handleLogin() {
  void loginWithRedirect();
}

function handleLogout() {
  logout({ logoutParams: { returnTo: window.location.origin } });
}
</script>

<template>
  <header class="app-header">
    <RouterLink to="/" class="brand">
      <div class="brand-text">
        <span class="brand-title">Tsunami Auth0 + Vue</span>
        <span v-if="tenantLabel" class="brand-subtitle">Tenant: {{ tenantLabel }}</span>
      </div>
    </RouterLink>

    <nav class="nav-links">
      <RouterLink to="/" class="nav-link">Home</RouterLink>
      <RouterLink v-if="isAuthenticated" to="/tenant-config-tree" class="nav-link">Tenant Config Tree</RouterLink>
      <RouterLink v-if="isAuthenticated" to="/tenant-config-list" class="nav-link">Tenant Config List</RouterLink>
      <RouterLink v-if="isAuthenticated" to="/profile" class="nav-link">Profile</RouterLink>
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
</template>
