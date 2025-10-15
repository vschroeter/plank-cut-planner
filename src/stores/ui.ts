import { useLocalStorage } from '@vueuse/core'
import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', () => {
  const lastWidthMm = useLocalStorage<number | null>('ui.lastWidthMm', null)
  const lastLengthMm = useLocalStorage<number | null>('ui.lastLengthMm', null)

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
  }
})
