import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

function loadHttpsOptions() {
  const keyPath = process.env.VITE_DEV_SSL_KEY
  const certPath = process.env.VITE_DEV_SSL_CERT

  if (!keyPath || !certPath) {
    return undefined
  }

  try {
    const key = fs.readFileSync(path.resolve(keyPath))
    const cert = fs.readFileSync(path.resolve(certPath))

    return { key, cert }
  } catch (error) {
    console.warn('Failed to load HTTPS certificates for local dev:', error)
    return undefined
  }
}

const httpsOptions = loadHttpsOptions()

const allowedHosts = [
  'localhost',
  '127.0.0.1',
  'tsunami-mt-sso.azurewebsites.net',
  '.dev.tsunamitenant.com',
  '.qa.tsunamitenant.com',
  '.stage.tsunamitenant.com',
  '.prod.tsunamitenant.com',
]

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: true,
    allowedHosts,
    https: httpsOptions,
  },
  preview: {
    host: true,
    allowedHosts,
  },
})
