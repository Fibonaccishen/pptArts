# PPTArts 自动化导入指南（给 AI Agent 使用）

## 一、概述

PPTArts 提供 REST API，你可以编程式调用接口批量导入 PPT 组件。
导入后服务端会自动生成缩略图并写入数据库，无需人工干预。

### 支持的文件格式

| 格式 | 扩展名 | 缩略图生成方式 |
|---|---|---|
| PowerPoint | `.pptx` | LibreOffice 渲染 → XML 包围盒裁剪 |
| PNG 图片 | `.png` | sharp 自动 trim 白边 |
| SVG 矢量图 | `.svg` | sharp 内置光栅化 → trim |

---

## 二、环境准备

### 2.1 服务地址

```
BASE_URL = http://<服务器IP>:3001
```

默认端口 3001，可在服务端 `.env` 中修改。

### 2.2 认证

所有 API（除缩略图获取外）需要 JWT Token。先登录获取 Token：

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

响应：
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {"id": 1, "username": "admin"}
}
```

**Token 有效期 7 天**。后续所有请求在 Header 中携带：
```
Authorization: Bearer <token>
```

### 2.3 Python 示例（推荐）

```python
import requests
import os
from pathlib import Path

BASE_URL = "http://localhost:3001"
USERNAME = "admin"
PASSWORD = "admin123"

def login():
    r = requests.post(f"{BASE_URL}/api/auth/login", json={
        "username": USERNAME,
        "password": PASSWORD
    })
    r.raise_for_status()
    return r.json()["token"]

TOKEN = login()
HEADERS = {"Authorization": f"Bearer {TOKEN}"}
```

---

## 三、分类体系

组件的分类是**两级结构**，导入时必须指定一级和二级分类。

分类逻辑从实际使用场景出发：

- **基础元素**：独立小组件，拖到任意页面上丰富页面细节（箭头、图标、文字框、卡片等）
- **结构模板**：完整页面布局，填入内容即成为一页 PPT（架构图、对比图、流程图等）

### 完整分类表

| 一级分类 key | 一级名称 | 二级分类 key（取 `|` 后面的部分）| 二级名称 |
|---|---|---|---|
| `basic-elements` | 基础元素 | `arrows` | 箭头 |
| | | `icons` | 图标库 |
| | | `dividers` | 分割线&装饰 |
| | | `transitions` | 过渡元素 |
| | | `text-boxes` | 文字框 |
| | | `data-cards` | 数据卡片 |
| | | `quotes-labels` | 引用框&标签 |
| | | `others` | 其他 |
| `structure-templates` | 结构模板 | `side-by-side` | 并列结构 |
| | | `architecture` | 架构图 |
| | | `comparison` | 对比图 |
| | | `flow-timeline` | 流程图&时间轴 |
| | | `pyramid-cycle-matrix` | 金字塔&循环&矩阵 |
| | | `infographics` | 信息图 |

### 调用 API 时的参数

导入时传的是**分类的中文名称**（不是 key）：

```python
category = "基础元素"       # 一级名称
subcategory = "图标库"       # 二级名称
```

---

## 四、标签系统

标签是逗号分隔的中文字符串，可用于跨分类检索。

### 常用标签参考

| 类别 | 标签 |
|---|---|
| 颜色 | 蓝色, 绿色, 红色, 橙色, 紫色, 灰色 |
| 风格 | 简约, 商务, 科技, 手绘, 扁平, 渐变, 3D |
| 类型 | 箭头, 图标, 流程图, 时间轴, 数据, 卡片, 文字框 |

标签不是必填，但建议填写以提高可搜索性。

---

## 五、核心 API：批量导入

### 5.1 端点

```
POST /api/components/import
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

### 5.2 表单参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `files` | File[] | ✅ | 一个或多个文件，最多 200 个，单文件 ≤ 50MB |
| `category` | string | ✅ | 一级分类中文名，如 `"基础元素"` |
| `subcategory` | string | ✅ | 二级分类中文名，如 `"图标库"` |
| `name` | string | | 组件名称。不传则取文件名（去扩展名）。**注意：批量导入时所有文件共用此名称** |
| `tags` | string | | 逗号分隔的中文标签，如 `"蓝色,简约,图标"` |

### 5.3 响应

```json
{
  "results": [
    {"id": 1, "name": "箭头-向上", "success": true},
    {"id": 0, "name": "bad-file", "success": false, "error": "缩略图生成失败: ..."}
  ]
}
```

每个文件一条结果。`id=0` 且 `success=false` 表示导入失败。

### 5.4 一次导入多个文件

所有文件共享**相同的 category / subcategory / name / tags**。
如果要给不同文件设置不同信息，需要**分多次调用**导入接口。

### 5.5 并发注意事项

服务端缩略图生成使用**串行队列**（一次生成一张，避免 LibreOffice 进程冲突）。
你可以并行调用多个导入请求，但同一批内的缩略图是一个一个生成的。

**建议**：每批 5-10 个文件，多批同时发。

---

## 六、完整代码示例

### Python 脚本模板

```python
#!/usr/bin/env python3
"""
PPTArts 自动化批量导入脚本
用法：修改下面的下载/生成组件逻辑，然后运行 python import_to_pptarts.py
"""
import requests
import os
import time
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

# ====== 配置 ======
BASE_URL = "http://localhost:3001"
USERNAME = "admin"
PASSWORD = "admin123"
MAX_WORKERS = 3          # 并发批次数

# ====== 登录 ======
def login():
    r = requests.post(f"{BASE_URL}/api/auth/login", json={
        "username": USERNAME, "password": PASSWORD
    })
    r.raise_for_status()
    token = r.json()["token"]
    print(f"[Auth] 登录成功, token: {token[:20]}...")
    return token

TOKEN = login()
HEADERS = {"Authorization": f"Bearer {TOKEN}"}

# ====== 单批导入 ======
def import_batch(files: list[Path], category: str, subcategory: str,
                 name: str = "", tags: str = "") -> list[dict]:
    """导入一批文件（同分类/同标签）"""
    form_data = {
        "category": category,
        "subcategory": subcategory,
        "name": name,
        "tags": tags,
    }
    # requests 的 files 参数自动处理 multipart/form-data
    file_tuples = [("files", (f.name, open(f, "rb"), guess_mime(f))) for f in files]

    try:
        r = requests.post(
            f"{BASE_URL}/api/components/import",
            headers=HEADERS,
            data=form_data,
            files=file_tuples,
            timeout=120,  # 缩略图生成需要时间
        )
        r.raise_for_status()
        results = r.json()["results"]
        ok = sum(1 for x in results if x["success"])
        fail = sum(1 for x in results if not x["success"])
        print(f"[Import] {category}/{subcategory}: {ok} 成功, {fail} 失败")
        return results
    finally:
        for _, (_, fh, _) in file_tuples:
            fh.close()


def guess_mime(filepath: Path) -> str:
    ext = filepath.suffix.lower()
    return {
        ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        ".png": "image/png",
        ".svg": "image/svg+xml",
    }.get(ext, "application/octet-stream")


# ====== 主流程：下载 + 导入 ======
def main():
    # ============================================================
    # TODO: 在这里编写你的下载/生成逻辑
    # 将文件保存到本地临时目录，然后调用 import_batch()
    # ============================================================

    # ---- 示例：从本地目录批量导入 ----
    # 按分类/标签分组，每组调用一次 import_batch()

    batches = [
        {
            "dir": Path("./downloads/arrows"),
            "category": "基础元素",
            "subcategory": "箭头",
            "tags": "箭头,蓝色,简约",
        },
        {
            "dir": Path("./downloads/icons"),
            "category": "基础元素",
            "subcategory": "图标库",
            "tags": "图标,扁平",
        },
        {
            "dir": Path("./downloads/flowcharts"),
            "category": "结构模板",
            "subcategory": "流程图&时间轴",
            "tags": "流程图,商务",
        },
    ]

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = []
        for batch in batches:
            if not batch["dir"].exists():
                print(f"[Skip] 目录不存在: {batch['dir']}")
                continue
            files = list(batch["dir"].glob("*"))
            # 过滤支持的文件格式
            files = [f for f in files if f.suffix.lower() in {".pptx", ".png", ".svg"}]
            if not files:
                continue
            # 每批最多 10 个文件
            for i in range(0, len(files), 10):
                chunk = files[i:i+10]
                future = executor.submit(
                    import_batch,
                    chunk,
                    batch["category"],
                    batch["subcategory"],
                    name="",            # 空 = 取文件名
                    tags=batch["tags"],
                )
                futures.append(future)

        for f in as_completed(futures):
            try:
                f.result()
            except Exception as e:
                print(f"[Error] {e}")

    print("\n全部导入完成！")


if __name__ == "__main__":
    main()
```

### 最重要的规则：分类映射

当你从网站下载组件时，根据描述/关键词匹配到最合适的分类：

```python
def map_to_category(keywords: list[str]) -> tuple[str, str]:
    """根据关键词返回 (一级分类, 二级分类)"""
    rules = [
        # ===== 基础元素 =====
        ("基础元素", "箭头", ["arrow", "箭头", "方向", "chevron"]),
        ("基础元素", "图标库", ["icon", "图标"]),
        ("基础元素", "分割线&装饰", ["divider", "分割线", "装饰", "separator", "分隔"]),
        ("基础元素", "过渡元素", ["transition", "过渡", "切换", "loader", "spinner", "加载"]),
        ("基础元素", "文字框", ["text box", "文字框", "文本", "文本框", "标题框", "title"]),
        ("基础元素", "数据卡片", ["card", "卡片", "数据", "data card", "chart", "图表"]),
        ("基础元素", "引用框&标签", ["quote", "引用", "标签", "label", "badge", "徽章", "bookmark"]),
        ("基础元素", "其他", []),
        # ===== 结构模板 =====
        ("结构模板", "并列结构", ["并列", "side by side", "左右", "两栏", "三栏", "多栏"]),
        ("结构模板", "架构图", ["架构", "architecture", "结构图", "组织"]),
        ("结构模板", "对比图", ["comparison", "对比图", "vs", "对比"]),
        ("结构模板", "流程图&时间轴", ["flowchart", "流程", "时间轴", "timeline", "步骤"]),
        ("结构模板", "金字塔&循环&矩阵", ["pyramid", "金字塔", "循环", "cycle", "矩阵", "matrix"]),
        ("结构模板", "信息图", ["infographic", "信息图", "info"]),
    ]
    kw_lower = [k.lower() for k in keywords]
    for cat, subcat, match_words in rules:
        if not match_words:  # "其他" 作为兜底
            continue
        if any(m in kw_lower for m in match_words if m in " ".join(kw_lower)):
            return (cat, subcat)
    # 默认：基础元素/图标库
    return ("基础元素", "图标库")
```

---

## 七、其他有用 API

### 7.1 查看已有组件（避免重复导入）

```python
def list_components(search: str = "", category: str = "") -> list[dict]:
    r = requests.get(
        f"{BASE_URL}/api/components",
        headers=HEADERS,
        params={"search": search, "category": category, "pageSize": 100}
    )
    return r.json()["data"]  # 每个元素含 name, category, tags 等
```

### 7.2 清理孤儿文件

如果上传了文件但因异常未能写入数据库，可调用清理接口：

```python
def cleanup():
    r = requests.post(f"{BASE_URL}/api/components/cleanup", headers=HEADERS)
    result = r.json()  # {"uploadsDeleted": 2, "thumbnailsDeleted": 2}
    print(f"[Cleanup] removed {result['uploadsDeleted']} uploads + {result['thumbnailsDeleted']} thumbnails")
    return result
```

### 7.3 检查服务健康状态

```python
def health_check() -> bool:
    try:
        r = requests.get(f"{BASE_URL}/api/auth/login", timeout=5)
        return r.status_code in [200, 404]  # 任何响应都说明服务在运行
    except:
        return False
```

---

## 八、故障排查

| 问题 | 可能原因 | 解决 |
|---|---|---|
| `401 Unauthorized` | Token 过期 | 重新调用 login() |
| `400 VALIDATION_ERROR` | 缺少 category 或 subcategory | 检查分类名是否与上表一致 |
| `413 Payload Too Large` | 单文件超过 50MB | 压缩或分割文件 |
| 导入成功但缩略图不显示 | 缩略图生成失败 | 检查服务端是否安装 LibreOffice（仅 PPTX 需要）|
| `requests.exceptions.Timeout` | 缩略图队列积压 | 减少 batch size，增加 timeout |

---

## 九、总结：AI Agent 的标准工作流

```
1. 登录获取 Token
2. 从网站下载组件文件 → 保存到本地临时目录
3. 根据组件描述/关键词 → 映射到正确的 (一级分类, 二级分类)
4. 根据组件属性 → 提取合适的标签
5. 调用 POST /api/components/import → 批量导入（每批 ≤10 个文件）
6. 记录导入结果（成功/失败），失败的文件重试或跳过
7. 导入完成后清理本地临时文件
```

> 文档版本：1.0  
> 创建日期：2026-05-11  
> 适用：AI Agent 自动化操作 PPTArts
