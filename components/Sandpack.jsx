'use client'
import { Sandpack as SandpackComponent } from '@codesandbox/sandpack-react'

export default function Sandpack({ content }) {
  const files = {
    '/src/App.vue': content,
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

  return (
    <SandpackComponent
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
  )
}
