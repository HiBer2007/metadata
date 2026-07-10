import { NextResponse } from 'next/server';
import { getDocTree } from '@/lib/doc-utils';

export async function GET() {
  const tree = getDocTree();
  return NextResponse.json(tree);
}