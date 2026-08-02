<script setup>
import { computed, ref } from 'vue'

import { useSnackbar } from '@/composables/useSnackbar'
import { useCartStore } from '@/stores/cart'
import { formatCurrency } from '@/utils/currency'

const cart = useCartStore()
const { success, error } = useSnackbar()

const code = ref('')
const feedback = ref(null) // { type: 'success' | 'error', message: string }

const isApplied = computed(() => cart.hasPromoApplied)

function apply() {
  const result = cart.applyPromoCode(code.value)

  feedback.value = { type: result.ok ? 'success' : 'error', message: result.message }

  if (result.ok) {
    code.value = ''
    success(result.message)
  } else {
    error(result.message)
  }
}

function remove() {
  const removed = cart.removePromoCode()
  feedback.value = null
  if (removed) success(`${removed} removed from your order.`)
}
</script>

<template>
  <div class="elan-promo">
    <template v-if="isApplied">
      <div class="elan-promo__applied">
        <div class="d-flex align-center ga-2 flex-wrap">
          <v-icon icon="mdi-tag-check-outline" size="18" color="success" />
          <span class="elan-promo__applied-label">Promo applied</span>
          <v-chip size="small" color="success" variant="tonal" class="font-weight-bold">
            {{ cart.promoCode }}
          </v-chip>
        </div>

        <div class="d-flex align-center justify-space-between mt-2">
          <span class="elan-promo__saving elan-numeric">
            You save {{ formatCurrency(cart.discountAmount) }}
          </span>
          <v-btn
            variant="text"
            size="small"
            color="primary"
            class="elan-link-button"
            aria-label="Remove the applied promo code"
            @click="remove"
          >
            Remove
          </v-btn>
        </div>
      </div>
    </template>

    <template v-else>
      <form class="elan-promo__form" @submit.prevent="apply">
        <v-text-field
          v-model="code"
          label="Promo code"
          placeholder="ELAN10"
          density="comfortable"
          autocomplete="off"
          spellcheck="false"
          :error="feedback?.type === 'error'"
          class="elan-promo__input"
        />
        <v-btn type="submit" variant="outlined" color="primary" class="elan-promo__submit">
          Apply
        </v-btn>
      </form>

      <p v-if="feedback" class="elan-promo__feedback mb-0" :class="`is-${feedback.type}`" role="status">
        {{ feedback.message }}
      </p>
      <p v-else class="elan-promo__hint mb-0">Try <strong>ELAN10</strong> for 10% off.</p>
    </template>
  </div>
</template>

<style scoped>
.elan-promo__form {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.elan-promo__input {
  flex: 1 1 auto;
  min-width: 0;
}

.elan-promo__submit {
  flex: 0 0 auto;
  height: 48px;
}

.elan-promo__feedback,
.elan-promo__hint {
  font-size: 0.78rem;
  margin-top: 8px;
  line-height: 1.4;
}

.elan-promo__feedback.is-error {
  color: var(--elan-error);
}

.elan-promo__feedback.is-success {
  color: var(--elan-text-muted);
}

.elan-promo__hint {
  color: var(--elan-text-muted);
}

.elan-promo__applied {
  border: 1px dashed var(--elan-border);
  border-radius: var(--elan-radius-input);
  padding: 12px 14px;
  background: var(--elan-background);
}

.elan-promo__applied-label {
  font-size: 0.85rem;
  font-weight: 600;
}

.elan-promo__saving {
  font-size: 0.85rem;
  color: var(--elan-text-muted);
}
</style>
