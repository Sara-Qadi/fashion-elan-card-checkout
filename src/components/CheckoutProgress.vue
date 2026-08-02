<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

/**
 * Vuetify-based step indicator for the checkout flow.
 * Completed steps are real buttons so shoppers can go back without the browser
 * back button; upcoming steps are inert.
 */
const props = defineProps({
  current: { type: Number, required: true }, // 1 = shipping, 2 = payment, 3 = review
})

const STEPS = [
  { index: 1, label: 'Shipping', route: 'checkout-shipping' },
  { index: 2, label: 'Payment', route: 'checkout-payment' },
  { index: 3, label: 'Review', route: 'checkout-review' },
]

const router = useRouter()

const steps = computed(() =>
  STEPS.map((step) => ({
    ...step,
    state: step.index < props.current ? 'done' : step.index === props.current ? 'active' : 'todo',
  })),
)

function goToStep(step) {
  if (step.state === 'done') router.push({ name: step.route })
}
</script>

<template>
  <nav class="elan-progress elan-no-print" aria-label="Checkout progress">
    <ol class="elan-progress__list">
      <li v-for="(step, i) in steps" :key="step.index" class="elan-progress__item">
        <component
          :is="step.state === 'done' ? 'button' : 'div'"
          class="elan-progress__step elan-focusable"
          :class="`elan-progress__step--${step.state}`"
          :type="step.state === 'done' ? 'button' : undefined"
          :aria-current="step.state === 'active' ? 'step' : undefined"
          :aria-label="
            step.state === 'done' ? `Step ${step.index}, ${step.label}, completed — go back` : undefined
          "
          @click="goToStep(step)"
        >
          <span class="elan-progress__bullet">
            <v-icon v-if="step.state === 'done'" icon="mdi-check" size="16" />
            <template v-else>{{ step.index }}</template>
          </span>
          <span class="elan-progress__label">{{ step.label }}</span>
        </component>

        <span v-if="i < steps.length - 1" class="elan-progress__line" aria-hidden="true" />
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.elan-progress__list {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  list-style: none;
  padding: 0;
  margin: 0 auto;
  width: 100%;
  max-width: 620px;
}

.elan-progress__item {
  display: flex;
  align-items: center;
  min-width: 0;
}

/* The connector absorbs the spare width, so the row never outgrows the screen. */
.elan-progress__item:not(:last-child) {
  flex: 1 1 auto;
}

.elan-progress__step {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  min-width: 0;
  gap: 10px;
  background: none;
  border: 0;
  padding: 6px 8px;
  border-radius: 999px;
  font: inherit;
  color: var(--elan-text-muted);
}

.elan-progress__step--done {
  cursor: pointer;
  color: var(--elan-primary);
}

.elan-progress__step--active {
  color: var(--elan-text);
}

.elan-progress__bullet {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1.5px solid var(--elan-border);
  background: var(--elan-surface);
  font-size: 0.85rem;
  font-weight: 600;
  flex: 0 0 auto;
}

.elan-progress__step--done .elan-progress__bullet {
  background: var(--elan-primary);
  border-color: var(--elan-primary);
  color: #fff;
}

.elan-progress__step--active .elan-progress__bullet {
  border-color: var(--elan-primary);
  color: var(--elan-primary);
  box-shadow: 0 0 0 4px var(--elan-primary-soft);
}

.elan-progress__label {
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.elan-progress__line {
  display: block;
  flex: 1 1 auto;
  min-width: 8px;
  max-width: 72px;
  height: 1.5px;
  margin: 0 6px;
  background: var(--elan-border);
}

@media (max-width: 599px) {
  .elan-progress__label {
    font-size: 0.78rem;
  }

  .elan-progress__step {
    gap: 6px;
    padding: 4px 2px;
  }

  .elan-progress__bullet {
    width: 26px;
    height: 26px;
    font-size: 0.75rem;
  }

  .elan-progress__line {
    margin: 0 4px;
  }
}

@media (max-width: 359px) {
  .elan-progress__label {
    font-size: 0.72rem;
  }
}
</style>
