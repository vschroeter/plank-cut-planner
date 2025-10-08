<template>
  <v-card>
    <v-card-title>Available Planks</v-card-title>
    <v-card-text>
      <v-form @submit.prevent="onAdd">
        <v-row dense>
          <v-col cols="12" sm="2">
            <v-text-field v-model.number="form.widthMm" label="Width (mm)" type="number" min="1" :error-messages="widthErrors" />
          </v-col>
          <v-col cols="12" sm="2">
            <v-text-field v-model.number="form.lengthMm" label="Length (mm)" type="number" min="1" :error-messages="lengthErrors" />
          </v-col>
          <v-col cols="12" sm="2">
            <v-text-field v-model.number="form.pricePerPiece" label="Price" type="number" min="0" step="0.01" :error-messages="priceErrors" />
          </v-col>
          <v-col cols="12" sm="3">
            <v-text-field v-model="form.articleNr" label="Article Nr (optional)" />
          </v-col>
          <v-col cols="12" sm="2">
            <v-text-field v-model.number="form.availablePieces" label="Avail (blank=∞)" type="number" min="0" :error-messages="availErrors" />
          </v-col>
          <v-col cols="12" sm="1" class="d-flex align-center">
            <v-btn type="submit" color="primary">Add</v-btn>
          </v-col>
        </v-row>
      </v-form>
      <v-data-table :items="rows" :headers="headers" item-key="key" density="compact">
        <template #item.actions="{ index }">
          <v-btn icon="mdi-delete" variant="text" @click="remove(index)" />
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { computed, reactive } from 'vue'
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

const rows = computed(() => store.sortedAvailablePlanks.map((p, i) => ({ ...p, key: `${p.articleNr}-${i}` })))

const form = reactive({
  widthMm: 100,
  lengthMm: 1000,
  pricePerPiece: 10,
  articleNr: '',
  availablePieces: null as number | null,
})

function onAdd(): void {
  store.addPlank({
    widthMm: Number(form.widthMm),
    lengthMm: Number(form.lengthMm),
    pricePerPiece: Number(form.pricePerPiece),
    articleNr: form.articleNr || null,
    availablePieces: form.availablePieces === null || form.availablePieces === undefined ? null : Number(form.availablePieces),
  })
  form.articleNr = ''
}

const widthErrors = computed(() => (form.widthMm > 0 ? [] : ['Must be > 0']))
const lengthErrors = computed(() => (form.lengthMm > 0 ? [] : ['Must be > 0']))
const priceErrors = computed(() => (form.pricePerPiece >= 0 ? [] : ['Must be ≥ 0']))
const availErrors = computed(() => (form.availablePieces === null || Number.isInteger(form.availablePieces) && form.availablePieces >= 0 ? [] : ['Must be null or integer ≥ 0']))

function remove(index: number): void {
  store.removePlank(index)
}
</script>


