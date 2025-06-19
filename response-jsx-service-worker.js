console.log('Service Worker 已加载');

// 安装阶段：获取 Babel 编译器
self.addEventListener('install', e => {
    console.log('Service Worker 安装开始');
    // 获取 Babel 编译器
    async function getBabel() {
        try {
            const r = await fetch('./src/assets/lib/babel-standalone/babel.js');
            const babelCode = await r.text();
            eval(babelCode);
            console.log('Babel 已加载到 Service Worker');
        } catch (err) {
            console.error('加载 Babel 失败:', err);
        }
    }
    e.waitUntil(getBabel());
});

// 激活阶段：清理旧缓存
self.addEventListener('activate', e => {
    console.log('Service Worker 激活');
    e.waitUntil(self.clients.claim());
});

// 拦截路径匹配
const interceptorPaths = [
    '/App.js',
    '/src/router',
    '/src/store',
    '/src/views',
]
// 拦截和处理请求
self.addEventListener('fetch', e => {
    const url = new URL(e.request.url);
    const pathname = url.pathname;
    // 不是js 或不在拦截路径
    if (!pathname.endsWith('.js') || !interceptorPaths.some(s => pathname.includes(s))) {
        return;
    }
    e.respondWith(handleRequest(e.request));
});


// 处理请求
async function handleRequest(request) {
    try {
        const response = await fetch(request);
        if (response.status !== 200) return response;
        const text = await response.text();
        // 关键 /* @jsx Vue.h */
        const vueJsx = `/* @jsx Vue.h */\n${text}`;
        // 使用正确配置转译
        const js = Babel.transform(vueJsx, {presets: ['react'],}).code;

        return new Response(js, {
            headers: {'Content-Type': 'application/javascript'}
        });
    } catch (err) {
        console.error('转译失败:', err);
        return new Response(`console.error("JSX 转译错误");`, {
            status: 500,
            headers: {'Content-Type': 'application/javascript'}
        });
    }
}


// 激活事件确保控制页面
self.addEventListener('activate', e => {
    e.waitUntil(self.clients.claim());
});