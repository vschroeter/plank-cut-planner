<template>
  <v-alert class="my-2" density="comfortable" :type="type">
    <div class="d-flex align-center ga-4">
      <span>{{ statusText }}</span>
      <v-btn v-if="!store.autoRecompute" size="small" @click="store.computePlans()">Compute</v-btn>
      <v-switch v-model="auto" hide-details inset label="Auto" />
    </div>
  </v-alert>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'
  import { usePlannerStore } from '@/stores/planner'
  const store = usePlannerStore()

  const hasData = computed(() => store.availablePlanks.length > 0 && store.requiredPieces.length > 0)
  const type = computed(() => (hasData.value ? 'info' : 'warning'))
  const statusText = computed(() => {
    const ms = store.computeMs ?? null
    const last = store.lastComputedAt ? new Date(store.lastComputedAt).toLocaleTimeString() : '—'
    const perf = ms == null ? 'Not computed yet' : `Last ${ms}ms @ ${last}`
    return store.autoRecompute ? perf : `${perf} • Auto disabled (>1.0s)`
  })
  const auto = computed({
    get: () => store.autoRecompute,
    set: (v: boolean) => store.toggleAutoRecompute(v),
  })
</script>
