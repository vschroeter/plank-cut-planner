<template>
  <v-container fluid>
    <v-navigation-drawer v-model="drawer" location="right" :permanent="true" width="360">
      <GlobalSettingsCard />
    </v-navigation-drawer>
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center">
          <ComputeStatusBar />
          <v-btn icon="mdi-cog" @click="drawer = !drawer" />
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="6">
        <AvailablePlanksTable />
      </v-col>
      <v-col cols="12" md="6">
        <RequiredPiecesTable />
      </v-col>
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
import RequiredPiecesTable from '@/components/RequiredPiecesTable.vue'
import GlobalSettingsCard from '@/components/GlobalSettingsCard.vue'
import PurchasePlanTable from '@/components/PurchasePlanTable.vue'
import CutPlanView from '@/components/CutPlanView.vue'
import ComputeStatusBar from '@/components/ComputeStatusBar.vue'
const drawer = useLocalStorage<boolean>('planner.settingsDrawerOpen', true)
</script>
