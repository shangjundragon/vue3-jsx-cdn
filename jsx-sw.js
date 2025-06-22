const version = 'v1.0.0'
let babelLoaded = false;


let CONFIG = {
    // A 拦截所有js，要忽略的js需添加?no-jsx参数  B 只拦截参数中带有?jsx的js
    interceptor_mode: 'A',
    // babel/standalone的地址
    babel_url: 'https://unpkg.com/@babel/standalone@7.27.6/babel.min.js',
}

self.addEventListener('install', (event) => {
    console.log('[jsx-sw] install')
    /*event.waitUntil(
        preloadBabel().catch(console.error)
    );*/
});

self.addEventListener('activate', (event) => {
    console.log('[jsx-sw] activate')
    event.waitUntil(handleActivation());
});

async function transformJSX(code) {
    if (!babelLoaded) await preloadBabel();

    try {
        return Babel.transform(code, {
            presets: ['react'],
            plugins: [
                ['transform-react-jsx', {
                    pragma: 'Vue.h',
                    pragmaFrag: 'Vue.Fragment'
                }]
            ]
        }).code;
    } catch (e) {
        console.error('JSX转换失败', e);
        return code; // 返回原始代码
    }
}

self.addEventListener('fetch', (event) => {
    console.log('====')
    const url = new URL(event.request.url);
    if (!url.pathname.endsWith('.js')) {
        return;
    }
    if (CONFIG.interceptor_mode === 'A') {
        if (url.searchParams.has('no-jsx')) {
            // 参数标识no-jsx 不拦截
            return;
        }
    } else if (CONFIG.interceptor_mode === 'B') {
        if (!url.searchParams.has('jsx')) {
            // 参数没有标识jsx 不拦截
            return;
        }
    }
    event.respondWith(handleFetch(event.request));
});


// 处理请求的核心函数
async function handleFetch(request) {
    try {
        const response = await fetch(request);

        // 只处理成功的JS响应
        if (!response.ok || response.status !== 200) {
            return response;
        }

        // 克隆响应以便读取内容
        const clonedResponse = response.clone();
        const originalText = await clonedResponse.text();

        // 转换JSX
        const transformed = await transformJSX(originalText);

        // 返回转换后的响应
        return new Response(transformed, {
            headers: response.headers,
            status: response.status,
            statusText: response.statusText
        });

    } catch (error) {
        console.error('[SW] 请求处理失败:', error);
        // 降级处理：返回原始请求
        return fetch(request);
    }
}

// ===== 核心功能函数 =====
async function preloadBabel() {
    console.log('[jsx-sw] 加载Babel')
    const configData = await readIndexDbConfigData().catch(e => {
        console.error(e);
    })
    // 合并有效配置
    CONFIG = mergeObjects(configData, CONFIG);
    console.log('[jsx-sw] CONFIG', CONFIG)
    const babelUrl = configData?.babelUrl ?? CONFIG.babel_url
    console.log('[jsx-sw] babelUrl', babelUrl)

    // 从网络加载并缓存
    const response = await fetch(babelUrl);
    if (!response.ok) {
        throw new Error('Babel加载失败')
    }
    const babelScriptText = await response.text()

    try {
        // 安全执行脚本
        (0, eval)(babelScriptText);
        self.Babel = Babel; // 全局引用
        babelLoaded = true;
    } catch (e) {
        console.error('Babel执行失败', e);
        throw e;
    }
}


async function handleActivation() {
    // 清理旧版本缓存
    const keys = await caches.keys();
    await Promise.all(
        keys.filter(key => key.startsWith('babel-cache-') && key !== version)
            .map(key => caches.delete(key))
    );

    await self.clients.claim();
}

async function readIndexDbConfigData() {
    const dbName = 'SwSharedDB';
    const storeName = 'appData';
    const version = 1; // 明确指定版本号

    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, version); // 添加版本号

        // 添加升级处理
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(storeName)) {
                db.createObjectStore(storeName, {keyPath: 'id'});
                console.log(`创建对象存储: ${storeName}`);
            }
        };

        request.onsuccess = (event) => {
            const db = event.target.result;

            // 检查对象存储是否存在
            if (!db.objectStoreNames.contains(storeName)) {
                reject(new Error(`对象存储 ${storeName} 不存在`));
                db.close();
                return;
            }

            const tx = db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const getRequest = store.get('jsx_sw_config');

            getRequest.onsuccess = () => {
                const data = getRequest.result;
                if (data) {
                    self.theme = data.theme;
                } else {
                    console.warn('未找到配置数据');
                }
                db.close();
                resolve(data);
            };

            getRequest.onerror = (e) => {
                console.error('读取数据失败', e);
                db.close();
                reject(e);
            };
        };

        request.onerror = (e) => {
            console.error('打开数据库失败', e);
            reject(e);
        };
    });
}

/**
 * 合并两个对象，保留有效值
 * @param {Object} obj1 - 第一个对象
 * @param {Object} obj2 - 第二个对象
 * @param {Function} [isValid=(v) => v !== undefined && v !== null] - 自定义有效性判断函数
 * @returns {Object} - 合并后的对象
 */
function mergeObjects(obj1, obj2, isValid = (v) => v !== undefined && v !== null) {
    const result = {};
    const keys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

    for (const key of keys) {
        const val1 = obj1[key];
        const val2 = obj2[key];

        if (isValid(val1)) {
            result[key] = val1;
        } else if (isValid(val2)) {
            result[key] = val2;
        } else {
            // 如果两者都无效，可选保留默认值（如 undefined）
            result[key] = val2;
        }
    }

    return result;
}