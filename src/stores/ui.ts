import { useLocalStorage } from '@vueuse/core'
import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', () => {
  const lastWidthMm = useLocalStorage<number | null>('ui.lastWidthMm', null)
  const lastLengthMm = useLocalStorage<number | null>('ui.lastLengthMm', null)
  // Synced table heights between RequiredPiecesTable and AvailablePlanksTable
  // min: header + 5 rows; max: measured height of RequiredPieces table content
  const syncedTablesMinPx = useLocalStorage<number>('ui.syncedTablesMinPx', 0)
  const syncedTablesMaxPx = useLocalStorage<number>('ui.syncedTablesMaxPx', 0)

  function setLastWidthMm (widthMm: number): void {
    lastWidthMm.value = widthMm
  }
  function setLastLengthMm (lengthMm: number): void {
    lastLengthMm.value = lengthMm
  }

  return {
    lastWidthMm,
    lastLengthMm,
    setLastWidthMm,
    setLastLengthMm,
    syncedTablesMinPx,
    syncedTablesMaxPx,
  }
})
