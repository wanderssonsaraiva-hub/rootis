import { json,method } from '../../_lib/http.js';

export default async function handler(req,res){
  if(!method(req,res,['POST']))return;
  return json(res,410,{error:'A recuperação de senha está temporariamente desativada no Rootis.'});
}
