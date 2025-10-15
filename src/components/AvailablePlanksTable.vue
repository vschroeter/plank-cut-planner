<template>
  <v-card class="fill-card">
    <v-toolbar class="sticky-header" density="compact" flat>
      <v-toolbar-title>Available Planks</v-toolbar-title>
      <v-spacer />
      <v-btn
        class="mx-1"
        icon="mdi-delete-sweep"
        :title="'Clear All Planks'"
        variant="text"
        @click="confirmClear = true"
      />
      <v-btn icon="mdi-plus" :title="'Add Plank'" variant="text" @click="add" />
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
        <template #item.pricePerPiece="{ value, item }"><div @dblclick="edit(item)"><v-chip color="primary" label variant="tonal">{{ value.toFixed(2) }} {{ store.settings.currency }}</v-chip></div></template>
        <template #item.availablePieces="{ value, item }"><div @dblclick="edit(item)"><v-chip :color="value === null ? 'info' : 'success'" label variant="tonal">{{ value ?? '∞' }}</v-chip></div></template>
        <template #item.articleNr="{ value, item }"><div @dblclick="edit(item)">{{ value }}</div></template>
        <template #item.actions="{ item }">
          <v-menu>
            <template #activator="{ props }"><v-btn icon="mdi-dots-vertical" v-bind="props" variant="text" /></template>
            <v-list density="compact">
              <v-list-item prepend-icon="mdi-pencil" title="Edit" @click="edit(item)" />
              <v-list-item prepend-icon="mdi-delete" title="Delete" @click="removeByIndex(item._idx)" />
            </v-list>
          </v-menu>
        </template>
      </v-data-table>
      <div class="text-center my-2">
        <v-btn color="primary" prepend-icon="mdi-plus" @click="add">Add Plank</v-btn>
      </div>
    </v-card-text>
  </v-card>

  <v-dialog v-model="dialog" max-width="640">
    <v-card :subtitle="`${isEditing ? 'Update' : 'Create'} a plank SKU`" :title="`${isEditing ? 'Edit' : 'Add'} Plank`" @keydown.enter.prevent="save" @keydown.esc.prevent="dialog = false">
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
              v-model.number="form.pricePerPiece"
              :error-messages="priceErrors"
              label="Price"
              min="0"
              step="0.01"
              type="number"
            />
          </v-col>
          <v-col cols="12" sm="3">
            <v-text-field v-model="form.articleNr" label="Article Nr (optional)" />
          </v-col>
          <v-col cols="12" sm="3">
            <v-text-field
              v-model.number="form.availablePieces"
              :error-messages="availErrors"
              label="Avail (blank=∞)"
              min="0"
              type="number"
            />
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
    <v-card subtitle="This action cannot be undone." title="Clear all available planks?">
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
  import { validatePlankSKU } from '@/lib/validation'
  import { usePlannerStore } from '@/stores/planner'
  import { useUiStore } from '@/stores/ui'

  const store = usePlannerStore()
  const ui = useUiStore()
  const loading = computed(() => store.computeLoading)

  const headers = [
    { title: 'Width', key: 'widthMm', align: 'end' as const },
    { title: 'Length', key: 'lengthMm', align: 'end' as const },
    { title: 'Unit Price', key: 'pricePerPiece', align: 'end' as const },
    { title: 'Avail', key: 'availablePieces', align: 'end' as const },
    { title: 'Article', key: 'articleNr' },
    { title: '', key: 'actions', sortable: false, width: 52 },
  ] as const

  const rows = computed(() => store.sortedAvailablePlanks.map((p, i) => ({
    ...p,
    key: `${p.articleNr}-${i}`,
    // track original index in store for stable edit/remove
    _idx: store.availablePlanks.indexOf(p),
  })))

  const dialog = ref(false)
  const isEditing = ref(false)
  const editIndex = ref<number | null>(null)
  const confirmClear = ref(false)

  const form = reactive({
    widthMm: 100 as number,
    lengthMm: 1000 as number,
    pricePerPiece: 10 as number,
    articleNr: '' as string,
    availablePieces: null as number | null,
  })

  function resetForm (): void {
    form.widthMm = ui.lastWidthMm ?? 100
    form.lengthMm = ui.lastLengthMm ?? 1000
    form.pricePerPiece = 10
    form.articleNr = ''
    form.availablePieces = null
  }

  function add (): void {
    isEditing.value = false
    editIndex.value = null
    resetForm()
    dialog.value = true
  }

  function edit (row: any): void {
    isEditing.value = true
    editIndex.value = row._idx
    form.widthMm = row.widthMm
    form.lengthMm = row.lengthMm
    form.pricePerPiece = row.pricePerPiece
    form.articleNr = row.articleNr ?? ''
    form.availablePieces = row.availablePieces
    dialog.value = true
  }

  function save (): void {
    const availablePiecesValue: number | null = ((form.availablePieces === null) || (form.availablePieces === undefined) || ((form.availablePieces as unknown) === ''))
      ? null
      : Number(form.availablePieces)

    const errors = validatePlankSKU({
      widthMm: Number(form.widthMm),
      lengthMm: Number(form.lengthMm),
      pricePerPiece: Number(form.pricePerPiece),
      articleNr: form.articleNr ? String(form.articleNr) : null,
      availablePieces: availablePiecesValue,
    })
    if (errors.length > 0) return

    const payload = {
      widthMm: Number(form.widthMm),
      lengthMm: Number(form.lengthMm),
      pricePerPiece: Number(form.pricePerPiece),
      articleNr: form.articleNr ? String(form.articleNr) : null,
      availablePieces: availablePiecesValue,
    }

    if (isEditing.value && editIndex.value !== null) {
      store.updatePlank(editIndex.value, payload)
    } else {
      store.addPlank(payload)
    }
    ui.setLastWidthMm(payload.widthMm)
    ui.setLastLengthMm(payload.lengthMm)
    dialog.value = false
  }

  function saveAndAddAnother (): void {
    const availablePiecesValue: number | null = ((form.availablePieces === null) || (form.availablePieces === undefined) || ((form.availablePieces as unknown) === ''))
      ? null
      : Number(form.availablePieces)

    const errors = validatePlankSKU({
      widthMm: Number(form.widthMm),
      lengthMm: Number(form.lengthMm),
      pricePerPiece: Number(form.pricePerPiece),
      articleNr: form.articleNr ? String(form.articleNr) : null,
      availablePieces: availablePiecesValue,
    })
    if (errors.length > 0) return

    const payload = {
      widthMm: Number(form.widthMm),
      lengthMm: Number(form.lengthMm),
      pricePerPiece: Number(form.pricePerPiece),
      articleNr: form.articleNr ? String(form.articleNr) : null,
      availablePieces: availablePiecesValue,
    }

    // Always add a new plank when using "add another"
    store.addPlank(payload)
    ui.setLastWidthMm(payload.widthMm)
    ui.setLastLengthMm(payload.lengthMm)
    resetForm()
    dialog.value = true
  }

  const widthErrors = computed(() => (form.widthMm > 0 ? [] : ['Must be > 0']))
  const lengthErrors = computed(() => (form.lengthMm > 0 ? [] : ['Must be > 0']))
  const priceErrors = computed(() => (form.pricePerPiece >= 0 ? [] : ['Must be ≥ 0']))
  const availErrors = computed(() => ((form.availablePieces === null) || (Number.isInteger(form.availablePieces) && form.availablePieces >= 0)) ? [] : ['Must be null or integer ≥ 0'])

  function removeByIndex (index: number): void {
    store.removePlank(index)
  }

  function doClearAll (): void {
    store.clearAvailablePlanks()
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
</style>
