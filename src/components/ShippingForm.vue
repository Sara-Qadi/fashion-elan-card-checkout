<script setup>
import { computed, reactive, watch } from 'vue'

import {
  emailRule,
  maxLengthRule,
  minLengthRule,
  phoneRule,
  postalCodeRule,
  requiredRule,
} from '@/utils/validation'

const props = defineProps({
  modelValue: { type: Object, required: true },
})

const emit = defineEmits(['update:modelValue'])

const COUNTRIES = [
  'Jordan',
  'United Arab Emirates',
  'Saudi Arabia',
  'Qatar',
  'Kuwait',
  'Egypt',
  'United Kingdom',
  'Germany',
  'France',
  'United States',
  'Canada',
]

// Local working copy so every keystroke does not rewrite the store.
const form = reactive({ ...props.modelValue })

watch(
  () => props.modelValue,
  (value) => Object.assign(form, value),
  { deep: true },
)

watch(form, () => emit('update:modelValue', { ...form }), { deep: true })

// VSelect treats the empty string as a selected value and floats its label out
// of step with the text fields, so the select talks in null instead.
const country = computed({
  get: () => form.country || null,
  set: (value) => {
    form.country = value ?? ''
  },
})

const rules = {
  firstName: [requiredRule('First name'), minLengthRule(2, 'First name'), maxLengthRule(40, 'First name')],
  lastName: [requiredRule('Last name'), minLengthRule(2, 'Last name'), maxLengthRule(40, 'Last name')],
  email: [requiredRule('Email address'), emailRule],
  phone: [requiredRule('Phone number'), phoneRule],
  country: [requiredRule('Country')],
  city: [requiredRule('City'), maxLengthRule(60, 'City')],
  street: [requiredRule('Street address'), minLengthRule(4, 'Street address')],
  postalCode: [requiredRule('Postal code'), postalCodeRule],
  apartment: [maxLengthRule(60, 'Apartment')],
  instructions: [maxLengthRule(200, 'Delivery instructions')],
}
</script>

<template>
  <section aria-labelledby="shipping-details-heading">
    <h2 id="shipping-details-heading" class="elan-heading mb-1">Shipping details</h2>
    <p class="elan-muted elan-form__intro mb-6">
      Where should we send your order? Fields marked with * are required.
    </p>

    <v-row dense>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="form.firstName"
          label="First name *"
          autocomplete="given-name"
          :rules="rules.firstName"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="form.lastName"
          label="Last name *"
          autocomplete="family-name"
          :rules="rules.lastName"
        />
      </v-col>

      <v-col cols="12" sm="6">
        <v-text-field
          v-model="form.email"
          label="Email address *"
          type="email"
          inputmode="email"
          autocomplete="email"
          hint="Your order confirmation is sent here."
          :rules="rules.email"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="form.phone"
          label="Phone number *"
          type="tel"
          inputmode="tel"
          autocomplete="tel"
          placeholder="+962 79 000 0000"
          :rules="rules.phone"
        />
      </v-col>

      <v-col cols="12" sm="6">
        <v-select
          v-model="country"
          :items="COUNTRIES"
          label="Country *"
          autocomplete="country-name"
          :rules="rules.country"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="form.city"
          label="City *"
          autocomplete="address-level2"
          :rules="rules.city"
        />
      </v-col>

      <v-col cols="12">
        <v-text-field
          v-model="form.street"
          label="Street address *"
          autocomplete="address-line1"
          :rules="rules.street"
        />
      </v-col>

      <v-col cols="12" sm="6">
        <v-text-field
          v-model="form.apartment"
          label="Apartment, suite or building"
          autocomplete="address-line2"
          :rules="rules.apartment"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="form.postalCode"
          label="Postal code *"
          autocomplete="postal-code"
          :rules="rules.postalCode"
        />
      </v-col>

      <v-col cols="12">
        <v-textarea
          v-model="form.instructions"
          label="Delivery instructions (optional)"
          placeholder="Leave with the concierge, ring the bell twice…"
          counter="200"
          :rules="rules.instructions"
        />
      </v-col>
    </v-row>
  </section>
</template>

<style scoped>
.elan-form__intro {
  font-size: 0.9rem;
}
</style>
