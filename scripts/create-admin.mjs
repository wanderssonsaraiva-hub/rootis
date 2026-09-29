import { neon } from '@neondatabase/serverless';
import crypto from 'node:crypto';
const required=['DATABASE_URL','ROOTIS_ADMIN_EMAIL','ROOTIS_ADMIN_PHONE','ROOTIS_ADMIN_PASSWORD'];
for(const k of required)if(!process.env[k]){console.error(`Falta ${k}. Defina a variável de ambiente sem gravá-la no código.`);process.exit(1)}
const hashPassword=p=>{const salt=crypto.randomBytes(16).toString('hex');const hash=crypto.scryptSync(String(p),salt,64,{N:16384,r:8,p:1}).toString('hex');return `scrypt$${salt}$${hash}`};
const sql=neon(process.env.DATABASE_URL),email=process.env.ROOTIS_ADMIN_EMAIL.trim().toLowerCase(),phone=process.env.ROOTIS_ADMIN_PHONE.replace(/\D/g,''),name=process.env.ROOTIS_ADMIN_NAME||'Administrador Rootis',passwordHash=hashPassword(process.env.ROOTIS_ADMIN_PASSWORD);
await sql`INSERT INTO users (user_id,role,name,email,phone,password_hash,verified) VALUES ('wandersson-saraiva','owner',${name},${email},${phone},${passwordHash},TRUE) ON CONFLICT (user_id) DO UPDATE SET role='owner',name=EXCLUDED.name,email=EXCLUDED.email,phone=EXCLUDED.phone,password_hash=EXCLUDED.password_hash,verified=TRUE,updated_at=NOW()`;
console.log('Conta proprietária criada/atualizada com segurança no banco. Nenhuma senha foi gravada no frontend.');
