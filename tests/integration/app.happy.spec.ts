import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import App from '@/App.vue'
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
        plugins: [createTestingPinia({ createSpy: vi.fn }), router, vuetify],
      },
    })

    await router.isReady()

    // Placeholder assertions until UI implemented
    expect(wrapper.exists()).toBe(true)
  })
})


