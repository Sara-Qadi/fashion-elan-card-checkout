<script setup>
import { computed, ref, watch } from 'vue'

import { buildSafePaymentSummary } from '@/utils/order'
import {
  CARD_BRANDS,
  cardNameRule,
  cardNumberRule,
  cvvRule,
  detectCardBrand,
  digitsOnly,
  expiryRule,
  formatCardNumber,
  formatExpiry,
} from '@/utils/validation'

/**
 * MOCK card form.
 *
 * Security posture for this demo:
 *  - the PAN and CVV live ONLY in the refs below (component state)
 *  - they are never written to Pinia, never written to localStorage, never
 *    logged, and never sent anywhere
 *  - the parent only ever receives `{ valid, summary }`, where `summary` is
 *    brand + last four digits
 */

const emit = defineEmits(['change'])

const cardName = ref('')
const cardNumber = ref('')
const expiry = ref('')
const cvv = ref('')

const touched = ref({ cardName: false, cardNumber: false, expiry: false, cvv: false })

const brand = computed(() => detectCardBrand(cardNumber.value))
const brandLabel = computed(() => CARD_BRANDS[brand.value]?.label ?? 'Card')
const showBrand = computed(() => digitsOnly(cardNumber.value).length >= 4 && brand.value !== 'unknown')
const cvvLength = computed(() => CARD_BRANDS[brand.value]?.cvvLength ?? 3)

// Input masking — the model always holds the display-formatted value, and every
// rule strips the formatting before checking it.
watch(cardNumber, (value) => {
  const formatted = formatCardNumber(value)
  if (formatted !== value) cardNumber.value = formatted
})

watch(expiry, (value) => {
  const formatted = formatExpiry(value)
  if (formatted !== value) expiry.value = formatted
})

watch(cvv, (value) => {
  const digits = digitsOnly(value).slice(0, cvvLength.value)
  if (digits !== value) cvv.value = digits
})

const results = computed(() => ({
  cardName: cardNameRule(cardName.value),
  cardNumber: cardNumberRule(cardNumber.value),
  expiry: expiryRule(expiry.value),
  cvv: cvvRule(brand.value)(cvv.value),
}))

const isValid = computed(() => Object.values(results.value).every((result) => result === true))

// Rules only fire after a field has been blurred once, so the form does not
// greet the shopper with four red errors.
const rulesFor = (field) => [() => (touched.value[field] ? results.value[field] : true)]

function markTouched(field) {
  touched.value[field] = true
}

/** Exposed so the parent can force-show every error when the user tries to continue. */
function touchAll() {
  Object.keys(touched.value).forEach((field) => {
    touched.value[field] = true
  })
}

defineExpose({ touchAll })

watch(
  [isValid, cardNumber, cardName],
  () => {
    emit('change', {
      valid: isValid.value,
      summary: isValid.value
        ? buildSafePaymentSummary({
            method: 'card',
            cardNumber: cardNumber.value,
            cardName: cardName.value,
          })
        : null,
    })
  },
  { immediate: true },
)
</script>

<template>
  <div class="elan-card-form">
    <v-alert
      type="info"
      variant="tonal"
      color="secondary"
      density="compact"
      class="mb-5"
      icon="mdi-credit-card-check-outline"
    >
      <span class="elan-card-form__test">
        Test card <strong>4242 4242 4242 4242</strong> · any future expiry · any 3-digit CVV
      </span>
    </v-alert>

    <v-row dense>
      <v-col cols="12">
        <v-text-field
          v-model="cardName"
          label="Name on card *"
          autocomplete="off"
          :rules="rulesFor('cardName')"
          @blur="markTouched('cardName')"
        />
      </v-col>

      <v-col cols="12">
        <v-text-field
          v-model="cardNumber"
          label="Card number *"
          inputmode="numeric"
          placeholder="4242 4242 4242 4242"
          autocomplete="off"
          :rules="rulesFor('cardNumber')"
          @blur="markTouched('cardNumber')"
        >
          <template #append-inner>
            <v-chip v-if="showBrand" size="x-small" color="primary" variant="tonal" class="font-weight-bold">
              {{ brandLabel }}
            </v-chip>
            <v-icon v-else icon="mdi-credit-card-outline" size="20" color="medium-emphasis" />
          </template>
        </v-text-field>
      </v-col>

      <v-col cols="6">
        <v-text-field
          v-model="expiry"
          label="Expiry (MM/YY) *"
          inputmode="numeric"
          placeholder="09/29"
          autocomplete="off"
          :rules="rulesFor('expiry')"
          @blur="markTouched('expiry')"
        />
      </v-col>

      <v-col cols="6">
        <v-text-field
          v-model="cvv"
          label="CVV *"
          type="password"
          inputmode="numeric"
          :placeholder="'•'.repeat(cvvLength)"
          autocomplete="off"
          :rules="rulesFor('cvv')"
          @blur="markTouched('cvv')"
        />
      </v-col>
    </v-row>

    <p class="elan-card-form__note mb-0">
      <v-icon icon="mdi-shield-lock-outline" size="15" />
      Your card details stay in this browser tab. Nothing is transmitted or stored — only the card
      brand and last four digits are kept for the order summary.
    </p>
  </div>
</template>

<style scoped>
.elan-card-form__test {
  font-size: 0.85rem;
}

.elan-card-form__note {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 16px;
  font-size: 0.78rem;
  line-height: 1.5;
  color: var(--elan-text-muted);
}
</style>
