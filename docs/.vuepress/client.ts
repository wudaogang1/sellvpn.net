import { defineClientConfig } from 'vuepress/client'
import './theme/styles/custom.css'
import Layout from './theme/layouts/Layout.vue'

export default defineClientConfig({
  layouts: {
    Layout,
  },
})
