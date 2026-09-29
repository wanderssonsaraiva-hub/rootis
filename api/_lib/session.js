import { db } from './db.js';
import { randomToken, sha256 } from './security.js';

const COOKIE='rootis_session';
const MAX_AGE=60*60*24*7;
function cookies(req){
  return Object.fromEntries(String(req.headers.cookie||'').split(';').map(v=>v.trim()).filter(Boolean).map(v=>{const i=v.indexOf('=');return [decodeURIComponent(v.slice(0,i)),decodeURIComponent(v.slice(i+1))]}));
}
export async function createSession(res,userId){
  const sql=db(),token=randomToken(),tokenHash=sha256(token);
  await sql`DELETE FROM sessions WHERE expires_at < NOW()`;
  await sql`INSERT INTO sessions (token_hash,user_id,expires_at) VALUES (${tokenHash},${userId},NOW()+INTERVAL '7 days')`;
  res.setHeader('Set-Cookie',`${COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${MAX_AGE}`);
}
export async function currentUser(req){
  const token=cookies(req)[COOKIE];if(!token)return null;
  const sql=db(),rows=await sql`
    SELECT u.user_id AS "userId",u.role,u.name,u.email,u.phone,u.cro,u.specialty,u.clinic,u.created_at AS "createdAt"
    FROM sessions s JOIN users u ON u.user_id=s.user_id
    WHERE s.token_hash=${sha256(token)} AND s.expires_at>NOW() AND u.verified=TRUE
    LIMIT 1`;
  return rows[0]||null;
}
export async function destroySession(req,res){
  const token=cookies(req)[COOKIE];
  if(token){const sql=db();await sql`DELETE FROM sessions WHERE token_hash=${sha256(token)}`;}
  res.setHeader('Set-Cookie',`${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
}
