<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://readme-typing-svg.demolab.com?font=Inter&weight=700&size=32&duration=2000&pause=1000&color=5A9E6F&center=true&vCenter=true&width=600&lines=PPTArts+%F0%9F%8E%A8;%E4%BC%81%E4%B8%9A+PPT+%E7%BB%84%E4%BB%B6%E5%BA%93">
  <img src="https://readme-typing-svg.demolab.com?font=Inter&weight=700&size=32&duration=2000&pause=1000&color=4A7C59&center=true&vCenter=true&width=600&lines=PPTArts+%F0%9F%8E%A8;%E4%BC%81%E4%B8%9A+PPT+%E7%BB%84%E4%BB%B6%E5%BA%93">
</picture>

<p align="center">
  <b>告别枯燥的白板幻灯片</b> · 积木式搭建 · 开箱即用 · 团队共享
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React">
  <img src="https://img.shields.io/badge/Express-4-000000?logo=express" alt="Express">
  <img src="https://img.shields.io/badge/Electron-34-47848F?logo=electron" alt="Electron">
  <img src="https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite" alt="SQLite">
  <img src="https://img.shields.io/badge/Tailscale-Funnel-242424?logo=tailscale" alt="Tailscale">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
</p>

---

## 这是什么

写 PPT 最痛苦的不是没想法，而是有想法但缺素材。你脑子里有个流程图，打开 PowerPoint 却要从空白矩形画起。PPTArts 就是一个**企业内部的 PPT 组件库**——把你收藏的所有箭头、图标、插画、数据卡片、结构模板都装进去，分类、标签、搜索，拖出来就用。

> 🎯 核心理念：写 PPT 应该像搭乐高，而不是从捏塑料开始。

---

## ✨ 能干什么

<table>
<tr><td>🗂️ <b>两级分类导航</b></td><td>基础元素（11类）＋ 结构模板（8类），左侧树形菜单一键筛选</td></tr>
<tr><td>🔍 <b>跨分类搜索</b></td><td>搜名称、搜标签，300ms 防抖不卡顿</td></tr>
<tr><td>🖼️ <b>自动生成缩略图</b></td><td>导入 PPTX / PNG / SVG，服务端自动渲染预览图</td></tr>
<tr><td>⬆️ <b>批量导入</b></td><td>拖拽导入，REST API 批量上传，多文件并发处理</td></tr>
<tr><td>📥 <b>一键下载</b></td><td>下载原始 PPTX 文件直接插入你的 PPT</td></tr>
<tr><td>🏷️ <b>标签系统</b></td><td>颜色、风格、用途三维标签，跨分类检索</td></tr>
<tr><td>📊 <b>下载量统计</b></td><td>热门组件自动排序，团队最爱一目了然</td></tr>
<tr><td>🌐 <b>网页版 + 桌面版</b></td><td>浏览器直接访问 or 下载 Windows EXE，同一套代码</td></tr>
<tr><td>🔐 <b>JWT 认证</b></td><td>Token 7天有效，登录限流防暴力破解</td></tr>
<tr><td>🛡️ <b>安全加固</b></td><td>Helmet / CORS / 魔数校验 / 缩略图签名 URL / 审计日志</td></tr>
<tr><td>🔌 <b>内网穿透</b></td><td>Tailscale Funnel 一键暴露公网，团队随时随地访问</td></tr>
<tr><td>📱 <b>移动端适配</b></td><td>响应式布局，手机浏览器也能浏览和搜索</td></tr>
</table>

---

## 🏗️ 架构一览

```
┌──────────────────────────────────────────────────┐
│                   PPTArts                         │
│                                                   │
│  ┌──────────┐   ┌──────────┐   ┌──────────────┐ │
│  │ Browser  │   │ Electron │   │  Python CLI  │ │
│  │ (网页版)  │   │  (EXE)  │   │  (批量导入)   │ │
│  └────┬─────┘   └────┬─────┘   └──────┬───────┘ │
│       │              │                 │          │
│       └──────────────┼─────────────────┘          │
│                      │  REST API  :3001           │
│               ┌──────┴──────┐                     │
│               │  Express.js │                     │
│               │  + Helmet   │                     │
│               │  + RateLimit│                     │
│               └──────┬──────┘                     │
│                      │                            │
│          ┌───────────┼───────────┐                │
│     ┌────┴────┐ ┌────┴────┐ ┌───┴────┐          │
│     │ SQLite  │ │ Sharp   │ │ Libre   │          │
│     │  (数据)  │ │ (缩略图) │ │ Office  │          │
│     └─────────┘ └─────────┘ └────────┘           │
└──────────────────────────────────────────────────┘
```

| 层 | 技术 | 说明 |
|---|---|---|
| 🖥️ 前端 | React 19 + Ant Design 5 + Zustand | 响应式 UI，CSS Grid 卡片布局 |
| 🔧 后端 | Express 4 + TypeScript + SQLite | RESTful API，Better-SQLite3 同步高性能 |
| 📦 桌面 | Electron 34 + Vite | 打包 Windows EXE，自动更新 |
| 🐍 工具 | Python 3 (标准库) | 批量导入脚本，无需 pip install |
| 🌐 穿透 | Tailscale Funnel | 免费 HTTPS 公网访问 |

---

## 🚀 快速开始

### 1. 克隆安装

```bash
git clone https://github.com/Fibonaccishen/pptArts.git
cd pptArts
npm install
```

### 2. 启动服务端

```bash
cd server
cp .env.example .env    # 编辑 .env，修改 JWT_SECRET
npx tsx src/index.ts    # 默认启动在 :3001
```

首次运行会自动创建 `admin` 账户（密码 `admin123`）和 SQLite 数据库。

### 3. 启动前端（选其一）

```bash
# 网页版开发（Vite 热更新 :5173）
npm -w client run dev

# 打包 Windows 桌面应用
npm -w client run build
npx electron-builder --win --x64 --dir
# 输出在 release/win-unpacked/
```

### 4. 打开浏览器

```
http://localhost:3001      # 网页版（Express 直接托管）
http://localhost:5173      # 开发版（Vite + HMR）
```

---

## 📦 批量导入组件

PPTArts 提供 Python 导入脚本，支持从 npm 图标库 / SVG 资源站批量下载并导入：

```bash
# 1. 下载图标到本地目录（按分类组织）
# 2. 运行导入脚本
python3 ppt-components-downloads/import_to_pptarts.py
```

| 资源 | 数量 | 协议 |
|---|---|---|
| 🎨 Manypixels 插画 | 1,226 | MIT |
| 🏷️ Simple Icons 品牌 | 19 (可扩至 3,432) | CC0 |

更多详见 [AI-IMPORT-GUIDE.md](docs/AI-IMPORT-GUIDE.md)。

---

## 📂 分类体系

```
基础元素 (11 类)                     结构模板 (8 类)
├── → 箭头                            ├── ↔ 并列结构
├── 👤 人物角色                       ├── 🏛️ 架构图
├── 💼 商务办公                       ├── ⚖️ 对比图
├── 💻 科技数字                       ├── 🔀 流程图&时间轴
├── 🌍 生活场景                       ├── 🔺 金字塔
├── ✂️ 分割线&装饰                    ├── 🔄 循环
├── ⏳ 过渡元素                       ├── 🧮 矩阵
├── 📝 文字框                         └── 📊 信息图
├── 💬 引用框
├── 🏷️ 标签
└── 📦 其他
```

---

## 🔒 内网穿透部署

想让团队同事在外网也能用？

```bash
# 1. 配置 .env
PUBLIC_MODE=true
CORS_ORIGIN=https://你的域名.tail0771f7.ts.net
JWT_SECRET=你的64位随机密钥

# 2. 启动服务端
cd server && npx tsx src/index.ts

# 3. 开启 Tailscale Funnel
tailscale funnel 3001
```

然后浏览器打开 `https://你的机器.tail0771f7.ts.net` 就能用了。详见 [SECURITY-HARDENING.md](docs/SECURITY-HARDENING.md)。

---

## 🧪 安全加固清单

- [x] ~~JWT 默认密钥~~ → 随机 64 位强密钥
- [x] ~~CORS 全开~~ → PUBLIC_MODE 白名单
- [x] ~~无速率限制~~ → 登录 10次/15min，导入 60次/15min
- [x] ~~Stack trace 泄露~~ → 500 只返回消息不返回堆栈
- [x] ~~缩略图公开可枚举~~ → JWT 签名 URL（1h 过期）
- [x] ~~文件扩展名可绕过~~ → 魔数校验（magic bytes）
- [x] ~~无安全响应头~~ → Helmet (CSP + HSTS + X-Frame + XSS)
- [x] ~~无审计日志~~ → Morgan 请求日志

---

## 📁 项目结构

```
pptArts/
├── client/                  # React + Electron 前端
│   ├── src/
│   │   ├── api/            # Axios API 客户端
│   │   ├── components/     # 通用组件（卡片/表格/导航）
│   │   ├── pages/          # 页面（浏览/搜索/导入/管理）
│   │   ├── stores/         # Zustand 状态管理
│   │   └── types/          # TypeScript 类型
│   ├── electron/           # Electron 主进程
│   ├── index.html          # 入口 HTML + 响应式 CSS
│   └── vite.config.ts      # Vite + 代理 + Electron 插件
├── server/                  # Express 后端
│   ├── src/
│   │   ├── controllers/    # 路由处理
│   │   ├── middleware/      # 认证/上传/错误处理
│   │   ├── services/        # 业务逻辑
│   │   ├── db/              # Schema + Seed
│   │   └── types/           # TypeScript 类型
│   └── data/                # SQLite 数据库
├── docs/                    # 文档
│   ├── PRD-V2.md
│   ├── AI-IMPORT-GUIDE.md
│   └── SECURITY-HARDENING.md
└── ppt-components-downloads/ # 组件下载暂存区（gitignore）
    └── import_to_pptarts.py  # 批量导入脚本
```

---

<p align="center">
  <sub>Made with ☕ by someone who was tired of drawing rectangles in PowerPoint</sub>
</p>
