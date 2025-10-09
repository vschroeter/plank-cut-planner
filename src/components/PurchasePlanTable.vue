<template>
  <v-card class="fill-card">
    <v-card-title>Purchase Plan</v-card-title>
    <v-card-text>
      <v-data-table
        :items="rows"
        :headers="headers"
        item-key="articleNr"
        density="compact"
        hide-default-footer
        :items-per-page="-1"
      />
    </v-card-text>
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
  { title: 'Width (mm)', key: 'widthMm' },
  { title: 'Length (mm)', key: 'lengthMm' },
  { title: 'Unit Price', key: 'unitPriceFmt' },
  { title: 'Qty', key: 'quantity' },
  { title: 'Subtotal', key: 'subtotalFmt' },
  { title: 'Article', key: 'articleNr' },
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

<style scoped>
.fill-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.fill-card :deep(.v-card-text) {
  flex: 1;
  overflow: auto;
}
</style>


