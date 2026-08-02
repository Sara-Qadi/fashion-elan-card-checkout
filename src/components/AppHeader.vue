<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useCartStore } from '@/stores/cart'

const route = useRoute()
const router = useRouter()
const cart = useCartStore()

const isCheckoutStep = computed(() => route.path.startsWith('/checkout'))

function goToBag() {
  if (route.name !== 'cart') router.push({ name: 'cart' })
}
</script>

<template>
  <!-- Promotional strip. Mirrors the live pricing rules exactly. -->
  <v-app-bar
    :order="0"
    :height="36"
    flat
    color="primary"
    class="elan-promo-bar elan-no-print"
    tag="aside"
    aria-label="Store promotions"
  >
    <div class="elan-promo-bar__text">
      Free standard shipping over $150 · Use code
      <strong>ELAN10</strong>
      for 10% off
    </div>
  </v-app-bar>

  <v-app-bar :order="1" flat color="surface" class="elan-header elan-no-print" tag="header">
    <v-container class="d-flex align-center py-0 px-4 px-sm-6">
      <router-link
        :to="{ name: 'cart' }"
        class="elan-brand elan-focusable"
        aria-label="ELAN — go to shopping bag"
      >
        <span class="elan-brand__mark" aria-hidden="true">E</span>
        <span class="elan-brand__word">ELAN</span>
      </router-link>

      <v-spacer />

      <v-chip
        v-if="isCheckoutStep"
        size="small"
        variant="tonal"
        color="primary"
        class="elan-secure-chip mr-2 mr-sm-4"
      >
        <v-icon start size="16" icon="mdi-lock-outline" />
        <span class="d-none d-sm-inline">Secure Checkout</span>
        <span class="d-sm-none">Secure</span>
      </v-chip>

      <v-btn
        variant="text"
        color="primary"
        class="elan-bag-btn"
        :aria-label="`Shopping bag, ${cart.itemCount} item${cart.itemCount === 1 ? '' : 's'}`"
        @click="goToBag"
      >
        <v-badge
          :content="cart.itemCount"
          :model-value="cart.itemCount > 0"
          color="primary"
          offset-x="-2"
          offset-y="-2"
        >
          <v-icon icon="mdi-shopping-outline" size="24" />
        </v-badge>
        <span class="d-none d-md-inline ml-3 elan-bag-btn__label">Bag</span>
      </v-btn>
    </v-container>
  </v-app-bar>
</template>

<style scoped>
.elan-promo-bar__text {
  width: 100%;
  text-align: center;
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #fff;
  padding: 0 16px;
}

.elan-promo-bar__text strong {
  font-weight: 800;
}

.elan-header {
  border-bottom: 1px solid var(--elan-border);
}

.elan-header :deep(.v-toolbar__content) {
  height: 72px !important;
}

.elan-brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  border-radius: 12px;
}

.elan-brand__mark {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--elan-primary);
  color: #fff;
  font-weight: 700;
  font-size: 1.05rem;
  letter-spacing: 0.02em;
}

.elan-brand__word {
  font-size: 1.4rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  color: var(--elan-primary);
}

.elan-secure-chip {
  font-weight: 600;
  letter-spacing: 0.02em;
}

.elan-bag-btn__label {
  font-weight: 600;
}

@media (max-width: 599px) {
  .elan-brand__word {
    font-size: 1.15rem;
    letter-spacing: 0.16em;
  }

  .elan-promo-bar__text {
    font-size: 0.62rem;
    letter-spacing: 0.06em;
  }
}
</style>
