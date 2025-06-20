export function loadScript(src, type) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        if (type) {
            script.type = type;
        }
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);

    });
}

export function loadLink(href, rel = 'stylesheet') {
    return new Promise((resolve, reject) => {
        const linkElement = document.createElement('link');
        linkElement.href = href;
        linkElement.rel = rel;

        linkElement.onload = () => {
            resolve();
        };
        linkElement.onerror = (event) => {

            reject(new Error(`Failed to load ${href}`));
        };
        document.head.appendChild(linkElement);
    });
}

export function loadVueScript(IS_PROD, arr = []) {
    let src = IS_PROD ? 'https://unpkg.com/vue@3.5.17/dist/vue.global.prod.js?no-jsx=1' : 'https://unpkg.com/vue@3.5.17/dist/vue.global.js?no-jsx=1'
    if (arr.length > 0) {
        src = IS_PROD ? arr[0] : arr[1]
    }
    return loadScript(src)
}

export function loadVueRouterScript(IS_PROD, arr = []) {
    let src = IS_PROD ? 'https://unpkg.com/vue-router@4.5.1/dist/vue-router.global.js?no-jsx=1' : 'https://unpkg.com/vue-router@4.5.1/dist/vue-router.global.prod.js?no-jsx=1'
    if (arr.length > 0) {
        src = IS_PROD ? arr[0] : arr[1]
    }
    return loadScript(src)
}

export function loadNaiveUiScript(IS_PROD, arr = []) {
    let src = IS_PROD ? 'https://unpkg.com/naive-ui@2.42.0/dist/index.prod.js?no-jsx=1' : 'https://unpkg.com/naive-ui@2.42.0/dist/index.js?no-jsx=1'
    if (arr.length > 0) {
        src = IS_PROD ? arr[0] : arr[1]
    }
    return loadScript(src)
}

