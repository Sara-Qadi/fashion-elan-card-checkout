<template>
  <v-container class="elan-page px-4 px-sm-6">
    <v-card class="elan-card elan-notfound pa-8 pa-sm-12 text-center">
      <p class="elan-eyebrow mb-3">Error 404</p>
      <h1 class="elan-display mb-3">This page slipped off the rail</h1>
      <p class="elan-notfound__text mb-8">
        The page you were looking for is not part of the Cart &amp; Checkout microfrontend. Catalog
        and account pages live in the other Team 1 applications.
      </p>

      <v-btn
        variant="flat"
        color="primary"
        class="elan-cta px-8"
        prepend-icon="mdi-shopping-outline"
        :to="{ name: 'cart' }"
      >
        Go to Shopping Bag
      </v-btn>
    </v-card>
  </v-container>
</template>

<style scoped>
.elan-page {
  max-width: 1240px;
  padding-top: 56px;
  padding-bottom: 72px;
}

.elan-notfound {
  max-width: 640px;
  margin-inline: auto;
}

.elan-notfound__text {
  max-width: 48ch;
  margin-inline: auto;
  color: var(--elan-text-muted);
  line-height: 1.65;
}
</style>
