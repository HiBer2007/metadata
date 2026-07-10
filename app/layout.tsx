import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HiBerNET元数据服务',
  description: '提供元数据下载和文件下载服务，附带文档站',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
      </body>
    </html>
  );
}