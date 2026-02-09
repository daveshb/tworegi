import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const res = NextResponse.json({ message: 'ok' });
  res.cookies.set({ name: 'tworegi_token', value: '', path: '/', maxAge: 0 });
  return res;
}
