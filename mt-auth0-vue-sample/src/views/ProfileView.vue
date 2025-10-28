<script setup>
import { computed } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue';

const { user, isLoading } = useAuth0();

const profile = computed(() => user.value || {});
</script>

<template>
  <section class="page">
    <h1>Your Profile</h1>

    <div v-if="isLoading" class="info-card">Loading profile…</div>

    <div v-else class="profile-grid">
      <div class="info-card">
        <h2>Identity</h2>
        <p><strong>Name:</strong> {{ profile.name || '—' }}</p>
        <p><strong>Email:</strong> {{ profile.email || '—' }}</p>
        <p><strong>Nickname:</strong> {{ profile.nickname || '—' }}</p>
      </div>

      <div class="info-card">
        <h2>Raw Profile JSON</h2>
        <pre>{{ JSON.stringify(profile, null, 2) }}</pre>
      </div>
    </div>
  </section>
</template>