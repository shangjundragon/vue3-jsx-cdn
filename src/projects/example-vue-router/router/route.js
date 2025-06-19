export default [
    {
        path: '/',
        component: () => import('../views/home.js'),
        name: 'home',
    },
    {
        path: '/about',
        component: () => import('../views/about.js'),
        name: 'about',
    },
]