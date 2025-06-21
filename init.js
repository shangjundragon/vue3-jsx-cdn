/**
 *
 * @param options
 * @param [options.swPath]
 * @param [options.scope]
 * @param [options.swConfigData]
 * @param [options.swConfigData.interceptor_mode]
 * @param [options.swConfigData.babel_url]
 * @param [options.swConfigData.cache_version]
 * @returns {Promise<ServiceWorkerRegistration>}
 */
export async function initJsxSw(options = {}) {
    console.log('[main] init')
    const {swPath = './jsx-sw.js', scope = './', swConfigData = {}} = options
    if (!('serviceWorker' in navigator)) {
        throw new Error('您的浏览器不支持Service Worker');
    }


    try {
        await writeSwConfigData(swConfigData)
        const registration = await navigator.serviceWorker.register(swPath, {scope});
        console.log('Service Worker注册成功:', registration);

        // 使用更可靠的方式等待激活
        if (registration.active) {
            return registration;
        }

        await new Promise((resolve) => {
            if (registration.installing) {
                registration.installing.addEventListener('statechange', () => {
                    setTimeout(() => {
                        window.location.reload();
                    }, 100)
                    return registration.active && resolve()
                });
            } else {
                registration.addEventListener('updatefound', () => {
                    registration.installing.addEventListener('statechange',
                        () => {
                            return registration.active && resolve()
                        }
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

async function writeSwConfigData(config = {}) {
    return new Promise((resolve, reject) => {
        // 打开/创建数据库
        const dbName = 'SwSharedDB';
        const storeName = 'appData';
        const dbVersion = 1;

        const request = indexedDB.open(dbName, dbVersion);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(storeName)) {
                // 创建对象存储空间
                db.createObjectStore(storeName, {keyPath: '_id'});
            }
        };

        request.onsuccess = async (event) => {
            const db = event.target.result;
            const tx = db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);

            // 写入初始数据
            const initialData = {
                _id: 'jsx_sw_config',
                ...config
            };

            await store.put(initialData);
            console.log('主线程写入数据成功:', initialData);
            resolve()
        }
    })
}

export async function unregisterServiceWorker() {
    if (!('serviceWorker' in navigator)) return false;

    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map(r => r.unregister()));
    console.log(`已注销 ${registrations.length} 个Service Worker`);

    return registrations.length > 0;
}