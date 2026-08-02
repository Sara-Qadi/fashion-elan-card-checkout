<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import ProductThumb from '@/components/ProductThumb.vue'
import { useSnackbar } from '@/composables/useSnackbar'
import { requestCatalogNavigation } from '@/integration/checkoutBridge'
import { useCheckoutStore } from '@/stores/checkout'
import { formatCurrency } from '@/utils/currency'
import { formatOrderDate } from '@/utils/order'

const router = useRouter()
const checkout = useCheckoutStore()
const { info } = useSnackbar()

// Read straight from the store, which rehydrates the order from localStorage —
// so refreshing this route keeps working.
const order = computed(() => checkout.orderConfirmation)
const firstName = computed(() => order.value?.shippingAddress?.firstName || 'there')

function printReceipt() {
  window.print()
}

/**
 * The Catalog microfrontend is not wired up yet, so this asks the future shell
 * first (elan:navigate-catalog) and otherwise resets the demo locally.
 * Swapping in a real catalog later means setting VITE_CATALOG_URL or having the
 * shell call preventDefault() on the event — no change to this view.
 */
function continueShopping() {
  const outcome = requestCatalogNavigation({
    reason: 'post-order',
    fallback: () => {
      checkout.resetDemo()
      info('Demo reset — a fresh sample bag is waiting for you.')
      router.push({ name: 'cart' })
    },
  })

  if (outcome === 'shell') info('Handing navigation over to the shell application…')
}
</script>

<template>
  <v-container class="elan-page px-4 px-sm-6">
    <!-- No order in memory or storage: explain, do not crash. -->
    <v-card v-if="!order" class="elan-card elan-missing pa-8 pa-sm-12 text-center">
      <div class="elan-missing__icon" aria-hidden="true">
        <v-icon icon="mdi-receipt-text-outline" size="40" color="primary" />
      </div>
      <h1 class="elan-missing__title mt-6 mb-2">No order to show yet</h1>
      <p class="elan-missing__text mb-8">
        We could not find a completed order in this browser. If you have just cleared your storage,
        start a new demo order from your bag.
      </p>
      <v-btn
        variant="flat"
        color="primary"
        class="elan-cta px-8"
        prepend-icon="mdi-shopping-outline"
        :to="{ name: 'cart' }"
      >
        Back to Shopping Bag
      </v-btn>
    </v-card>

    <template v-else>
      <section class="elan-hero">
        <div class="elan-hero__icon" aria-hidden="true">
          <v-icon icon="mdi-check" size="38" color="white" />
        </div>
        <p class="elan-eyebrow mt-6 mb-2">Order confirmed</p>
        <h1 class="elan-display mb-3">Thank you for your order, {{ firstName }}</h1>
        <p class="elan-hero__text mb-0">
          A confirmation for order
          <strong>{{ order.id }}</strong>
          would be sent to
          <strong>{{ order.shippingAddress.email }}</strong>
          in a real store. This demo does not send email.
        </p>
      </section>

      <v-row class="mt-2">
        <v-col cols="12" lg="7" xl="8">
          <v-card class="elan-card pa-6 pa-sm-8">
            <h2 class="elan-heading mb-5">Order details</h2>

            <dl class="elan-facts">
              <div class="elan-facts__row">
                <dt>Order number</dt>
                <dd class="elan-numeric font-weight-medium">{{ order.id }}</dd>
              </div>
              <div class="elan-facts__row">
                <dt>Order date</dt>
                <dd>{{ formatOrderDate(order.createdAt) }}</dd>
              </div>
              <div class="elan-facts__row">
                <dt>Confirmation email</dt>
                <dd>{{ order.shippingAddress.email }}</dd>
              </div>
              <div class="elan-facts__row">
                <dt>Delivery method</dt>
                <dd>{{ order.delivery.label }} · {{ order.delivery.estimate }}</dd>
              </div>
              <div class="elan-facts__row">
                <dt>Estimated delivery</dt>
                <dd class="font-weight-medium">{{ order.delivery.window.label }}</dd>
              </div>
              <div class="elan-facts__row">
                <dt>Payment</dt>
                <dd>{{ order.payment.label }}</dd>
              </div>
              <div class="elan-facts__row">
                <dt>Ship to</dt>
                <dd>
                  {{ order.shippingAddress.firstName }} {{ order.shippingAddress.lastName }},
                  {{ order.shippingAddress.street }}, {{ order.shippingAddress.city }},
                  {{ order.shippingAddress.country }}
                </dd>
              </div>
            </dl>

            <v-divider class="elan-divider my-6" />

            <h2 class="elan-heading mb-4">
              {{ order.totals.itemCount }} item{{ order.totals.itemCount === 1 ? '' : 's' }} on the way
            </h2>

            <ul class="elan-order-items">
              <li v-for="item in order.items" :key="item.id" class="elan-order-item">
                <ProductThumb :src="item.image" :alt="item.imageAlt" :name="item.name" :width="64" />
                <div class="elan-order-item__body">
                  <p class="elan-order-item__name mb-1">{{ item.name }}</p>
                  <p class="elan-order-item__meta mb-0">
                    {{ item.color }}
                    <template v-if="item.size"> · Size {{ item.size }}</template>
                    · Qty {{ item.quantity }}
                  </p>
                </div>
                <p class="elan-order-item__total elan-numeric mb-0">
                  {{ formatCurrency(item.lineTotal) }}
                </p>
              </li>
            </ul>
          </v-card>
        </v-col>

        <v-col cols="12" lg="5" xl="4">
          <v-card class="elan-card elan-paid pa-6">
            <h2 class="elan-heading mb-4">Amount paid</h2>

            <dl class="elan-paid__rows">
              <div class="elan-paid__row">
                <dt>Subtotal</dt>
                <dd class="elan-numeric">{{ formatCurrency(order.totals.subtotal) }}</dd>
              </div>
              <div v-if="order.totals.discountAmount > 0" class="elan-paid__row is-discount">
                <dt>Discount <span v-if="order.promoCode">({{ order.promoCode }})</span></dt>
                <dd class="elan-numeric">−{{ formatCurrency(order.totals.discountAmount) }}</dd>
              </div>
              <div class="elan-paid__row">
                <dt>Shipping</dt>
                <dd class="elan-numeric">
                  {{ order.totals.shippingCost === 0 ? 'Free' : formatCurrency(order.totals.shippingCost) }}
                </dd>
              </div>
              <div class="elan-paid__row">
                <dt>Tax</dt>
                <dd class="elan-numeric">{{ formatCurrency(order.totals.taxAmount) }}</dd>
              </div>
            </dl>

            <v-divider class="elan-divider" />

            <div class="elan-paid__total">
              <span>Total paid</span>
              <span class="elan-numeric">{{ formatCurrency(order.totals.grandTotal) }}</span>
            </div>

            <div class="elan-paid__actions elan-no-print">
              <v-btn
                block
                variant="flat"
                color="primary"
                class="elan-cta"
                prepend-icon="mdi-printer-outline"
                @click="printReceipt"
              >
                Print Receipt
              </v-btn>

              <v-btn
                block
                variant="outlined"
                color="primary"
                class="elan-cta mt-3"
                prepend-icon="mdi-shopping-outline"
                @click="continueShopping"
              >
                Continue Shopping
              </v-btn>
            </div>

            <p class="elan-paid__note mb-0 mt-4">
              Demo order — no charge was made. “Continue Shopping” emits
              <code>elan:navigate-catalog</code> for the future shell.
            </p>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<style scoped>
.elan-page {
  max-width: 1240px;
  padding-top: 40px;
  padding-bottom: 64px;
}

.elan-hero {
  text-align: center;
  max-width: 640px;
  margin: 8px auto 24px;
}

.elan-hero__icon {
  display: grid;
  place-items: center;
  width: 76px;
  height: 76px;
  margin: 0 auto;
  border-radius: 50%;
  background: var(--elan-primary);
  box-shadow: 0 0 0 10px var(--elan-primary-soft);
}

.elan-hero__text {
  color: var(--elan-text-muted);
  line-height: 1.65;
}

.elan-facts {
  margin: 0;
}

.elan-facts__row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 24px;
  padding: 10px 0;
  border-bottom: 1px solid var(--elan-border);
}

.elan-facts__row:last-child {
  border-bottom: 0;
}

.elan-facts__row dt {
  flex: 0 0 180px;
  font-size: 0.85rem;
  color: var(--elan-text-muted);
}

.elan-facts__row dd {
  flex: 1 1 220px;
  margin: 0;
  font-size: 0.92rem;
  color: var(--elan-text);
}

.elan-order-items {
  list-style: none;
  margin: 0;
  padding: 0;
}

.elan-order-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 0;
}

.elan-order-item__body {
  flex: 1 1 auto;
  min-width: 0;
}

.elan-order-item__name {
  font-size: 0.92rem;
  font-weight: 500;
}

.elan-order-item__meta {
  font-size: 0.8rem;
  color: var(--elan-text-muted);
}

.elan-order-item__total {
  font-weight: 600;
  font-size: 0.92rem;
  white-space: nowrap;
}

.elan-paid__rows {
  margin: 0;
  padding-bottom: 12px;
}

.elan-paid__row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 10px;
}

.elan-paid__row dt {
  font-size: 0.88rem;
  color: var(--elan-text-muted);
}

.elan-paid__row dd {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 500;
}

.elan-paid__row.is-discount dd {
  color: var(--elan-primary);
}

.elan-paid__total {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  padding-top: 16px;
  font-weight: 600;
}

.elan-paid__total span:last-child {
  font-size: 1.45rem;
  font-weight: 500;
}

.elan-paid__actions {
  margin-top: 24px;
}

.elan-paid__note {
  font-size: 0.74rem;
  color: var(--elan-text-muted);
  line-height: 1.5;
}

.elan-paid__note code {
  background: var(--elan-secondary-soft);
  border-radius: 6px;
  padding: 1px 5px;
}

.elan-missing {
  max-width: 620px;
  margin-inline: auto;
}

.elan-missing__icon {
  display: grid;
  place-items: center;
  width: 88px;
  height: 88px;
  margin: 0 auto;
  border-radius: 50%;
  background: var(--elan-primary-soft);
}

.elan-missing__title {
  font-size: clamp(1.35rem, 1.1rem + 1vw, 1.7rem);
  font-weight: 400;
}

.elan-missing__text {
  max-width: 46ch;
  margin-inline: auto;
  color: var(--elan-text-muted);
  line-height: 1.6;
}

@media (max-width: 599px) {
  .elan-page {
    padding-top: 24px;
  }

  .elan-facts__row dt {
    flex: 0 0 100%;
  }
}
</style>
