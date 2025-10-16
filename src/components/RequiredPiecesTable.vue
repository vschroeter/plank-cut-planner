<template>
  <v-card class="fill-card">
    <v-toolbar class="sticky-header" density="compact" flat>
      <v-toolbar-title>Required Pieces</v-toolbar-title>
      <v-spacer />
      <v-tooltip location="bottom" open-delay="500" text="Export CSV">
        <template #activator="{ props }">
          <v-btn
            class="mx-1"
            icon="mdi-download"
            variant="text"
            v-bind="props"
            @click="exportCsv"
          />
        </template>
      </v-tooltip>
      <v-tooltip location="bottom" open-delay="500" text="Import CSV">
        <template #activator="{ props }">
          <v-btn
            class="mx-1"
            icon="mdi-upload"
            variant="text"
            v-bind="props"
            @click="triggerImport"
          />
        </template>
      </v-tooltip>
      <v-tooltip location="bottom" open-delay="500" text="Clear All Pieces">
        <template #activator="{ props }">
          <v-btn
            class="mx-1"
            icon="mdi-delete-sweep"
            variant="text"
            v-bind="props"
            @click="confirmClear = true"
          />
        </template>
      </v-tooltip>
      <v-tooltip location="bottom" open-delay="500" text="Add Piece">
        <template #activator="{ props }">
          <v-btn
            icon="mdi-plus"
            variant="text"
            v-bind="props"
            @click="add"
          />
        </template>
      </v-tooltip>
    </v-toolbar>
    <v-divider />
    <v-card-text ref="refCardText" :style="{ minHeight: ui.syncedTablesMinPx ? (ui.syncedTablesMinPx + 'px') : undefined, maxHeight: ui.syncedTablesMaxPx ? (ui.syncedTablesMaxPx + 'px') : undefined }">
      <input
        ref="refFile"
        accept=".csv,text/csv"
        style="display:none"
        type="file"
        @change="onImportFileChange"
      >
      <div ref="refTableWrap">
        <v-skeleton-loader v-if="loading" class="rounded-xl" type="table" />
        <v-data-table
          v-else
          density="compact"
          :headers="headers"
          hide-default-footer
          item-key="key"
          :items="rows"
          :items-per-page="-1"
        >
          <template #item.widthMm="{ value, item }"><div @dblclick="edit(item)"><v-chip label>{{ value }} mm</v-chip></div></template>
          <template #item.lengthMm="{ value, item }"><div @dblclick="edit(item)"><v-chip label>{{ value }} mm</v-chip></div></template>
          <template #item.quantity="{ value, item }"><div class="text-right font-mono" @dblclick="edit(item)">{{ value }}</div></template>
          <template #item.comment="{ value, item }"><div @dblclick="edit(item)">{{ value }}</div></template>
          <template #item.actions="{ item }">
            <v-menu>
              <template #activator="{ props }"><v-btn icon="mdi-dots-vertical" v-bind="props" variant="text" /></template>
              <v-list density="compact">
                <v-list-item prepend-icon="mdi-pencil" title="Edit" @click="edit(item)" />
                <v-list-item prepend-icon="mdi-content-copy" title="Duplicate" @click="dup(item)" />
                <v-list-item prepend-icon="mdi-delete" title="Delete" @click="removeByIndex(item._idx)" />
              </v-list>
            </v-menu>
          </template>
        </v-data-table>
      </div>
      <div class="text-center my-2">
        <v-btn color="primary" prepend-icon="mdi-plus" @click="add">Add Piece</v-btn>
      </div>
    </v-card-text>
  </v-card>

  <v-dialog v-model="dialog" max-width="640">
    <v-card :subtitle="`${isEditing ? 'Update' : 'Create'} a required piece`" :title="`${isEditing ? 'Edit' : 'Add'} Piece`" @keydown.enter.prevent="save" @keydown.esc.prevent="dialog = false">
      <template #text>
        <v-row>
          <v-col cols="12" sm="3">
            <v-text-field
              v-model.number="form.widthMm"
              :error-messages="widthErrors"
              label="Width (mm)"
              min="1"
              type="number"
            />
          </v-col>
          <v-col cols="12" sm="3">
            <v-text-field
              v-model.number="form.lengthMm"
              :error-messages="lengthErrors"
              label="Length (mm)"
              min="1"
              type="number"
            />
          </v-col>
          <v-col cols="12" sm="3">
            <v-text-field
              v-model.number="form.quantity"
              :error-messages="qtyErrors"
              label="Quantity"
              min="1"
              type="number"
            />
          </v-col>
          <v-col cols="12" sm="3">
            <v-text-field v-model="form.comment" label="Comment" />
          </v-col>
        </v-row>
      </template>
      <v-divider />
      <v-card-actions class="bg-surface-light">
        <v-btn text="Cancel" variant="plain" @click="dialog = false" />
        <v-spacer />
        <v-btn v-if="!isEditing" text="Save & add another" variant="tonal" @click="saveAndAddAnother" />
        <v-btn text="Save" @click="save" />
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="confirmClear" max-width="520">
    <v-card subtitle="This action cannot be undone." title="Clear all required pieces?">
      <v-card-actions class="bg-surface-light">
        <v-btn text="Cancel" variant="plain" @click="confirmClear = false" />
        <v-spacer />
        <v-btn color="error" text="Delete All" @click="doClearAll" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
  import { useResizeObserver } from '@vueuse/core'
  import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
  import { buildCsv, downloadTextFile, parseCsv, readFileAsText } from '@/lib/csv'
  import { fileSafeTimestamp } from '@/lib/datetime'
  import { parseFlexibleNumber } from '@/lib/number'
  import { withAutoRecomputeDisabled } from '@/lib/storeImport'
  import { validateRequiredPiece } from '@/lib/validation'
  import { usePlannerStore } from '@/stores/planner'
  import { useUiStore } from '@/stores/ui'

  const store = usePlannerStore()
  const ui = useUiStore()
  const loading = computed(() => store.computeLoading)

  const headers = [
    { title: 'Width', key: 'widthMm', align: 'end' as const },
    { title: 'Length', key: 'lengthMm', align: 'end' as const },
    { title: 'Qty', key: 'quantity', align: 'end' as const },
    { title: 'Comment', key: 'comment' },
    { title: '', key: 'actions', sortable: false, width: 52 },
  ] as const

  const rows = computed(() => store.requiredPieces
    .toSorted((a, b) => a.widthMm - b.widthMm || a.lengthMm - b.lengthMm)
    .map(p => {
      const originalIndex = store.requiredPieces.indexOf(p)
      return {
        ...p,
        key: `${p.widthMm}-${p.lengthMm}-${originalIndex}`,
        _idx: originalIndex,
      }
    }))

  const dialog = ref(false)
  const isEditing = ref(false)
  const editIndex = ref<number | null>(null)
  const confirmClear = ref(false)
  const refFile = ref<HTMLInputElement | null>(null)

  const refCardText = ref<HTMLElement | null>(null)
  const refTableWrap = ref<HTMLElement | null>(null)

  function measureAndSyncHeights (): void {
    if (!refTableWrap.value || !refCardText.value) return
    const tableEl = refTableWrap.value.querySelector('table') as HTMLTableElement | null
    const thead = tableEl?.querySelector('thead') as HTMLElement | null
    const firstRow = tableEl?.querySelector('tbody tr') as HTMLElement | null
    const headerHeight = thead?.getBoundingClientRect?.()?.height ?? 0
    const rowHeight = firstRow?.getBoundingClientRect?.()?.height ?? 40
    const minHeight = Math.ceil(headerHeight + rowHeight * 5)
    const contentHeight = Math.ceil(refCardText.value.getBoundingClientRect?.()?.height ?? 0)
    if (Number.isFinite(minHeight) && minHeight > 0) ui.syncedTablesMinPx = minHeight
    if (Number.isFinite(contentHeight) && contentHeight > 0) ui.syncedTablesMaxPx = contentHeight
  }

  onMounted(async () => {
    await nextTick()
    measureAndSyncHeights()
  })

  useResizeObserver(refCardText, () => {
    measureAndSyncHeights()
  })

  useResizeObserver(refTableWrap, () => {
    measureAndSyncHeights()
  })

  watch(rows, async () => {
    await nextTick()
    measureAndSyncHeights()
  }, { deep: true })

  const form = reactive({
    widthMm: 100 as number,
    lengthMm: 400 as number,
    quantity: 1 as number,
    comment: '' as string,
  })

  function resetForm (): void {
    form.widthMm = ui.lastWidthMm ?? 100
    form.lengthMm = ui.lastLengthMm ?? 400
    form.quantity = 1
    form.comment = ''
  }

  function add (): void {
    isEditing.value = false
    editIndex.value = null
    resetForm()
    dialog.value = true
  }

  function dup (row: any): void {
    store.addRequiredPiece({
      widthMm: row.widthMm,
      lengthMm: row.lengthMm,
      quantity: row.quantity,
      comment: row.comment ?? null,
    })
  }

  function edit (row: any): void {
    isEditing.value = true
    editIndex.value = row._idx
    form.widthMm = row.widthMm
    form.lengthMm = row.lengthMm
    form.quantity = row.quantity
    form.comment = row.comment ?? ''
    dialog.value = true
  }

  function save (): void {
    const errors = validateRequiredPiece({
      widthMm: Number(form.widthMm),
      lengthMm: Number(form.lengthMm),
      quantity: Number(form.quantity),
    })
    if (errors.length > 0) return

    const payload = {
      widthMm: Number(form.widthMm),
      lengthMm: Number(form.lengthMm),
      quantity: Number(form.quantity),
      comment: form.comment || null,
    }

    if (isEditing.value && editIndex.value !== null) {
      store.updateRequiredPiece(editIndex.value, payload)
    } else {
      store.addRequiredPiece(payload)
    }
    ui.setLastWidthMm(payload.widthMm)
    ui.setLastLengthMm(payload.lengthMm)
    dialog.value = false
  }

  function saveAndAddAnother (): void {
    const errors = validateRequiredPiece({
      widthMm: Number(form.widthMm),
      lengthMm: Number(form.lengthMm),
      quantity: Number(form.quantity),
    })
    if (errors.length > 0) return

    const payload = {
      widthMm: Number(form.widthMm),
      lengthMm: Number(form.lengthMm),
      quantity: Number(form.quantity),
      comment: form.comment || null,
    }

    // Always add a new piece when using "add another"
    store.addRequiredPiece(payload)
    ui.setLastWidthMm(payload.widthMm)
    ui.setLastLengthMm(payload.lengthMm)
    resetForm()
    dialog.value = true
  }

  function removeByIndex (index: number): void {
    store.removeRequiredPiece(index)
  }

  const widthErrors = computed(() => (form.widthMm > 0 ? [] : ['Must be > 0']))
  const lengthErrors = computed(() => (form.lengthMm > 0 ? [] : ['Must be > 0']))
  const qtyErrors = computed(() => (Number.isInteger(form.quantity) && form.quantity >= 1 ? [] : ['Integer ≥ 1']))

  function doClearAll (): void {
    store.clearRequiredPieces()
    confirmClear.value = false
  }

  function exportCsv (): void {
    const headers = ['widthMm', 'lengthMm', 'quantity', 'comment']
    const rows = store.requiredPieces.map(p => ({
      widthMm: p.widthMm,
      lengthMm: p.lengthMm,
      quantity: p.quantity,
      comment: p.comment ?? '',
    }))
    const csv = buildCsv(headers, rows)
    downloadTextFile(csv, `required-pieces-${fileSafeTimestamp()}.csv`)
  }

  function triggerImport (): void {
    refFile.value?.click()
  }

  async function onImportFileChange (ev: Event): Promise<void> {
    const input = ev.target as HTMLInputElement
    const file = input.files && input.files[0]
    if (!file) return
    try {
      const text = await readFileAsText(file)
      const rows = parseCsv(text)
      if (rows.length === 0) return
      const first: string[] = rows[0] ?? []
      const header = first.map(h => h.trim())
      const idx = (name: string) => header.findIndex(h => h.toLowerCase() === name.toLowerCase())
      const iWidth = idx('widthMm')
      const iLength = idx('lengthMm')
      const iQty = idx('quantity')
      const iComment = idx('comment')
      if (iWidth < 0 || iLength < 0 || iQty < 0) return

      await withAutoRecomputeDisabled(store as any, async () => {
        for (let r = 1; r < rows.length; r++) {
          const row = rows[r]
          if (!row || row.length === 0) continue
          const widthMm = parseFlexibleNumber(row[iWidth] ?? '')
          const lengthMm = parseFlexibleNumber(row[iLength] ?? '')
          const quantity = parseFlexibleNumber(row[iQty] ?? '')
          const comment = iComment >= 0 ? (row[iComment] ?? '').trim() : ''
          if (widthMm === null || lengthMm === null || quantity === null) continue
          const qtyInt = Math.max(1, Math.round(quantity))
          const errors = validateRequiredPiece({ widthMm, lengthMm, quantity: qtyInt })
          if (errors.length > 0) continue
          store.addRequiredPiece({ widthMm, lengthMm, quantity: qtyInt, comment: comment || null })
        }
      })
    } finally {
      if (refFile.value) refFile.value.value = ''
    }
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
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 1;
}
</style>
