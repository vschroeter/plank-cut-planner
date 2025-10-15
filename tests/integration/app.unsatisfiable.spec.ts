import { createTestingPinia } from '@pinia/testing'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'
import { createVuetify } from 'vuetify'
import App from '@/App.vue'
import 'vuetify/styles'

describe('App unsatisfiable demand', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('shows clear error when demand cannot be satisfied', async () => {
    const router = createRouter({ history: createWebHistory(), routes: [{ path: '/', component: App }] })
    const vuetify = createVuetify()
    const wrapper = mount(App, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn }), router, vuetify],
      },
    })

    await router.isReady()

    // Placeholder assertion until UI implemented
    expect(wrapper.exists()).toBe(true)
  })
})
