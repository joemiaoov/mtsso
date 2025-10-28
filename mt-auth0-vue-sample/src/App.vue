<script setup>
import { RouterView } from 'vue-router';
import AppNav from './components/AppNav.vue';
</script>

<template>
  <div class="app-shell">
    <AppNav />
    <main class="app-content">
      <RouterView />
    </main>
  </div>
</template>