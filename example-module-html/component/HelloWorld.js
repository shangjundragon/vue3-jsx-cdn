const {defineComponent, ref} = Vue

export default defineComponent(
    (props, { slots, emit }) => {
        const list = ref([1, 2, 3])

        function clickConfirm() {
            emit('click-confirm', {msg: 'hello'})
        }

        return () => <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center'}}>
            {slots.header?.() || 'header插槽'}
            {slots.default?.() || '默认插槽'}
            <div>Hello World {props.msg}</div>
            <naive.NButton onClick={clickConfirm}>确定</naive.NButton>
            {slots.footer?.(list.value) || 'footer插槽'}
        </div>
    },
    {
        props: {
            msg: {
                type: String,
            }
        },
        emits: ['click-confirm']
    }
)