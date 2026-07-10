# 开始使用

本指南将带您快速上手。

## 关于此项目

此项目提供了由HiBer2007和他的小伙伴编写的项目的托管地点，并提供下载/更新等的元数据

## 使用项目

- **API 端点**：`/api/metadata`
- **请求方式**：`GET`
- **查询参数**：
  - `type`（可选）：指定元数据类型，默认为 `default`。有效值由映射表定义（如 `service`, `another`）。

**示例请求**：

```bash
# 获取默认元数据
curl -O https://metadata.hibernet.top/api/metadata

# 获取指定类型元数据
curl -O https://metadata.hibernet.top/api/metadata?type=another
```

**响应**：返回对应 JSON 文件的内容，并设置 `Content-Disposition: attachment` 头，浏览器会自动下载文件，文件名为 `metadata-{type}.json`。