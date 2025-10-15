<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <span>Cut Plan (total cuts: {{ store.totalCuts }})</span>
      <v-spacer />
      <v-btn
        border
        icon="mdi-restore"
        rounded="lg"
        :title="'Reset marked pieces'"
        @click="store.resetAllDone()"
      />
    </v-card-title>
    <v-card-text ref="refCardContent">

      <v-row v-for="plank, idx in planks" :key="idx">
        <v-col>
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

</script>
