const { onMounted, defineComponent} = Vue;
import AppStore from "../store/app-store.js";
export default defineComponent(() => {
    onMounted(() => {
        console.log('about页面', AppStore.value.AppName)
    })
    return () => <div className="bor-red">about页面</div>
})