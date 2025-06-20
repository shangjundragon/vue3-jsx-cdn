# Vue3 + JSX + CDN 方案

- 通过service-worker拦截jsx转换为Vue.h 支持es6模块化

## unpkg版本锁定

- vue3
    - 开发环境：https://unpkg.com/vue@3.5.17/dist/vue.global.js
    - 生产环境：https://unpkg.com/vue@3.5.17/dist/vue.global.prod.js
- vue-router
    - 开发环境：https://unpkg.com/vue-router@4.5.1/dist/vue-router.global.js
    - 生产环境：https://unpkg.com/vue-router@4.5.1/dist/vue-router.global.prod.js
- naive ui
    - 开发环境：https://unpkg.com/naive-ui@2.42.0/dist/index.js
    - 生产环境：https://unpkg.com/naive-ui@2.42.0/dist/index.prod.js
- babel-standalone
    - 开发环境：https://unpkg.com/@babel/standalone@7.27.6/babel.js
    - 生产环境：https://unpkg.com/@babel/standalone@7.27.6/babel.min.js
