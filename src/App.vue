<script setup>
import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import AppSnackbar from '@/components/AppSnackbar.vue'
import { useSnackbar } from '@/composables/useSnackbar'

const route = useRoute()
const router = useRouter()
const { info } = useSnackbar()

/** Router guards redirect with `?reason=…`; this turns it into one message. */
const REDIRECT_MESSAGES = {
  'empty-cart': 'Your bag is empty — add something before checking out.',
  'missing-shipping': 'Please complete your shipping details first.',
  'missing-payment': 'Please choose a payment method first.',
}

watch(
  () => route.query.reason,
  (reason) => {
    const message = REDIRECT_MESSAGES[reason]
    if (!message) return

    info(message)
    // Drop the flag so a refresh does not repeat the message.
    const query = { ...route.query }
    delete query.reason
    router.replace({ path: route.path, query })
  },
  { immediate: true },
)
</script>

<template>
  <v-app>
    <AppHeader />

    <v-main class="elan-main">
      <router-view v-slot="{ Component }">
        <transition name="elan-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </v-main>

    <AppFooter />
    <AppSnackbar />
  </v-app>
</template>

<style scoped>
.elan-main {
  background-color: var(--elan-background);
  min-height: 70vh;
}
</style>
