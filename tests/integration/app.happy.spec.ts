import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import App from '@/App.vue'
import { usePlannerStore } from '@/stores/planner'
import { createRouter, createWebHistory } from 'vue-router'

describe('App happy path', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders purchase plan and cut plan after entering data', async () => {
    const router = createRouter({ history: createWebHistory(), routes: [{ path: '/', component: App }] })
    const vuetify = createVuetify()
    const wrapper = mount(App, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false }), router, vuetify],
      },
    })

    await router.isReady()

    // populate store and compute
    const store = usePlannerStore()
    store.addPlank({ articleNr: 'A', widthMm: 100, lengthMm: 1000, pricePerPiece: 10, availablePieces: null })
    store.addRequiredPiece({ widthMm: 100, lengthMm: 400, quantity: 2 })
    store.computePlans()
    await wrapper.vm.$nextTick()

    // assert purchase plan table and cut plan show data
    expect(store.purchasePlan.length).toBeGreaterThan(0)
    expect(store.cutPlan.items.length).toBeGreaterThan(0)
    expect(store.totalCuts).toBeGreaterThanOrEqual(1)
  })
})


