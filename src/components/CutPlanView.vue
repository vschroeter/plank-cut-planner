<template>
  <v-card>
    <v-toolbar class="sticky-header bg-surface-2" density="compact" flat>
      <v-toolbar-title>Cut Plan</v-toolbar-title>
      <v-spacer />

      <!-- Metrics group -->
      <div class="d-flex align-center">
        <v-chip color="info" label>cuts: {{ store.totalCuts }}</v-chip>
        <v-chip v-if="planks.length > 0" class="ml-2" color="success" label>waste: {{ wastePercentTotal }}%</v-chip>
      </div>

      <v-divider class="mx-2" vertical />

      <!-- Status group -->
      <div class="d-flex align-center text-caption">
        <v-icon class="mr-1" icon="mdi-clock-outline" size="small" />
        <span>{{ statusText }}</span>
      </div>

      <v-divider class="mx-2" vertical />

      <!-- Actions group -->
      <div class="d-flex align-center">
        <v-tooltip location="bottom" text="Auto recompute when data changes">
          <template #activator="{ props: tprops }">
            <v-switch
              v-model="auto"
              density="comfortable"
              hide-details
              inset
              label="Auto"
              v-bind="tprops"
            />
          </template>
        </v-tooltip>
        <v-tooltip location="bottom" text="Compute now">
          <template #activator="{ props: tprops }">
            <v-btn
              class="ml-2"
              color="primary"
              :disabled="store.autoRecompute"
              :loading="store.computeLoading"
              prepend-icon="mdi-cpu-64-bit"
              variant="elevated"
              v-bind="tprops"
              @click="store.computePlans()"
            >Compute</v-btn>
          </template>
        </v-tooltip>

        <v-tooltip location="bottom" text="Export cut plan (Markdown)">
          <template #activator="{ props: tprops }">
            <v-btn
              class="ml-2"
              icon="mdi-file-document-outline"
              variant="text"
              v-bind="tprops"
              @click="onExportMarkdown"
            />
          </template>
        </v-tooltip>

        <v-divider class="mx-2" vertical />

        <v-tooltip location="bottom" text="Reset all marked pieces">
          <template #activator="{ props: tprops }">
            <v-btn icon="mdi-restore" variant="text" v-bind="tprops" @click="store.resetAllDone()" />
          </template>
        </v-tooltip>
      </div>
    </v-toolbar>
    <v-divider />
    <v-card-text ref="refCardContent">

      <v-row v-for="meta in planksWithIndex" :key="meta.originalIndex" class="py-2">
        <v-col>
          <div class="d-flex align-center mb-2">
            <v-chip v-if="meta.plank.availablePlank.articleNr" class="mr-2" label>{{ meta.plank.availablePlank.articleNr }}</v-chip>
            <v-chip
              v-if="meta.plank.isHalved"
              class="mr-2"
              color="red"
              label
              variant="tonal"
            >halved plank</v-chip>
            <v-chip class="mr-2" label>{{ meta.plank.lengthMm }} × {{ meta.plank.widthMm }} mm</v-chip>
            <v-chip class="mr-2" color="secondary" label variant="tonal">kerf: {{ store.settings.sawKerfMm }} mm</v-chip>
            <v-chip class="mr-2" color="warning" label variant="tonal">waste: {{ wastePercent(meta.plank) }}%</v-chip>
          </div>
          <PlankVisualization :max-plank-length="maxPlankLength" :plank="meta.plank" :plank-idx="meta.originalIndex" :width-reference="widthReference" />
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
  import { buildFullMarkdown } from '@/lib/exportMarkdown'
  import { usePlannerStore } from '@/stores/planner'
  import PlankVisualization from './PlankVisualization.vue'
  const store = usePlannerStore()

  const widthReference = ref(0)

  const refCardContent = useTemplateRef('refCardContent')
  useResizeObserver(refCardContent, entries => {
    widthReference.value = entries[0]?.contentRect.width ?? 0
  })

  function pieceIdentityFor (originalIndex: number, plank: any, piece: any, pieceIdx: number): string {
    const art = plank.availablePlank.articleNr ?? 'na'
    return `${originalIndex}:${art}:${piece.widthMm}x${piece.lengthMm}:${pieceIdx}:${piece.offsetMm}`
  }

  function isPlankFinished (plank: any, originalIndex: number): boolean {
    const piecesSorted = [...plank.pieces].toSorted((a, b) => (b.widthMm - a.widthMm) || (b.lengthMm - a.lengthMm))
    if (piecesSorted.length === 0) return false
    return piecesSorted.every((piece, idx) => !!store.donePieces[pieceIdentityFor(originalIndex, plank, piece, idx)])
  }

  const planksWithIndex = computed(() => {
    const metas = store.plankPlan.map((plank: any, originalIndex: number) => ({
      plank,
      originalIndex,
      finished: isPlankFinished(plank, originalIndex),
    }))
    return metas.toSorted((a, b) => {
      if (a.finished !== b.finished) return Number(a.finished) - Number(b.finished) // unfinished first
      if (a.plank.widthMm === b.plank.widthMm) return b.plank.lengthMm - a.plank.lengthMm
      return a.plank.widthMm - b.plank.widthMm
    })
  })

  const planks = computed(() => planksWithIndex.value.map(m => m.plank))
  const maxPlankLength = computed(() => Math.max(...planks.value.map(plank => plank.lengthMm)))

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

  function onExportMarkdown (): void {
    const md = buildFullMarkdown(
      store.plankPlan,
      store.requiredPieces,
      store.purchasePlan,
      store.settings.unitSystem,
      store.settings.currency,
    )
    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const ts = new Date()
    const y = ts.getFullYear().toString()
    const m = String(ts.getMonth() + 1).padStart(2, '0')
    const d = String(ts.getDate()).padStart(2, '0')
    const hh = String(ts.getHours()).padStart(2, '0')
    const mm = String(ts.getMinutes()).padStart(2, '0')
    a.href = url
    a.download = `plan-${y}${m}${d}-${hh}${mm}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

</script>
<style scoped>
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 1;
}
</style>
