export default [
    {
        path: '/',
        component: defineAsyncComponent(() => import('../views/home.js')),
        name: 'home',
    },
    {
        path: '/about',
        component: defineAsyncComponent(() => import('../views/about.js')),
        name: 'about',
    },
]