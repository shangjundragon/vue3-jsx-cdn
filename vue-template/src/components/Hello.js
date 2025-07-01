export default defineComponent({
    template: `
        <div>
            你好 {{username}}
        </div>
    `,
    props: {
        username: String,
    },
    setup() {

    }
})