// 'use server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic';

import admin from "@/lib/firebase-admin";
import { cookies } from 'next/headers'
import { OAuth2Client } from 'google-auth-library'
import crypto from 'crypto';
import { createsession, createusersession, checksession, getUserfromemail } from '@/lib/db';

async function hasConsent() {
  const cookieStore = await cookies();
  return cookieStore.get("cookie_consent")?.value === "accepted";
}

function getGoogleClient() {
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error("Missing GOOGLE_CLIENT_ID");
  }
  return new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
}

export async function verifyGoogleToken(idToken) {
  const client = getGoogleClient();
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

export async function verifyFirebaseLogin(accessToken) {
  const decoded = await admin.auth().verifyIdToken(accessToken);
  // console.log(decoded)
  if (decoded.firebase.sign_in_provider !== "facebook.com"&&decoded.firebase.sign_in_provider !== "google.com") {
    throw new Error('Invalid Facebook token')
  }

  return decoded
}

export async function POST(req) {
  const { provider, token} = await req.json()
  let payload,firstname,lastname
  console.log('LOGIN ROUTE HIT')
  if (!(await hasConsent())) {
    return Response.json(
      { error: 'Cookie consent required for analytics' },
      { status: 403 }
    );
  }
  if (provider === 'line.com') {
    payload = await verifyLineToken(token)
  } else if (provider === 'facebook.com'||provider === 'google.com') {
    payload = await verifyFirebaseLogin(token)
    let fullname = payload.name.split(" ")
    firstname = fullname[0]
    lastname = fullname[1]
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
