'use server'

import pkg from "pg";
const { Client } = pkg;

export async function updata(userData) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log("connect");
  const timecreate = new Date(new Date().getTime() + (7 * 60 * 60 * 1000)).toISOString();
  await client.query(
    `INSERT INTO "user" (email, firstname, lastname, token, provider, timecreate) 
                       VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      userData.email,
      userData.firstname,
      userData.lastname,
      userData.sub,
      userData.provider,
      timecreate
    ]
  );

  await client.end();
}
