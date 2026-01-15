import { cookies } from 'next/headers'
export const runtime = 'nodejs'

export async function GET(req) {
  const cookieStore = await cookies()
  const cookie = cookieStore.get('session')
  if (!cookie) {
    return new Response('Unauthorized', { status: 401 })
  }

  const sessionToken = cookie.value;

  return Response.json({ sessionToken });
}
