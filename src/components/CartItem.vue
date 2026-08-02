<script setup>
import { computed } from 'vue'

import ProductThumb from '@/components/ProductThumb.vue'
import { formatCurrency } from '@/utils/currency'
import { PRICING_RULES, getLineTotal } from '@/utils/pricing'

const props = defineProps({
  item: { type: Object, required: true },
})

const emit = defineEmits(['increment', 'decrement', 'remove'])

const lineTotal = computed(() => getLineTotal(props.item))
const isDiscounted = computed(
  () => Number(props.item.originalPrice) > Number(props.item.price),
)
const savedPercent = computed(() =>
  isDiscounted.value
    ? Math.round((1 - props.item.price / props.item.originalPrice) * 100)
    : 0,
)
const atMaxQuantity = computed(() => props.item.quantity >= PRICING_RULES.maxQuantityPerLine)
const atMinQuantity = computed(() => props.item.quantity <= 1)
</script>

<template>
  <article class="elan-line">
    <ProductThumb
      :src="item.image"
      :alt="item.imageAlt"
      :name="item.name"
      class="elan-line__media"
    />

    <div class="elan-line__body">
      <div class="elan-line__head">
        <div class="elan-line__titles">
          <p class="elan-line__category mb-1">{{ item.category }}</p>
          <h3 class="elan-line__name mb-2">{{ item.name }}</h3>
        </div>

        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          color="medium-emphasis"
          class="elan-line__remove"
          :aria-label="`Remove ${item.name} from your bag`"
          @click="emit('remove', item.id)"
        />
      </div>

      <div class="elan-line__attributes">
        <span class="elan-line__attribute">
          <span class="elan-line__attribute-key">Colour</span>
          {{ item.color }}
        </span>
        <span v-if="item.size" class="elan-line__attribute">
          <span class="elan-line__attribute-key">Size</span>
          {{ item.size }}
        </span>
      </div>

      <div class="elan-line__price">
        <span class="elan-numeric elan-line__unit">{{ formatCurrency(item.price) }}</span>
        <template v-if="isDiscounted">
          <s class="elan-numeric elan-line__was">{{ formatCurrency(item.originalPrice) }}</s>
          <v-chip size="x-small" color="primary" variant="tonal" class="elan-line__badge">
            -{{ savedPercent }}%
          </v-chip>
        </template>
      </div>

      <div class="elan-line__foot">
        <div
          class="elan-qty"
          role="group"
          :aria-label="`Quantity for ${item.name}`"
        >
          <v-btn
            icon="mdi-minus"
            variant="text"
            size="small"
            density="comfortable"
            :disabled="atMinQuantity"
            :aria-label="`Decrease quantity of ${item.name}`"
            @click="emit('decrement', item.id)"
          />
          <span class="elan-qty__value elan-numeric" aria-live="polite">{{ item.quantity }}</span>
          <v-btn
            icon="mdi-plus"
            variant="text"
            size="small"
            density="comfortable"
            :disabled="atMaxQuantity"
            :aria-label="`Increase quantity of ${item.name}`"
            @click="emit('increment', item.id)"
          />
        </div>

        <p class="elan-line__total elan-numeric mb-0">
          <span class="d-sm-none elan-line__total-key">Subtotal</span>
          {{ formatCurrency(lineTotal) }}
        </p>
      </div>
    </div>
  </article>
</template>

<style scoped>
.elan-line {
  display: flex;
  gap: 16px;
  padding: 20px 0;
}

.elan-line__media {
  width: 104px;
}

.elan-line__body {
  flex: 1 1 auto;
  min-width: 0;
}

.elan-line__head {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.elan-line__titles {
  flex: 1 1 auto;
  min-width: 0;
}

.elan-line__category {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--elan-secondary);
}

.elan-line__name {
  font-size: 1.02rem;
  font-weight: 500;
  line-height: 1.3;
  color: var(--elan-text);
}

.elan-line__remove {
  margin-top: -4px;
  margin-right: -6px;
}

.elan-line__attributes {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 20px;
  margin-bottom: 12px;
}

.elan-line__attribute {
  font-size: 0.85rem;
  color: var(--elan-text);
}

.elan-line__attribute-key {
  color: var(--elan-text-muted);
  margin-right: 6px;
}

.elan-line__price {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.elan-line__unit {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--elan-text);
}

.elan-line__was {
  font-size: 0.85rem;
  color: var(--elan-text-muted);
}

.elan-line__badge {
  font-weight: 700;
}

.elan-line__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.elan-qty {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  border: 1px solid var(--elan-border);
  border-radius: 999px;
  padding: 2px;
  background: var(--elan-surface);
}

.elan-qty__value {
  min-width: 32px;
  text-align: center;
  font-size: 0.95rem;
  font-weight: 600;
}

.elan-line__total {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--elan-text);
}

.elan-line__total-key {
  font-size: 0.8rem;
  font-weight: 400;
  color: var(--elan-text-muted);
  margin-right: 8px;
}

@media (max-width: 599px) {
  .elan-line {
    gap: 12px;
  }

  .elan-line__media {
    width: 84px;
  }

  .elan-line__name {
    font-size: 0.95rem;
  }
}
</style>
