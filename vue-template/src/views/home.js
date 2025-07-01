export default defineComponent({
    template: `
        <div>
            <h1>home 页面</h1>
            <n-button @click="() => count++">count {{count}}</n-button>
        </div>
    `,
    setup() {
        const count = ref(0)

        return {
            count
        }
    }
})

