import fs from 'fs';
import path from 'path';

function extractTitle(filePath: string): string | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const match = content.match(/^#\s+(.+)$/m);
    return match ? match[1].trim() : null;
  } catch {
    return null;
  }
}

function scanDir(dirPath: string, basePath: string = ''): any[] {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const result: any[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const relativePath = path.join(basePath, entry.name);

    if (entry.isDirectory()) {
      const children = scanDir(fullPath, relativePath);
      result.push({
        type: 'directory',
        name: entry.name,
        title: entry.name,
        path: relativePath,
        children,
      });
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      const title = extractTitle(fullPath) || entry.name.replace(/\.md$/, '');
      result.push({
        type: 'file',
        name: entry.name.replace(/\.md$/, ''),
        title: title,
        path: relativePath,
      });
    }
  }

  result.sort((a, b) => {
    if (a.type === 'directory' && b.type !== 'directory') return -1;
    if (a.type !== 'directory' && b.type === 'directory') return 1;
    return a.name.localeCompare(b.name);
  });

  return result;
}

export function getDocTree(): any[] {
  const docRoot = path.join(process.cwd(), 'doc');
  if (!fs.existsSync(docRoot)) {
    return [];
  }
  return scanDir(docRoot, '');
}

export function getDocContent(relativePath: string): string {
  const fullPath = path.join(process.cwd(), 'doc', relativePath);
  if (!fs.existsSync(fullPath)) {
    return '# 文档不存在\n\n请检查路径是否正确。';
  }
  return fs.readFileSync(fullPath, 'utf-8');
}