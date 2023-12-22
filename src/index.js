import { createApp } from 'vue'
import App from './App.vue'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

const linkNode = document.createElement("link")
linkNode.href = "https://cdn.jsdelivr.net/npm/@mdi/font@5.x/css/materialdesignicons.min.css"
linkNode.rel = "stylesheet"

const tool = document.createElement("div")
tool.id = "app"

document.body.appendChild(linkNode)
document.body.appendChild(tool)


const vuetify = createVuetify({
    components,
    directives,
    icons: {
        defaultSet: 'mdi',
        aliases,
        sets: {
            mdi,
        },
    },
})


createApp(App).use(vuetify).mount("#app")



