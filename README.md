# 元数据服务站点

一个基于 **Next.js 14 (App Router)** 构建的轻量级服务，专门用于提供元数据下载和文件下载功能。服务根路径展示动态生成的 Markdown 文档，所有元数据由 JSON 文件驱动，并通过映射表灵活管理端点与数据源的对应关系。

---

## ✨ 特性

- 📄 **文档即服务** – 根路径 `/` 渲染 `doc/index.md`，作为服务的说明门户。
- 📦 **元数据下载** – 通过 `/api/metadata` 接口，根据查询参数 `type` 返回不同的 JSON 元数据文件，并强制下载。
- 🗂️ **静态文件下载** – 存放在 `public/` 下的任何文件均可通过 URL 直接访问或下载。
- 🔗 **映射表控制** – `lib/metadata-mapping.ts` 维护 `type` 参数与 JSON 文件的对应关系，新增元数据只需添加一行映射并放入 JSON 文件。
- 🌙 **深色主题** – 整体采用 GitHub 风格深色配色，阅读舒适，视觉统一。
- 🚀 **开箱即用** – 基于 Next.js 14，支持 TypeScript，代码结构清晰，易于扩展。

---

## 📁 目录结构

```
my-metadata-service/
├── app/
│   ├── api/
│   │   └── metadata/
│   │       └── route.ts          # 元数据下载 API
│   ├── globals.css               # 深色主题样式
│   ├── layout.tsx                # 根布局
│   └── page.tsx                  # 首页（渲染 doc/index.md）
├── doc/
│   └── index.md                  # 服务说明文档（Markdown）
├── lib/
│   └── metadata-mapping.ts       # 端点 ↔ JSON 文件映射表
├── metadata/
│   ├── service-info.json         # 默认元数据示例
│   └── another.json              # 另一个元数据示例
├── public/
│   ├── sample-file.txt           # 示例静态文件
│   └── sample-data.csv           # 示例静态文件
├── package.json
├── tsconfig.json
├── next.config.js
└── .gitignore
```

---

## 🛠️ 快速开始

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd my-metadata-service
```

### 2. 安装依赖

```bash
npm install
```

### 3. 启动开发服务器

```bash
npm run dev
```

### 4. 访问服务

打开浏览器访问 [http://localhost:3000](http://localhost:3000)，你将看到深色主题的文档页面，其中说明了所有可用资源。

---

## 📖 使用说明

### 根路径（文档）

- 首页会渲染 `doc/index.md` 的内容，作为服务的使用手册。
- 你可以自由修改 `doc/index.md`，刷新页面即可生效。
- 页面底部会自动列出映射表中定义的所有元数据类型及其对应的 JSON 文件。

### 元数据下载

- **API 端点**：`/api/metadata`
- **请求方式**：`GET`
- **查询参数**：
  - `type`（可选）：指定元数据类型，默认为 `default`。有效值由映射表定义（如 `service`, `another`）。

**示例请求**：

```bash
# 获取默认元数据
curl -O http://localhost:3000/api/metadata

# 获取指定类型元数据
curl -O http://localhost:3000/api/metadata?type=another
```

**响应**：返回对应 JSON 文件的内容，并设置 `Content-Disposition: attachment` 头，浏览器会自动下载文件，文件名为 `metadata-{type}.json`。

### 静态文件下载

- 所有放入 `public/` 目录的文件都可以直接通过 URL 访问。
- 例如：
  - `http://localhost:3000/sample-file.txt` → 访问文本文件
  - `http://localhost:3000/sample-data.csv` → 访问 CSV 文件

你也可以在页面中使用 `<a href="/sample-file.txt" download>` 来强制触发下载。

---

## ⚙️ 配置与扩展

### 添加新的元数据类型

1. 在 `metadata/` 目录下创建新的 JSON 文件，例如 `product.json`。
2. 在 `lib/metadata-mapping.ts` 中的 `metadataMapping` 对象中添加一个键值对：

   ```typescript
   export const metadataMapping = {
     default: 'service-info.json',
     service: 'service-info.json',
     another: 'another.json',
     product: 'product.json',   // 新增
   };
   ```

3. 现在可以通过 `/api/metadata?type=product` 访问该元数据。

### 修改文档

直接编辑 `doc/index.md` 文件，首页内容会自动更新。Markdown 支持 GitHub Flavored Markdown（GFM），包括表格、任务列表等。

### 自定义样式

- 深色主题定义在 `app/globals.css` 中，你可以修改变量（如 `--bg-primary`、`--text-primary`）来调整配色。
- 如需添加浅色/深色切换，可扩展 CSS 类并配合 JavaScript。

### 部署

本项目可部署在任何支持 Next.js 的平台（Vercel、Netlify、自托管服务器等）。

```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

---

## 🧪 示例元数据内容

### `metadata/service-info.json`

```json
{
  "service": "元数据服务",
  "version": "1.0.0",
  "generatedAt": "2026-07-09T12:00:00Z",
  "description": "这是服务的基础元数据，包含所有可用的端点信息。",
  "availableEndpoints": [
    {
      "path": "/api/metadata?type=service",
      "description": "获取服务基础元数据"
    }
  ]
}
```

### `metadata/another.json`

```json
{
  "title": "另一个元数据示例",
  "author": "Admin",
  "timestamp": "2026-07-09T12:00:00Z",
  "tags": ["demo", "metadata"]
}
```

---

## 🤝 贡献与反馈

欢迎提交 Issue 或 Pull Request。如有任何问题，请联系项目维护者。

---

## 📄 许可证

[LGPL-V3](LICENSE)

---

**享受使用！** 🎉