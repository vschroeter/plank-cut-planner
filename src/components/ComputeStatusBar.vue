<template>
  <v-alert :type="type" density="comfortable" class="my-2">
    <div class="d-flex align-center ga-4">
      <span>{{ message }}</span>
      <v-btn v-if="!store.autoRecompute" size="small" @click="store.computePlans()">Compute</v-btn>
      <v-switch v-model="auto" inset hide-details label="Auto" />
    </div>
  </v-alert>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { usePlannerStore } from '@/stores/planner'
const store = usePlannerStore()

const hasData = computed(() => store.availablePlanks.length > 0 && store.requiredPieces.length > 0)
const type = computed(() => (hasData.value ? 'info' : 'warning'))
const message = computed(() => (hasData.value ? 'Ready to compute' : 'Add planks and required pieces to compute'))
const auto = computed({
  get: () => store.autoRecompute,
  set: (v: boolean) => store.toggleAutoRecompute(v),
})
</script>


