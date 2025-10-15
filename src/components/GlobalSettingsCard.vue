<template>
  <v-card>
    <v-card-title>Global Settings</v-card-title>
    <v-card-text>
      <v-row dense>
        <v-col cols="12" sm="4">
          <v-text-field v-model.number="kerf" label="Saw kerf (mm)" min="0" type="number" />
        </v-col>
        <v-col cols="12" sm="4">
          <v-select v-model="unit" :items="units" label="Units" />
        </v-col>
        <v-col cols="12" sm="4">
          <v-text-field v-model="currency" label="Currency" maxlength="3" />
        </v-col>
        <v-col class="d-flex align-center" cols="12">
          <v-switch v-model="auto" inset label="Auto recompute" />
        </v-col>
      </v-row>
      <v-btn class="mt-2" :disabled="auto" @click="store.computePlans()">Compute Now</v-btn>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'
  import { usePlannerStore } from '@/stores/planner'

  const store = usePlannerStore()
  const units = ['mm', 'inch']

  const kerf = computed({
    get: () => store.settings.sawKerfMm,
    set: (v: number) => store.setSawKerf(Number(v)),
  })
  const unit = computed({
    get: () => store.settings.unitSystem,
    set: (v: 'mm' | 'inch') => store.setUnitSystem(v),
  })
  const auto = computed({
    get: () => store.autoRecompute,
    set: (v: boolean) => store.toggleAutoRecompute(v),
  })

  const currency = computed({
    get: () => store.settings.currency,
    set: (v: string) => store.setCurrency(v || '€'),
  })
</script>
