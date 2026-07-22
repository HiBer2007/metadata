# FLFHMCL及其组件的下载

本文档分别介绍 **FLFHMCL** 核心项目与附属组件 **flf-title** 的元数据 API 返回格式、字段含义，以及版本 1 与版本 2 的区分说明。

---

## 1. FLFHMCL 核心

### 项目信息
- **项目标识**：`FLFHMCL`
- **最新版本**：`0.3.0-alpha`
- **仓库地址**：[https://github.com/HiBer2007/FLFHMCL](https://github.com/HiBer2007/FLFHMCL)
- **许可证**：LGPL-V2.1

### 元数据 API 返回示例（含混合版本）
```json
{
    "project": "FLFHMCL",
    "Latest": "0.3.0-alpha",
    "Project_Link": "https://github.com/HiBer2007/FLFHMCL",
    "License": "LGPL-V2.1",
    "List": [
        {
            "version": "0.1.1-alpha",
            "download_link": "https://github.com/HiBer2007/FLFHMCL/releases/download/0.1.1-alpha/FLFHMCL-0.1.1-alpha.jar",
            "release_page": "https://github.com/HiBer2007/FLFHMCL/releases/tag/0.1.1-alpha"
        },
        {
            "version": "0.2.0-alpha",
            "download_link": "https://github.com/HiBer2007/FLFHMCL/releases/download/0.2.0-alpha/FLFHMCL-0.2.0-alpha.jar",
            "release_page": "https://github.com/HiBer2007/FLFHMCL/releases/tag/0.2.0-alpha"
        },
        {
            "version": "0.3.0-alpha",
            "meta_version": 2,
            "download_link": "https://github.com/HiBer2007/FLFHMCL/releases/download/0.3.0-alpha/FLFHMCL-0.3.0-alpha.jar",
            "release_page": "https://github.com/HiBer2007/FLFHMCL/releases/tag/0.3.0-alpha",
            "sha_256": "475d3c3cf9d118f6e398149d7ae8fc51d2785fc36828698d642ba9feee22c7cc"
        },
        ···
    ]
}
```

### 顶层字段解释
| 字段 | 类型 | 描述 |
|------|------|------|
| `project` | string | 固定为 `"FLFHMCL"`，用于识别项目。 |
| `Latest` | string | 当前最新版本的版本号（如 `"0.3.0-alpha"`）。 |
| `Project_Link` | string | 项目主页或源代码仓库的 URL。 |
| `License` | string | 项目采用的许可证标识（此处为 `"LGPL-V2.1"`）。 |
| `List` | array | 包含所有已发布版本的元数据对象数组（通常按版本顺序排列）。 |

### `List` 中每个版本对象的字段

| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| `version` | string | 是 | 该版本的版本号。 |
| `download_link` | string | 是 | 该版本 JAR 文件的直接下载链接。 |
| `release_page` | string | 是 | 该版本对应的 GitHub Release 页面链接。 |
| `meta_version` | integer | 否 | **元数据格式版本号**。若存在且值为 `2`，则表示该版本对象包含扩展字段（见下文）。若缺失，则视为版本 1。 |
| `sha_256` | string | 否 | 文件的 SHA-256 校验和（十六进制小写），仅在 `meta_version = 2` 时出现。 |

### 版本 1 与版本 2 的区分（针对 FLFHMCL）

- **版本 1（旧格式）**：对象中**不包含** `meta_version` 和 `sha_256`。  
  *示例*：0.1.1-alpha 和 0.2.0-alpha 版本。
- **版本 2（新格式）**：对象中包含 `"meta_version": 2`，并且同时提供 `sha_256` 字段。  
  *示例*：0.3.0-alpha 版本。

> **兼容性建议**：客户端应同时支持两种格式，缺失 `meta_version` 时按版本 1 处理；版本 2 提供的 `sha_256` 可用于下载后的完整性校验。

---

## 2. flf-title 组件

### 项目信息
- **项目标识**：`flftitle`
- **最新版本**：`0.2.0-alpha`
- **仓库地址**：[https://github.com/HiBer2007/FLFHMCL](https://github.com/HiBer2007/FLFHMCL)（与核心项目共用仓库）
- **许可证**：LGPL-V2.1
- **安装方式**：该组件为 **Fabric 模组**，安装时需放入 Fabric 模组文件夹。

### 元数据 API 返回示例（当前仅一个版本）
```json
{
    "project": "flftitle",
    "Latest": "0.2.0-alpha",
    "Project_Link": "https://github.com/HiBer2007/FLFHMCL",
    "License": "LGPL-V2.1",
    "List": [
        {
            "version": "0.2.0-alpha",
            "meta_version": 2,
            "download_link": "https://github.com/HiBer2007/FLFHMCL/releases/download/0.2.0-alpha/flf-title-mod.jar",
            "release_page": "https://github.com/HiBer2007/FLFHMCL/releases/tag/0.2.0-alpha",
            "sha_256": "8c8fd492715a040645762c71791bb3d50585b9390aa9b6a85730951413a92c4f"
        },
        ···
    ]
}
```

### 顶层字段解释
与 FLFHMCL 核心完全相同，但 `project` 固定为 `"flftitle"`，`Latest` 相应为组件的最新版本。

### `List` 中版本对象的字段
字段含义与核心项目一致，但在当前发布的 0.2.0-alpha 版本中，已采用**版本 2** 格式（包含 `meta_version` 和 `sha_256`）。

### 版本区分说明（针对 flf-title）
- 由于当前列出的唯一版本已包含 `"meta_version": 2`，因此该组件目前仅使用版本 2 格式。  
- 若未来有更早版本未包含这些字段，则同样视为版本 1，处理规则与核心项目相同。

> **注意**：虽然 `flf-title` 与 `FLFHMCL` 共用仓库和 Release 页面，但下载链接的文件名不同（`flf-title-mod.jar`），请注意区分。

---

## 通用注意事项

1. **解析兼容性**：所有元数据消费者都应先检查 `meta_version` 字段是否存在，若存在且为 `2`，则按扩展格式解析；否则按基础格式（版本 1）解析。
2. **校验和验证**：对于版本 2 的对象，推荐下载后计算文件 SHA-256 并与提供的值比对，以确保文件完整性。
3. **未来扩展**：若引入 `meta_version: 3`，将可能新增其他字段，但应保持向下兼容，旧版本字段依然保留。

---

*本规范适用于 FLFHMCL 核心及所有附属组件，最新元数据以 GitHub Release 页面为准。*  
*Release 总览：[https://github.com/HiBer2007/FLFHMCL/releases](https://github.com/HiBer2007/FLFHMCL/releases)*