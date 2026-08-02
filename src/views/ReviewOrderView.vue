<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import CheckoutProgress from '@/components/CheckoutProgress.vue'
import OrderSummary from '@/components/OrderSummary.vue'
import ProductThumb from '@/components/ProductThumb.vue'
import ReviewSection from '@/components/ReviewSection.vue'
import { useSnackbar } from '@/composables/useSnackbar'
import { useCartStore } from '@/stores/cart'
import { useCheckoutStore } from '@/stores/checkout'
import { formatCurrency } from '@/utils/currency'
import { getLineTotal } from '@/utils/pricing'

const router = useRouter()
const cart = useCartStore()
const checkout = useCheckoutStore()
const { error, success } = useSnackbar()

const confirmed = ref(false)

const address = computed(() => checkout.shippingAddress)

const canPlaceOrder = computed(
  () =>
    confirmed.value &&
    !cart.isEmpty &&
    checkout.hasValidShipping &&
    checkout.hasValidPayment &&
    !checkout.isPlacingOrder,
)

async function placeOrder() {
  if (!canPlaceOrder.value) return

  const order = await checkout.createOrder()

  if (!order) {
    error('We could not place the order — please review your checkout details.')
    return
  }

  success(`Order ${order.id} placed successfully.`)
  router.push({ name: 'order-confirmation' })
}
</script>

<template>
  <v-container class="elan-page px-4 px-sm-6">
    <CheckoutProgress :current="3" class="mb-8" />

    <header class="elan-page__head">
      <p class="elan-eyebrow mb-2">Step 4 of 4</p>
      <h1 class="elan-display mb-0">Review your order</h1>
    </header>

    <v-row>
      <v-col cols="12" lg="7" xl="8">
        <ReviewSection title="Items" icon="mdi-hanger">
          <ul class="elan-review-items">
            <li v-for="item in cart.items" :key="item.id" class="elan-review-item">
              <ProductThumb :src="item.image" :alt="item.imageAlt" :name="item.name" :width="72" />

              <div class="elan-review-item__body">
                <p class="elan-review-item__name mb-1">{{ item.name }}</p>
                <p class="elan-review-item__meta mb-0">
                  {{ item.color }}
                  <template v-if="item.size"> · Size {{ item.size }}</template>
                  · Qty {{ item.quantity }}
                </p>
              </div>

              <p class="elan-review-item__total elan-numeric mb-0">
                {{ formatCurrency(getLineTotal(item)) }}
              </p>
            </li>
          </ul>
        </ReviewSection>

        <ReviewSection
          title="Shipping address"
          icon="mdi-map-marker-outline"
          edit-label="Edit shipping address"
          class="mt-4"
          @edit="router.push({ name: 'checkout-shipping' })"
        >
          <address class="elan-address">
            <p class="elan-address__name mb-1">{{ checkout.customerName }}</p>
            <p class="mb-0">{{ address.street }}</p>
            <p v-if="address.apartment" class="mb-0">{{ address.apartment }}</p>
            <p class="mb-0">{{ address.city }}, {{ address.postalCode }}</p>
            <p class="mb-3">{{ address.country }}</p>
            <p class="mb-0"><span class="elan-address__key">Phone</span> {{ address.phone }}</p>
            <p class="mb-0"><span class="elan-address__key">Email</span> {{ address.email }}</p>
            <p v-if="address.instructions" class="mt-3 mb-0 elan-address__note">
              “{{ address.instructions }}”
            </p>
          </address>
        </ReviewSection>

        <ReviewSection
          title="Delivery method"
          icon="mdi-truck-outline"
          edit-label="Edit delivery method"
          class="mt-4"
          @edit="router.push({ name: 'checkout-shipping' })"
        >
          <div class="elan-kv">
            <span>
              <strong>{{ checkout.shippingMethod.label }}</strong>
              <span class="elan-kv__sub">{{ checkout.shippingMethod.estimate }}</span>
              <span class="elan-kv__sub">
                Estimated arrival {{ checkout.deliveryEstimate.label }}
              </span>
            </span>
            <span class="elan-numeric elan-kv__value">
              {{ checkout.shippingCost === 0 ? 'Free' : formatCurrency(checkout.shippingCost) }}
            </span>
          </div>
        </ReviewSection>

        <ReviewSection
          title="Payment method"
          icon="mdi-credit-card-outline"
          edit-label="Edit payment method"
          class="mt-4"
          @edit="router.push({ name: 'checkout-payment' })"
        >
          <div class="elan-kv">
            <span>
              <strong>{{ checkout.safePaymentSummary?.label }}</strong>
              <span class="elan-kv__sub">{{ checkout.safePaymentSummary?.description }}</span>
              <span v-if="checkout.safePaymentSummary?.cardHolder" class="elan-kv__sub">
                {{ checkout.safePaymentSummary.cardHolder }}
              </span>
            </span>
            <v-icon
              :icon="checkout.paymentMethod === 'cod' ? 'mdi-cash-multiple' : 'mdi-credit-card-outline'"
              color="primary"
              size="22"
            />
          </div>
        </ReviewSection>
      </v-col>

      <v-col cols="12" lg="5" xl="4">
        <OrderSummary title="Final summary">
          <template #actions>
            <v-checkbox
              v-model="confirmed"
              color="primary"
              class="elan-confirm mt-4"
              density="comfortable"
            >
              <template #label>
                <span class="elan-confirm__label">
                  I confirm that the order information is correct.
                </span>
              </template>
            </v-checkbox>

            <v-btn
              block
              variant="flat"
              color="primary"
              class="elan-cta mt-2"
              :disabled="!canPlaceOrder"
              :loading="checkout.isPlacingOrder"
              append-icon="mdi-lock-check-outline"
              @click="placeOrder"
            >
              {{ checkout.isPlacingOrder ? 'Placing your order…' : 'Place Order' }}
            </v-btn>

            <p class="elan-disclaimer mb-0 mt-3">
              This is a university demo — no payment is taken and no order is shipped.
            </p>
          </template>
        </OrderSummary>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.elan-page {
  max-width: 1240px;
  padding-top: 40px;
  padding-bottom: 64px;
}

.elan-page__head {
  margin-bottom: 28px;
}

.elan-review-items {
  list-style: none;
  margin: 0;
  padding: 0;
}

.elan-review-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid var(--elan-border);
}

.elan-review-item:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.elan-review-item:first-child {
  padding-top: 0;
}

.elan-review-item__body {
  flex: 1 1 auto;
  min-width: 0;
}

.elan-review-item__name {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--elan-text);
}

.elan-review-item__meta {
  font-size: 0.82rem;
  color: var(--elan-text-muted);
}

.elan-review-item__total {
  font-size: 0.95rem;
  font-weight: 600;
  white-space: nowrap;
}

.elan-address {
  font-style: normal;
  font-size: 0.92rem;
  line-height: 1.6;
  color: var(--elan-text);
}

.elan-address__name {
  font-weight: 600;
}

.elan-address__key {
  display: inline-block;
  min-width: 56px;
  color: var(--elan-text-muted);
}

.elan-address__note {
  font-size: 0.85rem;
  color: var(--elan-text-muted);
}

.elan-kv {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.elan-kv__sub {
  display: block;
  font-size: 0.82rem;
  color: var(--elan-text-muted);
  margin-top: 2px;
}

.elan-kv__value {
  font-weight: 600;
  white-space: nowrap;
}

.elan-confirm__label {
  font-size: 0.88rem;
  line-height: 1.45;
  color: var(--elan-text);
}

.elan-disclaimer {
  font-size: 0.74rem;
  color: var(--elan-text-muted);
  text-align: center;
}

/* Very small screens: let the line total drop below the product name. */
@media (max-width: 400px) {
  .elan-review-item {
    flex-wrap: wrap;
  }

  .elan-review-item__body {
    flex: 1 1 55%;
  }

  .elan-review-item__total {
    flex: 1 1 100%;
    text-align: right;
  }
}
</style>
