<script setup>
import { computed } from 'vue'

import { useCheckoutStore } from '@/stores/checkout'
import { formatCurrency } from '@/utils/currency'
import { SHIPPING_METHODS, PRICING_RULES } from '@/utils/pricing'

const checkout = useCheckoutStore()

const selected = computed({
  get: () => checkout.shippingMethodId,
  set: (value) => checkout.selectShippingMethod(value),
})

/** Standard shipping is free once the discounted subtotal reaches the threshold. */
function priceFor(method) {
  const isFree =
    method.eligibleForFreeShipping &&
    checkout.totals.discountedSubtotal >= PRICING_RULES.freeShippingThreshold
  return isFree ? 'Free' : formatCurrency(method.price)
}
</script>

<template>
  <section aria-labelledby="shipping-method-heading">
    <h2 id="shipping-method-heading" class="elan-heading mb-1">Delivery method</h2>
    <p class="elan-muted elan-method__intro mb-5">Choose how quickly you would like your order.</p>

    <v-radio-group v-model="selected" hide-details class="elan-method__group">
      <label
        v-for="method in SHIPPING_METHODS"
        :key="method.id"
        class="elan-method"
        :class="{ 'is-selected': selected === method.id }"
      >
        <v-radio :value="method.id" color="primary" class="elan-method__radio">
          <template #label>
            <span class="elan-method__body">
              <span class="elan-method__text">
                <span class="elan-method__label">{{ method.label }}</span>
                <span class="elan-method__estimate">{{ method.estimate }}</span>
              </span>
              <span class="elan-method__price elan-numeric">{{ priceFor(method) }}</span>
            </span>
          </template>
        </v-radio>
      </label>
    </v-radio-group>
  </section>
</template>

<style scoped>
.elan-method__intro {
  font-size: 0.9rem;
}

.elan-method__group :deep(.v-selection-control-group) {
  gap: 12px;
}

.elan-method {
  display: block;
  border: 1.5px solid var(--elan-border);
  border-radius: var(--elan-radius-card);
  padding: 6px 16px 6px 8px;
  background: var(--elan-surface);
  transition: border-color 0.15s ease, background-color 0.15s ease;
  cursor: pointer;
}

.elan-method.is-selected {
  border-color: var(--elan-primary);
  background: var(--elan-primary-soft);
}

.elan-method__radio :deep(.v-label) {
  opacity: 1;
  width: 100%;
}

.elan-method__body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  padding: 10px 0;
}

.elan-method__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.elan-method__label {
  font-size: 0.98rem;
  font-weight: 600;
  color: var(--elan-text);
}

.elan-method__estimate {
  font-size: 0.82rem;
  color: var(--elan-text-muted);
}

.elan-method__price {
  font-size: 1rem;
  font-weight: 600;
  color: var(--elan-text);
  white-space: nowrap;
}
</style>
