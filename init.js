export async function registerJsxServiceWorker(swPath = './jsx-sw.js', scope = './') {
    if (!('serviceWorker' in navigator)) {
        throw new Error('您的浏览器不支持Service Worker');
    }

    try {
        const registration = await navigator.serviceWorker.register(swPath, {scope});
        console.log('Service Worker注册成功:', registration);

        // 使用更可靠的方式等待激活
        if (registration.active) {
            return registration;
        }

        await new Promise((resolve) => {
            if (registration.installing) {
                registration.installing.addEventListener('statechange', () => registration.active && resolve());
            } else {
                registration.addEventListener('updatefound', () => {
                    registration.installing.addEventListener('statechange',
                        () => registration.active && resolve()
                    );
                });
            }
        });

        return registration;
    } catch (error) {
        console.error('Service Worker注册失败:', error);
        throw new Error(`Service Worker注册失败: ${error.message}`);
    }
}

export async function unregisterServiceWorker() {
    if (!('serviceWorker' in navigator)) return false;

    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map(r => r.unregister()));
    console.log(`已注销 ${registrations.length} 个Service Worker`);

    return registrations.length > 0;
}