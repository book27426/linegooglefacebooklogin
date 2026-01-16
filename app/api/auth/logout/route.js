export const runtime = 'nodejs';
import { NextResponse } from 'next/server'
import { deleteSession } from '@/lib/db';

export async function POST(request) {
  const session = request.cookies.get('session');
  const response = NextResponse.json({ success: true });
  if (session) {
    await deleteSession(session.value);
    response.cookies.delete('session');
  }
  return response
}
