<template>
  <v-card class="fill-card">
    <v-toolbar class="sticky-header" density="compact" flat>
      <v-toolbar-title>Purchase Plan</v-toolbar-title>
      <v-spacer />
      <v-chip color="info" label>Total: {{ formatCurrency(total, store.settings.currency) }}</v-chip>
    </v-toolbar>
    <v-divider />
    <v-card-text>
      <v-skeleton-loader v-if="loading" class="rounded-xl" type="table" />
      <v-data-table
        v-else
        density="compact"
        :headers="headers"
        hide-default-footer
        item-key="articleNr"
        :items="rows"
        :items-per-page="-1"
      />
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'
  import { formatCurrency } from '@/lib/format'
  import { usePlannerStore } from '@/stores/planner'
  const store = usePlannerStore()
  const headers = [
    { title: 'Width', key: 'widthMm', align: 'end' as const },
    { title: 'Length', key: 'lengthMm', align: 'end' as const },
    { title: 'Unit Price', key: 'unitPriceFmt', align: 'end' as const },
    { title: 'Qty', key: 'quantity', align: 'end' as const },
    { title: 'Subtotal', key: 'subtotalFmt', align: 'end' as const },
    { title: 'Article', key: 'articleNr' },
  ] as const

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
  const loading = computed(() => store.computeLoading)
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
