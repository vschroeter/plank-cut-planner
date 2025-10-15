<template>
  <div class="plank-wrapper">
    <!-- Plank div with width and height based on the scale -->
    <div class="plank-background" :style="{ width: `${props.plank.lengthMm * scale}px`, height: `${props.plank.widthMm * scale + 2}px` }">

      <!-- Child divs absolutely positioned at same vertical level -->
      <div
        v-for="(piece, idx) in [...plank.pieces].toSorted((a, b) => (b.widthMm - a.widthMm) || (b.lengthMm - a.lengthMm))"
        :key="idx"
        class="plank-piece"
        :class="{ done: isPieceDone(piece, idx) }"
        role="button"
        :style="{ width: `${piece.lengthMm * scale}px`, height: `${piece.widthMm * scale}px`, left: `${piece.offsetMm * scale}px` }"
        tabindex="0"
        @click="togglePiece(piece, idx)"
        @keydown.enter.prevent="togglePiece(piece, idx)"
        @keydown.space.prevent="togglePiece(piece, idx)"
      >
        <span class="piece-label">{{ piece.lengthMm }} x {{ piece.widthMm }}</span>
      </div>

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

</script>

<style scoped>
  .plank-wrapper {
    position: relative;
    display: inline-block;
    padding-left: 16px;
  }

  .plank-background {
    background-color: #EEE;
    border: 1px solid #999;
    position: relative;
  }

  .plank-piece {
    background-color: #bdbdbd;
    border: 0px solid #999;
    border-radius: 4px;
    position: absolute;
    top: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #1f1f1f;
    cursor: pointer;
    transition: background-color 120ms ease-in-out, transform 80ms ease-in-out;
  }

  .plank-piece:hover {
    background-color: #a7a7a7;
  }

  .plank-piece.done {
    background-color: #c8f7c5; /* pastel green */
  }

  .piece-label {
    font-size: 12px;
    text-align: center;
    padding: 2px 4px;
    user-select: none;
    pointer-events: none;
  }

  /* White measurement markers */
  .plank-length-label {
    position: absolute;
    left: 0;
    right: 0;
    bottom: -16px;
    text-align: center;
    font-size: 10px;
    color: #fff;
    text-shadow: 0 1px 2px rgba(0,0,0,0.6);
    user-select: none;
  }

  .plank-width-label {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0px;
    display: flex;
    align-items: center;
    justify-content: center;
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    font-size: 10px;
    color: #fff;
    text-shadow: 0 1px 2px rgba(0,0,0,0.6);
    user-select: none;
  }
</style>
