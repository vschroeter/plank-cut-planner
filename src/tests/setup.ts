import { config } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

// Provide Vuetify plugin for component tests
const vuetify = createVuetify({})

config.global.plugins = [vuetify]

// Stub out non-essential components to reduce noise
config.global.stubs = {
  'transition': false,
  'v-icon': true,
}
