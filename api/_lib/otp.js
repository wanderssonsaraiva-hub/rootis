function twilioAuth(){return 'Basic '+Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64')}
async function sendEmail(destination,code){
  if(!process.env.RESEND_API_KEY||!process.env.ROOTIS_EMAIL_FROM)throw new Error('Canal de e-mail ainda não configurado no servidor.');
  const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({from:process.env.ROOTIS_EMAIL_FROM,to:[destination],subject:'Código de acesso Rootis',html:`<p>Seu código Rootis é <strong>${code}</strong>.</p><p>Ele expira em 10 minutos.</p>`})});
  if(!r.ok)throw new Error('Não foi possível enviar o e-mail de verificação.');
}
async function sendTwilio(destination,code,whatsapp=false){
  const sid=process.env.TWILIO_ACCOUNT_SID,token=process.env.TWILIO_AUTH_TOKEN,from=whatsapp?process.env.TWILIO_FROM_WHATSAPP:process.env.TWILIO_FROM_SMS;
  if(!sid||!token||!from)throw new Error(`${whatsapp?'WhatsApp':'SMS'} ainda não configurado no servidor.`);
  const to=whatsapp?`whatsapp:+55${destination}`:`+55${destination}`;
  const fromValue=whatsapp?(from.startsWith('whatsapp:')?from:`whatsapp:${from}`):from;
  const form=new URLSearchParams({To:to,From:fromValue,Body:`Rootis: seu código é ${code}. Ele expira em 10 minutos.`});
  const r=await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,{method:'POST',headers:{Authorization:twilioAuth(),'Content-Type':'application/x-www-form-urlencoded'},body:form});
  if(!r.ok)throw new Error(`Não foi possível enviar o código por ${whatsapp?'WhatsApp':'SMS'}.`);
}
export async function sendOtp(channel,destination,code){
  if(process.env.ROOTIS_ALLOW_TEST_OTP==='true'&&process.env.VERCEL_ENV!=='production')return {devCode:code};
  if(channel==='email'){await sendEmail(destination,code);return {}};
  if(channel==='sms'){await sendTwilio(destination,code,false);return {}};
  if(channel==='whatsapp'){await sendTwilio(destination,code,true);return {}};
  throw new Error('Canal de verificação inválido.');
}
