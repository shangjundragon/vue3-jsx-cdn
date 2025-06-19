const { createApp, ref, onMounted, defineComponent, resolveComponent, h, defineAsyncComponent } = Vue;
const {createRouter, createWebHashHistory, RouterView} = VueRouter

//unregisterServiceWorker().then(() => registerServiceWorker())
registerServiceWorker()

async function initApp() {
    console.log('initApp');
    const script = document.createElement('script');
    script.src = './App.js';
    script.type = 'module';
    document.body.appendChild(script);
}


async function registerServiceWorker() {
    if (!'serviceWorker' in navigator) {
        alert('浏览器版本过低!')
        return
    }

    // 获取 Service Worker 的绝对路径
    const swPath = new URL('./service-worker.js', window.location.href).href;

    navigator.serviceWorker.register(swPath, {scope: './'})
        .then(registration => {
            window.serviceWorkerRegistration = registration;
            console.log('Service Worker 注册成功:', registration);

            // 激活状态检测
            if (registration.active && registration.active.state === 'activated') {
                console.log('Service Worker 已激活');
                initApp();
            } else {
                const worker = registration.installing || registration.waiting;

                if (worker) {
                    const stateChangeHandler = () => {
                        if (worker.state === 'activated') {
                            console.log('Service Worker 激活成功');
                            worker.removeEventListener('statechange', stateChangeHandler);
                            initApp();
                        }
                    };

                    worker.addEventListener('statechange', stateChangeHandler);
                } else {
                    console.warn('没有活动的 Service Worker');
                }
            }
        })
        .catch(err => {
            console.error('注册 Service Worker 出错:', err);
            document.getElementById('app').innerText = '错误: ' + err.toString();
        });

}


async function unregisterServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            // 获取当前作用域的注册
            const registration = await navigator.serviceWorker.getRegistration('./');

            if (registration) {
                const result = await registration.unregister();
                if (result) {
                    console.log('Service Worker 注销成功');
                } else {
                    console.log('注销失败: Service Worker 可能已被移除');
                }
            } else {
                console.log('未找到注册的 Service Worker');
            }
        } catch (error) {
            console.error('注销过程中出错:', error);
        }
    } else {
        console.warn('浏览器不支持 Service Worker');
    }
}