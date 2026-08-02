<script setup>
import { computed } from 'vue'

import PromoCodeForm from '@/components/PromoCodeForm.vue'
import { useCartStore } from '@/stores/cart'
import { useCheckoutStore } from '@/stores/checkout'
import { formatCurrency } from '@/utils/currency'
import { PRICING_RULES, amountUntilFreeShipping } from '@/utils/pricing'

/**
 * The single order-summary implementation, reused on every page so the numbers
 * can never disagree between steps.
 */
const props = defineProps({
  title: { type: String, default: 'Order Summary' },
  showPromo: { type: Boolean, default: false },
  showFreeShippingHint: { type: Boolean, default: false },
  sticky: { type: Boolean, default: true },
})

const cart = useCartStore()
const checkout = useCheckoutStore()

const totals = computed(() => checkout.totals)

const shippingLabel = computed(() => {
  if (cart.isEmpty) return '—'
  return totals.value.shippingCost === 0 ? 'Free' : formatCurrency(totals.value.shippingCost)
})

const remainingForFreeShipping = computed(() => amountUntilFreeShipping(totals.value.discountedSubtotal))

const freeShippingProgress = computed(() => {
  const ratio = totals.value.discountedSubtotal / PRICING_RULES.freeShippingThreshold
  return Math.min(100, Math.max(0, ratio * 100))
})

const showHint = computed(
  () =>
    props.showFreeShippingHint &&
    !cart.isEmpty &&
    checkout.shippingMethod.eligibleForFreeShipping &&
    remainingForFreeShipping.value > 0,
)
</script>

<template>
  <v-card class="elan-card elan-summary" :class="{ 'elan-sticky': sticky }">
    <div class="elan-summary__head">
      <h2 class="elan-heading mb-0">{{ title }}</h2>
      <span class="elan-summary__count">
        {{ totals.itemCount }} item{{ totals.itemCount === 1 ? '' : 's' }}
      </span>
    </div>

    <v-divider class="elan-divider" />

    <div v-if="showPromo" class="elan-summary__promo">
      <PromoCodeForm />
      <v-divider class="elan-divider mt-5" />
    </div>

    <dl class="elan-summary__rows">
      <div class="elan-summary__row">
        <dt>Subtotal</dt>
        <dd class="elan-numeric">{{ formatCurrency(totals.subtotal) }}</dd>
      </div>

      <div v-if="totals.discountAmount > 0" class="elan-summary__row is-discount">
        <dt>
          Discount
          <span v-if="cart.promoCode" class="elan-summary__tag">{{ cart.promoCode }}</span>
        </dt>
        <dd class="elan-numeric">−{{ formatCurrency(totals.discountAmount) }}</dd>
      </div>

      <div class="elan-summary__row">
        <dt>
          Shipping
          <span class="elan-summary__meta">{{ checkout.shippingMethod.label }}</span>
        </dt>
        <dd class="elan-numeric" :class="{ 'is-free': totals.shippingCost === 0 && !cart.isEmpty }">
          {{ shippingLabel }}
        </dd>
      </div>

      <div class="elan-summary__row">
        <dt>Estimated tax <span class="elan-summary__meta">5%</span></dt>
        <dd class="elan-numeric">{{ formatCurrency(totals.taxAmount) }}</dd>
      </div>
    </dl>

    <div v-if="showHint" class="elan-summary__shipping-hint">
      <p class="mb-2">
        Add <strong class="elan-numeric">{{ formatCurrency(remainingForFreeShipping) }}</strong> more
        to unlock free standard shipping.
      </p>
      <v-progress-linear
        :model-value="freeShippingProgress"
        color="secondary"
        bg-color="#EDE0DB"
        height="6"
        rounded
        :aria-label="`Progress towards free shipping: ${Math.round(freeShippingProgress)} percent`"
      />
    </div>

    <v-divider class="elan-divider" />

    <div class="elan-summary__total">
      <span>Total</span>
      <span class="elan-numeric elan-summary__total-value">{{ formatCurrency(totals.grandTotal) }}</span>
    </div>
    <p class="elan-summary__currency mb-0">All prices in USD, taxes included in the total.</p>

    <slot name="actions" />

    <div class="elan-summary__trust">
      <span><v-icon icon="mdi-lock-outline" size="15" /> Secure demo checkout</span>
      <span><v-icon icon="mdi-package-variant-closed" size="15" /> Free returns within 30 days</span>
    </div>
  </v-card>
</template>

<style scoped>
.elan-summary {
  padding: 24px;
}

.elan-summary__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.elan-summary__count {
  font-size: 0.82rem;
  color: var(--elan-text-muted);
}

.elan-summary__promo {
  padding-top: 20px;
}

.elan-summary__rows {
  margin: 0;
  padding: 20px 0 4px;
}

.elan-summary__row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}

.elan-summary__row dt {
  font-size: 0.9rem;
  color: var(--elan-text-muted);
}

.elan-summary__row dd {
  margin: 0;
  font-size: 0.92rem;
  font-weight: 500;
  color: var(--elan-text);
  white-space: nowrap;
}

.elan-summary__row.is-discount dd {
  color: var(--elan-primary);
  font-weight: 600;
}

.elan-summary__row dd.is-free {
  color: var(--elan-success, #2f6a4f);
  font-weight: 600;
}

.elan-summary__tag {
  display: inline-block;
  margin-left: 6px;
  padding: 1px 7px;
  border-radius: 999px;
  background: var(--elan-primary-soft);
  color: var(--elan-primary);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.06em;
}

.elan-summary__meta {
  display: block;
  font-size: 0.74rem;
  color: var(--elan-text-muted);
  opacity: 0.85;
}

.elan-summary__shipping-hint {
  background: var(--elan-secondary-soft);
  border-radius: var(--elan-radius-input);
  padding: 12px 14px;
  margin-bottom: 16px;
  font-size: 0.8rem;
  color: var(--elan-text);
}

.elan-summary__total {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  padding-top: 16px;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--elan-text);
}

.elan-summary__total-value {
  font-size: 1.45rem;
  font-weight: 500;
  letter-spacing: -0.01em;
}

.elan-summary__currency {
  font-size: 0.74rem;
  color: var(--elan-text-muted);
  margin-top: 4px;
}

.elan-summary__trust {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--elan-border);
  font-size: 0.76rem;
  color: var(--elan-text-muted);
}

.elan-summary__trust span {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
</style>
