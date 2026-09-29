import crypto from 'node:crypto';
import { db } from '../../_lib/db.js';
import { json,bodyJson,method } from '../../_lib/http.js';
import { normalizeEmail,normalizePhone,hashPassword,slug } from '../../_lib/security.js';
import { createSession } from '../../_lib/session.js';

export default async function handler(req,res){
  if(!method(req,res,['POST']))return;
  try{
    const b=await bodyJson(req);
    const name=String(b.name||'').trim();
    const email=normalizeEmail(b.email);
    const phone=normalizePhone(b.phone);
    const password=String(b.password||'');
    if(!name||!email||!/^[0-9]{11}$/.test(phone))return json(res,400,{error:'Preencha nome, e-mail e celular válidos.'});
    if(password.length<8)return json(res,400,{error:'Use uma senha com pelo menos 8 caracteres.'});
    const sql=db();
    const exists=await sql`SELECT 1 FROM users WHERE lower(email)=${email} OR phone=${phone} LIMIT 1`;
    if(exists.length)return json(res,409,{error:'Já existe uma conta com este e-mail ou celular.'});
    const userId=`${slug(name)}-${crypto.randomBytes(4).toString('hex')}`;
    const users=await sql`INSERT INTO users (user_id,role,name,email,phone,password_hash,verified,cro,specialty,clinic) VALUES (${userId},'dentist',${name},${email},${phone},${hashPassword(password)},TRUE,${String(b.cro||'').trim()},${String(b.specialty||'').trim()},${String(b.clinic||'').trim()}) RETURNING user_id AS "userId",role,name,email,phone,cro,specialty,clinic`;
    await createSession(res,userId);
    return json(res,201,{user:users[0]});
  }catch(e){
    console.error(e);
    return json(res,500,{error:e.message||'Falha ao criar conta.'});
  }
}
