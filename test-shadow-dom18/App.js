const {createApp, ref} = Vue;

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
            <naive.NButton onClick={increment}>count {count.value}</naive.NButton>
        </div>
    }
});

app.mount('#app');


