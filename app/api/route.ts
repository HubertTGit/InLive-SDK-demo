import { env } from '@/lib/env';
import { NextResponse } from 'next/server';

export async function GET() {
  const { INLIVE_API_KEY } = env;
  return NextResponse.json(INLIVE_API_KEY);
}
