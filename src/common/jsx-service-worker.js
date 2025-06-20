const VERSION = '19'
const BABEL_URL = 'https://unpkg.com/@babel/standalone@7.27.6/babel.js';
//const BABEL_URL = 'https://unpkg.com/@babel/standalone@7.27.6/babel.min.js';
const JSX_PRAGMA = '/* @jsx Vue.h */';

self.addEventListener('install', event => {
    console.log('[SW] 安装成功');
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    console.log('[SW] 激活成功');
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // 只处理同源JS文件，排除特定文件
    if (shouldIntercept(url)) {
        event.respondWith(handleJSRequest(event.request));
    }
});

// 判断是否应该拦截请求
function shouldIntercept(url) {
    if (!url.pathname.endsWith('.js') || url.searchParams.has('no-jsx')) {
        return false;
    }
    return true
}

// 处理JS请求
async function handleJSRequest(request) {
    try {
        const response = await fetch(request);

        // 只处理200成功的响应
        if (!response.ok || response.status !== 200) {
            return response;
        }

        // 克隆响应以便多次使用
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
        console.error('[SW] JS请求处理失败:', error);
        return fetch(request);
    }
}

// 转换JSX为Vue h函数
async function transformJSX(code) {
    try {
        // 添加JSX pragma注释
        const jsxCode = JSX_PRAGMA + code;

        // 确保Babel已加载
        if (typeof Babel === 'undefined') {
            await loadBabel();
        }

        // 转换JSX
        return Babel.transform(jsxCode, {
            presets: ['react'],
            plugins: [
                ['transform-react-jsx', {
                    pragma: 'Vue.h',
                    pragmaFrag: 'Vue.Fragment'
                }]
            ],
            sourceMaps: false
        }).code;
    } catch (error) {
        console.error('[SW] JSX转换失败:', error);
        return code; // 返回原始代码作为回退
    }
}

// 加载Babel库
async function loadBabel() {
    try {
        console.log('[SW] 正在加载Babel...');
        const response = await fetch(BABEL_URL);
        const script = await response.text();

        // 安全地执行Babel脚本
        (0, eval)(script);

        // 设置全局Babel引用
        self.Babel = Babel;
        console.log('[SW] Babel加载完成');
    } catch (error) {
        console.error('[SW] Babel加载失败:', error);
        throw error;
    }
}