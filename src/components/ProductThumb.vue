<script setup>
import { computed, ref } from 'vue'

/**
 * Product image with a graceful, on-brand fallback. Remote photography can fail
 * on a flaky demo connection — the shopper should still see a tidy tile rather
 * than a broken image.
 */
const props = defineProps({
  src: { type: String, default: '' },
  alt: { type: String, default: '' },
  name: { type: String, default: '' },
  width: { type: [Number, String], default: 96 },
  aspectRatio: { type: [Number, String], default: 0.78 },
})

const failed = ref(false)
const initial = computed(() => (props.name || 'E').trim().charAt(0).toUpperCase())
</script>

<template>
  <div class="elan-thumb" :style="{ width: typeof width === 'number' ? `${width}px` : width }">
    <v-img
      v-if="src && !failed"
      :src="src"
      :alt="alt || name"
      :aspect-ratio="aspectRatio"
      cover
      class="elan-thumb__img"
      @error="failed = true"
    >
      <template #placeholder>
        <div class="elan-thumb__loading">
          <v-progress-circular indeterminate size="20" width="2" color="primary" />
        </div>
      </template>
    </v-img>

    <div
      v-else
      class="elan-thumb__fallback"
      :style="{ aspectRatio: String(aspectRatio) }"
      role="img"
      :aria-label="alt || name || 'Product image unavailable'"
    >
      <span aria-hidden="true">{{ initial }}</span>
    </div>
  </div>
</template>

<style scoped>
.elan-thumb {
  flex: 0 0 auto;
  align-self: flex-start; /* never stretch to the row height */
  border-radius: var(--elan-radius-thumb);
  overflow: hidden;
  background: var(--elan-secondary-soft);
  border: 1px solid var(--elan-border);
}

.elan-thumb__img {
  display: block;
}

.elan-thumb__loading,
.elan-thumb__fallback {
  display: grid;
  place-items: center;
  height: 100%;
  width: 100%;
  background: linear-gradient(150deg, var(--elan-secondary-soft), var(--elan-primary-soft));
}

.elan-thumb__fallback span {
  font-size: 1.5rem;
  font-weight: 300;
  letter-spacing: 0.08em;
  color: var(--elan-primary);
}
</style>
