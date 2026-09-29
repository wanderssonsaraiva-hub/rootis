import { json, method } from '../_lib/http.js';import { destroySession } from '../_lib/session.js';
export default async function handler(req,res){if(!method(req,res,['POST']))return;try{await destroySession(req,res);json(res,200,{ok:true})}catch(e){console.error(e);json(res,500,{error:'Falha ao sair.'})}}
