import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '元数据服务站点',
  description: '提供元数据下载和文件下载服务',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="container">{children}</div>
      </body>
    </html>
  );
}