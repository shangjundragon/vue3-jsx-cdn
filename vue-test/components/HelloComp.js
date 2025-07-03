import drawer from './func/drawer/index.js'
import HiComp from "./HiComp.js";

export default {
    template: `
        <div style="display: flex;flex-direction: column;gap: 1rem">
            <n-button @click="increment">count {{count}}</n-button>
            <n-button @click="test">Drawer</n-button>
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
                    //content: () => h('div', null, h(naive.NButton, {type: 'primary'}, () => 'NButton'))
                    content: {
                        template: `
                            <div>
                                <n-button>NButton</n-button>
                            </div>
                        `,
                        components: {
                            NButton: naive.NButton
                        },
                        setup() {}
                    }
                    //content: h(naive.NButton, {}, () => 'NButton'),

                })
            }
        }
    }
}