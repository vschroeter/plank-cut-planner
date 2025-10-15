<template>
  <v-card class="fill-card">
    <v-toolbar class="sticky-header" density="compact" flat>
      <v-toolbar-title>Required Pieces</v-toolbar-title>
      <v-spacer />
      <v-btn
        class="mx-1"
        icon="mdi-delete-sweep"
        :title="'Clear All Pieces'"
        variant="text"
        @click="confirmClear = true"
      />
      <v-btn icon="mdi-plus" :title="'Add Piece'" variant="text" @click="add" />
    </v-toolbar>
    <v-divider />
    <v-card-text>
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
  import { computed, reactive, ref } from 'vue'
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
