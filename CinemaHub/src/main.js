import { createApp } from 'vue'
import './style.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import App from './App.vue'
import router from './router'
import * as directives from './directives'

const app = createApp(App)

// Register custom directives
Object.keys(directives).forEach(key => {
    app.directive(key, directives[key])
})

app.use(router).mount('#app')
