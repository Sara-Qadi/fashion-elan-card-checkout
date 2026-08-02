<script setup>
defineProps({
  title: { type: String, required: true },
  icon: { type: String, default: '' },
  editLabel: { type: String, default: '' },
})

const emit = defineEmits(['edit'])
</script>

<template>
  <v-card class="elan-card elan-review-section">
    <header class="elan-review-section__head">
      <h2 class="elan-heading mb-0">
        <v-icon v-if="icon" :icon="icon" size="18" class="mr-2" color="primary" />
        {{ title }}
      </h2>

      <v-btn
        v-if="editLabel"
        variant="text"
        size="small"
        color="primary"
        class="elan-link-button elan-no-print"
        :aria-label="editLabel"
        @click="emit('edit')"
      >
        Edit
      </v-btn>
    </header>

    <v-divider class="elan-divider" />

    <div class="elan-review-section__body">
      <slot />
    </div>
  </v-card>
</template>

<style scoped>
.elan-review-section {
  padding: 20px 24px 24px;
}

.elan-review-section__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.elan-review-section__body {
  padding-top: 18px;
}
</style>
