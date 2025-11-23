import { createApp } from 'vue'
import './style.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import App from './App.vue'
import router from './router'
import * as directives from './directives'
import vue3GoogleLogin from "vue3-google-login"

const app = createApp(App)

// Register custom directives
Object.keys(directives).forEach(key => {
    app.directive(key, directives[key])
})
app.use(vue3GoogleLogin, {
	clientId: "425392999066-4r3u3s7k1flo741vv4v7nglvv76crqqr.apps.googleusercontent.com",
})
app.use(router).mount('#app')
