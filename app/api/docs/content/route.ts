import { NextRequest, NextResponse } from 'next/server';
import { getDocContent } from '@/lib/doc-utils';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const pathParam = searchParams.get('path') || 'index.md';
  if (pathParam.includes('..')) {
    return new NextResponse('Invalid path', { status: 400 });
  }
  const content = getDocContent(pathParam);
  return new NextResponse(content, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
}