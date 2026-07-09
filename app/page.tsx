import fs from 'fs';
import path from 'path';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { metadataMapping } from '@/lib/metadata-mapping';

// 读取 doc/index.md
async function getDocContent() {
  const filePath = path.join(process.cwd(), 'doc', 'index.md');
  const content = fs.readFileSync(filePath, 'utf-8');
  return content;
}

export default async function HomePage() {
  const markdownContent = await getDocContent();

  // 从映射表获取可用端点列表，用于在文档中展示（可选，也可在文档中手写）
  const endpoints = Object.keys(metadataMapping);

  return (
    <article className="markdown-body">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {markdownContent}
      </ReactMarkdown>
      {/* 可选：动态显示可用的元数据端点 */}
      <hr />
      <h2>📡 可用元数据端点</h2>
      <p>您可以通过以下类型参数获取不同的元数据：</p>
      <ul>
        {endpoints.map((key) => (
          <li key={key}>
            <code>/api/metadata?type={key}</code> → 对应 <code>{metadataMapping[key as keyof typeof metadataMapping]}</code>
          </li>
        ))}
      </ul>
      <p>
        默认（不传 <code>type</code>）使用 <code>default</code> 对应的 JSON。
      </p>
    </article>
  );
}