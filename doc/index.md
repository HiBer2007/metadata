# 📦 元数据服务站点

欢迎访问本站点，本服务提供**元数据下载**和**文件下载**功能。

---

## 📄 元数据下载

通过调用 `/api/metadata` 接口，您可以获取不同内容的元数据 JSON 文件，并自动触发下载。

### 使用方法

- **默认元数据**：`/api/metadata` 或 `/api/metadata?type=default`
- **指定类型**：`/api/metadata?type=another`

可用的 `type` 参数值请参考页面底部列表。

所有元数据均以 JSON 格式返回，并通过 HTTP 头强制下载为 `.json` 文件。

---

## 📁 文件下载（静态资源）

本站同时提供静态文件下载，这些文件存放在 `public/` 目录下，可直接通过 URL 访问：

- [`/sample-file.txt`](/sample-file.txt) – 示例文本文件
- [`/sample-data.csv`](/sample-data.csv) – 示例 CSV 数据文件

您也可以使用 `<a download>` 标签强制下载。

---

## 🔧 配置与扩展

- **映射表**：位于 `lib/metadata-mapping.ts`，可添加新的端点到 JSON 文件的对应关系。
- **元数据 JSON**：存放在 `metadata/` 目录下，格式不限，只需保证合法 JSON。
- **文档**：本页面由 `doc/index.md` 渲染，修改后自动生效。

---

## ⚡ 快速开始

1. 启动服务：`npm run dev`
2. 访问根路径 `http://localhost:3000` 查看本文档。
3. 尝试下载元数据或静态文件。

若有问题，请联系系统管理员。