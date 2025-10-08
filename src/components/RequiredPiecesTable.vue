<template>
  <v-card>
    <v-card-title>Required Pieces</v-card-title>
    <v-card-text>
      <v-data-table :items="rows" :headers="headers" item-key="key" density="compact">
        <template #top>
          <v-toolbar flat>
            <v-toolbar-title>
              <v-icon color="medium-emphasis" icon="mdi-shape-rectangle-plus" size="x-small" start />
              Required pieces
            </v-toolbar-title>
            <v-spacer />
            <v-btn
              class="me-2"
              prepend-icon="mdi-plus"
              rounded="lg"
              border
              text="Add Piece"
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
    <v-card :subtitle="`${isEditing ? 'Update' : 'Create'} a required piece`" :title="`${isEditing ? 'Edit' : 'Add'} Piece`">
      <template #text>
        <v-row>
          <v-col cols="12" sm="3">
            <v-text-field
              v-model.number="form.widthMm"
              label="Width (mm)"
              type="number"
              min="1"
              :error-messages="widthErrors"
            />
          </v-col>
          <v-col cols="12" sm="3">
            <v-text-field
              v-model.number="form.lengthMm"
              label="Length (mm)"
              type="number"
              min="1"
              :error-messages="lengthErrors"
            />
          </v-col>
          <v-col cols="12" sm="3">
            <v-text-field
              v-model.number="form.quantity"
              label="Quantity"
              type="number"
              min="1"
              :error-messages="qtyErrors"
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
        <v-btn text="Save" @click="save" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { computed, reactive, ref } from 'vue'
import { usePlannerStore } from '@/stores/planner'
import { validateRequiredPiece } from '@/lib/validation'

const store = usePlannerStore()

const headers = [
  { title: 'Width (mm)', key: 'widthMm' },
  { title: 'Length (mm)', key: 'lengthMm' },
  { title: 'Qty', key: 'quantity' },
  { title: 'Comment', key: 'comment' },
  { title: '', key: 'actions', sortable: false },
]

const rows = computed(() => store.requiredPieces.map((p, i) => ({
  ...p,
  key: `${p.widthMm}-${p.lengthMm}-${i}`,
  _idx: i,
})))

const dialog = ref(false)
const isEditing = ref(false)
const editIndex = ref<number | null>(null)

const form = reactive({
  widthMm: 100 as number,
  lengthMm: 400 as number,
  quantity: 1 as number,
  comment: '' as string,
})

function resetForm(): void {
  form.widthMm = 100
  form.lengthMm = 400
  form.quantity = 1
  form.comment = ''
}

function add(): void {
  isEditing.value = false
  editIndex.value = null
  resetForm()
  dialog.value = true
}

function edit(row: any): void {
  isEditing.value = true
  editIndex.value = row._idx
  form.widthMm = row.widthMm
  form.lengthMm = row.lengthMm
  form.quantity = row.quantity
  form.comment = row.comment ?? ''
  dialog.value = true
}

function save(): void {
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
  dialog.value = false
}

function removeByIndex(index: number): void {
  store.removeRequiredPiece(index)
}

const widthErrors = computed(() => (form.widthMm > 0 ? [] : ['Must be > 0']))
const lengthErrors = computed(() => (form.lengthMm > 0 ? [] : ['Must be > 0']))
const qtyErrors = computed(() => (Number.isInteger(form.quantity) && form.quantity >= 1 ? [] : ['Integer ≥ 1']))
</script>


