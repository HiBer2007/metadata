import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { metadataMapping, MetadataType } from '@/lib/metadata-mapping';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const typeParam = searchParams.get('type') || 'default';

  // 检查映射表中是否存在该类型
  const validTypes = Object.keys(metadataMapping) as MetadataType[];
  let type: MetadataType = 'default';
  if (validTypes.includes(typeParam as MetadataType)) {
    type = typeParam as MetadataType;
  } else {
    // 如果类型无效，仍返回默认，但可以返回错误信息或默认
    // 这里选择返回默认
    type = 'default';
  }

  const jsonFileName = metadataMapping[type];
  const jsonFilePath = path.join(process.cwd(), 'metadata', jsonFileName);

  // 检查文件是否存在
  if (!fs.existsSync(jsonFilePath)) {
    return new NextResponse(
      JSON.stringify({ error: `Metadata file ${jsonFileName} not found` }),
      {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const fileContent = fs.readFileSync(jsonFilePath, 'utf-8');
  // 可选：验证 JSON 格式
  try {
    JSON.parse(fileContent);
  } catch {
    return new NextResponse(
      JSON.stringify({ error: 'Invalid JSON metadata' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // 返回 JSON 并强制下载
  return new NextResponse(fileContent, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="metadata-${type}.json"`,
    },
  });
}