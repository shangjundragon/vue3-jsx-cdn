
export async function registerServiceWorker(swPath, scope = new URL('./', window.location.href).href) {
    // 检查浏览器支持
    if (!('serviceWorker' in navigator)) {
        throw new Error('您的浏览器不支持Service Worker');
    }
    try {
        // 注册Service Worker
        const registration = await navigator.serviceWorker.register(swPath, {scope});

        console.log('Service Worker注册成功:', registration);

        // 等待Service Worker激活
        await waitForSWActivation(registration);

        return registration;
    } catch (error) {
        console.error('Service Worker注册失败:', error);
        throw new Error(`Service Worker注册失败: ${error.message}`);
    }
}

// 等待Service Worker激活
export function waitForSWActivation(registration) {
    return new Promise((resolve, reject) => {
        // 如果已经激活，立即解决
        if (registration.active) {
            console.log('Service Worker已激活');
            return resolve();
        }

        // 监听新worker的安装
        if (registration.installing) {
            registration.installing.addEventListener('statechange', (event) => {
                if (event.target.state === 'activated') {
                    console.log('Service Worker已激活');
                    resolve();
                }
            });
            return;
        }

        // 监听等待中的worker
        if (registration.waiting) {
            registration.waiting.addEventListener('statechange', (event) => {
                if (event.target.state === 'activated') {
                    console.log('Service Worker已激活');
                    resolve();
                }
            });
            return;
        }

        // 如果没有找到worker，等待updatefound事件
        registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'activated') {
                    console.log('Service Worker已激活');
                    resolve();
                }
            });
        });

        // 设置超时以防万一
        setTimeout(() => {
            reject(new Error('等待Service Worker激活超时'));
        }, 10000); // 10秒超时
    });
}

// 注销Service Worker
export async function unregisterServiceWorker() {
    if (!('serviceWorker' in navigator)) return false;

    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
        await registration.unregister();
        console.log('Service Worker已注销');
    }

    return registrations.length > 0;
}