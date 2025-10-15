<template>
  <v-app-bar density="compact" flat>
    <v-app-bar-title>Plank Cut Planner</v-app-bar-title>
    <v-spacer />
    <v-btn icon="mdi-download" :title="'Export JSON'" variant="text" @click="onExport" />
    <v-btn icon="mdi-file-document-outline" :title="'Export Markdown'" variant="text" @click="onExportMarkdown" />
    <v-btn icon="mdi-upload" :title="'Import JSON'" variant="text" @click="triggerImport" />
    <input
      ref="importInput"
      accept="application/json,.json"
      style="display:none"
      type="file"
      @change="onImport"
    >
    <v-btn icon="mdi-cog-outline" variant="text" @click="settingsDialogOpen = true" />
  </v-app-bar>

  <!-- Settings Dialog -->
  <v-dialog v-model="settingsDialogOpen" max-width="720">
    <v-card>
      <v-card-title>Settings</v-card-title>
      <v-card-text>
        <GlobalSettingsCard />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text="Close" @click="settingsDialogOpen = false" />
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- <div class="planner-grid" :class="{ 'has-alerts': hasAlerts }">
      <div v-if="hasAlerts" class="grid-full">
        <v-alert
          class="mb-4"
          density="comfortable"
          type="error"
        >
          <div class="d-flex flex-column ga-1">
            <div class="text-subtitle-2">Computation issues</div>
            <ul class="ma-0 ps-4">
              <li v-for="(msg, idx) in store.computeErrors" :key="idx">{{ msg }}</li>
            </ul>
          </div>
        </v-alert>
      </div>

      <div class="grid-left-top">
        <RequiredPiecesTable />
      </div>

      <div class="grid-left-bottom">
        <PurchasePlanTable />
      </div>

      <div class="grid-center">
        <CutPlanView />
      </div>

      <div class="grid-right">
        <AvailablePlanksTable />
      </div>
    </div> -->

  <v-container class="py-4" fluid>
    <div v-if="hasAlerts" class="grid-full">
      <v-alert
        class="mb-4"
        density="comfortable"
        type="error"
      >
        <div class="d-flex flex-column ga-1">
          <div class="text-subtitle-2">Computation issues</div>
          <ul class="ma-0 ps-4">
            <li v-for="(msg, idx) in store.computeErrors" :key="idx">{{ msg }}</li>
          </ul>
        </div>
      </v-alert>
    </div>
    <v-row dense>
      <v-col cols="12" lg="6" order="-1" order-lg="0"><CutPlanView /></v-col>
      <v-col cols="12" lg="3"><RequiredPiecesTable /></v-col>
      <v-col cols="12" lg="3"><AvailablePlanksTable /></v-col>
    </v-row>
    <v-row class="mt-3 d-lg-none">
      <v-col cols="12">
        <v-expansion-panels>
          <v-expansion-panel>
            <v-expansion-panel-title>Purchase Plan</v-expansion-panel-title>
            <v-expansion-panel-text>
              <PurchasePlanTable />
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>
    <v-row class="mt-3 d-none d-lg-flex">
      <v-col cols="12"><PurchasePlanTable /></v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
  import { computed, onMounted, ref } from 'vue'
  import AvailablePlanksTable from '@/components/AvailablePlanksTable.vue'
  import CutPlanView from '@/components/CutPlanView.vue'
  import GlobalSettingsCard from '@/components/GlobalSettingsCard.vue'
  import PurchasePlanTable from '@/components/PurchasePlanTable.vue'
  import RequiredPiecesTable from '@/components/RequiredPiecesTable.vue'
  import { buildCutPlanMarkdown } from '@/lib/exportMarkdown'
  import { usePlannerStore } from '@/stores/planner'
  const store = usePlannerStore()

  const settingsDialogOpen = ref(false)
  const hasAlerts = computed(() => store.computeErrors.length > 0)

  // Import/Export handlers
  const importInput = ref<HTMLInputElement | null>(null)
  function onExport (): void {
    const data = store.exportAll()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'plank-planner.json'
    a.click()
    URL.revokeObjectURL(url)
  }
  function onExportMarkdown (): void {
    const md = buildCutPlanMarkdown(store.plankPlan, store.requiredPieces, store.settings.unitSystem)
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
    a.download = `cut-plan-${y}${m}${d}-${hh}${mm}.md`
    a.click()
    URL.revokeObjectURL(url)
  }
  function triggerImport (): void {
    importInput.value?.click()
  }
  async function onImport (e: Event): Promise<void> {
    const input = e.target as HTMLInputElement
    const file = input.files && input.files[0]
    if (!file) return
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      store.importAll(data)
    } catch (error) {
      console.error('Failed to import JSON', error)
    } finally {
      if (importInput.value) importInput.value.value = ''
    }
  }

  // Recompute on page load
  onMounted(() => {
    store.computePlans()
  })
</script>

<style scoped>
/* Responsive CSS grid layout */
.planner-grid {
  display: grid;
  gap: 16px;
  height: calc(100dvh - 126px);
}

/* Small: stack all */
@media (max-width: 959px) {
  .planner-grid {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto auto;
    grid-template-areas:
      'leftTop'
      'leftBottom'
      'right'
      'center';
  }
  .grid-full { grid-area: full; }
  .grid-left-top { grid-area: leftTop; }
  .grid-left-bottom { grid-area: leftBottom; }
  .grid-right { grid-area: right; }
  .grid-center { grid-area: center; }

  .planner-grid.has-alerts {
    grid-template-rows: auto auto auto auto auto;
    grid-template-areas:
      'full'
      'leftTop'
      'leftBottom'
      'right'
      'center';
  }
}

/* Medium: two columns, tables top, cut plan full width below */
@media (min-width: 960px) and (max-width: 1279px) {
  .planner-grid {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: minmax(0, 1fr) minmax(0, 1fr) auto;
    grid-template-areas:
      'leftTop right'
      'leftBottom right'
      'center center';
  }
  .grid-full { grid-area: full; }
  .grid-left-top { grid-area: leftTop; min-height: 0; }
  .grid-left-bottom { grid-area: leftBottom; min-height: 0; }
  .grid-right { grid-area: right; min-height: 0; }
  .grid-center { grid-area: center; }

  .planner-grid.has-alerts {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto minmax(0, 1fr) minmax(0, 1fr) auto;
    grid-template-areas:
      'full full'
      'leftTop right'
      'leftBottom right'
      'center center';
  }
}

/* Large: three columns, center is cut plan spanning both rows */
@media (min-width: 1280px) {
  .planner-grid {
    grid-template-columns: 1fr 1.2fr 1fr;
    grid-template-rows: minmax(0, 1fr) minmax(0, 1fr);
    grid-template-areas:
      'leftTop center right'
      'leftBottom center right';
    align-items: stretch;
  }
  .grid-full { grid-area: full; }
  .grid-left-top { grid-area: leftTop; min-height: 0; overflow: auto; }
  .grid-left-bottom { grid-area: leftBottom; min-height: 0; overflow: auto; }
  .grid-right { grid-area: right; min-height: 0; overflow: auto; }
  .grid-center { grid-area: center; min-height: 0; overflow: auto; }

  .planner-grid.has-alerts {
    grid-template-columns: 1fr 1.2fr 1fr;
    grid-template-rows: auto minmax(0, 1fr) minmax(0, 1fr);
    grid-template-areas:
      'full full full'
      'leftTop center right'
      'leftBottom center right';
  }
}
</style>
