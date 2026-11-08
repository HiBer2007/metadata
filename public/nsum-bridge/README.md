# nsum-bridge 发布产物（metadata 站点托管）

把 bridge 的发布 jar 放在本目录，供 bridge 自更新检查下载：

```
public/nsum-bridge/nsum-bridge-<version>.jar
```

- 文件名与 `metadata/nsum-bridge.json` 中对应版本的 `download_link` 必须一致。
- 建议同时提供 `sha_256`。

示例：

```
https://metadata.hibernet.top/nsum-bridge/nsum-bridge-0.2.0.jar
```
