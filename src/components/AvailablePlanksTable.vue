<template>
  <v-card>
    <v-card-title>Available Planks</v-card-title>
    <v-card-text>
      <v-data-table
        density="compact"
        :headers="headers"
        item-key="key"
        :items="rows"
      >
        <template #top>
          <v-toolbar flat>
            <v-toolbar-title>
              <v-icon color="medium-emphasis" icon="mdi-wood-plank" size="x-small" start />
              Available planks
            </v-toolbar-title>
            <v-spacer />
            <v-btn
              border
              class="me-2"
              prepend-icon="mdi-plus"
              rounded="lg"
              text="Add Plank"
              @click="add"
            />
          </v-toolbar>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex ga-2 justify-end">
            <v-icon color="medium-emphasis" icon="mdi-pencil" size="small" @click="edit(item)" />
            <v-icon color="medium-emphasis" icon="mdi-delete" size="small" @click="removeByIndex(item._idx)" />
          </div>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>

  <v-dialog v-model="dialog" max-width="640">
    <v-card :subtitle="`${isEditing ? 'Update' : 'Create'} a plank SKU`" :title="`${isEditing ? 'Edit' : 'Add'} Plank`">
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
        <v-btn text="Save" @click="save" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
  import { computed, reactive, ref } from 'vue'
  import { validatePlankSKU } from '@/lib/validation'
  import { usePlannerStore } from '@/stores/planner'

  const store = usePlannerStore()

  const headers = [
    { title: 'Article', key: 'articleNr' },
    { title: 'Width (mm)', key: 'widthMm' },
    { title: 'Length (mm)', key: 'lengthMm' },
    { title: 'Price', key: 'pricePerPiece' },
    { title: 'Avail', key: 'availablePieces' },
    { title: '', key: 'actions', sortable: false },
  ]

  const rows = computed(() => store.sortedAvailablePlanks.map((p, i) => ({
    ...p,
    key: `${p.articleNr}-${i}`,
    // track original index in store for stable edit/remove
    _idx: store.availablePlanks.indexOf(p),
  })))

  const dialog = ref(false)
  const isEditing = ref(false)
  const editIndex = ref<number | null>(null)

  const form = reactive({
    widthMm: 100 as number,
    lengthMm: 1000 as number,
    pricePerPiece: 10 as number,
    articleNr: '' as string,
    availablePieces: null as number | null,
  })

  function resetForm (): void {
    form.widthMm = 100
    form.lengthMm = 1000
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
    dialog.value = false
  }

  const widthErrors = computed(() => (form.widthMm > 0 ? [] : ['Must be > 0']))
  const lengthErrors = computed(() => (form.lengthMm > 0 ? [] : ['Must be > 0']))
  const priceErrors = computed(() => (form.pricePerPiece >= 0 ? [] : ['Must be ≥ 0']))
  const availErrors = computed(() => ((form.availablePieces === null) || (Number.isInteger(form.availablePieces) && form.availablePieces >= 0)) ? [] : ['Must be null or integer ≥ 0'])

  function removeByIndex (index: number): void {
    store.removePlank(index)
  }
</script>
