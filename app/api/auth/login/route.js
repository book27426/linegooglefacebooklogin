// 'use server'
export const runtime = 'nodejs'

import { cookies } from 'next/headers'
import { OAuth2Client } from 'google-auth-library'
import crypto from 'crypto';
import { createsession, createusersession, checksession, getUserfromemail } from '@/lib/db';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

export function hasConsent(req) {
  const cookieStore = req.cookies.get('cookie_consent');;
  return cookieStore.value === 'accepted';
}


export async function verifyGoogleToken(idToken) {
  // console.log(idToken)
  // console.log(process.env.GOOGLE_CLIENT_ID)
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  })

  return ticket.getPayload()
}

export async function verifyLineToken(idToken) {
  const res = await fetch(
    'https://api.line.me/oauth2/v2.1/verify',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ id_token: idToken }),
    }
  )

  if (!res.ok) throw new Error('Invalid LINE token')

  return res.json()
}

export async function verifyFacebookToken(accessToken) {
  const res = await fetch(
    `https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`
  )

  if (!res.ok) {
    throw new Error('Invalid Facebook token')
  }

  return res.json()
}

export async function POST(req) {
  const { provider, token, firstname, lastname} = await req.json()
  let payload
  console.log('LOGIN ROUTE HIT')
  if (!(await hasConsent(req))) {
    return Response.json(
      { error: 'Cookie consent required for analytics' },
      { status: 403 }
    );
  }
  if (provider === 'google.com') {
    payload = await verifyGoogleToken(token)
  } else if (provider === 'line.com') {
    payload = await verifyLineToken(token)
  } else if (provider === 'facebook.com') {
    payload = await verifyFacebookToken(token)
  } else {
    return new Response('Unsupported provider', { status: 400 })
  }
  let userId = await getUserfromemail(payload.email);
  if(!userId){
    userId = await createusersession({
      email: payload.email,
      firstname: firstname,
      lastname: lastname,
      provider,
    });
  }
  userId = userId.uid
  let session_token = await checksession(userId)
  if(!session_token){
    session_token = crypto.randomBytes(30).toString('hex');
    createsession(session_token,userId)
  }
  const cookieStore = await cookies()
  cookieStore.set(
    'session',
    session_token,
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    }
  )

  return Response.json({ success: true })
}
