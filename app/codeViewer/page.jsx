'use client'

import { Sandpack } from '@codesandbox/sandpack-react'

const files = {
  '/src/App.vue': `<template>
  <div id="app">
    <el-input v-model="message" placeholder="Type something"></el-input>
    <el-button type="primary" @click="handleClick">Click me!</el-button>
    <p>{{ message }}</p>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      message: ''
    }
  },
  methods: {
    handleClick() {
      alert(this.message)
    }
  }
}
</script>`,

  '/src/main.js': `import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import App from './App.vue'

Vue.use(ElementUI)

new Vue({
  render: h => h(App)
}).$mount('#app')`,

  '/package.json': {
    code: JSON.stringify(
      {
        dependencies: {
          vue: '^2.6.14',
          'element-ui': '^2.15.13',
        },
      },
      null,
      2
    ),
  },
}

export default function CodeViewer() {
  return (
    <div className="container">
      <h1>Vue 2 + Element UI Sandbox</h1>
      <Sandpack
        template="vue"
        files={files}
        options={{
          showNavigator: true,
          showTabs: true,
        }}
        customSetup={{
          dependencies: {
            vue: '^2.6.14',
            'element-ui': '^2.15.13',
          },
        }}
      />
    </div>
  )
}
