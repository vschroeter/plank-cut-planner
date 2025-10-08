import { useLocalStorage } from '@vueuse/core'
import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', () => {
  const lastWidthMm = useLocalStorage<number | null>('ui.lastWidthMm', null)

  function setLastWidthMm (widthMm: number): void {
    lastWidthMm.value = widthMm
  }

  return {
    lastWidthMm,
    setLastWidthMm,
  }
})
