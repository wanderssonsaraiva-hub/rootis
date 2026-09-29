import crypto from 'node:crypto';

const KEYLEN = 64;
export function normalizeEmail(v){ return String(v||'').trim().toLowerCase(); }
export function normalizePhone(v){ return String(v||'').replace(/\D/g,''); }
export function hashPassword(password){
  const salt=crypto.randomBytes(16).toString('hex');
  const hash=crypto.scryptSync(String(password),salt,KEYLEN,{N:16384,r:8,p:1}).toString('hex');
  return `scrypt$${salt}$${hash}`;
}
export function verifyPassword(password, stored){
  const [kind,salt,hex]=String(stored||'').split('$');
  if(kind!=='scrypt'||!salt||!hex)return false;
  const actual=crypto.scryptSync(String(password),salt,KEYLEN,{N:16384,r:8,p:1});
  const expected=Buffer.from(hex,'hex');
  return expected.length===actual.length&&crypto.timingSafeEqual(expected,actual);
}
export function randomCode(){ return String(crypto.randomInt(100000,1000000)); }
export function hashOtp(code){
  const secret=process.env.ROOTIS_OTP_SECRET;
  if(!secret)throw new Error('ROOTIS_OTP_SECRET não configurado');
  return crypto.createHmac('sha256',secret).update(String(code)).digest('hex');
}
export function safeEqualHex(a,b){
  try{const A=Buffer.from(String(a),'hex'),B=Buffer.from(String(b),'hex');return A.length===B.length&&crypto.timingSafeEqual(A,B)}catch{return false}
}
export function randomToken(){ return crypto.randomBytes(32).toString('base64url'); }
export function sha256(value){ return crypto.createHash('sha256').update(String(value)).digest('hex'); }
export function slug(value){ return String(value||'dentista').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,48)||'dentista'; }
export function masked(channel,value){
  const raw=String(value||'');
  if(channel==='email'){const [u,d]=raw.split('@');return u&&d?`${u.slice(0,2)}***@${d}`:'***';}
  const p=normalizePhone(raw);return p.length>=4?`(**) *****-${p.slice(-4)}`:'***';
}
