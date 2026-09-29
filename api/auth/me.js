import { json, method } from '../_lib/http.js';
import { currentUser } from '../_lib/session.js';
export default async function handler(req,res){if(!method(req,res,['GET']))return;try{const user=await currentUser(req);if(!user)return json(res,401,{error:'Sessão não autenticada.'});json(res,200,{user})}catch(e){console.error(e);json(res,500,{error:'Falha ao validar sessão.'})}}
