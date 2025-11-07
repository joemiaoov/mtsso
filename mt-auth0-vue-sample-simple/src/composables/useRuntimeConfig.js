import { inject } from 'vue';

export const runtimeConfigKey = Symbol('runtimeConfig');

export function useRuntimeConfig() {
  const config = inject(runtimeConfigKey);

  if (!config) {
    throw new Error('Runtime Auth0 configuration has not been provided.');
  }

  return config;
}