# 开始使用

本指南将带您快速上手。

## 关于此项目

此项目提供了由HiBer2007和他的小伙伴编写的项目的托管地点，并提供下载/更新等的元数据

## 使用项目

- **API 端点**：`/api/metadata`
- **请求方式**：`GET`
- **查询参数**：
  - `type`（可选）：指定元数据类型，默认为 `default`。有效值由映射表定义（如 `service`, `another`）。


**响应**：返回对应 JSON 文件的内容，并设置 `Content-Disposition: attachment` 头，浏览器会自动下载文件，文件名为 `metadata-{type}.json`。

**示例请求**：

```bash
# bash终端
# 获取默认元数据
curl -O https://metadata.hibernet.top/api/metadata

# 获取指定类型元数据
curl -O https://metadata.hibernet.top/api/metadata?type=another

# 或者使用wget命令
# 获取默认元数据，保存为 metadata
wget -O metadata "https://metadata.hibernet.top/api/metadata"

# 获取指定类型元数据，保存为 metadata_another
wget -O metadata_another "https://metadata.hibernet.top/api/metadata?type=another"
```

---

```python
# python 脚本
#!/usr/bin/env python3
import requests
import os

def download_file(url, output_filename):
    try:
        response = requests.get(url, stream=True, timeout=10)
        response.raise_for_status()
        with open(output_filename, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        print(f"Downloaded: {output_filename}")
    except Exception as e:
        print(f"Error downloading {url}: {e}")

if __name__ == "__main__":
    # 下载默认元数据
    download_file("https://metadata.hibernet.top/api/metadata", "metadata")
    # 下载指定类型元数据
    download_file("https://metadata.hibernet.top/api/metadata?type=another", "metadata_another")
```

---

```cpp
\\使用C++ QT库
#include <QCoreApplication>
#include <QNetworkAccessManager>
#include <QNetworkRequest>
#include <QNetworkReply>
#include <QFile>
#include <QUrl>
#include <QEventLoop>
#include <QDebug>

bool downloadFile(const QString &urlString, const QString &outputFileName) {
    QNetworkAccessManager manager;
    QNetworkRequest request(QUrl(urlString));
    // 可添加必要的 header（如 User-Agent）
    request.setRawHeader("User-Agent", "Qt-CPP-Downloader");

    QNetworkReply *reply = manager.get(request);

    // 使用事件循环等待完成（适合命令行工具）
    QEventLoop loop;
    QObject::connect(reply, &QNetworkReply::finished, &loop, &QEventLoop::quit);
    loop.exec();

    if (reply->error() != QNetworkReply::NoError) {
        qCritical() << "Download error:" << reply->errorString();
        reply->deleteLater();
        return false;
    }

    QFile file(outputFileName);
    if (!file.open(QIODevice::WriteOnly)) {
        qCritical() << "Cannot open file for writing:" << outputFileName;
        reply->deleteLater();
        return false;
    }

    file.write(reply->readAll());
    file.close();
    reply->deleteLater();
    qDebug() << "Downloaded:" << outputFileName;
    return true;
}

int main(int argc, char *argv[]) {
    QCoreApplication a(argc, argv);

    // 下载默认元数据
    if (!downloadFile("https://metadata.hibernet.top/api/metadata", "metadata")) {
        return 1;
    }
    // 下载指定类型元数据
    if (!downloadFile("https://metadata.hibernet.top/api/metadata?type=another", "metadata_another")) {
        return 1;
    }

    return 0;
}
```
> **说明**：  
> - 使用 Qt 的 `QNetworkAccessManager` 进行同步下载（通过 `QEventLoop` 阻塞等待）。  
> - 需在 `.pro` 文件中添加 `QT += network`。  
> - 编译命令示例（Linux）：  
>   ```bash
>   g++ -std=c++11 -fPIC download.cpp -o download -I/usr/include/qt5 -I/usr/include/qt5/QtNetwork -L/usr/lib/x86_64-linux-gnu -lQt5Core -lQt5Network
>   ```
> - 输出文件分别为 `metadata` 和 `metadata_another`。

