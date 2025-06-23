const { onMounted, defineComponent} = Vue;


export default defineComponent(() => {
    onMounted(() => {
        console.log('about页面')
    })
    return () => <div className="bor-red">{{default: () => 'about'}}</div>
})