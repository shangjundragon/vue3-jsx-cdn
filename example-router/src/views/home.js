const {onMounted, defineComponent, ref} = Vue;
export default defineComponent(() => {
    onMounted(() => {
        console.log('home页面')
    })
    const count = ref(0);
    function increment() {
        count.value++
    }
    return () => <div >
        <h1>home页面</h1>
        <naive.NButton onClick={increment}> {{ default: () => `count ${count.value}` }}</naive.NButton>
    </div>
})