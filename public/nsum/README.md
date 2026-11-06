# NSUM Runtime 发布产物

**产物策略**：单个文件 **>10MB 一律走 GitHub Releases**；只有 **<10MB** 的小文件才放本目录。

NSUM Runtime 由 **HIC 安装器**（`NSUM_Installer_<version>.exe`，通常 >10MB）分发，因此本目录默认**不放**运行时产物，`metadata/NSUM.json` 的 `download_link` 指向 GH Release。

如需托管小文件（例如增量补丁、配置样例），放在本目录并以 `https://metadata.hibernet.top/nsum/<文件名>` 引用。

**bridge 的安装方式**：

```
NSUM_Installer_<ver>.exe --cli --json --silent --path <HMCL>/.hmcl/nsum/runtime --flow <bridge 内置流程>
```

- 安装流程由 bridge 内置（`/nsum-install-flow.json`），其中快捷方式步骤 `enabled:false`，**不会创建桌面快捷方式或开始菜单项**；
- `--json` 输出 `progress/message/finish` 事件，bridge 解析后把进度回显到 HMCL GUI。
