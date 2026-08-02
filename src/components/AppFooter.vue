<template>
  <footer class="elan-footer elan-no-print">
    <v-container class="py-6 px-4 px-sm-6">
      <div class="elan-footer__inner">
        <p class="elan-footer__brand mb-1">ELAN</p>
        <p class="elan-footer__note mb-0">
          Cart &amp; Checkout microfrontend · Team 1 university project · Demo checkout — no real
          payment is processed.
        </p>
      </div>
    </v-container>
  </footer>
</template>

<style scoped>
.elan-footer {
  border-top: 1px solid var(--elan-border);
  background: var(--elan-surface);
}

.elan-footer__inner {
  text-align: center;
}

.elan-footer__brand {
  font-weight: 700;
  letter-spacing: 0.24em;
  font-size: 0.85rem;
  color: var(--elan-primary);
}

.elan-footer__note {
  font-size: 0.8rem;
  color: var(--elan-text-muted);
}
</style>
