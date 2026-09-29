import { db } from '../_lib/db.js';
import { json, bodyJson, method } from '../_lib/http.js';
import { normalizeEmail, normalizePhone, verifyPassword } from '../_lib/security.js';
import { createSession } from '../_lib/session.js';
export default async function handler(req,res){
  if(!method(req,res,['POST']))return;
  try{
    const {identifier,password}=await bodyJson(req);const raw=String(identifier||'').trim();if(!raw||!password)return json(res,400,{error:'Informe e-mail/celular e senha.'});
    const sql=db(),email=normalizeEmail(raw),phone=normalizePhone(raw);const rows=await sql`SELECT * FROM users WHERE lower(email)=${email} OR phone=${phone||'__'} LIMIT 1`;const user=rows[0];
    if(!user||!verifyPassword(password,user.password_hash))return json(res,401,{error:'E-mail/celular ou senha incorretos.'});
    if(!user.verified)return json(res,403,{error:'Conta ainda não verificada.'});
    await createSession(res,user.user_id);
    json(res,200,{user:{userId:user.user_id,role:user.role,name:user.name,email:user.email,phone:user.phone,cro:user.cro,specialty:user.specialty,clinic:user.clinic}});
  }catch(e){console.error(e);json(res,500,{error:'Falha ao entrar com segurança.'})}
}
