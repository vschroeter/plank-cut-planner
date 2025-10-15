/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Composables
import { createVuetify } from 'vuetify'
// Styles
import '@mdi/font/css/materialdesignicons.css'

import 'vuetify/styles'

const darkTheme = {
  dark: true,
  colors: {
    'background': '#0F1115',
    'surface': '#151821',
    'surface-2': '#1B2030',
    'primary': '#8AB4F8',
    'secondary': '#82E3C8',
    'error': '#FF6B6B',
    'warning': '#FFB86B',
    'success': '#5BD38A',
    'info': '#7AA2F7',
  },
}

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: 'darkTheme',
    themes: {
      darkTheme,
    },
  },
  defaults: {
    VCard: { rounded: 'xl', elevation: 1, variant: 'flat' },
    VBtn: { rounded: 'lg', density: 'comfortable' },
    VTextField: { variant: 'outlined', density: 'compact' },
    VDataTable: { density: 'compact', hover: true, fixedHeader: true },
    VChip: { size: 'small', variant: 'tonal' },
  },
})
