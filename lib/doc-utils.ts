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

function loadOrderMap(dirPath: string): Map<string, number> {
  const orderFile = path.join(dirPath, '_order.json');
  if (!fs.existsSync(orderFile)) return new Map();
  try {
    const raw = fs.readFileSync(orderFile, 'utf-8');
    const list: { name: string; weight: number }[] = JSON.parse(raw);
    const map = new Map<string, number>();
    for (const item of list) {
      map.set(item.name, item.weight);
    }
    return map;
  } catch {
    return new Map();
  }
}

function scanDir(dirPath: string, basePath: string = ''): any[] {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const orderMap = loadOrderMap(dirPath);
  const items: any[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const relativePath = path.join(basePath, entry.name);
    if (entry.isFile() && entry.name === '_order.json') continue;

    if (entry.isDirectory()) {
      const children = scanDir(fullPath, relativePath);
      items.push({
        type: 'directory',
        name: entry.name,
        title: entry.name,
        path: relativePath,
        children,
        weight: orderMap.get(entry.name) ?? Infinity,
      });
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      const title = extractTitle(fullPath) || entry.name.replace(/\.md$/, '');
      items.push({
        type: 'file',
        name: entry.name.replace(/\.md$/, ''),
        title,
        path: relativePath,
        weight: orderMap.get(entry.name) ?? Infinity,
      });
    }
  }

  items.sort((a, b) => {
    if (a.weight !== b.weight) return a.weight - b.weight;
    return a.name.localeCompare(b.name);
  });

  return items;
}

export function getDocTree(): any[] {
  const docRoot = path.join(process.cwd(), 'doc');
  if (!fs.existsSync(docRoot)) return [];
  return scanDir(docRoot, '');
}

export function getDocContent(relativePath: string): string {
  const fullPath = path.join(process.cwd(), 'doc', relativePath);
  if (!fs.existsSync(fullPath)) {
    return '# 文档不存在\n\n请检查路径是否正确。';
  }
  return fs.readFileSync(fullPath, 'utf-8');
}