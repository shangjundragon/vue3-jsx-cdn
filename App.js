const {RouterView} = VueRouter
const {createApp, onMounted} = Vue;
import router from './src/router/router.js'

function routerPush(name) {
    return router.push({name})
}

const app = createApp({
    setup() {
        onMounted(() => {
            document.querySelector('#Loading')?.remove()
        })
        return () => <div className="pd-05r fx-column fx-gp10">
            <div className="fx fx-gp10">
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


