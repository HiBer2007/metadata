import fs from 'fs';
import path from 'path';

// 从 Markdown 中提取第一个一级标题（# 标题）
function extractTitle(filePath: string): string | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const match = content.match(/^#\s+(.+)$/m);
    return match ? match[1].trim() : null;
  } catch {
    return null;
  }
}

// 递归获取目录下的所有 .md 文件，构建树结构
export function getDocTree(dir: string = 'doc', basePath: string = ''): any[] {
  const fullDir = path.join(process.cwd(), dir);
  const entries = fs.readdirSync(fullDir, { withFileTypes: true });
  const result: any[] = [];

  for (const entry of entries) {
    const fullPath = path.join(fullDir, entry.name);
    const relativePath = path.join(basePath, entry.name);

    if (entry.isDirectory()) {
      const children = getDocTree(fullPath, relativePath);
      result.push({
        type: 'directory',
        name: entry.name,
        title: entry.name,          // 目录显示名称仍为目录名
        path: relativePath,
        children,
      });
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      const title = extractTitle(fullPath) || entry.name.replace(/\.md$/, '');
      result.push({
        type: 'file',
        name: entry.name.replace(/\.md$/, ''),
        title: title,               // 使用提取的一级标题
        path: relativePath,
      });
    }
  }

  // 按目录优先、名称排序
  result.sort((a, b) => {
    if (a.type === 'directory' && b.type !== 'directory') return -1;
    if (a.type !== 'directory' && b.type === 'directory') return 1;
    return a.name.localeCompare(b.name);
  });

  return result;
}

// 读取指定路径的 Markdown 内容（路径相对于 doc/）
export function getDocContent(relativePath: string): string {
  const fullPath = path.join(process.cwd(), 'doc', relativePath);
  if (!fs.existsSync(fullPath)) {
    return '# 文档不存在\n\n请检查路径是否正确。';
  }
  return fs.readFileSync(fullPath, 'utf-8');
}