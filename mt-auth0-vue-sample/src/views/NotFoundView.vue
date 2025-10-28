<script setup>
import { RouterLink } from 'vue-router';
</script>

<template>
  <section class="page">
    <h1>Page Not Found</h1>
    <p>The page you are looking for does not exist.</p>
    <RouterLink to="/" class="btn">Return home</RouterLink>
  </section>
</template>