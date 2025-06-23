const {RouterView} = VueRouter
const {createApp, onMounted} = Vue;
import router from './router/index.js'

function routerPush(name) {
    return router.push({name})
}

const app = createApp({
    setup() {
        return () => <div style={{padding: '1rem'}}>
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem'}}>
                <naive.NButton onClick={() => routerPush('home')} type={'primary'}>{{ default: () => 'home 页面' }}</naive.NButton>
                <naive.NButton onClick={() => routerPush('about')}>{{ default: () => 'about 页面' }}</naive.NButton>
            </div>
            <RouterView></RouterView>
        </div>
    }
});

app.use(window.naive)
    .use(router)
    .mount('#app');


