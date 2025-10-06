<template>
  <v-card>
    <v-card-title>Cut Plan (total cuts: {{ store.totalCuts }})</v-card-title>
    <v-card-text>
      <div class="d-flex flex-wrap ga-4">
        <svg v-for="(item, idx) in store.cutPlan.items" :key="idx" :width="300" :height="80" viewBox="0 0 1000 200">
          <rect x="0" y="40" :width="item.source.lengthMm" height="40" fill="#EEE" stroke="#999" />
          <g v-for="(pos, i) in item.assignments[0]?.cutPositionsMm || []" :key="i">
            <line :x1="pos" y1="40" :x2="pos" y2="80" stroke="red" stroke-width="2" />
          </g>
          <text x="5" y="30" font-size="20">{{ item.source.articleNr }}</text>
        </svg>
      </div>
    </v-card-text>
  </v-card>

</template>

<script lang="ts" setup>
import { usePlannerStore } from '@/stores/planner'
const store = usePlannerStore()
</script>


