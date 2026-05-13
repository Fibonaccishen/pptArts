# PPTArts 服务端安全加固方案

## 背景

PPTArts 原本设计为本地桌面应用，服务端仅在 localhost 运行。若要通过内网穿透暴露到公网，应用的安全边界发生根本变化，必须在暴露前完成以下加固，否则存在严重风险。

---

## 风险排查

### 🔴 高危

| 风险 | 位置 | 说明 |
|------|------|------|
| JWT 弱密钥 | `server/src/config.ts:10` | 默认值 `pptarts-dev-secret` 可被轻易猜测，攻击者能伪造任意用户 token |
| CORS 全开 | `server/src/app.ts:13` | `cors()` 无参数，任意域名均可跨域调用 API，结合内网穿透可能被恶意网站利用 |
| 无速率限制 | `server/src/controllers/auth.controller.ts` | 登录接口无频率限制，攻击者可无限尝试密码进行暴力破解 |
| 默认弱密码 | `server/src/db/seed.ts:13` | 种子账号 `admin / admin123`，若用户未修改则公网任何人都可登录 |

### 🟡 中危

| 风险 | 位置 | 说明 |
|------|------|------|
| 上传限制过松 | `server/src/middleware/upload.ts:30` | 单次允许 200 文件、单文件 50MB，可被用于 DoS 攻击耗尽磁盘空间 |
| Stack trace 泄露 | `server/src/middleware/errorHandler.ts:20-22` | 500 错误向客户端返回调用栈，暴露服务端内部路径和代码结构 |
| 缺少安全响应头 | `server/src/app.ts` | 无 `helmet`，缺少 X-Content-Type-Options、X-Frame-Options 等基础安全头 |
| 文件扩展名校验可绕过 | `server/src/middleware/upload.ts:16` | 仅校验扩展名，未校验文件魔数（magic bytes），攻击者可改后缀绕过 |
| 缩略图无认证 | `server/src/routes/component.routes.ts:9` | 缩略图路由在 `router.use(authenticate)` 之前注册，公网可直接访问且 ID 自增可枚举 |
| bcrypt 同步阻塞 | `server/src/services/auth.service.ts:11` | `compareSync` 阻塞事件循环，公网并发登录攻击可拖慢整个服务 |

### 🟢 低危

| 风险 | 位置 | 说明 |
|------|------|------|
| .env 无校验 | `server/src/config.ts` | 使用弱默认值时无任何警告，用户可能不知情就暴露到公网 |
| SQLite 并发限制 | `server/src/db/connection.ts` | 公网高并发场景下 SQLite 性能瓶颈，不过当前规模影响有限 |
| /updates 静态目录无认证 | `server/src/app.ts:20` | `express.static` 公开暴露，需确认目录内容是否敏感 |

---

## 加固方案

### 1. 强制 JWT 密钥

**文件：** `server/src/config.ts`

- 当 `JWT_SECRET` 为默认值 `pptarts-dev-secret` 时，**拒绝启动**并打印错误提示
- 要求用户自行生成强随机密钥（至少 32 字符）
- 新增 `CORS_ORIGIN` 环境变量，用于限制跨域来源

推荐生成密钥方式：
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. CORS 白名单

**文件：** `server/src/app.ts`

- 将 `cors()` 改为仅允许 `CORS_ORIGIN` 指定的域名
- 若无设置则拒绝启动（内网穿透场景下必须设置）

### 3. API 速率限制

**新依赖：** `express-rate-limit`

**全局限制：** 所有 `/api/*` 路由，每 IP 15 分钟内最多 100 次请求
**登录限制：** `/api/auth/login` 单独限制，每 IP 15 分钟内最多 10 次

### 4. 安全响应头

**新依赖：** `helmet`

- 添加 `helmet()` 中间件，自动设置以下响应头：
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Strict-Transport-Security: max-age=31536000`（隧道层 HTTPS 下生效）
  - `X-XSS-Protection: 0`（配合 CSP 使用）

### 5. 上传安全收紧

**文件：** `server/src/middleware/upload.ts`

| 参数 | 当前值 | 加固后 |
|------|--------|--------|
| 单次文件数 | 200 | 20 |
| 单文件大小 | 50MB | 20MB |
| 文件名校验 | 仅扩展名 | 扩展名 + 魔数校验（PNG / SVG / PPTX） |

### 6. 缩略图访问控制

**文件：** `server/src/routes/component.routes.ts`

当前缩略图路由在认证中间件之前注册，公网下任何人可通过自增 ID 枚举下载全部组件缩略图。

**方案 A（推荐）：** 缩略图改为签名 URL
- 移除公开缩略图路由
- 列表接口返回组件时附加 `thumbnail_token`（JWT 签名，payload 含组件 ID，有效期 1 小时）
- 缩略图接口验证 token 后返回图片：`GET /api/components/thumbnail?token=xxx`
- 前端 `<img src>` 拼接 token

**方案 B（轻量）：** 按路由顺序将缩略图移到 `authenticate` 之后
- `router.get('/:id/thumbnail', authenticate, ctrl.getThumbnail)`
- 缺点：前端 `<img src>` 无法带 Authorization header，需要改为 fetch + Blob URL 方式加载

### 7. 错误信息收敛

**文件：** `server/src/middleware/errorHandler.ts`

- 移除 `console.error(err.stack)` 打印
- 生产环境只在日志中保留错误摘要，不向客户端返回调用栈

### 8. bcrypt 异步化

**文件：** `server/src/services/auth.service.ts:11`

- `bcrypt.compareSync` → `bcrypt.compare`（异步版本）
- 避免公网并发登录攻击阻塞事件循环拖慢整个服务

### 9. 请求审计日志

**新依赖：** `morgan`

- 添加 `morgan('combined')`（或 `morgan('short')`）中间件
- 记录请求来源 IP、时间、路径、状态码，用于事后追溯攻击行为
- 日志写入文件，按天轮转

---

## 实施清单

- [ ] 安装 `helmet`、`express-rate-limit`、`morgan`
- [ ] 修改 `config.ts` — 默认密钥校验 + CORS_ORIGIN
- [ ] 修改 `app.ts` — helmet + CORS 限制 + 全局限流 + morgan
- [ ] 修改 `auth.routes.ts` — 登录接口限流
- [ ] 修改 `auth.service.ts` — bcrypt.compareSync → bcrypt.compare（异步）
- [ ] 修改 `upload.ts` — 收紧上传限制 + 魔数校验
- [ ] 修改 `component.routes.ts` — 缩略图签名 URL 认证
- [ ] 修改 `errorHandler.ts` — 移除 stack trace
- [ ] 修改前端缩略图加载方式 — `<img src>` 改为携带 token
- [ ] 更新 `.env.example` 添加新配置项说明
- [ ] 功能回归测试：登录、上传、CRUD、缩略图访问
