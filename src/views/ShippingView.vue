<script setup>
import { nextTick, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import CheckoutProgress from '@/components/CheckoutProgress.vue'
import OrderSummary from '@/components/OrderSummary.vue'
import ShippingForm from '@/components/ShippingForm.vue'
import ShippingMethodSelector from '@/components/ShippingMethodSelector.vue'
import { useSnackbar } from '@/composables/useSnackbar'
import { useCheckoutStore } from '@/stores/checkout'
import { validateShippingAddress } from '@/utils/validation'

const router = useRouter()
const checkout = useCheckoutStore()
const { error } = useSnackbar()

const formRef = ref(null)
const address = ref({ ...checkout.shippingAddress })

/** Readable summary of what is blocking the shopper, shown above the form. */
const blockingErrors = ref([])

// Persist as the shopper types, so a refresh never loses progress.
watch(address, (value) => checkout.setShippingDraft(value), { deep: true })

// Hide the summary as soon as the shopper starts correcting things.
watch(address, () => { blockingErrors.value = [] }, { deep: true })

/** Brings the first offending field into view — it is often off-screen. */
async function revealFirstError() {
  await nextTick()
  const field = document.querySelector('.v-input--error')
  if (!field) return
  field.scrollIntoView({ behavior: 'smooth', block: 'center' })
  field.querySelector('input, textarea')?.focus({ preventScroll: true })
}

async function continueToPayment() {
  const { valid } = await formRef.value.validate()
  const check = validateShippingAddress(address.value)

  if (!valid || !check.valid) {
    const messages = Object.values(check.errors)
    blockingErrors.value = messages.length
      ? messages
      : ['Some details still need attention — check the highlighted fields below.']

    error(
      messages.length === 1
        ? messages[0]
        : `${messages.length || 'Some'} fields still need your attention.`,
    )
    revealFirstError()
    return
  }

  blockingErrors.value = []
  checkout.saveShippingAddress(address.value)

  // Reflect the trimmed values back into the form.
  address.value = { ...checkout.shippingAddress }
  router.push({ name: 'checkout-payment' })
}
</script>

<template>
  <v-container class="elan-page px-4 px-sm-6">
    <CheckoutProgress :current="1" class="mb-8" />

    <header class="elan-page__head">
      <p class="elan-eyebrow mb-2">Step 2 of 4</p>
      <h1 class="elan-display mb-0">Shipping</h1>
    </header>

    <v-row>
      <v-col cols="12" lg="7" xl="8">
        <v-form ref="formRef" validate-on="blur" @submit.prevent="continueToPayment">
          <v-alert
            v-if="blockingErrors.length"
            type="error"
            variant="tonal"
            class="mb-4"
            icon="mdi-alert-circle-outline"
            role="alert"
          >
            <p class="font-weight-medium mb-1">Please complete these before continuing</p>
            <ul class="elan-error-list">
              <li v-for="message in blockingErrors" :key="message">{{ message }}</li>
            </ul>
          </v-alert>

          <v-card class="elan-card pa-6 pa-sm-8">
            <ShippingForm v-model="address" />
          </v-card>

          <v-card class="elan-card pa-6 pa-sm-8 mt-4">
            <ShippingMethodSelector />
          </v-card>

          <div class="elan-actions elan-no-print">
            <v-btn
              variant="outlined"
              color="primary"
              class="elan-cta"
              prepend-icon="mdi-arrow-left"
              :to="{ name: 'cart' }"
            >
              Back to Cart
            </v-btn>

            <v-btn
              type="submit"
              variant="flat"
              color="primary"
              class="elan-cta px-8"
              append-icon="mdi-arrow-right"
            >
              Continue to Payment
            </v-btn>
          </div>
        </v-form>
      </v-col>

      <v-col cols="12" lg="5" xl="4">
        <OrderSummary show-free-shipping-hint />
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

.elan-error-list {
  margin: 0;
  padding-left: 20px;
  font-size: 0.88rem;
  line-height: 1.55;
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
