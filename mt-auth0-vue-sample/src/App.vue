<script setup>
import { RouterView } from 'vue-router';
import AppNav from './components/AppNav.vue';
import { useAuth0 } from '@auth0/auth0-vue';

const { isAuthenticated } = useAuth0();
</script>

<template>
  <div class="app-shell">
    <AppNav v-show="isAuthenticated" />
    <main class="app-content" v-show="isAuthenticated">
      <RouterView />
    </main>
  </div>
</template>
