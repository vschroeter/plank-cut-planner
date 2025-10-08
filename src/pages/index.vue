<template>
  <v-container>
    <v-app-bar density="compact" flat>
      <v-btn icon="mdi-menu" @click="leftDrawerOpen = !leftDrawerOpen" />
      <v-toolbar-title>Plank Cut Planner</v-toolbar-title>
      <v-spacer />
      <v-btn icon="mdi-cog" @click="rightDrawerOpen = !rightDrawerOpen" />
    </v-app-bar>
    <v-navigation-drawer v-model="rightDrawerOpen" location="right" :permanent="true" :width="rightDrawerWidth">
      <GlobalSettingsCard />
      <div class="resize-handle left" @mousedown="startResizeRight" />
    </v-navigation-drawer>
    <v-navigation-drawer v-model="leftDrawerOpen" location="left" :permanent="true" :width="leftDrawerWidth">
      <AvailablePlanksTable />
      <div class="resize-handle right" @mousedown="startResizeLeft" />
    </v-navigation-drawer>
    <!-- <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center">
          <ComputeStatusBar />
          <v-btn icon="mdi-cog" @click="drawer = !drawer" />
        </div>
      </v-col>
    </v-row> -->
    <v-row>
      <v-col cols="12">
        <RequiredPiecesTable />
      </v-col>
      <!-- <v-col cols="12" md="6">
        <RequiredPiecesTable />
      </v-col> -->
    </v-row>
    <v-row>
      <v-col cols="12">
        <PurchasePlanTable />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <CutPlanView />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
  import { useLocalStorage } from '@vueuse/core'
  import AvailablePlanksTable from '@/components/AvailablePlanksTable.vue'
  import CutPlanView from '@/components/CutPlanView.vue'
  import GlobalSettingsCard from '@/components/GlobalSettingsCard.vue'
  import PurchasePlanTable from '@/components/PurchasePlanTable.vue'
  import RequiredPiecesTable from '@/components/RequiredPiecesTable.vue'
  const leftDrawerOpen = useLocalStorage<boolean>('planner.leftDrawerOpen', true)
  const rightDrawerOpen = useLocalStorage<boolean>('planner.rightDrawerOpen', true)
  const leftDrawerWidth = useLocalStorage<number>('planner.leftDrawerWidth', 360)
  const rightDrawerWidth = useLocalStorage<number>('planner.rightDrawerWidth', 360)

  const MIN_WIDTH = 200
  const MAX_WIDTH = 1000

  function clamp (value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value))
  }

  function startResizeLeft (e: MouseEvent): void {
    e.preventDefault()
    const startX = e.clientX
    const startWidth = Number(leftDrawerWidth.value)
    document.body.style.cursor = 'col-resize'
    const onMove = (ev: MouseEvent): void => {
      const delta = ev.clientX - startX
      leftDrawerWidth.value = clamp(startWidth + delta, MIN_WIDTH, MAX_WIDTH)
    }
    const onUp = (): void => {
      document.body.style.cursor = ''
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  function startResizeRight (e: MouseEvent): void {
    e.preventDefault()
    const startX = e.clientX
    const startWidth = Number(rightDrawerWidth.value)
    document.body.style.cursor = 'col-resize'
    const onMove = (ev: MouseEvent): void => {
      const delta = startX - ev.clientX
      rightDrawerWidth.value = clamp(startWidth + delta, MIN_WIDTH, MAX_WIDTH)
    }
    const onUp = (): void => {
      document.body.style.cursor = ''
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }
</script>

<style scoped>
.resize-handle {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 6px;
  cursor: col-resize;
  opacity: 0.2;
}
.resize-handle.left {
  left: 0;
}
.resize-handle.right {
  right: 0;
}
.resize-handle:hover {
  background-color: currentColor;
}
</style>
