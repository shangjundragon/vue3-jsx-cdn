import AppStore from "../store/app-store.js";
const {onMounted, defineComponent} = Vue;
export default defineComponent(() => {
    onMounted(() => {
        console.log('home页面', AppStore.value.AppName)
    })
    return () => <div className="bor-red">home页面</div>
})