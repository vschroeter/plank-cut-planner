<template>
  <div>
    <!-- Plank div with width and height based on the scale -->
    <div class="plank-background" :style="{ width: `${props.plank.lengthMm * scale}px`, height: `${props.plank.widthMm * scale + 2}px` }">

      <!-- Child divs absolutely positioned at same vertical level -->
      <div v-for="(piece, idx) in plank.pieces" :key="idx" class="plank-piece" :style="{ width: `${piece.lengthMm * scale}px`, height: `${piece.widthMm * scale}px`, left: `${piece.offsetMm * scale}px` }">
        {{ piece.lengthMm }} {{ idx }}
      </div>

    </div>
  </div>
</template>

<script lang="ts" setup>
  import type { Plank } from '@/types/planner'

  const props = defineProps<{
    plank: Plank
    maxPlankLength: number
    widthReference: number
  }>()

  const scale = computed(() => props.widthReference / props.maxPlankLength)

</script>

<style scoped>
  .plank-background {
    background-color: #EEE;
    border: 1px solid #999;
    position: relative;
  }

  .plank-piece {
    background-color: #858585;
    border: 0px solid #999;
    border-radius: 4px;
    position: absolute;
    top: 0;
  }
</style>
