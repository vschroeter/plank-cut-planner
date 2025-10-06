<template>
  <v-card>
    <v-card-title>Purchase Plan</v-card-title>
    <v-data-table :items="store.purchasePlan" :headers="headers" item-key="articleNr" density="compact" />
  </v-card>
</template>

<script lang="ts" setup>
import { usePlannerStore } from '@/stores/planner'
const store = usePlannerStore()
const headers = [
  { title: 'Article', key: 'articleNr' },
  { title: 'Width (mm)', key: 'widthMm' },
  { title: 'Length (mm)', key: 'lengthMm' },
  { title: 'Unit Price', key: 'unitPrice' },
  { title: 'Qty', key: 'quantity' },
  { title: 'Subtotal', key: 'subtotal' },
]
</script>


