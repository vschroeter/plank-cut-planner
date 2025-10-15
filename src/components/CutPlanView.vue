<template>
  <v-card>
    <v-toolbar class="sticky-header" density="compact" flat>
      <v-toolbar-title>Cut Plan</v-toolbar-title>
      <v-spacer />
      <v-chip color="info" label>cuts: {{ store.totalCuts }}</v-chip>
      <v-chip v-if="planks.length > 0" class="ml-2" color="success" label>waste: {{ wastePercentTotal }}%</v-chip>
      <v-btn icon="mdi-restore" :title="'Reset marked pieces'" variant="text" @click="store.resetAllDone()" />
    </v-toolbar>
    <v-divider />
    <v-card-text ref="refCardContent">

      <v-row v-for="plank, idx in planks" :key="idx" class="py-2">
        <v-col>
          <div class="d-flex align-center mb-2">
            <v-chip v-if="plank.availablePlank.articleNr" class="mr-2" label>{{ plank.availablePlank.articleNr }}</v-chip>
            <v-chip class="mr-2" label>{{ plank.lengthMm }} × {{ plank.widthMm }} mm</v-chip>
            <v-chip class="mr-2" color="secondary" label variant="tonal">kerf: {{ store.settings.sawKerfMm }} mm</v-chip>
            <v-chip color="warning" label variant="tonal">waste: {{ wastePercent(plank) }}%</v-chip>
          </div>
          <PlankVisualization :max-plank-length="maxPlankLength" :plank="plank" :plank-idx="idx" :width-reference="widthReference" />
        </v-col>
      </v-row>

      <!-- <div class="d-flex flex-wrap ga-4">
        <svg
          v-for="(item, idx) in store.cutPlan.items"
          :key="idx"
          :height="80"
          viewBox="0 0 1000 200"
          :width="300"
        >
          <rect
            fill="#EEE"
            height="40"
            stroke="#999"
            :width="item.source.lengthMm"
            x="0"
            y="40"
          />
          <g v-for="(pos, i) in item.assignments[0]?.cutPositionsMm || []" :key="i">
            <line
              stroke="red"
              stroke-width="2"
              :x1="pos"
              :x2="pos"
              y1="40"
              y2="80"
            />
          </g>
          <text font-size="20" x="5" y="30">{{ item.source.articleNr }}</text>
        </svg>
      </div> -->
    </v-card-text>
  </v-card>

</template>

<script lang="ts" setup>
  import { useResizeObserver } from '@vueuse/core'
  import { usePlannerStore } from '@/stores/planner'
  import PlankVisualization from './PlankVisualization.vue'
  const store = usePlannerStore()

  const widthReference = ref(0)

  const refCardContent = useTemplateRef('refCardContent')
  useResizeObserver(refCardContent, entries => {
    widthReference.value = entries[0]?.contentRect.width ?? 0
  })

  const planks = computed(() => [...store.plankPlan].toSorted((a, b) => {
    if (a.widthMm === b.widthMm) {
      return b.lengthMm - a.lengthMm
    }
    return a.widthMm - b.widthMm
  }))
  const maxPlankLength = computed(() => Math.max(...planks.value.map(plank => plank.lengthMm)))

  watch(planks, () => {
    console.log(planks.value)
  })

  function wastePercent (plank: any): number {
    const used = plank.pieces.reduce((s: number, p: any) => s + p.lengthMm + p.cutWidthMm, 0)
    const waste = Math.max(0, plank.lengthMm - used)
    return Math.round((waste / plank.lengthMm) * 100)
  }

  const wastePercentTotal = computed(() => {
    const totalLen = planks.value.reduce((s, p) => s + p.lengthMm, 0)
    const used = planks.value.reduce((s, plank) => s + plank.pieces.reduce((x: number, p: any) => x + p.lengthMm + p.cutWidthMm, 0), 0)
    if (totalLen === 0) return 0
    return Math.round(((totalLen - used) / totalLen) * 100)
  })

</script>
<style scoped>
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 1;
}
</style>
