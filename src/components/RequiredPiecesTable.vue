<template>
  <v-card>
    <v-card-title>Required Pieces</v-card-title>
    <v-card-text>
      <v-form @submit.prevent="onAdd">
        <v-row dense>
          <v-col cols="12" sm="3">
            <v-text-field v-model.number="form.widthMm" label="Width (mm)" type="number" min="1" :error-messages="widthErrors" />
          </v-col>
          <v-col cols="12" sm="3">
            <v-text-field v-model.number="form.lengthMm" label="Length (mm)" type="number" min="1" :error-messages="lengthErrors" />
          </v-col>
          <v-col cols="12" sm="3">
            <v-text-field v-model.number="form.quantity" label="Quantity" type="number" min="1" :error-messages="qtyErrors" />
          </v-col>
          <v-col cols="12" sm="2">
            <v-text-field v-model="form.comment" label="Comment" />
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
import { usePlannerStore } from '@/stores/planner'

const store = usePlannerStore()

const headers = [
  { title: 'Width (mm)', key: 'widthMm' },
  { title: 'Length (mm)', key: 'lengthMm' },
  { title: 'Qty', key: 'quantity' },
  { title: 'Comment', key: 'comment' },
  { title: '', key: 'actions', sortable: false },
]

const rows = computed(() => store.requiredPieces.map((p, i) => ({ ...p, key: `${p.widthMm}-${p.lengthMm}-${i}` })))

const form = reactive({
  widthMm: 100,
  lengthMm: 400,
  quantity: 1,
  comment: '',
})

function onAdd(): void {
  store.addRequiredPiece({
    widthMm: Number(form.widthMm),
    lengthMm: Number(form.lengthMm),
    quantity: Number(form.quantity),
    comment: form.comment || null,
  })
  form.quantity = 1
}

function remove(index: number): void {
  store.removeRequiredPiece(index)
}

const widthErrors = computed(() => (form.widthMm > 0 ? [] : ['Must be > 0']))
const lengthErrors = computed(() => (form.lengthMm > 0 ? [] : ['Must be > 0']))
const qtyErrors = computed(() => (Number.isInteger(form.quantity) && form.quantity >= 1 ? [] : ['Integer ≥ 1']))
</script>


