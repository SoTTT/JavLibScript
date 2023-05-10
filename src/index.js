import { createApp } from 'vue'
import App from './App.vue'

window.onload = function () {
    const tool = document.createElement("div")
    tool.id = "app"
    document.body.appendChild(tool)
    console.log(111)

    createApp(App).mount("#app")
}



