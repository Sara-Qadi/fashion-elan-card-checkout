<script setup>
const emit = defineEmits(['continue-shopping', 'restore-demo'])
</script>

<template>
  <v-card class="elan-card elan-empty pa-8 pa-sm-12 text-center">
    <div class="elan-empty__icon" aria-hidden="true">
      <v-icon icon="mdi-shopping-outline" size="44" color="primary" />
    </div>

    <h2 class="elan-empty__title mt-6 mb-2">Your bag is empty</h2>
    <p class="elan-empty__text mb-8">
      Nothing here yet. Once you add a few pieces you love, they’ll appear on this page ready for
      checkout.
    </p>

    <div class="elan-empty__actions">
      <v-btn
        variant="flat"
        color="primary"
        class="elan-cta px-8"
        prepend-icon="mdi-arrow-left"
        @click="emit('continue-shopping')"
      >
        Continue Shopping
      </v-btn>

      <v-btn
        variant="outlined"
        color="primary"
        class="elan-cta px-6"
        prepend-icon="mdi-refresh"
        @click="emit('restore-demo')"
      >
        Restore demo bag
      </v-btn>
    </div>

    <p class="elan-empty__hint mt-6 mb-0">
      “Continue Shopping” emits the
      <code>elan:navigate-catalog</code>
      event for the future shell. The Catalog microfrontend is not connected yet.
    </p>
  </v-card>
</template>

<style scoped>
.elan-empty__icon {
  display: grid;
  place-items: center;
  width: 92px;
  height: 92px;
  margin: 0 auto;
  border-radius: 50%;
  background: var(--elan-primary-soft);
}

.elan-empty__title {
  font-size: clamp(1.35rem, 1.1rem + 1vw, 1.7rem);
  font-weight: 400;
  letter-spacing: -0.01em;
  color: var(--elan-text);
}

.elan-empty__text {
  max-width: 42ch;
  margin-inline: auto;
  color: var(--elan-text-muted);
  line-height: 1.6;
}

.elan-empty__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}

.elan-empty__hint {
  font-size: 0.78rem;
  color: var(--elan-text-muted);
}

.elan-empty__hint code {
  background: var(--elan-secondary-soft);
  border-radius: 6px;
  padding: 1px 6px;
  font-size: 0.75rem;
}
</style>
