import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: [
        'index.html',
        'signin.html',
        'signup.html',
        'dashboard.html',
        'marketplace.html',
        'earnings-table.html',
        'settings.html',
        'onboarding.html',
        'forgot-password.html',
        'reset-password.html',
        'builder.html',
        'product.html',
        'navigation.html',
        'buttons.html',
        'cards.html',
        'inputs.html',
        'states.html',
        'feedback.html',
        'mina-okafor.html',
      ],
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
  },
});
