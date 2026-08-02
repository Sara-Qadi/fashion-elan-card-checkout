<script setup>
import { useSnackbar } from '@/composables/useSnackbar'

const { state, hide } = useSnackbar()
</script>

<template>
  <v-snackbar
    v-model="state.visible"
    :color="state.color"
    :timeout="state.timeout"
    location="bottom"
    class="elan-snackbar elan-no-print"
  >
    <div class="d-flex align-center ga-3">
      <v-icon :icon="state.icon" size="20" />
      <span class="elan-snackbar__text">{{ state.message }}</span>
    </div>

    <template #actions>
      <v-btn variant="text" color="white" size="small" aria-label="Dismiss message" @click="hide">
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>

<style scoped>
.elan-snackbar__text {
  font-size: 0.9rem;
  line-height: 1.35;
}
</style>
