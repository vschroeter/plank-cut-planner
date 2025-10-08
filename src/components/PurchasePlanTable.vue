<template>
  <v-card>
    <v-card-title>Purchase Plan</v-card-title>
    <v-data-table :items="rows" :headers="headers" item-key="articleNr" density="compact" />
    <div class="text-right px-4 py-2">
      <strong>Total: {{ formatCurrency(total, store.settings.currency) }}</strong>
    </div>
  </v-card>
</template>

<script lang="ts" setup>
import { usePlannerStore } from '@/stores/planner'
import { computed } from 'vue'
import { formatCurrency } from '@/lib/format'
const store = usePlannerStore()
const headers = [
  { title: 'Article', key: 'articleNr' },
  { title: 'Width (mm)', key: 'widthMm' },
  { title: 'Length (mm)', key: 'lengthMm' },
  { title: 'Unit Price', key: 'unitPriceFmt' },
  { title: 'Qty', key: 'quantity' },
  { title: 'Subtotal', key: 'subtotalFmt' },
]

const rows = computed(() => store.purchasePlan.map(item => {
  const plank = item.plank
  const sku = plank.availablePlank
  const unitPrice = sku.pricePerPiece
  const subtotal = unitPrice * item.quantity
  return {
    articleNr: sku.articleNr,
    widthMm: sku.widthMm,
    lengthMm: sku.lengthMm,
    quantity: item.quantity,
    unitPriceFmt: formatCurrency(unitPrice, store.settings.currency),
    subtotalFmt: formatCurrency(subtotal, store.settings.currency),
  }
}))
const total = computed(() => store.purchasePlan.reduce((s, item) => s + item.quantity * item.plank.availablePlank.pricePerPiece, 0))
defineExpose({ formatCurrency })
</script>


