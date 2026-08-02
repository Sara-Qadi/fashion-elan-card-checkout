<script setup>
const props = defineProps({
  modelValue: { type: String, default: null },
})

const emit = defineEmits(['update:modelValue'])

const METHODS = [
  {
    id: 'card',
    label: 'Credit or Debit Card',
    description: 'Visa, Mastercard, American Express',
    icon: 'mdi-credit-card-outline',
  },
  {
    id: 'cod',
    label: 'Cash on Delivery',
    description: 'Pay the courier when your order arrives',
    icon: 'mdi-cash-multiple',
  },
]

function select(id) {
  emit('update:modelValue', id)
}
</script>

<template>
  <fieldset class="elan-pay">
    <legend class="elan-heading mb-1">Payment method</legend>
    <p class="elan-muted elan-pay__intro mb-5">Choose how you would like to pay for this order.</p>

    <div class="elan-pay__grid">
      <button
        v-for="method in METHODS"
        :key="method.id"
        type="button"
        class="elan-pay__option elan-focusable"
        :class="{ 'is-selected': props.modelValue === method.id }"
        :aria-pressed="props.modelValue === method.id"
        @click="select(method.id)"
      >
        <span class="elan-pay__icon">
          <v-icon :icon="method.icon" size="22" />
        </span>
        <span class="elan-pay__text">
          <span class="elan-pay__label">{{ method.label }}</span>
          <span class="elan-pay__desc">{{ method.description }}</span>
        </span>
        <v-icon
          :icon="props.modelValue === method.id ? 'mdi-check-circle' : 'mdi-checkbox-blank-circle-outline'"
          :color="props.modelValue === method.id ? 'primary' : 'medium-emphasis'"
          size="20"
          class="elan-pay__check"
        />
      </button>
    </div>
  </fieldset>
</template>

<style scoped>
.elan-pay {
  border: 0;
  padding: 0;
  margin: 0;
}

.elan-pay__intro {
  font-size: 0.9rem;
}

.elan-pay__grid {
  display: grid;
  gap: 12px;
}

.elan-pay__option {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  text-align: left;
  padding: 16px;
  border: 1.5px solid var(--elan-border);
  border-radius: var(--elan-radius-card);
  background: var(--elan-surface);
  cursor: pointer;
  transition: border-color 0.15s ease, background-color 0.15s ease;
  font: inherit;
}

.elan-pay__option:hover {
  border-color: var(--elan-secondary);
}

.elan-pay__option.is-selected {
  border-color: var(--elan-primary);
  background: var(--elan-primary-soft);
}

.elan-pay__icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  flex: 0 0 auto;
  border-radius: 12px;
  background: var(--elan-background);
  color: var(--elan-primary);
}

.elan-pay__option.is-selected .elan-pay__icon {
  background: var(--elan-surface);
}

.elan-pay__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1 1 auto;
  min-width: 0;
}

.elan-pay__label {
  font-size: 0.98rem;
  font-weight: 600;
  color: var(--elan-text);
}

.elan-pay__desc {
  font-size: 0.82rem;
  color: var(--elan-text-muted);
}

.elan-pay__check {
  flex: 0 0 auto;
}

@media (min-width: 700px) {
  .elan-pay__grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
