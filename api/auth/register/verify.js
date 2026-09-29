import { json,method } from '../../_lib/http.js';

export default async function handler(req,res){
  if(!method(req,res,['POST']))return;
  return json(res,410,{error:'O cadastro do Rootis não usa mais código de ativação. Crie a conta diretamente pela tela de cadastro.'});
}
