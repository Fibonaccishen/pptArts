# PPTArts 发版与更新流程

## 一、版本号规范

每次发版前修改 `client/package.json` 中的 `version` 字段，遵循语义化版本：

- **修订号** (1.0.x)：修 bug、小优化
- **次版本号** (1.x.0)：加新功能，向下兼容
- **主版本号** (x.0.0)：大改，不保证旧版兼容

## 二、标准发版流程

### 步骤 1：确认代码无误

```bash
cd /Users/shenfangzhi/Desktop/vibe-coding/pptArts

# 确保所有改动已提交
git status
git push origin main
```

### 步骤 2：更新版本号

编辑 `client/package.json`：

```json
"version": "1.0.0"  →  "version": "1.0.1"
```

### 步骤 3：提交版本号变更

```bash
git add client/package.json
git commit -m "Release v1.0.1"
git push origin main
```

### 步骤 4：打包 Windows 客户端

```bash
npm run build:client
```

打包完成后检查 `client/release/` 目录，应有类似文件：

```
release/
├── PPTArts Setup 1.0.1.exe     ← 发给同事的安装包
├── latest.yml                   ← 更新配置文件
└── builder-effective-config.yaml
```

### 步骤 5：部署到服务端更新目录

```bash
# 将打包产物复制到服务端更新目录
cp "client/release/PPTArts Setup 1.0.1.exe" server/updates/
cp client/release/latest.yml server/updates/
```

### 步骤 6：提交更新文件并推送

```bash
git add server/updates/
git commit -m "Deploy v1.0.1 update"
git push origin main
```

### 步骤 7：重启服务端

在服务端机器上：

```bash
# 停掉现有服务
Ctrl+C

# 拉取最新代码（如果服务端和开发机不是同一台）
git pull origin main

# 重启
npm run dev:server
```

### 步骤 8：验证

在另一台 Windows 电脑上打开旧版客户端，应出现更新提示。

## 三、同事端的更新体验

1. 打开 PPTArts 客户端 → 自动检测到新版本 → 弹出"PPTArts x.x.x 已发布，是否下载更新？"
2. 点击"**立即下载**" → 开始下载更新
3. 下载完成后弹窗"是否立即重启安装更新？"
4. 点击"**立即重启**" → 自动安装 → 重新打开 → 已是最新版
5. 点击"**稍后**" → 继续使用当前版本，下次启动会再次提醒
6. 如果点了"**暂不更新**" → 不下载，下次启动继续提醒

也可以在顶栏点击"检查更新"按钮随时手动检查。

## 四、注意事项

- **向下兼容**：发新版时不要删除或修改已有 API 接口，保证旧客户端仍能正常使用
- **强制更新**：如果某版本有严重 bug，可以把旧版 exe 从 `server/updates/` 中删除，旧版重启时会一直提示更新（但不会强制）
- **备份**：建议在服务端保留最近 3 个版本的 exe
- **不要**直接覆盖 `server/updates/latest.yml` 以外的方式更新，electron-updater 依赖它判断版本

## 五、目录结构参考

```
pptArts/
├── client/
│   ├── release/               ← 每次打包后本地生成
│   │   ├── "PPTArts Setup 1.0.1.exe"
│   │   └── latest.yml
│   └── package.json           ← version 字段控制版本号
│
├── server/
│   └── updates/               ← 部署到这里，服务端静态托管
│       ├── "PPTArts Setup 1.0.1.exe"
│       ├── latest.yml
│       └── "PPTArts Setup 1.0.0.exe"  ← 旧版保留
│
└── docs/
    └── RELEASE.md             ← 本文档
```

## 六、回滚

如果新版有问题需要回滚：

```bash
# 1. 把旧版 latest.yml 和 exe 放回 server/updates/
# 2. 重启服务端
# 3. 新客户端会"更新"到旧版，已经在新版的同事会看到回滚提示
```
