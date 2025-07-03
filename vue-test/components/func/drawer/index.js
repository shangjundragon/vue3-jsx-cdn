const {NDrawer, NDrawerContent, NConfigProvider, zhCN, dateZhCN } = window.naive

/**
 *
 * @param option
 * @param option.props
 * @param option.content
 */
function create(option) {
    const {
        props = {},
        content
    } = option

    const appBox = document.createElement('div')
    document.body.appendChild(appBox)
    const showDrawer = ref(false)
    const instance = createApp({
        setup() {

            const {onAfterLeave} = props
            props['on-after-leave'] = () => {
                try {
                    onAfterLeave?.()
                } finally {
                    destroy()
                }
            }
            const DrawerContent = () => {
                if (typeof content === 'function') {
                    return content()
                }
                return content
            }

            return () => h(
                NConfigProvider,
                {
                    'inline-theme-disabled': true,
                    locale: zhCN,
                    'date-locale': dateZhCN,

                },

                () => h(
                    NDrawer,
                    {
                        show: showDrawer.value,
                        'onUpdate:show': value => showDrawer.value = value,
                        ...props
                    },
                    () => h(NDrawerContent, null, {
                        default: () => DrawerContent()
                    })
                )
            )
        }
    })

    instance.mount(appBox);
    showDrawer.value = true

    function destroy() {
        instance.unmount()
        appBox.remove()
    }

    return {
        destroy,
        close: () => showDrawer.value = false
    }
}

export default {
    create
}
