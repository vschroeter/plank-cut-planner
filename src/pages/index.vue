<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <ComputeStatusBar />
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
      <v-col cols="12" md="4">
        <GlobalSettingsCard />
      </v-col>
      <v-col cols="12" md="8">
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
import AvailablePlanksTable from '@/components/AvailablePlanksTable.vue'
import RequiredPiecesTable from '@/components/RequiredPiecesTable.vue'
import GlobalSettingsCard from '@/components/GlobalSettingsCard.vue'
import PurchasePlanTable from '@/components/PurchasePlanTable.vue'
import CutPlanView from '@/components/CutPlanView.vue'
import ComputeStatusBar from '@/components/ComputeStatusBar.vue'
</script>
