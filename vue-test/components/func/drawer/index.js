const {NDrawer, NDrawerContent, NConfigProvider, zhCN, dateZhCN} = window.naive

/**
 *
 * @param option
 * @param option.props
 * @param option.content
 */
function create(option) {
    const { props = {}, content: Content } = option;

    const appBox = document.createElement('div');
    document.body.appendChild(appBox);

    const showDrawer = ref(false);
    const instance = createApp({
        setup() {
            // 正确的内容渲染函数
            const renderContent = () => {
                // 如果是函数组件
                if (typeof Content === 'function') {
                    return Content();
                }
                // 如果是组件选项对象
                else if (Content && Content.setup) {
                    return h(Content);
                }
                // 直接内容（字符串、VNode 等）
                else {
                    return Content;
                }
            };

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
                    // 关键修复：正确渲染内容
                    () => h(NDrawerContent, null, {
                        default: () => renderContent()
                    })
                )
            );
        }
    });

    instance.mount(appBox);
    showDrawer.value = true;

    function destroy() {
        instance.unmount();
        appBox.remove();
    }

    return {
        destroy,
        close: () => showDrawer.value = false
    };
}

export default {
    create
}
