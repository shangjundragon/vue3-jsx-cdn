import drawer from './func/drawer/index.js'

export default defineComponent({
    template: `
        <div>
            <n-button @click="increment">count {{count}}</n-button>
            <n-button @click="test">test</n-button>
        </div>    
    `,
    setup() {
        const count = ref(0)

        function increment() {
            count.value++
        }

        return {
            count,
            increment,
            test() {
                drawer.create({
                    props: {
                      width: '50vw'
                    },
                    content: () => h('span', null, '文字')
                })
            }
        }
    }
})