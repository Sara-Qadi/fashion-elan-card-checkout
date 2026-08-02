<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import CartItem from '@/components/CartItem.vue'
import EmptyCart from '@/components/EmptyCart.vue'
import OrderSummary from '@/components/OrderSummary.vue'
import { useSnackbar } from '@/composables/useSnackbar'
import { requestCatalogNavigation } from '@/integration/checkoutBridge'
import { useCartStore } from '@/stores/cart'
import { useCheckoutStore } from '@/stores/checkout'

const router = useRouter()
const cart = useCartStore()
const checkout = useCheckoutStore()
const { success, info } = useSnackbar()

const pendingRemoval = ref(null)

// Derived v-model: only a `false` from the dialog clears the pending item, so
// the dialog's own "opened" emit cannot immediately close it again.
const isRemovalDialogOpen = computed({
  get: () => Boolean(pendingRemoval.value),
  set: (open) => {
    if (!open) pendingRemoval.value = null
  },
})

// Held separately from `pendingRemoval` so the name does not blank out while
// the dialog plays its closing animation.
const removalName = ref('')

function confirmRemoval(id) {
  const item = cart.findItem(id)
  if (!item) return
  pendingRemoval.value = item
  removalName.value = item.name
}

function removeConfirmed() {
  const item = pendingRemoval.value
  pendingRemoval.value = null
  if (!item) return

  const removed = cart.removeItem(item.id)
  if (removed) success(`${removed.name} removed from your bag.`)
}

function restoreDemoCart() {
  cart.resetDemoCart()
  success('Demo bag restored with 3 sample pieces.')
}

/**
 * The Catalog microfrontend is not connected yet, so this asks the (future)
 * shell first and only then falls back to a local, non-broken behaviour.
 */
function continueShopping() {
  const outcome = requestCatalogNavigation({
    reason: 'continue-shopping',
    fallback: () =>
      info('The Catalog microfrontend is not connected yet — restore the demo bag to keep exploring.'),
  })

  if (outcome === 'shell') info('Handing navigation over to the shell application…')
}

function proceedToCheckout() {
  if (cart.isEmpty) return
  checkout.startCheckout()
  router.push({ name: 'checkout-shipping' })
}
</script>

<template>
  <v-container class="elan-page px-4 px-sm-6">
    <header class="elan-page__head">
      <p class="elan-eyebrow mb-2">Step 1 of 4</p>
      <h1 class="elan-display mb-2">Shopping Bag</h1>
      <p class="elan-page__subtitle mb-0">
        {{ cart.itemCount }} item{{ cart.itemCount === 1 ? '' : 's' }} in your bag
      </p>
    </header>

    <EmptyCart
      v-if="cart.isEmpty"
      class="elan-page__empty"
      @continue-shopping="continueShopping"
      @restore-demo="restoreDemoCart"
    />

    <v-row v-else>
      <v-col cols="12" lg="7" xl="8">
        <v-card class="elan-card elan-bag">
          <div class="elan-bag__head">
            <h2 class="elan-heading mb-0">Your pieces</h2>
            <v-btn
              variant="text"
              size="small"
              color="primary"
              class="elan-link-button"
              prepend-icon="mdi-refresh"
              aria-label="Restore the demo bag with the sample products"
              @click="restoreDemoCart"
            >
              Restore demo bag
            </v-btn>
          </div>

          <v-divider class="elan-divider" />

          <ul class="elan-bag__list">
            <li v-for="(item, index) in cart.items" :key="item.id">
              <CartItem
                :item="item"
                @increment="cart.incrementQuantity"
                @decrement="cart.decrementQuantity"
                @remove="confirmRemoval"
              />
              <v-divider v-if="index < cart.items.length - 1" class="elan-divider" />
            </li>
          </ul>
        </v-card>

        <v-alert
          type="info"
          variant="tonal"
          color="secondary"
          density="comfortable"
          class="mt-4"
          icon="mdi-truck-outline"
        >
          Standard delivery is free once your discounted subtotal reaches $150.
        </v-alert>
      </v-col>

      <v-col cols="12" lg="5" xl="4">
        <OrderSummary show-promo show-free-shipping-hint>
          <template #actions>
            <v-btn
              block
              variant="flat"
              color="primary"
              class="elan-cta mt-6"
              append-icon="mdi-arrow-right"
              :disabled="cart.isEmpty"
              @click="proceedToCheckout"
            >
              Proceed to Checkout
            </v-btn>
          </template>
        </OrderSummary>
      </v-col>
    </v-row>

    <!-- Removing an item is destructive, so it gets a confirmation. -->
    <v-dialog v-model="isRemovalDialogOpen" max-width="420">
      <v-card class="elan-card pa-6">
        <h2 class="elan-heading mb-3">Remove this item?</h2>
        <p class="elan-muted mb-6">
          {{ removalName }} will be taken out of your bag. You can always restore the demo bag
          afterwards.
        </p>
        <div class="d-flex justify-end ga-2 flex-wrap">
          <v-btn variant="text" color="primary" @click="pendingRemoval = null">Keep it</v-btn>
          <v-btn variant="flat" color="primary" @click="removeConfirmed">Remove</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.elan-page {
  max-width: 1240px;
  padding-top: 40px;
  padding-bottom: 64px;
}

.elan-page__head {
  margin-bottom: 32px;
}

.elan-page__subtitle {
  color: var(--elan-text-muted);
  font-size: 1rem;
}

.elan-page__empty {
  max-width: 720px;
  margin-inline: auto;
}

.elan-bag {
  padding: 20px 24px 8px;
}

.elan-bag__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.elan-bag__list {
  list-style: none;
  padding: 0;
  margin: 0;
}

@media (max-width: 599px) {
  .elan-page {
    padding-top: 28px;
  }

  .elan-bag {
    padding: 18px 16px 4px;
  }
}
</style>
