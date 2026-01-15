// 'use server';

import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function createsession( session_token, user_id ) {
  await pool.query(
    `
    INSERT INTO sessions (session_token, user_id, expires_at, created_at)
    VALUES ($1, $2, NOW() + INTERVAL '12 hours', NOW())
    `,
    [session_token, user_id]
  );
}

export async function checksession(user_id) {
  const res = await pool.query(
    `
    SELECT session_token
    FROM sessions
    WHERE user_id = $1
      AND expires_at > NOW()
    `,
    [user_id]
  );
  try {
    return res.rows[0].session_token;
  } catch (error) {
    return null;
  }
  
}

export async function deleteSession(session_token) {
  await pool.query(
    'DELETE FROM sessions WHERE session_token = $1',
    [session_token]
  );
}

export async function createusersession({ email, firstname,lastname,provider }) {
  const res = await pool.query(
    `
    INSERT INTO usersession (email, firstname, lastname, provider,timecreate)
    VALUES ($1, $2, $3, $4, NOW())
    RETURNING uid
    `,
    [email, firstname,lastname,provider]
  );
  return res.rows[0].uid
}

export async function getUserfromid(session_token) {
  const res = await pool.query(
    `
    SELECT u.email, u.firstname, u.lastname
    FROM public."usersession" u
    JOIN public."sessions" s ON u.uid = s.user_id
    WHERE s.session_token = $1
      AND s.expires_at > NOW()
    `,
    [session_token]
  );
  return res.rows[0] || null;
}

export async function getUserfromemail(email) {
  const res = await pool.query(
    `
    SELECT uid
    FROM usersession
    WHERE email = $1
    `,
    [email]
  );
  return res.rows[0] || null;
}
export default pool;