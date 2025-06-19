const { createApp, ref, onMounted, defineComponent, resolveComponent, h, defineAsyncComponent } = Vue;
const {createRouter, createWebHashHistory, RouterView} = VueRouter


async function initApp() {
    // 卸载service-worker
    // await window.serviceWorkerRegistration.unregister()
    console.log('initApp 被调用');

    // 创建脚本加载器
    const script = document.createElement('script');
    script.src = './App.js';
    script.type = 'module';

    // 添加加载成功/失败监听
    script.onload = () => console.log('app.js 加载成功');
    script.onerror = (e) => {
        console.error('App.js 加载失败', e);
        document.getElementById('app').innerText = '脚本加载失败';
    };

    document.body.appendChild(script);
}


// 注册 Service Worker
if ('serviceWorker' in navigator) {
    // 获取 Service Worker 的绝对路径
    const swPath = new URL('./service-worker.js', window.location.href).href;

    navigator.serviceWorker.register(swPath, { scope: './' })
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
                    // 直接尝试初始化
                    initApp();
                }
            }
        })
        .catch(err => {
            console.error('注册 Service Worker 出错:', err);
            document.getElementById('app').innerText = '错误: ' + err.toString();
        });
} else {
    alert('浏览器版本过低!')
}