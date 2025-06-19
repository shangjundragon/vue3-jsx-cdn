export function loadScript(url, type) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        if (type) {
            script.type = type;
        }
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}