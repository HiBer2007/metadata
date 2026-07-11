# HMCL启动器的更新方式

---

## HMCL 启动器版本更新机制

### 涉及的关键文件

| 文件 | 作用 |
|------|------|
| Metadata.java | 定义版本号、更新 API 地址等常量 |
| UpdateChannel.java | 定义更新频道枚举（STABLE / DEVELOPMENT / NIGHTLY） |
| UpdateChecker.java | **核心**：检查更新，与远程 API 通信 |
| RemoteVersion.java | 远程版本数据模型，解析 API JSON |
| UpdateHandler.java | 处理更新下载和应用流程 |
| HMCLDownloadTask.java | 下载更新 JAR 文件的任务 |
| UpgradeDialog.java | 显示更新日志和更新确认对话框 |

---

### 1️⃣ 更新检查流程

**触发时机：** 启动器启动时自动触发。

在 `Launcher.start()` 的第 153 行调用 `UpdateChecker.init()`：

```java
UpdateChecker.init();
```

**`UpdateChecker.init()`** 会读取当前构建频道和预览设置，发起检查：

```java
public static void init() {
    requestCheckUpdate(UpdateChannel.getChannel(), settings().acceptPreviewUpdateProperty().get());
}
```

**频道判定（`UpdateChannel.getChannel()`）：**
根据 `Metadata.BUILD_CHANNEL`（从 JAR 清单属性 `hmcl.version.type` 读取）决定：
- `"stable"` → `STABLE`
- `"dev"` → `DEVELOPMENT`
- 其他（如 nightly） → `NIGHTLY`

---

### 2️⃣ 网络请求与 API 通信

`UpdateChecker.checkUpdate()` 构建请求 URL：

```java
var query = new LinkedHashMap<String, String>();
query.put("version", Metadata.VERSION);   // 当前版本号
query.put("channel", preview ? channel.channelName + "-preview" : channel.channelName);

String url = NetworkUtils.withQuery(Metadata.HMCL_UPDATE_URL, query);
// 最终 URL 示例：
// https://hmcl.huangyuhui.net/api/update_link?version=3.5.5&channel=stable
```

**更新 API 地址**定义在 Metadata.java 第 49 行：

```java
public static final String HMCL_UPDATE_URL = 
    System.getProperty("hmcl.update_source.override", 
                       PUBLISH_URL + "/api/update_link");
// 默认值: https://hmcl.huangyuhui.net/api/update_link
// 可通过系统属性 hmcl.update_source.override 覆盖
```

请求通过 `NetworkUtils.doGet(url)` 发送 HTTP GET 请求。

---

### 3️⃣ 解析远程版本信息

`RemoteVersion.fetch(channel, preview, url)` 解析 API 返回的 JSON：

```java
JsonObject response = JsonUtils.fromNonNullJson(NetworkUtils.doGet(url), JsonObject.class);
```

**API 预期的 JSON 响应格式：**

```json
{
    "version": "3.5.6",          // 最新版本号
    "jar": "https://.../HMCL-3.5.6.jar",  // 下载链接
    "jarsha1": "abc123...",      // SHA-1 哈希值（完整性校验）
    "force": false               // 是否强制更新
}
```

解析后封装成 `RemoteVersion` 记录（Record）：

```java
public record RemoteVersion(
    UpdateChannel channel,     // 更新频道
    String version,            // 版本号
    String url,                // JAR 下载链接
    Type type,                 // JAR 类型
    IntegrityCheck integrityCheck,  // SHA-1 完整性校验
    boolean preview,           // 是否预览版
    boolean force              // 是否强制更新
)
```

---

### 4️⃣ 判断是否有新版本

`UpdateChecker.isOutdated()` 通过 **`outdated` 绑定属性**实时计算：

```java
private static final BooleanBinding outdated = Bindings.createBooleanBinding(
    () -> {
        RemoteVersion latest = latestVersion.get();
        if (latest == null || isDevelopmentVersion(Metadata.VERSION)) {
            return false;  // 开发版不提示更新
        } else if (latest.force()
                || Metadata.isNightly()
                || latest.channel() == UpdateChannel.NIGHTLY
                || latest.channel() != UpdateChannel.getChannel()) {
            return !latest.version().equals(Metadata.VERSION);  // 字符串比较
        } else {
            return VersionNumber.compare(Metadata.VERSION, latest.version()) < 0;  // 语义化版本比较
        }
    },
    latestVersion);
```

判断逻辑：
1. **无远程版本信息** 或 **当前是开发版**（版本号含 `@` 或 `SNAPSHOT`）→ 不认为有更新
2. **强制更新** 或 **频道变更** → 版本号不同就认为有更新
3. **正常情况** → 使用 `VersionNumber.compare()` 做语义化版本比较，当前版本 < 最新版本即有更新

---

### 5️⃣ 获取最新版本下载链接

最新版本的下载链接存储在 `RemoteVersion.url` 字段中，该字段来自 API 返回的 `"jar"` 字段。

可通过以下方式获取：
- **代码层面：** `UpdateChecker.getLatestVersion().url()` 获取下载 URL
- **版本号：** `UpdateChecker.getLatestVersion().version()`
- **完整性校验：** `UpdateChecker.getLatestVersion().integrityCheck()` 包含 SHA-1 哈希

---

### 6️⃣ 执行更新流程（下载 + 安装）

当用户点击更新按钮时，`SettingsPage.onUpdate()` 调用：

```java
private void onUpdate() {
    RemoteVersion target = UpdateChecker.getLatestVersion();
    if (target == null) return;
    UpdateHandler.updateFrom(target);
}
```

**`UpdateHandler.updateFrom()` 的执行过程：**

1. **显示更新对话框**（`UpgradeDialog`）：展示更新日志（从 `https://docs.hmcl.net/changelog/` 抓取 HTML 解析）
2. **创建临时文件：** `Files.createTempFile("hmcl-update-", ".jar")`
3. **下载 JAR 文件：** 使用 `HMCLDownloadTask`（继承 `FileDownloadTask`），下载时自动用 SHA-1 做完整性校验
4. **下载成功后：**
   - 验证当前 JAR 的完整性（`IntegrityChecker.isSelfVerified()`）
   - 保存窗口状态
   - 等待所有文件保存完成
   - 调用 `requestUpdate(downloaded, currentLocation)`
5. **启动新进程：** `startJava(updateTo, "--apply-to", selfPath)`，启动新的 HMCL JVM 进程
6. **新进程（`--apply-to` 模式）：**
   - `UpdateHandler.applyUpdate()`：将可执行文件头复制到目标文件
   - 重命名 JAR 文件为包含版本号的格式（如 `HMCL-3.5.6.jar`）
   - 启动 HMCL 主程序

---

### 7️⃣ 用户界面反馈

- **主界面（`MainPage`）：** 绑定 `UpdateChecker.outdatedProperty()`，有新版本时显示更新通知
- **设置页面（`SettingsPage`）：**
  - 在"更新"面板显示当前频道（stable/dev）
  - 显示更新状态："已是最新" / "检查中…" / 或 "新版本 X.X.X 可用"
  - 提供「预览更新」切换开关，切换后重新检查更新
  - 提供「禁用自动显示更新对话框」选项
- **UI 上更新按钮**仅在 `UpdateChecker.isOutdated()` 为 true 时显示

---

### 流程图概览

```mermaid
flowchart TD
    A[启动器启动] --> B[Launcher.start()]
    B --> C[UpdateChecker.init]
    C --> D[requestCheckUpdate]
    D --> E[后台线程 checkUpdate]
    E --> F[构建 API URL]
    F --> G[HTTP GET 请求<br/>api/update_link]
    G --> H[解析 JSON -> RemoteVersion]
    H --> I[存入 latestVersion 属性]
    I --> J[isOutdated 判断是否有更新]
    J --> K{有更新?}
    K -->|是| L[UI 显示更新按钮]
    K -->|否| M[UI 显示"已是最新"]
    L --> N[用户点击更新]
    N --> O[UpdateHandler.updateFrom]
    O --> P[下载 JAR + SHA-1 校验]
    P --> Q[启动新 Java 进程 --apply-to]
    Q --> R[新进程替换旧 JAR<br/>重命名为 HMCL-X.X.X.jar]
    R --> S[启动 HMCL]
```

这就是 HMCL 完整的版本更新检查与下载安装机制！