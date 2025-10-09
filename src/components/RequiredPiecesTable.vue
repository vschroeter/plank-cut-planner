<template>
  <v-card class="fill-card">
    <v-card-title class="d-flex align-center">
      <span>Required Pieces</span>
      <v-spacer />
      <v-btn
        border
        class="mx-2"
        icon="mdi-delete-sweep"
        rounded="lg"
        :title="'Clear All Pieces'"
        @click="confirmClear = true"
      />
      <v-btn
        border
        icon="mdi-plus"
        rounded="lg"
        :title="'Add Piece'"
        @click="add"
      />
    </v-card-title>
    <v-card-text>
      <v-data-table
        density="compact"
        :headers="headers"
        hide-default-footer
        item-key="key"
        :items="rows"
        :items-per-page="-1"
      >
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
  const confirmClear = ref(false)

  const form = reactive({
    widthMm: 100 as number,
    lengthMm: 400 as number,
    quantity: 1 as number,
    comment: '' as string,
  })

  function resetForm (): void {
    form.widthMm = ui.lastWidthMm ?? 100
    form.lengthMm = 400
    form.quantity = 1
    form.comment = ''
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
    dialog.value = false
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
</style>
