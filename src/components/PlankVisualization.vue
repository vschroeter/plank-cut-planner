<template>
  <div class="plank-wrapper">
    <div class="plank-background" :style="{ width: `${props.plank.lengthMm * scale}px`, height: `${props.plank.widthMm * scale + 2}px` }">
      <v-tooltip
        v-for="(piece, idx) in sortedPieces"
        :key="idx"
        :open-delay="500"
        :text="`${piece.lengthMm}×${piece.widthMm} • kerf ${piece.cutWidthMm}mm`"
      >
        <template #activator="{ props: tprops }">
          <div
            class="plank-piece"
            :class="{ done: isPieceDone(piece, idx) }"
            role="button"
            v-bind="tprops"
            :style="{ width: `${piece.lengthMm * scale}px`, height: `${piece.widthMm * scale}px`, left: `${piece.offsetMm * scale}px` }"
            tabindex="0"
            @click="togglePiece(piece, idx)"
            @keydown.enter.prevent="togglePiece(piece, idx)"
            @keydown.space.prevent="togglePiece(piece, idx)"
          >
            <span class="piece-label">{{ piece.lengthMm }} × {{ piece.widthMm }}</span>
          </div>
        </template>
      </v-tooltip>

      <!-- Waste segment -->
      <div v-if="wasteMm > 0" class="plank-waste" :style="{ left: `${usedLengthMm * scale}px`, width: `${wasteMm * scale}px`, height: `${props.plank.widthMm * scale}px` }" />
    </div>

    <!-- Axes/size markers -->
    <div class="plank-length-label">{{ props.plank.lengthMm }}</div>
    <div class="plank-width-label">{{ props.plank.widthMm }}</div>
  </div>
</template>

<script lang="ts" setup>
  import type { Plank } from '@/types/planner'
  import { usePlannerStore } from '@/stores/planner'

  const props = defineProps<{
    plank: Plank
    maxPlankLength: number
    widthReference: number
    plankIdx: number
  }>()

  const scale = computed(() => props.widthReference / props.maxPlankLength)

  const store = usePlannerStore()

  const sortedPieces = computed(() => [...props.plank.pieces].toSorted((a, b) => (b.widthMm - a.widthMm) || (b.lengthMm - a.lengthMm)))

  function pieceId (piece: any, idx: number): string {
    const art = props.plank.availablePlank.articleNr ?? 'na'
    return `${props.plankIdx}:${art}:${piece.widthMm}x${piece.lengthMm}:${idx}:${piece.offsetMm}`
  }

  function isPieceDone (piece: any, idx: number): boolean {
    return !!store.donePieces[pieceId(piece, idx)]
  }

  function togglePiece (piece: any, idx: number): void {
    const id = pieceId(piece, idx)
    store.markPieceDone(id, !store.donePieces[id])
  }

  const usedLengthMm = computed(() => sortedPieces.value.reduce((sum, p) => sum + p.lengthMm + p.cutWidthMm, 0))
  const wasteMm = computed(() => Math.max(0, props.plank.lengthMm - usedLengthMm.value))

</script>

<style scoped>
  .plank-wrapper {
    position: relative;
    display: inline-block;
    padding-left: 16px;
  }

  .plank-background {
    background-color: color-mix(in oklab, rgb(var(--v-theme-surface)) 90%, transparent);
    border: 1px solid color-mix(in oklab, rgb(var(--v-theme-on-surface)) 16%, transparent);
    position: relative;
  }

  .plank-piece {
    background-color: color-mix(in oklab, rgb(var(--v-theme-primary)) 35%, transparent);
    border-radius: 4px;
    position: absolute;
    top: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(var(--v-theme-on-surface), 0.8);
    cursor: pointer;
    transition: background-color 120ms ease-in-out, transform 80ms ease-in-out;
  }

  .plank-piece:hover { background-color: color-mix(in oklab, rgb(var(--v-theme-primary)) 45%, transparent); }

  .plank-piece.done { background-color: color-mix(in oklab, rgb(var(--v-theme-success)) 35%, transparent); }

  .plank-waste {
    position: absolute;
    top: 0;
    background: repeating-linear-gradient(
      45deg,
      color-mix(in oklab, rgb(var(--v-theme-surface-2)) 70%, transparent),
      color-mix(in oklab, rgb(var(--v-theme-surface-2)) 70%, transparent) 6px,
      transparent 6px,
      transparent 12px
    );
    border-left: 1px dashed color-mix(in oklab, rgb(var(--v-theme-on-surface)) 24%, transparent);
  }

  .piece-label { font-size: 12px; text-align: center; padding: 2px 4px; user-select: none; pointer-events: none; }

  /* White measurement markers */
  .plank-length-label { position: absolute; left: 0; right: 0; bottom: -16px; text-align: center; font-size: 10px; color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.6); user-select: none; }

  .plank-width-label { position: absolute; top: 0; bottom: 0; left: 0px; display: flex; align-items: center; justify-content: center; writing-mode: vertical-rl; transform: rotate(180deg); font-size: 10px; color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.6); user-select: none; }
</style>
