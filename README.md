# Vue3 + JSX + CDN 方案
- 无构建步骤
- 通过service-worker拦截jsx转换为Vue.h 支持es6模块化

## unpkg版本锁定

- vue3
    - 开发环境：https://unpkg.com/vue@3.5.17/dist/vue.global.js
    - 生产环境：https://unpkg.com/vue@3.5.17/dist/vue.global.prod.js
- vue-router
    - 开发环境：https://unpkg.com/vue-router@4.5.1/dist/vue-router.global.js
    - 生产环境：https://unpkg.com/vue-router@4.5.1/dist/vue-router.global.prod.js
- naive ui
    - 开发环境：https://unpkg.com/naive-ui@2.42.0/dist/index.js
    - 生产环境：https://unpkg.com/naive-ui@2.42.0/dist/index.prod.js
- babel-standalone
    - 开发环境：https://unpkg.com/@babel/standalone@7.27.6/babel.js
    - 生产环境：https://unpkg.com/@babel/standalone@7.27.6/babel.min.js

## Service Worker 的 scope（作用域） 与 sw.js 文件路径 以及 HTML 页面路径 之间的关系

在浏览器中，Service Worker 的 **`scope`（作用域）** 与 **`sw.js` 文件路径** 以及 **HTML 页面路径** 之间的关系决定了 Service Worker 能控制哪些页面。以下是核心规则和常见问题解析：

---

### 一、核心规则
1. **默认作用域（Scope）**  
   Service Worker 的默认作用域是其脚本所在目录的**路径**。  
   **示例**：
  - 若 `sw.js` 位于根目录（`/sw.js`）→ 作用域为 **`/`**（控制整个站点）
  - 若 `sw.js` 位于 `/scripts/sw.js` → 作用域为 **`/scripts/`**（仅控制 `/scripts/` 下的页面）

2. **显式指定作用域**  
   注册时可手动设置 `scope` 参数：
   ```javascript
   navigator.serviceWorker.register('/path/sw.js', { 
     scope: '/custom-scope/' 
   });
   ```
   **限制**：`scope` 不能超过 `sw.js` 所在目录（需服务器设置 `Service-Worker-Allowed` 头突破）。

3. **作用域匹配规则**  
   Service Worker 仅控制**作用域内及其子路径**的页面：
  - 作用域 `/admin/` → 匹配 `/admin/`, `/admin/users`
  - 作用域 `/` → 匹配所有页面

---

### 二、关键问题与解决方案
#### 问题1：Service Worker 无法控制某些页面
**原因**：页面路径不在 Service Worker 的作用域内。  
**示例**：
- `sw.js` 路径：`/assets/sw.js` → 默认作用域为 `/assets/`
- 页面路径：`/index.html`（不在作用域内）

**解决方案**：
- **方法1**：将 `sw.js` 移至根目录（推荐）
- **方法2**：注册时扩展作用域（需服务器支持）：
  ```javascript
  // 浏览器默认会阻止超出目录的 scope，需服务器设置响应头
  navigator.serviceWorker.register('/assets/sw.js', { scope: '/' });
  ```
  **服务器配置**（以 Nginx 为例）：
  ```nginx
  location /assets/sw.js {
    add_header Service-Worker-Allowed /;  # 允许作用域扩展到根目录
  }
  ```

#### 问题2：Service Worker 意外拦截页面
**原因**：作用域过大（如根目录的 Service Worker 会控制所有页面）。  
**解决方案**：
- 将 `sw.js` 放在子目录（如 `/admin/sw.js`），限制作用域为特定路径。

#### 问题3：注册失败（控制台报错）
**常见错误**：
- `Error: The path of the provided scope '...' is not under the max scope allowed ...`  
  **原因**：`scope` 超出了 `sw.js` 所在目录，且未设置 `Service-Worker-Allowed` 头。

---

### 三、最佳实践
1. **文件位置**
  - 将 `sw.js` **放在站点根目录**（`/sw.js`），作用域默认为 `/`，可控制所有页面。
  - 若需限定作用域（如仅管理后台），将其放在子目录（如 `/admin/sw.js`）。

2. **作用域设置**
  - 避免手动设置 `scope`，除非有特殊需求。
  - 如需扩展作用域，务必配置服务器头 `Service-Worker-Allowed`。

3. **注册位置**
  - 在**所有需要控制的页面**中注册 Service Worker（通常在主 HTML 的 `<script>` 中）。

4. **路径检查**
  - 通过 `registration.scope` 查看实际作用域：
    ```javascript
    navigator.serviceWorker.ready.then(reg => {
      console.log("当前作用域:", reg.scope); 
    });
    ```

---

### 四、示例场景
#### 场景1：控制整个站点
- `sw.js` 路径：**`/sw.js`**
- 注册代码（所有页面中）：
  ```javascript
  // 在 index.html, about.html 等页面中执行
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js'); // 默认作用域为 /
  }
  ```

#### 场景2：仅控制 `/admin/` 下的页面
- `sw.js` 路径：**`/admin/sw.js`**
- 在 `/admin/` 下的页面注册：
  ```javascript
  // 在 /admin/index.html 中执行
  navigator.serviceWorker.register('/admin/sw.js');
  ```

---

### 五、调试工具
- **Chrome DevTools**：  
  `Application` → `Service Workers` 标签页：
  - 查看已注册的 Service Worker 及其作用域。
  - 勾选 `Show all` 显示所有作用域的 Worker。
- **命令行**：
  ```javascript
  navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(reg => console.log(reg.scope));
  });
  ```

---

### 总结
| 关键因素         | 规则说明                                                                 |
|------------------|--------------------------------------------------------------------------|
| `sw.js` 路径     | 决定默认作用域（所在目录路径）                                           |
| `scope` 参数     | 可扩展作用域，但不可超过 `sw.js` 所在目录（除非设置服务器响应头）         |
| HTML 页面路径    | 必须位于 Service Worker 的作用域内才会被控制                             |
| 服务器响应头     | `Service-Worker-Allowed: /` 允许突破目录限制扩展作用域                   |

遵循这些规则可避免路径问题，确保 Service Worker 按预期控制页面。