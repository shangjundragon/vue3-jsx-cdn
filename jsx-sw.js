const VERSION = '37';
const BABEL_URL = 'https://unpkg.com/@babel/standalone@7.27.6/babel.min.js';
const CACHE_NAME = `babel-cache-1`;

let babelLoaded = false;

self.addEventListener('install', (event) => {
    event.waitUntil(
        preloadBabel().catch(console.error)
    );
});

self.addEventListener('activate', (event) => {
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
    const url = new URL(event.request.url);
    if (!url.pathname.endsWith('.js') || url.searchParams.has('no-jsx')) {
        return;
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
    const cache = await caches.open(CACHE_NAME);

    // 检查缓存中是否有Babel
    const cachedResponse = await cache.match(BABEL_URL);
    if (cachedResponse) {
        await executeScript(await cachedResponse.text());
        return;
    }

    // 从网络加载并缓存
    const response = await fetch(BABEL_URL);
    if (!response.ok) throw new Error('Babel加载失败');

    // 克隆响应用于缓存和执行
    const clone = response.clone();
    await cache.put(BABEL_URL, clone);

    await executeScript(await response.text());
}

async function executeScript(script) {
    try {
        // 安全执行脚本
        (0, eval)(script);
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
        keys.filter(key => key.startsWith('babel-cache-') && key !== CACHE_NAME)
            .map(key => caches.delete(key))
    );

    await self.clients.claim();
}


