const CONFIG = {
    // A 拦截所有js，要忽略的js需添加?no-jsx参数  B 只拦截参数中带有?jsx的js
    interceptor_mode: 'A',
    // babel/standalone的地址
    babel_url: 'https://unpkg.com/@babel/standalone@7.27.6/babel.min.js',
}

self.addEventListener('install', e => {
    console.log('[sw] install')
    // 强制跳过等待阶段
    e.waitUntil(
        getBabel().then(() => self.skipWaiting())
    );
});

// 新增activate事件处理
self.addEventListener('activate', e => {
    // 立即接管所有客户端
    e.waitUntil(Promise.all([self.clients.claim(), self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
            client.postMessage('Hello from Service Worker!');
        });
    })]));
});

self.addEventListener('fetch', event => {
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
    event.respondWith(handleRequest(event.request))
})

async function getBabel() {
    console.log('[sw] 加载babel')
    const r = await fetch(CONFIG.babel_url)
    eval(await r.text())
}

async function handleRequest(request) {
    const url = new URL(request.url)
    const r = await fetch(request)
    if (r.status === 200 & url.host === location.host && url.pathname.endsWith('.js')) {
        if (!Babel) {
            await getBabel()
        }
        const jsx = await r.text()
        const js = Babel.transform(jsx, {
            presets: ['react'],
            plugins: [
                ['transform-react-jsx', {
                    pragma: 'Vue.h',
                    pragmaFrag: 'Vue.Fragment'
                }]
            ]
        }).code
        return new Response(js, r)
    } else {
        return r
    }
}