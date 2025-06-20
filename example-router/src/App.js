const {RouterView} = VueRouter
const {createApp, onMounted} = Vue;
import router from './router'

function routerPush(name) {
    return router.push({name})
}

const app = createApp({
    setup() {
        return () => <div style={{padding: '1rem'}}>
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem'}}>
                <naive.NButton onClick={() => routerPush('home')} type={'primary'}>home页面</naive.NButton>
                <naive.NButton onClick={() => routerPush('about')}>about页面</naive.NButton>
            </div>
            <RouterView></RouterView>
        </div>
    }
});

app.use(window.naive)
    .use(router)
    .mount('#app');


