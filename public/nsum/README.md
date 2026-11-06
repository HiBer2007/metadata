# NSUM Runtime 发布产物（metadata 站点托管）

把 NSUM Runtime 的发布包放在本目录，供 bridge 自动安装/更新下载：

```
public/nsum/NSUM_Runtime_<version>.zip
```

- zip 内需包含 `NeoServerUpdateModpack.exe` 及部署内容（`exporters/`、Qt DLL 等）；bridge 解压后会整目录装到 `<HMCL>/.hmcl/nsum/runtime/`。
- 文件名与 `metadata/NSUM.json` 中对应版本的 `download_link` 必须一致。
- 建议同时提供 `sha_256`（`metadata/NSUM.json` 的 `List[].sha_256`），bridge 会校验。

示例 `download_link`：

```
https://metadata.hibernet.top/nsum/NSUM_Runtime_1.0.0.zip
```

> 之所以托管在本站点而不是 GitHub Releases：部分网络环境下 GitHub 证书链/吊销检查不可用（PKIX / CRYPT_E_REVOCATION_OFFLINE），而 metadata 域名可正常访问。
