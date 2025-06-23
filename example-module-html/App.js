const {createApp, ref} = Vue;
import HelloWorld from './component/HelloWorld.js'

const app = createApp({
    setup() {
        const count = ref(0);

        function increment() {
            count.value++
        }

        return () => <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <HelloWorld onClickConfirm={(e) => {
                console.log('onClickConfirm', e)
            }} msg="vue">
                {{
                    header: () => <span>传入header</span>,
                    default: () => <span>传入默认</span>,
                    footer: (list) => <span>{list.join(',')}</span>,
                }}
            </HelloWorld>
            <naive.NButton onClick={increment}>{{ default: () => `count ${count.value}` }}</naive.NButton>
        </div>
    }
});

app.mount('#app');


