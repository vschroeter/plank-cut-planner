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

const rows = computed(() => store.purchasePlan.map(p => ({
  ...p,
  unitPriceFmt: formatCurrency(p.unitPrice, store.settings.currency),
  subtotalFmt: formatCurrency(p.subtotal, store.settings.currency),
})))
const total = computed(() => store.purchasePlan.reduce((s, p) => s + p.subtotal, 0))
defineExpose({ formatCurrency })
</script>


