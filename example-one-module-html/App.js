const {createApp, ref} = Vue;
const app = createApp({
    setup() {

        const count = ref(0);

        function increment() {
            count.value++
        }

        return () => <div>
            <naive.NButton onClick={increment}>count {count.value}</naive.NButton>
        </div>
    }
});

app.mount('#app');


