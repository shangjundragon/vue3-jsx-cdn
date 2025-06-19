const {createRouter, createWebHashHistory} = VueRouter
import routes from './route.js'

const router = createRouter({

    history: createWebHashHistory(),
    routes,
})

export default router