import Vue from 'vue'
import {
  Vuetify,
  VApp,
  VCard,
  VFooter,
  VList,
  VBtn,
  VIcon,
  VGrid,
  VToolbar,
  VSelect,
  VForm,
  VTabs,
  VTextField,
  VTextarea,
  VMenu,
  VDivider,
  VExpansionPanel,
  VDataTable,
  VProgressLinear,
  VImg
} from 'vuetify'

Vue.use(Vuetify, {
  theme: {
    primary: '#9c27b0',
    accent: '#ce93d8',
    secondary: '#424242',
    info: '#0D47A1',
    warning: '#ffb300',
    error: '#B71C1C',
    success: '#2E7D32'
  },
  components: {
    VApp,
    VCard,
    VFooter,
    VList,
    VBtn,
    VIcon,
    VGrid,
    VToolbar,
    VSelect,
    VForm,
    VTabs,
    VTextField,
    VTextarea,
    VMenu,
    VDivider,
    VExpansionPanel,
    VDataTable,
    VProgressLinear,
    VImg
  }
})
