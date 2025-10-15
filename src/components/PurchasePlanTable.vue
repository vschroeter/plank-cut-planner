<template>
  <v-card class="fill-card">
    <v-toolbar class="sticky-header" density="compact" flat>
      <v-toolbar-title>Purchase Plan</v-toolbar-title>
      <v-spacer />
      <v-chip color="info" label>Total: {{ formatCurrency(total, store.settings.currency) }}</v-chip>
      <v-divider class="mx-2" vertical />
      <v-tooltip location="bottom" open-delay="500" text="Export purchase plan (Markdown)">
        <template #activator="{ props: tprops }">
          <v-btn icon="mdi-file-document-outline" variant="text" v-bind="tprops" @click="onExportMarkdown" />
        </template>
      </v-tooltip>
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
      >
        <template #item.widthMm="{ value }"><div><v-chip label>{{ value }} mm</v-chip></div></template>
        <template #item.lengthMm="{ value }"><div><v-chip label>{{ value }} mm</v-chip></div></template>
        <template #item.unitPriceFmt="{ value }"><div><v-chip color="primary" label variant="tonal">{{ value }}</v-chip></div></template>
        <template #item.quantity="{ value }"><div class="text-right font-mono">{{ value }}</div></template>
        <template #item.subtotalFmt="{ value }"><div><v-chip color="info" label variant="tonal">{{ value }}</v-chip></div></template>
        <template #body.append>
          <tr>
            <td colspan="4" />
            <td class="text-right font-mono"><strong>{{ formatCurrency(total, store.settings.currency) }}</strong></td>
            <td />
          </tr>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'
  import { buildFullMarkdown } from '@/lib/exportMarkdown'
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
    const availablePlank = item.plank
    // const sku = plank.availablePlank
    const unitPrice = availablePlank.pricePerPiece
    const subtotal = unitPrice * item.quantity
    return {
      articleNr: availablePlank.articleNr,
      widthMm: availablePlank.widthMm,
      lengthMm: availablePlank.lengthMm,
      quantity: item.quantity,
      unitPriceFmt: formatCurrency(unitPrice, store.settings.currency),
      subtotalFmt: formatCurrency(subtotal, store.settings.currency),
    }
  }))
  const total = computed(() => store.purchasePlan.reduce((s, item) => s + item.quantity * item.plank.pricePerPiece, 0))
  const loading = computed(() => store.computeLoading)
  defineExpose({ formatCurrency })

  function onExportMarkdown (): void {
    const md = buildFullMarkdown(
      store.plankPlan,
      store.requiredPieces,
      store.purchasePlan,
      store.settings.unitSystem,
      store.settings.currency,
    )
    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const ts = new Date()
    const y = ts.getFullYear().toString()
    const m = String(ts.getMonth() + 1).padStart(2, '0')
    const d = String(ts.getDate()).padStart(2, '0')
    const hh = String(ts.getHours()).padStart(2, '0')
    const mm = String(ts.getMinutes()).padStart(2, '0')
    a.href = url
    a.download = `plan-${y}${m}${d}-${hh}${mm}.md`
    a.click()
    URL.revokeObjectURL(url)
  }
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
