<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import CardPaymentForm from '@/components/CardPaymentForm.vue'
import CheckoutProgress from '@/components/CheckoutProgress.vue'
import OrderSummary from '@/components/OrderSummary.vue'
import PaymentMethodSelector from '@/components/PaymentMethodSelector.vue'
import { useSnackbar } from '@/composables/useSnackbar'
import { useCheckoutStore } from '@/stores/checkout'
import { buildSafePaymentSummary } from '@/utils/order'

const router = useRouter()
const checkout = useCheckoutStore()
const { error } = useSnackbar()

const cardFormRef = ref(null)

// Restores the previous choice on refresh; card details themselves are never
// restored, so a returning shopper re-enters them.
const method = ref(checkout.paymentMethod)
const cardState = ref({ valid: false, summary: null })

const canContinue = computed(() => {
  if (method.value === 'cod') return true
  if (method.value === 'card') return cardState.value.valid
  return false
})

watch(method, (value) => {
  if (value === 'cod') {
    checkout.setPaymentMethod('cod', buildSafePaymentSummary({ method: 'cod' }))
  } else {
    // Switching back to card invalidates any stored summary until the mock card
    // form validates again.
    checkout.setPaymentMethod('card', cardState.value.summary)
  }
})

function onCardChange(state) {
  cardState.value = state
  if (method.value === 'card') checkout.setPaymentMethod('card', state.summary)
}

function reviewOrder() {
  if (!method.value) {
    error('Choose a payment method to continue.')
    return
  }

  if (method.value === 'card' && !cardState.value.valid) {
    cardFormRef.value?.touchAll()
    error('Please check your card details — try 4242 4242 4242 4242.')
    return
  }

  if (!checkout.hasValidPayment) {
    error('Payment details are incomplete.')
    return
  }

  router.push({ name: 'checkout-review' })
}
</script>

<template>
  <v-container class="elan-page px-4 px-sm-6">
    <CheckoutProgress :current="2" class="mb-8" />

    <header class="elan-page__head">
      <p class="elan-eyebrow mb-2">Step 3 of 4</p>
      <h1 class="elan-display mb-0">Payment</h1>
    </header>

    <v-row>
      <v-col cols="12" lg="7" xl="8">
        <v-alert
          type="warning"
          variant="tonal"
          color="primary"
          density="comfortable"
          icon="mdi-information-outline"
          class="mb-4"
        >
          <strong>Demo checkout — no real payment will be processed.</strong>
          This microfrontend has no backend and is not connected to any payment provider.
        </v-alert>

        <v-card class="elan-card pa-6 pa-sm-8">
          <PaymentMethodSelector v-model="method" />

          <div v-if="method" class="elan-payment__details">
            <v-divider class="elan-divider my-6" />

            <CardPaymentForm v-if="method === 'card'" ref="cardFormRef" @change="onCardChange" />

            <div v-else class="elan-cod">
              <div class="elan-cod__icon" aria-hidden="true">
                <v-icon icon="mdi-cash-multiple" size="26" color="primary" />
              </div>
              <div>
                <h3 class="elan-heading mb-2">Pay when it arrives</h3>
                <p class="elan-muted mb-0">
                  Your order total is collected in cash by the courier at your delivery address.
                  Please have the exact amount ready — no card details are needed for this option.
                </p>
              </div>
            </div>
          </div>
        </v-card>

        <div class="elan-actions elan-no-print">
          <v-btn
            variant="outlined"
            color="primary"
            class="elan-cta"
            prepend-icon="mdi-arrow-left"
            :to="{ name: 'checkout-shipping' }"
          >
            Back to Shipping
          </v-btn>

          <v-btn
            variant="flat"
            color="primary"
            class="elan-cta px-8"
            append-icon="mdi-arrow-right"
            :disabled="!canContinue"
            @click="reviewOrder"
          >
            Review Order
          </v-btn>
        </div>
      </v-col>

      <v-col cols="12" lg="5" xl="4">
        <OrderSummary />
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

.elan-cod {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.elan-cod__icon {
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: var(--elan-primary-soft);
}

.elan-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
  margin-top: 24px;
}

@media (max-width: 599px) {
  .elan-page {
    padding-top: 24px;
  }

  .elan-actions {
    flex-direction: column-reverse;
  }

  .elan-actions .v-btn {
    width: 100%;
  }
}
</style>
