function localWhatsappDigits(value){return String(value||'').replace(/\D/g,'')}
function validLocalWhatsapp(value){return /^\d{11}$/.test(localWhatsappDigits(value))}
function whatsappFieldValue(value){return localWhatsappDigits(value)}

const ROOTIS_DENTISTS_KEY='rootisDentistsV2';
const ROOTIS_ACTIVE_DENTIST_KEY='rootisActiveDentistIdV2';
const DEFAULT_DENTIST_ID='wandersson-saraiva';
const CARLA_DENTIST_ID='carla-matos-demo';
const ROOTIS_SESSION_USER_KEY='rootisSessionUserIdV9';
const ROOTIS_ACCOUNTS_KEY='rootisAccountsV9';
const ROOTIS_DOMAIN='https://www.rootins.com.br';
const ROOTIS_OWNER_EMAIL='saraivawandersson@gmail.com';
const ROOTIS_OWNER_PHONE='98981452365';
const ROOTIS_DEMO_EMAIL='dentista@rootins.com.br';
const ROOTIS_OWNER_PASSWORD_HASH='62e6aa3e';
const ROOTIS_DEMO_PASSWORD_HASH='3f0d9671';
function rootisLocalHash(value){let h=2166136261;for(const ch of String(value||'')){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)>>>0}return h.toString(16).padStart(8,'0')}
function loadAuthAccounts(){
  let list=[];try{const raw=JSON.parse(localStorage.getItem(ROOTIS_ACCOUNTS_KEY)||'[]');if(Array.isArray(raw))list=raw}catch(e){}
  const existingOwner=list.find(a=>a&&a.userId===DEFAULT_DENTIST_ID),existingDemo=list.find(a=>a&&a.userId===CARLA_DENTIST_ID);
  const owner={userId:DEFAULT_DENTIST_ID,role:'owner',name:'Dr. Wandersson Saraiva',email:ROOTIS_OWNER_EMAIL,phone:ROOTIS_OWNER_PHONE,passwordHash:existingOwner?.passwordHash||ROOTIS_OWNER_PASSWORD_HASH,verified:true,...existingOwner,email:ROOTIS_OWNER_EMAIL,phone:ROOTIS_OWNER_PHONE,role:'owner'};
  const demo={userId:CARLA_DENTIST_ID,role:'dentist',name:'Dra. Carla Matos',email:ROOTIS_DEMO_EMAIL,phone:'11999991234',passwordHash:existingDemo?.passwordHash||ROOTIS_DEMO_PASSWORD_HASH,verified:true,isDemo:true,...existingDemo,email:ROOTIS_DEMO_EMAIL,role:'dentist'};
  const others=list.filter(a=>a&&a.userId!==DEFAULT_DENTIST_ID&&a.userId!==CARLA_DENTIST_ID);list=[owner,demo,...others];localStorage.setItem(ROOTIS_ACCOUNTS_KEY,JSON.stringify(list));return list
}
let authAccounts=loadAuthAccounts();
function saveAuthAccounts(){localStorage.setItem(ROOTIS_ACCOUNTS_KEY,JSON.stringify(authAccounts))}
function accountByUserId(id){return authAccounts.find(a=>a.userId===id)||null}
function accountByLogin(value){const raw=String(value||'').trim(),email=raw.toLowerCase(),phone=whatsappFieldValue(raw);return authAccounts.find(a=>String(a.email||'').toLowerCase()===email||(phone&&String(a.phone||'')===phone))||null}
let sessionUserId=localStorage.getItem(ROOTIS_SESSION_USER_KEY)||'';
const isPlatformOwner=()=>sessionUserId===DEFAULT_DENTIST_ID;
const defaultDentist={id:DEFAULT_DENTIST_ID,name:'Dr. Wandersson Saraiva',cro:'8240',specialty:'Implantes e Endodontia',clinic:'Rootis',whatsapp:ROOTIS_OWNER_PHONE,email:ROOTIS_OWNER_EMAIL,pixKey:'',pixReceiver:'',cardPaymentLink:'',createdAt:'2026-09-25'};
const carlaDemoDentist={id:CARLA_DENTIST_ID,name:'Dra. Carla Matos',cro:'CRO-SP 12345',specialty:'Endodontia e Dentística',clinic:'Clínica Carla Matos',whatsapp:'11999991234',email:'carla.matos@exemplo.com',pixKey:'carla.matos@exemplo.com',pixReceiver:'Dra. Carla Matos',cardPaymentLink:'',createdAt:'2026-09-25',isDemo:true};
let dentists=JSON.parse(localStorage.getItem(ROOTIS_DENTISTS_KEY)||'null')||[defaultDentist,carlaDemoDentist];
if(!Array.isArray(dentists)||!dentists.length)dentists=[defaultDentist,carlaDemoDentist];
if(!dentists.some(d=>d.id===DEFAULT_DENTIST_ID))dentists.unshift(defaultDentist);
if(!dentists.some(d=>d.id===CARLA_DENTIST_ID))dentists.push(carlaDemoDentist);
dentists=dentists.map(d=>({...d,whatsapp:whatsappFieldValue(d.whatsapp),pixKey:d.pixKey||'',pixReceiver:d.pixReceiver||'',cardPaymentLink:d.cardPaymentLink||''}));
dentists=dentists.map(d=>d.id===DEFAULT_DENTIST_ID?{...d,email:ROOTIS_OWNER_EMAIL,whatsapp:ROOTIS_OWNER_PHONE}:d);
localStorage.setItem(ROOTIS_DENTISTS_KEY,JSON.stringify(dentists));
let activeDentistId=localStorage.getItem(ROOTIS_ACTIVE_DENTIST_KEY)||CARLA_DENTIST_ID;
if(sessionUserId&&!isPlatformOwner()&&dentists.some(d=>d.id===sessionUserId))activeDentistId=sessionUserId;
if(!dentists.some(d=>d.id===activeDentistId)){activeDentistId=CARLA_DENTIST_ID;localStorage.setItem(ROOTIS_ACTIVE_DENTIST_KEY,activeDentistId)}
let activeDentist=dentists.find(d=>d.id===activeDentistId)||carlaDemoDentist;
const dentistKey=(suffix,id=activeDentistId)=>`rootisDentist_${id}_${suffix}`;
function migrateLegacy(){
  if(activeDentistId!==DEFAULT_DENTIST_ID)return;
  const map={AppointmentsV1:'rootisAppointmentsV1',AvailabilityV3:'rootisAvailabilityV3',PaymentExplanation:'rootisPaymentExplanation',PaymentAmount:'rootisPaymentAmount',PaymentMethod:'rootisPaymentMethod',PaymentRequired:'rootisPaymentRequired',DentistWhatsapp:'rootisDentistWhatsapp',WeeklySummaryDay:'rootisWeeklySummaryDay',WeeklySummaryTime:'rootisWeeklySummaryTime'};
  Object.entries(map).forEach(([suffix,legacy])=>{if(localStorage.getItem(dentistKey(suffix))===null&&localStorage.getItem(legacy)!==null)localStorage.setItem(dentistKey(suffix),localStorage.getItem(legacy))});
  ['patientReminder8h','patientReminder2h','dentistReminder7d','dentistReminder1d','dentistReminder2h','weeklySummaryEnabled'].forEach(id=>{const legacy='rootisReminder_'+id;if(localStorage.getItem(dentistKey('Reminder_'+id))===null&&localStorage.getItem(legacy)!==null)localStorage.setItem(dentistKey('Reminder_'+id),localStorage.getItem(legacy))});
}
migrateLegacy();

const seedAppointments=[
 {name:'Mariana Souza',phone:'11999990000',time:'08:00',end:'11:00',slotStart:'08:00',slotEnd:'11:00',date:'2026-09-25',status:'Confirmado',paymentStatus:'Pago'},
 {name:'Lucas Martins',phone:'11988881111',time:'12:00',end:'15:00',slotStart:'12:00',slotEnd:'15:00',date:'2026-09-25',status:'Confirmado',paymentStatus:'Pago'},
 {name:'Ana Ferreira',phone:'11977772222',time:'16:00',end:'19:00',slotStart:'16:00',slotEnd:'19:00',date:'2026-09-25',status:'Aguardando pagamento',paymentStatus:'Aguardando pagamento'},
 {name:'Carlos Mendes',phone:'11966663333',time:'08:00',end:'11:00',slotStart:'08:00',slotEnd:'11:00',date:'2026-09-28',status:'Aguardando pagamento',paymentStatus:'Aguardando pagamento'},
 {name:'Juliana Rocha',phone:'',time:'12:00',end:'15:00',slotStart:'12:00',slotEnd:'15:00',date:'2026-09-28',status:'Confirmado',paymentStatus:'Pago'},
 {name:'Rafael Nunes',phone:'',time:'16:00',end:'19:00',slotStart:'16:00',slotEnd:'19:00',date:'2026-09-30',status:'Confirmado',paymentStatus:'Pago'}
];
const seedPatients=[
 {name:'Mariana Souza',phone:'11999990000',last:'25/09/2026',next:'02/10 · 10:00'},
 {name:'Lucas Martins',phone:'11988881111',last:'24/09/2026',next:'—'},
 {name:'Ana Ferreira',phone:'11977772222',last:'23/09/2026',next:'30/09 · 11:00'},
 {name:'Carlos Mendes',phone:'11966663333',last:'20/09/2026',next:'01/10 · 14:00'}
];
let appointments=JSON.parse(localStorage.getItem(dentistKey('AppointmentsV1'))||'null');
if(!appointments)appointments=activeDentistId===CARLA_DENTIST_ID?seedAppointments.map(a=>({...a})):[];
appointments=appointments.map((a,i)=>({...a,phone:whatsappFieldValue(a.phone),id:a.id||`appt-${String(a.date||'').replace(/\D/g,'')}-${String(a.time||'').replace(/\D/g,'')}-${i}`,paymentAmount:Number(a.paymentAmount??((a.status==='Confirmado'&&a.paymentStatus==='Pago')?(localStorage.getItem(dentistKey('PaymentAmount'))||100):0))||0}));
let patients=JSON.parse(localStorage.getItem(dentistKey('PatientsV1'))||'null');
if(!patients)patients=activeDentistId===CARLA_DENTIST_ID?seedPatients.map(p=>({...p})):[];
const defaultChargeForPatient=()=>Math.max(0,Number(localStorage.getItem(dentistKey('PaymentAmount'))||100)||0);
function patientAppointmentRecords(name){return appointments.filter(a=>String(a.name||'').trim().toLowerCase()===String(name||'').trim().toLowerCase())}
function inferPatientPaid(name){return patientAppointmentRecords(name).filter(a=>a.status==='Confirmado'&&a.paymentStatus==='Pago').reduce((sum,a)=>sum+(Number(a.paymentAmount)||0),0)}
function inferPatientDue(name){const records=patientAppointmentRecords(name).filter(a=>a.status!=='Cancelado');const paid=inferPatientPaid(name);const pending=records.filter(a=>!(a.status==='Confirmado'&&a.paymentStatus==='Pago')).length*defaultChargeForPatient();return Math.max(paid+pending,paid)}
patients=patients.map((p,i)=>{
  const treatments=Array.isArray(p.treatments)?p.treatments:[];
  const treatmentTotal=treatments.reduce((sum,t)=>sum+(Number(t.amount)||0),0);
  const amountPaid=Number(p.amountPaid??inferPatientPaid(p.name))||0;
  const amountDue=Math.max(Number(p.amountDue??inferPatientDue(p.name))||0,amountPaid,treatmentTotal);
  return {
    ...p,
    id:p.id||`patient-${Date.now().toString(36)}-${i}`,
    phone:whatsappFieldValue(p.phone),
    address:p.address||'',
    email:p.email||'',
    treatments,
    treatmentChargeTotal:Number(p.treatmentChargeTotal??treatmentTotal)||0,
    amountPaid,
    amountDue
  };
});
function persistAppointments(){localStorage.setItem(dentistKey('AppointmentsV1'),JSON.stringify(appointments))}
function persistPatients(){localStorage.setItem(dentistKey('PatientsV1'),JSON.stringify(patients))}
function ledgerToday(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
let paymentLedger=[];
function persistPaymentLedger(){localStorage.setItem(dentistKey('PaymentLedgerV1'),JSON.stringify(paymentLedger))}
function patientForLedgerName(name){return patients.find(p=>String(p.name||'').trim().toLowerCase()===String(name||'').trim().toLowerCase())||null}
function ledgerEntriesForPatient(p){if(!p)return[];return paymentLedger.filter(e=>String(e.patientId||'')===String(p.id||'')||(!e.patientId&&String(e.patientName||'').trim().toLowerCase()===String(p.name||'').trim().toLowerCase()))}
function ledgerTotalForPatient(p){return Math.max(0,ledgerEntriesForPatient(p).reduce((sum,e)=>sum+(Number(e.amount)||0),0))}
function ledgerTotalAll(){return paymentLedger.reduce((sum,e)=>sum+(Number(e.amount)||0),0)}
function ledgerMonthTotal(key){return paymentLedger.filter(e=>revenueMonthKey(e.date)===key).reduce((sum,e)=>sum+(Number(e.amount)||0),0)}
function syncAppointmentPaymentLedger(a){
  if(!a||!a.id)return;const id=`appointment:${a.id}`,idx=paymentLedger.findIndex(e=>e.id===id),isPaid=a.status==='Confirmado'&&a.paymentStatus==='Pago'&&(Number(a.paymentAmount)||0)!==0;
  if(isPaid){const p=patientForLedgerName(a.name),entry={id,date:a.date||ledgerToday(),amount:Number(a.paymentAmount)||0,patientId:p?.id||'',patientName:a.name||'Paciente',source:'appointment',label:'Pagamento de atendimento',appointmentId:a.id,updatedAt:new Date().toISOString()};if(idx>=0)paymentLedger[idx]={...paymentLedger[idx],...entry};else paymentLedger.push(entry)}else if(idx>=0){paymentLedger.splice(idx,1)}
}
function bootstrapPaymentLedger(){
  const raw=JSON.parse(localStorage.getItem(dentistKey('PaymentLedgerV1'))||'null');
  if(Array.isArray(raw)){paymentLedger=raw;return}
  paymentLedger=[];appointments.forEach(syncAppointmentPaymentLedger);
  patients.forEach(p=>{const current=ledgerEntriesForPatient(p).reduce((sum,e)=>sum+(Number(e.amount)||0),0),target=Math.max(0,Number(p.amountPaid)||0),delta=target-current;if(Math.abs(delta)>0.005)paymentLedger.push({id:`opening:${p.id}`,date:ledgerToday(),amount:delta,patientId:p.id,patientName:p.name||'Paciente',source:'opening',label:'Saldo pago já registrado',createdAt:new Date().toISOString()})});
  persistPaymentLedger();
}
function adjustPatientPaidLedger(p,target){
  if(!p)return;const wanted=Math.max(0,Number(target)||0),current=ledgerEntriesForPatient(p).reduce((sum,e)=>sum+(Number(e.amount)||0),0),delta=wanted-current;if(Math.abs(delta)>0.005){paymentLedger.push({id:`adjustment:${p.id}:${Date.now()}`,date:ledgerToday(),amount:delta,patientId:p.id,patientName:p.name||'Paciente',source:'manual',label:delta>=0?'Pagamento lançado manualmente':'Correção de pagamento',createdAt:new Date().toISOString()});persistPaymentLedger()}
}
function renamePatientInLedger(p,newName){if(!p)return;let changed=false;paymentLedger.forEach(e=>{if(String(e.patientId||'')===String(p.id||'')||String(e.patientName||'').trim().toLowerCase()===String(p.name||'').trim().toLowerCase()){e.patientId=p.id;e.patientName=newName;changed=true}});if(changed)persistPaymentLedger()}
bootstrapPaymentLedger();
patients.forEach(p=>{const ledgerPaid=ledgerTotalForPatient(p);if(ledgerEntriesForPatient(p).length)p.amountPaid=ledgerPaid;const treatmentTotal=patientTreatmentTotal(p);p.amountDue=Math.max(Number(p.amountDue)||0,Number(p.amountPaid)||0,treatmentTotal);p.treatmentChargeTotal=treatmentTotal});persistPatients();
function upsertPatient(booking){
  if(!booking.name)return;
  let p=patients.find(x=>x.name.toLowerCase()===String(booking.name).toLowerCase());
  const next=`${booking.date.split('-').reverse().slice(0,2).join('/')} · ${booking.time}`;
  if(!p){
    const paid=(booking.status==='Confirmado'&&booking.paymentStatus==='Pago')?(Number(booking.paymentAmount)||defaultChargeForPatient()):0;
    p={id:`patient-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,6)}`,name:booking.name,phone:whatsappFieldValue(booking.phone),email:booking.email||'',address:'',last:'—',next,amountDue:Math.max(defaultChargeForPatient(),paid),amountPaid:paid};
    patients.push(p)
  }else{
    if(booking.phone)p.phone=whatsappFieldValue(booking.phone);
    if(booking.email)p.email=booking.email;
    p.next=next;
    if(p.amountDue===undefined)p.amountDue=inferPatientDue(p.name);
    if(p.amountPaid===undefined)p.amountPaid=inferPatientPaid(p.name);
  }
  persistPatients();
}
function refreshPatientFinancialMinimums(name){
  const p=patients.find(x=>String(x.name||'').toLowerCase()===String(name||'').toLowerCase());if(!p)return;
  const paid=ledgerTotalForPatient(p);p.amountPaid=paid;p.amountDue=Math.max(Number(p.amountDue)||0,p.amountPaid);persistPatients();
}

const title=document.getElementById('title'),subtitle=document.getElementById('subtitle');
const todayList=document.getElementById('todayList'),patientRows=document.getElementById('patientRows'),patientSearch=document.getElementById('patientSearch'),patientMobileCards=document.getElementById('patientMobileCards');
const calendar=document.getElementById('calendar');
const newAppt=document.getElementById('newAppt'),newAppt2=document.getElementById('newAppt2'),quickAppt=document.getElementById('quickAppt');
const openPayment=document.getElementById('openPayment'),quickPay=document.getElementById('quickPay');
const apptForm=document.getElementById('apptForm'),payForm=document.getElementById('payForm');
const titles={perfil:['Meu perfil','Cadastro, agenda, pagamentos e lembretes do dentista.'],dashboard:['Dashboard','Sua agenda de forma simples.'],confirmacoes:['Confirmações','Aprove, cancele e avise pacientes pelo WhatsApp.'],agenda:['Agenda','Calendário e horários disponíveis.'],pacientes:['Pacientes','Cadastros e relatórios individuais.'],administrador:['Administrador','Área exclusiva do proprietário da plataforma.']};
let currentPageId=document.querySelector('.page.active')?.id||'dashboard';
const pageHistory=[];
function updateMobileNavigation(id){
  document.querySelectorAll('[data-mobile-page]').forEach(b=>b.classList.toggle('active',b.dataset.mobilePage===id));
  const back=document.getElementById('mobileBack');if(back){back.disabled=pageHistory.length===0;back.setAttribute('aria-disabled',back.disabled?'true':'false')}
}
function showPage(id,options={}){
  if(!titles[id]||id===currentPageId){updateMobileNavigation(id);return}
  if(options.remember!==false&&currentPageId)pageHistory.push(currentPageId);
  document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id===id));
  document.querySelectorAll('.nav').forEach(n=>n.classList.toggle('active',n.dataset.page===id));
  currentPageId=id;title.textContent=titles[id][0];subtitle.textContent=titles[id][1];updateMobileNavigation(id);if(id==='confirmacoes')renderConfirmations();
  if(options.scroll!==false)window.scrollTo({top:0,behavior:'smooth'});
}
document.querySelectorAll('.nav').forEach(b=>b.onclick=()=>showPage(b.dataset.page));
document.querySelectorAll('[data-mobile-page]').forEach(b=>b.onclick=()=>showPage(b.dataset.mobilePage));
document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>showPage(b.dataset.go));
document.getElementById('mobileBack')?.addEventListener('click',()=>{const previous=pageHistory.pop();if(previous)showPage(previous,{remember:false})});
updateMobileNavigation(currentPageId);
function initials(name){return String(name||'D').replace(/Dr(a)?\.?/gi,'').trim().split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase()||'D'}
function profileMeta(d){return [d.cro,d.specialty,d.clinic].filter(Boolean).join(' · ')||'Dentista administrador'}
function moneyBR(value){return Number(value||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}
function appToday(){return activeDentistId===CARLA_DENTIST_ID?'2026-09-25':isoToday()}
function paidRevenueAppointments(){return appointments.filter(a=>a.status==='Confirmado'&&a.paymentStatus==='Pago'&&(Number(a.paymentAmount)||0)>0)}
function revenueMonthKey(date){const parts=String(date||'').split('-');return parts.length>=2?`${parts[0]}-${parts[1]}`:''}
function revenueMonthLabel(key){if(!key)return'—';const [y,m]=key.split('-').map(Number);return new Date(y,m-1,1).toLocaleDateString('pt-BR',{month:'long',year:'numeric'})}
function currentRevenueMonthKey(){return revenueMonthKey(appToday())}
function revenueForMonth(key){return ledgerMonthTotal(key)}
function getMonthlyGoal(){const saved=localStorage.getItem(dentistKey('MonthlyGoal'));return Math.max(0,Number(saved===null?5000:saved)||0)}
function currentMonthRevenue(){
  const key=currentRevenueMonthKey();
  return revenueForMonth(key);
}
function renderDentistFinancialSummary(){
  const revenueEl=document.getElementById('monthlyRevenueValue'),lifetimeEl=document.getElementById('lifetimeRevenueValue'),goalEl=document.getElementById('monthlyGoalInput'),remainingEl=document.getElementById('monthlyRemainingValue'),labelEl=document.getElementById('monthlyRevenueLabel'),statusEl=document.getElementById('monthlyGoalStatus');
  if(!revenueEl||!goalEl||!remainingEl)return;
  const key=currentRevenueMonthKey(),monthName=revenueMonthLabel(key),revenue=currentMonthRevenue(),lifetime=ledgerTotalAll(),goal=getMonthlyGoal(),remaining=Math.max(goal-revenue,0);
  if(labelEl)labelEl.textContent=`Faturado em ${monthName}`;
  revenueEl.textContent=moneyBR(revenue);if(lifetimeEl)lifetimeEl.textContent=moneyBR(lifetime);goalEl.value=String(goal);remainingEl.textContent=moneyBR(remaining);
  const goalMet=goal>0&&revenue>=goal;
  remainingEl.classList.toggle('goal-met',goalMet);
  remainingEl.classList.toggle('goal-pending',!goalMet);
  if(statusEl){
    statusEl.textContent=goalMet?'Meta atingida':'';
    statusEl.classList.toggle('goal-met',goalMet);
    statusEl.classList.toggle('goal-pending',!goalMet);
  }
}
function saveMonthlyGoal(){
  const input=document.getElementById('monthlyGoalInput');if(!input)return;
  const goal=Math.max(0,Number(input.value)||0);localStorage.setItem(dentistKey('MonthlyGoal'),String(goal));renderDentistFinancialSummary();toast('Meta mensal atualizada.');
}
function renderDentistUI(){
  document.getElementById('sidebarDentistName').textContent=activeDentist.name;document.getElementById('sidebarDentistInitials').textContent=initials(activeDentist.name);
  document.getElementById('welcomeDentist').textContent=`Bom dia, ${activeDentist.name}. Aqui está sua agenda de hoje.`;
  document.getElementById('dentistReminderTitle').textContent=`Dentista · ${activeDentist.name}`;
  document.title=`Rootis | ${activeDentist.name}`;
  const wh=document.getElementById('dentistWhatsapp');if(wh&&!wh.value&&activeDentist.whatsapp)wh.value=activeDentist.whatsapp;
  const ownerActive=document.getElementById('ownerActiveDentistName');if(ownerActive)ownerActive.textContent=activeDentist.name;
  const role=document.getElementById('profileRolePill');if(role)role.textContent='DENTISTA';
  populateProfileDentistForm();applyRoleUI();
}
function saveDentists(){localStorage.setItem(ROOTIS_DENTISTS_KEY,JSON.stringify(dentists))}
function applyRoleUI(){
  const owner=isPlatformOwner();
  document.querySelectorAll('.owner-only').forEach(el=>el.style.display=owner?'':'none');
  document.querySelectorAll('.owner-only-page').forEach(el=>el.dataset.ownerVisible=owner?'1':'0');
  if(!owner&&currentPageId==='administrador')showPage('dashboard',{remember:false});
}
function populateProfileDentistForm(){
  const map={profileDentistName:'name',profileDentistCro:'cro',profileDentistSpecialty:'specialty',profileDentistClinic:'clinic',profileDentistWhatsapp:'whatsapp',profileDentistEmail:'email'};
  Object.entries(map).forEach(([id,key])=>{const el=document.getElementById(id);if(el)el.value=activeDentist[key]||''});
  const del=document.getElementById('deleteOwnDentist'),help=document.getElementById('profileDeleteHelp');
  const ownerProfile=activeDentistId===DEFAULT_DENTIST_ID;
  if(del){del.disabled=ownerProfile;del.textContent=ownerProfile?'Cadastro protegido':'Excluir meu cadastro';}
  if(help)help.textContent=ownerProfile?'Este cadastro principal é protegido e não pode ser excluído por esta tela.':'Ao excluir o cadastro, os dados locais desta agenda serão removidos deste navegador.';
}
function storedJson(key,fallback){try{const value=JSON.parse(localStorage.getItem(key)||'null');return value??fallback}catch(e){return fallback}}
function platformPatientsForDentist(id){if(id===activeDentistId)return patients.length;const stored=storedJson(dentistKey('PatientsV1',id),null);if(Array.isArray(stored))return stored.length;if(id===CARLA_DENTIST_ID)return seedPatients.length;return 0}
function platformRevenueForDentist(id){
  if(id===activeDentistId)return ledgerTotalAll();
  const ledger=storedJson(dentistKey('PaymentLedgerV1',id),null);if(Array.isArray(ledger))return ledger.reduce((sum,e)=>sum+(Number(e.amount)||0),0);
  const appts=storedJson(dentistKey('AppointmentsV1',id),id===CARLA_DENTIST_ID?seedAppointments:[]);return Array.isArray(appts)?appts.filter(a=>a.status==='Confirmado'&&a.paymentStatus==='Pago').reduce((sum,a)=>sum+(Number(a.paymentAmount)||defaultChargeForPatient()||0),0):0
}
function renderDentistCentral(){
  const associates=dentists.filter(d=>d.id!==DEFAULT_DENTIST_ID);
  const count=document.getElementById('dentistCount');if(count)count.textContent=associates.length;
  const patientTotal=associates.reduce((sum,d)=>sum+platformPatientsForDentist(d.id),0),revenueTotal=associates.reduce((sum,d)=>sum+platformRevenueForDentist(d.id),0);
  const assocEl=document.getElementById('adminAssociatedDentists'),patientsEl=document.getElementById('adminPatientsTotal'),revenueEl=document.getElementById('adminRevenueTotal');if(assocEl)assocEl.textContent=associates.length;if(patientsEl)patientsEl.textContent=patientTotal;if(revenueEl)revenueEl.textContent=moneyBR(revenueTotal);
  const active=document.getElementById('activeDentistCard');if(active)active.innerHTML=`<div class="central-dentist-profile"><div class="central-avatar">${initials(activeDentist.name)}</div><div><h4>${activeDentist.name}</h4><p>${profileMeta(activeDentist)}</p><p>${activeDentist.whatsapp||'WhatsApp ainda não informado'}${activeDentist.email?` · ${activeDentist.email}`:''}</p><p>${activeDentist.pixKey?'PIX cadastrado':'PIX não cadastrado'} · ${activeDentist.cardPaymentLink?'Cartão cadastrado':'Link de cartão não cadastrado'}</p></div></div>`;
  const list=document.getElementById('dentistList');if(!list)return;
  list.innerHTML=dentists.map(d=>{const pc=platformPatientsForDentist(d.id),rv=platformRevenueForDentist(d.id);return `<div class="dentist-item ${d.id===activeDentistId?'active-dentist':''}"><div class="dentist-item-avatar">${initials(d.name)}</div><div><strong>${d.name}</strong><small>${profileMeta(d)}</small>${d.id===DEFAULT_DENTIST_ID?'<small class="owner-inline">Proprietário da plataforma</small>':''}<div class="dentist-platform-metrics"><span>${pc} ${pc===1?'paciente':'pacientes'}</span><span class="money">${moneyBR(rv)} recebido</span></div></div><div class="dentist-item-actions">${d.id===activeDentistId?'<button type="button" disabled>Agenda ativa</button>':`<button type="button" class="open-dentist" data-open-dentist="${d.id}">Abrir agenda</button>`}<button type="button" class="edit-dentist" data-edit-dentist="${d.id}">Editar perfil</button><button type="button" class="remove-dentist" data-remove-dentist="${d.id}" ${d.id===DEFAULT_DENTIST_ID?'disabled':''}>Excluir</button></div></div>`}).join('');
  document.querySelectorAll('[data-open-dentist]').forEach(btn=>btn.onclick=()=>{localStorage.setItem(ROOTIS_ACTIVE_DENTIST_KEY,btn.dataset.openDentist);sessionStorage.setItem('rootisOpenPageAfterReload','dashboard');location.reload()});
  document.querySelectorAll('[data-edit-dentist]').forEach(btn=>btn.onclick=()=>{localStorage.setItem(ROOTIS_ACTIVE_DENTIST_KEY,btn.dataset.editDentist);sessionStorage.setItem('rootisOpenPageAfterReload','perfil');location.reload()});
  document.querySelectorAll('[data-remove-dentist]').forEach(btn=>btn.onclick=()=>removeDentist(btn.dataset.removeDentist));
}
function removeDentist(id){
  const d=dentists.find(x=>x.id===id);if(!d||id===DEFAULT_DENTIST_ID)return toast('A conta proprietária da plataforma é protegida.');
  if(!confirm(`Excluir o perfil de ${d.name}? Os dados locais desta agenda também serão apagados neste navegador.`))return;
  Object.keys(localStorage).filter(k=>k.startsWith(`rootisDentist_${id}_`)).forEach(k=>localStorage.removeItem(k));
  dentists=dentists.filter(x=>x.id!==id);saveDentists();authAccounts=authAccounts.filter(a=>a.userId!==id);saveAuthAccounts();
  if(activeDentistId===id){const fallback=dentists.some(x=>x.id===CARLA_DENTIST_ID)?CARLA_DENTIST_ID:DEFAULT_DENTIST_ID;localStorage.setItem(ROOTIS_ACTIVE_DENTIST_KEY,fallback);sessionStorage.setItem('rootisOpenPageAfterReload','administrador');location.reload();return}
  renderDentistCentral();toast('Dentista removido da plataforma.');
}
const dentistForm=document.getElementById('dentistForm');
if(dentistForm)dentistForm.addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.target);const name=String(f.get('name')||'').trim();if(!name)return;const adminWhatsapp=whatsappFieldValue(f.get('whatsapp'));if(adminWhatsapp&&!validLocalWhatsapp(adminWhatsapp)){toast('O WhatsApp deve ter exatamente 11 números, por exemplo 98981452367.');return}const base=name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'dentista';const id=`${base}-${Date.now().toString().slice(-6)}`;const d={id,name,cro:String(f.get('cro')||'').trim(),specialty:String(f.get('specialty')||'').trim(),clinic:String(f.get('clinic')||'').trim(),whatsapp:adminWhatsapp,email:String(f.get('email')||'').trim(),pixKey:String(f.get('pixKey')||'').trim(),pixReceiver:'',cardPaymentLink:String(f.get('cardPaymentLink')||'').trim(),createdAt:new Date().toISOString()};dentists.push(d);saveDentists();localStorage.setItem(ROOTIS_ACTIVE_DENTIST_KEY,id);location.reload()});
const profileDentistForm=document.getElementById('profileDentistForm');
if(profileDentistForm)profileDentistForm.addEventListener('submit',e=>{
  e.preventDefault();const f=new FormData(e.target);const name=String(f.get('name')||'').trim();if(!name)return;
  const whatsapp=whatsappFieldValue(f.get('whatsapp'));if(whatsapp&&!validLocalWhatsapp(whatsapp)){toast('O WhatsApp do dentista deve ter exatamente 11 números, por exemplo 98981452367.');return}
  const patch={name,cro:String(f.get('cro')||'').trim(),specialty:String(f.get('specialty')||'').trim(),clinic:String(f.get('clinic')||'').trim(),whatsapp,email:String(f.get('email')||'').trim()};
  activeDentist={...activeDentist,...patch};dentists=dentists.map(d=>d.id===activeDentistId?{...d,...patch}:d);saveDentists();if(activeDentistId!==DEFAULT_DENTIST_ID){authAccounts=authAccounts.map(a=>a.userId===activeDentistId?{...a,name:patch.name,email:patch.email||a.email,phone:patch.whatsapp||a.phone}:a);saveAuthAccounts()}
  const dentistWhats=document.getElementById('dentistWhatsapp');if(dentistWhats)dentistWhats.value=activeDentist.whatsapp||'';
  renderDentistUI();renderDentistCentral();renderToday();renderPatients(patientSearch?.value||'');renderCalendar();renderAvailable(selectedDate);renderConfirmations();renderDentistFinancialSummary();refreshPatientLink();toast('Cadastro profissional atualizado em todo o Rootis.');
});
document.getElementById('deleteOwnDentist')?.addEventListener('click',()=>removeDentist(activeDentistId));
document.querySelectorAll('[data-profile-target]').forEach(btn=>btn.addEventListener('click',()=>{document.getElementById(btn.dataset.profileTarget)?.scrollIntoView({behavior:'smooth',block:'start'})}));


function badge(s){s=String(s||'');const c=s==='Confirmado'?'ok':s==='Cancelado'?'cancelled':s.includes('pagamento')?'paid':'pending';return `<span class="badge ${c}">${s||'Sem status'}</span>`}
function renderToday(){
  const today=appToday();
  const confirmedItems=appointments.filter(a=>a.status==='Confirmado');
  const items=confirmedItems.filter(a=>a.date===today).sort((a,b)=>String(a.time||'').localeCompare(String(b.time||'')));
  const subtitle=document.getElementById('todayAgendaSubtitle');
  if(subtitle)subtitle.textContent=`${items.length} ${items.length===1?'atendimento confirmado':'atendimentos confirmados'} · marque quando concluir`;
  todayList.innerHTML=items.length?items.map(a=>{
    const slot=getConfiguredSlotForBooking(a),start=slot?.start||a.time,end=slot?.end||a.end,attended=!!a.attended;
    return `<article class="today-appointment-row ${attended?'attended':''}">
      <label class="attendance-check" title="${attended?'Marcar como não atendido':'Marcar como atendido'}">
        <input type="checkbox" data-attendance-id="${escapeHtml(a.id)}" ${attended?'checked':''}/>
        <span>✓</span>
      </label>
      <div class="today-time-range"><strong>${escapeHtml(start||'—')}</strong><small>${end?`até ${escapeHtml(end)}`:'horário'}</small></div>
      <div class="today-patient-main">
        <button class="today-patient-link" type="button" data-dashboard-patient="${escapeHtml(a.name||'')}">${escapeHtml(a.name||'Paciente')}</button>
        <small>${attended?'Atendimento concluído':'Agendamento confirmado'}</small>
      </div>
      <div class="today-attendance-status">${attended?'<span class="today-done-pill">Atendido</span>':badge(a.status)}</div>
    </article>`
  }).join(''):'<div class="closed-day">Nenhum atendimento confirmado nesta agenda hoje.</div>';
  document.querySelectorAll('[data-attendance-id]').forEach(input=>input.addEventListener('change',()=>setAppointmentAttended(input.dataset.attendanceId,input.checked)));
  document.querySelectorAll('[data-dashboard-patient]').forEach(btn=>btn.addEventListener('click',()=>openPatientFromDashboard(btn.dataset.dashboardPatient)));
  const stat=document.getElementById('statToday');if(stat)stat.textContent=items.length;
  const next=confirmedItems.filter(a=>!a.attended&&a.date>=today).sort((a,b)=>(a.date+(getConfiguredSlotForBooking(a)?.start||a.time||'')).localeCompare(b.date+(getConfiguredSlotForBooking(b)?.start||b.time||'')))[0];
  const nextSlot=next?getConfiguredSlotForBooking(next):null;
  document.getElementById('nextApptTime').textContent=next?(nextSlot?.start||next.time):'—';
  document.getElementById('nextApptName').textContent=next?next.name:'Sem próximo atendimento pendente';
  document.getElementById('pendingPayments').textContent=appointments.filter(a=>a.status!=='Cancelado'&&String(a.status).toLowerCase().includes('pagamento')).length;
  updateConfirmationCounts();
  renderDashboardQuickData();
  renderDentistFinancialSummary();
}
function setAppointmentAttended(id,attended){
  const a=appointments.find(x=>String(x.id)===String(id));if(!a)return;
  a.attended=!!attended;
  if(attended){
    a.attendedAt=new Date().toISOString();
    const p=patients.find(x=>String(x.name||'').toLowerCase()===String(a.name||'').toLowerCase());
    if(p)p.last=brDate(a.date);
  }else delete a.attendedAt;
  persistAppointments();persistPatients();renderToday();renderPatients(patientSearch?.value||'');renderDashboardQuickData();
}
function openPatientFromDashboard(name){
  let i=patients.findIndex(p=>String(p.name||'').toLowerCase()===String(name||'').toLowerCase());
  if(i<0){
    const a=appointments.find(x=>String(x.name||'').toLowerCase()===String(name||'').toLowerCase());
    if(a){upsertPatient(a);i=patients.findIndex(p=>String(p.name||'').toLowerCase()===String(name||'').toLowerCase())}
  }
  if(i<0)return;
  selectedPatientIndex=i;creatingPatient=false;renderPatients(patientSearch?.value||'');showPage('pacientes');
  setTimeout(()=>document.getElementById('patientReport')?.scrollIntoView({behavior:'smooth',block:'start'}),120);
}
let selectedPatientIndex=0;
let creatingPatient=false;
function patientFinancialOpen(p){return Math.max(0,(Number(p?.amountDue)||0)-(Number(p?.amountPaid)||0))}
function patientTreatmentTotal(p){return (Array.isArray(p?.treatments)?p.treatments:[]).reduce((sum,t)=>sum+(Number(t.amount)||0),0)}
function syncPatientTreatmentCharges(p,previousTotal=null){
  if(!p)return;
  const current=patientTreatmentTotal(p),previous=previousTotal===null?Number(p.treatmentChargeTotal||0):Number(previousTotal||0),delta=current-previous;
  p.amountDue=Math.max(Number(p.amountPaid)||0,(Number(p.amountDue)||0)+delta,current);
  p.treatmentChargeTotal=current;
}
function updatePatientOpenField(){
  const due=Number(document.getElementById('patientEditDue')?.value||0),paid=Number(document.getElementById('patientEditPaid')?.value||0),open=Math.max(0,due-paid),out=document.getElementById('patientEditOpen');if(out)out.value=open.toFixed(2);
}
function setPatientEditorDisabled(disabled){
  ['patientNewAppointment','patientChargeButton','openClinicalReport','deletePatient','patientTreatmentAdd'].forEach(id=>{const el=document.getElementById(id);if(el)el.disabled=!!disabled});
}

let editingTreatmentId=null;
function selectedPatient(){return !creatingPatient&&selectedPatientIndex>=0&&selectedPatientIndex<patients.length?patients[selectedPatientIndex]:null}
function treatmentList(p){if(!p)return[];if(!Array.isArray(p.treatments))p.treatments=[];return p.treatments}
function treatmentToday(){return new Date().toISOString().slice(0,10)}
function closeTreatmentEditor(){
  editingTreatmentId=null;
  const form=document.getElementById('patientTreatmentForm');if(form){form.hidden=true;form.reset()}
  const id=document.getElementById('patientTreatmentId');if(id)id.value='';
  const date=document.getElementById('patientTreatmentDate');if(date)date.value=treatmentToday();
  const amount=document.getElementById('patientTreatmentAmount');if(amount)amount.value='0';
  const save=document.getElementById('patientTreatmentSave');if(save)save.textContent='Adicionar tratamento';
}
function openTreatmentEditor(treatment=null){
  const p=selectedPatient();if(!p){toast('Salve o paciente antes de adicionar tratamentos.');return}
  const form=document.getElementById('patientTreatmentForm');if(!form)return;
  form.hidden=false;
  editingTreatmentId=treatment?.id||null;
  document.getElementById('patientTreatmentId').value=editingTreatmentId||'';
  document.getElementById('patientTreatmentDate').value=treatment?.date||treatmentToday();
  document.getElementById('patientTreatmentTooth').value=treatment?.tooth||'';
  document.getElementById('patientTreatmentType').value=treatment?.type||'Endodontia';
  document.getElementById('patientTreatmentDescription').value=treatment?.description||'';
  document.getElementById('patientTreatmentAmount').value=(Number(treatment?.amount)||0).toFixed(2);
  document.getElementById('patientTreatmentSave').textContent=treatment?'Salvar tratamento':'Adicionar tratamento';
  form.scrollIntoView({behavior:'smooth',block:'nearest'});
  setTimeout(()=>document.getElementById('patientTreatmentTooth')?.focus(),180);
}
function renderPatientTreatments(p=selectedPatient()){
  const history=document.getElementById('patientTreatmentHistory'),total=document.getElementById('patientTreatmentTotal'),add=document.getElementById('patientTreatmentAdd');if(!history||!total)return;
  if(!p){
    total.textContent=moneyBR(0);
    history.innerHTML='<div class="patient-treatment-empty"><strong>Salve o cadastro primeiro</strong><p>Depois você poderá registrar procedimentos e manter o histórico clínico deste paciente.</p></div>';
    if(add)add.disabled=true;
    closeTreatmentEditor();
    return;
  }
  if(add)add.disabled=false;
  const items=[...treatmentList(p)].sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))||String(b.createdAt||'').localeCompare(String(a.createdAt||'')));
  total.textContent=moneyBR(items.reduce((sum,t)=>sum+(Number(t.amount)||0),0));
  history.innerHTML=items.length?items.map(t=>`<article class="patient-treatment-item">
    <div class="patient-treatment-date"><span>${escapeHtml(t.date?brDate(t.date):'Sem data')}</span><small>Dente</small><strong>${escapeHtml(t.tooth||'—')}</strong></div>
    <div class="patient-treatment-main"><div class="patient-treatment-tags"><span>${escapeHtml(t.type||'Outro')}</span></div><strong>${escapeHtml(t.description||'Tratamento odontológico')}</strong><small>Valor cobrado: <b>${moneyBR(Number(t.amount)||0)}</b></small></div>
    <div class="patient-treatment-actions"><button class="linkbtn treatment-edit-btn" data-treatment-id="${escapeHtml(t.id)}" type="button">Editar</button><button class="linkbtn treatment-delete-btn danger-link" data-treatment-id="${escapeHtml(t.id)}" type="button">Excluir</button></div>
  </article>`).join(''):'<div class="patient-treatment-empty"><strong>Nenhum tratamento registrado</strong><p>Clique em “Adicionar tratamento” para começar o histórico deste paciente.</p></div>';
  history.querySelectorAll('.treatment-edit-btn').forEach(btn=>btn.onclick=()=>{const t=treatmentList(p).find(x=>String(x.id)===String(btn.dataset.treatmentId));if(t)openTreatmentEditor(t)});
  history.querySelectorAll('.treatment-delete-btn').forEach(btn=>btn.onclick=()=>{const list=treatmentList(p),idx=list.findIndex(x=>String(x.id)===String(btn.dataset.treatmentId));if(idx<0)return;const t=list[idx];if(!confirm(`Excluir o tratamento do dente ${t.tooth||'informado'}?`))return;const previousTotal=patientTreatmentTotal(p);list.splice(idx,1);syncPatientTreatmentCharges(p,previousTotal);persistPatients();closeTreatmentEditor();renderSelectedPatient();renderPatientOverview();toast('Tratamento excluído e financeiro do paciente atualizado.');});
}
function renderSelectedPatient(){
  const card=document.getElementById('patientReport');if(!card)return;
  if(creatingPatient){
    card.style.display='block';
    document.getElementById('patientReportAvatar').textContent='+';
    document.getElementById('patientReportName').textContent='Novo paciente';
    document.getElementById('patientReportContact').textContent='Preencha os dados e salve o cadastro.';
    ['patientEditName','patientEditPhone','patientEditEmail','patientEditAddress','patientEditLast','patientEditNext'].forEach(id=>{const el=document.getElementById(id);if(el)el.value=''});
    document.getElementById('patientEditDue').value='0';
    document.getElementById('patientEditPaid').value='0';
    updatePatientOpenField();
    document.getElementById('patientReportLast').textContent='—';document.getElementById('patientReportNext').textContent='—';document.getElementById('patientReportTotal').textContent='0';document.getElementById('patientReportStatus').textContent='Novo cadastro';
    document.getElementById('patientTimeline').innerHTML='<div class="tl"><strong>Novo paciente</strong><p>Salve o cadastro para liberar agendamento, cobrança e relatório.</p></div>';
    setPatientEditorDisabled(true);renderPatientTreatments(null);
    return;
  }
  if(!patients.length){card.style.display='none';return}
  if(selectedPatientIndex<0||selectedPatientIndex>=patients.length)selectedPatientIndex=0;
  card.style.display='block';setPatientEditorDisabled(false);
  const p=patients[selectedPatientIndex],patientAppts=patientAppointmentRecords(p.name).sort((a,b)=>(String(b.date||'')+String(b.time||'')).localeCompare(String(a.date||'')+String(a.time||'')));
  const email=p.email||patientAppts.find(a=>a.email)?.email||'';
  document.getElementById('patientReportAvatar').textContent=initials(p.name);
  document.getElementById('patientReportName').textContent=p.name||'Paciente';
  document.getElementById('patientReportContact').textContent=[p.phone,email,p.address].filter(Boolean).join(' · ')||'Contato não informado';
  document.getElementById('patientEditName').value=p.name||'';
  document.getElementById('patientEditPhone').value=p.phone||'';
  document.getElementById('patientEditEmail').value=email;
  document.getElementById('patientEditAddress').value=p.address||'';
  document.getElementById('patientEditDue').value=(Number(p.amountDue)||0).toFixed(2);
  document.getElementById('patientEditPaid').value=(Number(p.amountPaid)||0).toFixed(2);
  document.getElementById('patientEditLast').value=p.last==='—'?'':(p.last||'');
  document.getElementById('patientEditNext').value=p.next==='—'?'':(p.next||'');
  updatePatientOpenField();
  document.getElementById('patientReportLast').textContent=p.last||'—';
  document.getElementById('patientReportNext').textContent=p.next||'—';
  document.getElementById('patientReportTotal').textContent=patientAppts.length;
  document.getElementById('patientReportStatus').textContent=patientFinancialOpen(p)>0?`Em aberto · ${moneyBR(patientFinancialOpen(p))}`:'Cadastro ativo';
  closeTreatmentEditor();renderPatientTreatments(p);
  const tl=document.getElementById('patientTimeline');
  tl.innerHTML=patientAppts.length?patientAppts.slice(0,8).map(a=>{
    const slot=getConfiguredSlotForBooking(a),start=slot?.start||a.time,end=slot?.end||a.end;
    return `<div class="tl"><strong>${brDate(a.date)} · ${escapeHtml(start||'')}${end?` às ${escapeHtml(end)}`:''}</strong><p>${escapeHtml(a.status||'Atendimento odontológico')}${a.attended?' · Atendido':''}${a.note?` · ${escapeHtml(a.note)}`:''}</p></div>`
  }).join(''):'<div class="tl"><strong>Sem histórico registrado</strong><p>Os atendimentos deste paciente aparecerão aqui.</p></div>';
}
function renderPatientOverview(foundCount=patients.length){
  const total=document.getElementById('patientTotalCount'),apptTotal=document.getElementById('patientTotalAppointments'),found=document.getElementById('patientFoundCount');
  if(total)total.textContent=patients.length;
  if(apptTotal)apptTotal.textContent=appointments.filter(a=>a.status!=='Cancelado').length;
  if(found)found.textContent=foundCount;
}
function bindPatientOpenButtons(){
  document.querySelectorAll('.patient-report-link').forEach(btn=>btn.onclick=()=>{
    selectedPatientIndex=Number(btn.dataset.patientIndex);creatingPatient=false;renderSelectedPatient();
    document.getElementById('patientReport')?.scrollIntoView({behavior:'smooth',block:'start'});
  });
}
function renderPatients(f=''){
  const q=String(f||'').trim().toLowerCase();
  const found=patients.map((p,i)=>({p,i})).filter(({p})=>String(p.name||'').toLowerCase().includes(q)||String(p.phone||'').toLowerCase().includes(q));
  renderPatientOverview(found.length);
  patientRows.innerHTML=found.length?found.map(({p,i})=>`<tr>
    <td><button class="patient-name-button patient-report-link" type="button" data-patient-index="${i}">${escapeHtml(p.name||'Paciente')}</button></td>
    <td>${escapeHtml(p.phone||'—')}</td><td>${escapeHtml(p.last||'—')}</td><td>${escapeHtml(p.next||'—')}</td>
    <td><button class="linkbtn patient-report-link" type="button" data-patient-index="${i}">Abrir</button></td>
  </tr>`).join(''):'<tr><td colspan="5" style="text-align:center;color:var(--muted)">Nenhum paciente encontrado.</td></tr>';
  if(patientMobileCards)patientMobileCards.innerHTML=found.length?found.map(({p,i})=>`<article class="patient-mobile-card">
    <button class="patient-mobile-name patient-report-link" type="button" data-patient-index="${i}">${escapeHtml(p.name||'Paciente')}</button>
    <span>${escapeHtml(p.phone||'Sem telefone')}</span>
    <div class="patient-mobile-card-grid"><div><small>Último atendimento</small><b>${escapeHtml(p.last||'—')}</b></div><div><small>Próximo</small><b>${escapeHtml(p.next||'—')}</b></div><div><small>Em aberto</small><b>${moneyBR(patientFinancialOpen(p))}</b></div></div>
    <button class="btn btn-primary patient-report-link" type="button" data-patient-index="${i}">Abrir cadastro</button>
  </article>`).join(''):'<div class="closed-day">Nenhum paciente encontrado.</div>';
  bindPatientOpenButtons();
  if(!creatingPatient)renderSelectedPatient();
}
patientSearch.oninput=e=>renderPatients(e.target.value);
document.getElementById('patientEditDue')?.addEventListener('input',updatePatientOpenField);
document.getElementById('patientEditPaid')?.addEventListener('input',updatePatientOpenField);
document.getElementById('newPatient')?.addEventListener('click',()=>{
  creatingPatient=true;selectedPatientIndex=-1;renderSelectedPatient();document.getElementById('patientReport')?.scrollIntoView({behavior:'smooth',block:'start'});setTimeout(()=>document.getElementById('patientEditName')?.focus(),250);
});
document.getElementById('patientEditorForm')?.addEventListener('submit',e=>{
  e.preventDefault();const f=new FormData(e.target),name=String(f.get('name')||'').trim();if(!name){toast('Informe o nome do paciente.');return}
  const phone=whatsappFieldValue(f.get('phone'));if(!validLocalWhatsapp(phone)){toast('Informe o WhatsApp do paciente com exatamente 11 números, por exemplo 98981452367.');document.getElementById('patientEditPhone')?.focus();return}
  const enteredPaid=Math.max(0,Number(f.get('amountPaid'))||0),enteredDue=Math.max(0,Number(f.get('amountDue'))||0),existing=creatingPatient?null:patients[selectedPatientIndex],minimumTreatment=existing?patientTreatmentTotal(existing):0;
  const patch={name,phone,email:String(f.get('email')||'').trim(),address:String(f.get('address')||'').trim(),amountDue:Math.max(enteredDue,enteredPaid,minimumTreatment),amountPaid:enteredPaid,last:String(f.get('last')||'').trim()||'—',next:String(f.get('next')||'').trim()||'—'};
  if(creatingPatient){
    const created={id:`patient-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,6)}`,treatments:[],treatmentChargeTotal:0,...patch};patients.push(created);selectedPatientIndex=patients.length-1;creatingPatient=false;if(patch.amountPaid>0)adjustPatientPaidLedger(created,patch.amountPaid);persistPatients();renderPatients(patientSearch?.value||'');refreshFinancialViews();toast('Paciente cadastrado e financeiro atualizado em todo o Rootis.');
  }else{
    const p=patients[selectedPatientIndex];if(!p)return;const oldName=p.name;adjustPatientPaidLedger(p,patch.amountPaid);renamePatientInLedger(p,patch.name);patients[selectedPatientIndex]={...p,...patch,amountPaid:ledgerTotalForPatient(p)};
    appointments.forEach(a=>{if(String(a.name||'').toLowerCase()===String(oldName||'').toLowerCase()){a.name=patch.name;a.phone=patch.phone;if(patch.email)a.email=patch.email;syncAppointmentPaymentLedger(a)}});
    persistPatients();persistAppointments();persistPaymentLedger();renderPatients(patientSearch?.value||'');renderToday();renderCalendar();renderAvailable(selectedDate);renderConfirmations();refreshFinancialViews();refreshPatientLink();toast('Dados do paciente, pagamentos e agendamentos atualizados em todo o Rootis.');
  }
});
document.getElementById('deletePatient')?.addEventListener('click',()=>{
  if(creatingPatient){creatingPatient=false;selectedPatientIndex=patients.length?0:-1;renderPatients(patientSearch?.value||'');return}
  const p=patients[selectedPatientIndex];if(!p)return;
  if(!confirm(`Excluir o cadastro de ${p.name}? O histórico de agendamentos continuará preservado na agenda.`))return;
  patients.splice(selectedPatientIndex,1);selectedPatientIndex=Math.min(selectedPatientIndex,patients.length-1);persistPatients();renderPatients(patientSearch?.value||'');toast('Cadastro do paciente excluído.');
});
document.getElementById('patientTreatmentAdd')?.addEventListener('click',()=>openTreatmentEditor());
document.getElementById('patientTreatmentCancel')?.addEventListener('click',closeTreatmentEditor);
document.getElementById('patientTreatmentForm')?.addEventListener('submit',e=>{
  e.preventDefault();const p=selectedPatient();if(!p){toast('Salve o paciente antes de adicionar tratamentos.');return}
  const date=String(document.getElementById('patientTreatmentDate')?.value||'').trim(),tooth=String(document.getElementById('patientTreatmentTooth')?.value||'').trim(),type=String(document.getElementById('patientTreatmentType')?.value||'Outro').trim(),description=String(document.getElementById('patientTreatmentDescription')?.value||'').trim(),amount=Math.max(0,Number(document.getElementById('patientTreatmentAmount')?.value)||0);
  if(!date||!tooth||!description){toast('Preencha a data, o número do dente e o que foi feito.');return}
  const list=treatmentList(p),previousTotal=patientTreatmentTotal(p);
  if(editingTreatmentId){
    const idx=list.findIndex(t=>String(t.id)===String(editingTreatmentId));if(idx>=0)list[idx]={...list[idx],date,tooth,type,description,amount,updatedAt:new Date().toISOString()};
    toast('Tratamento e valores atualizados.');
  }else{
    list.push({id:`treatment-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,6)}`,date,tooth,type,description,amount,createdAt:new Date().toISOString()});
    toast('Tratamento adicionado ao histórico e ao valor do paciente.');
  }
  syncPatientTreatmentCharges(p,previousTotal);persistPatients();closeTreatmentEditor();renderSelectedPatient();renderPatientOverview();
});

function prefillAppointmentForPatient(){
  if(creatingPatient)return;const p=patients[selectedPatientIndex];if(!p)return;openAppt();
  const name=apptForm?.querySelector('[name="name"]'),phone=apptForm?.querySelector('[name="phone"]'),email=apptForm?.querySelector('[name="email"]');
  if(name)name.value=p.name||'';if(phone)phone.value=p.phone||'';if(email)email.value=p.email||'';
}
function openChargeForSelectedPatient(){
  if(creatingPatient)return;const p=patients[selectedPatientIndex];if(!p)return;openPay();
  const idx=paymentTargets.findIndex(t=>String(t.name||'').toLowerCase()===String(p.name||'').toLowerCase()&&(normalizePhone(t.phone)===normalizePhone(p.phone)||!p.phone));
  const select=document.getElementById('paymentPatientSelect');if(select&&idx>=0){select.value=String(idx);updatePaymentSendPreview()}
  const amount=document.getElementById('paymentChargeAmount');if(amount){amount.value=String(Math.max(patientFinancialOpen(p),Number(amount.value)||0));updatePaymentSendPreview()}
}
document.getElementById('patientNewAppointment')?.addEventListener('click',prefillAppointmentForPatient);
document.getElementById('patientChargeButton')?.addEventListener('click',openChargeForSelectedPatient);

const dayNames=['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
const baseSlots=()=>[{start:'08:00',end:'11:00'},{start:'12:00',end:'15:00'},{start:'16:00',end:'19:00'}];
const defaultAvailability={0:{open:false,slots:[]},1:{open:true,slots:baseSlots()},2:{open:true,slots:baseSlots()},3:{open:true,slots:baseSlots()},4:{open:true,slots:baseSlots()},5:{open:true,slots:baseSlots()},6:{open:false,slots:[]}};
let availability=JSON.parse(localStorage.getItem(dentistKey('AvailabilityV3'))||'null')||JSON.parse(JSON.stringify(defaultAvailability));
let selectedDate='2026-09-25';
let calendarCursor=new Date(selectedDate+'T12:00:00');
// Corrige somente o conjunto demonstrativo antigo que possuía horários sobrepostos (08:00 e 09:30 no mesmo intervalo).
if(activeDentistId===CARLA_DENTIST_ID){
  const legacyDemo=appointments.some(a=>a.name==='Lucas Martins'&&a.date==='2026-09-25'&&a.time==='09:30')&&appointments.some(a=>a.name==='Mariana Souza'&&a.date==='2026-09-25'&&a.time==='08:00');
  if(legacyDemo){appointments=seedAppointments.map((a,i)=>({...a,id:`demo-${i+1}`}));persistAppointments();}
}
function formatDate(date){return new Date(date+'T12:00:00').toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long'})}
function timeToMinutes(value){const [h,m]=String(value||'00:00').split(':').map(Number);return (Number.isFinite(h)?h:0)*60+(Number.isFinite(m)?m:0)}
function getSlotsForDate(date,sourceAvailability=availability){if(!date)return[];const d=new Date(date+'T12:00:00'),cfg=sourceAvailability[d.getDay()];if(!cfg||!cfg.open)return[];return(cfg.slots||[]).map((s,i)=>({...s,index:i,label:`Horário ${i+1} · ${s.start} às ${s.end}`})).sort((a,b)=>timeToMinutes(a.start)-timeToMinutes(b.start))}
function getConfiguredSlotForBooking(a,sourceAvailability=availability){
  if(!a||!a.date)return null;const slots=getSlotsForDate(a.date,sourceAvailability);if(!slots.length)return null;
  const preferredStart=a.slotStart||a.time,preferredEnd=a.slotEnd||a.end;
  let exact=slots.find(s=>s.start===preferredStart&&(preferredEnd?s.end===preferredEnd:true));if(exact)return exact;
  const minute=timeToMinutes(a.time);return slots.find(s=>minute>=timeToMinutes(s.start)&&minute<timeToMinutes(s.end))||null;
}
function bookingOverlapsSlot(a,date,slot,sourceAvailability=availability){
  if(!a||a.status==='Cancelado'||a.date!==date)return false;
  const configured=getConfiguredSlotForBooking(a,sourceAvailability);
  const aStart=timeToMinutes(a.slotStart||configured?.start||a.time);
  const aEnd=timeToMinutes(a.slotEnd||a.end||configured?.end||a.time);
  const sStart=timeToMinutes(slot.start),sEnd=timeToMinutes(slot.end);
  if(aEnd<=aStart)return aStart>=sStart&&aStart<sEnd;
  return aStart<sEnd&&aEnd>sStart;
}
function blockingAppointmentForSlot(date,slot,excludeId=null,sourceAppointments=appointments,sourceAvailability=availability){return sourceAppointments.find(a=>a.id!==excludeId&&a.status!=='Cancelado'&&bookingOverlapsSlot(a,date,slot,sourceAvailability))||null}
function isSlotBusy(date,slot,excludeId=null){return !!blockingAppointmentForSlot(date,slot,excludeId)}
function blockingAppointmentsForDate(date){return appointments.filter(a=>a.status!=='Cancelado'&&a.date===date)}
function agendaAppointmentsForDate(date){
  const confirmed=appointments.filter(a=>a.status==='Confirmado'&&a.date===date).sort((a,b)=>String(a.time||'').localeCompare(String(b.time||'')));
  const seen=new Set(),valid=[];
  confirmed.forEach(a=>{const slot=getConfiguredSlotForBooking(a);if(!slot)return;const key=`${slot.start}|${slot.end}`;if(seen.has(key))return;seen.add(key);valid.push({...a,_slot:slot})});
  return valid.sort((a,b)=>timeToMinutes(a._slot.start)-timeToMinutes(b._slot.start));
}
function appointmentsForDate(date){return agendaAppointmentsForDate(date)}
function renderSelectedDayPatients(date=selectedDate){
  const root=document.getElementById('selectedDayPatients'),count=document.getElementById('selectedDayPatientCount');if(!root)return;
  const list=agendaAppointmentsForDate(date);if(count)count.textContent=`${list.length} ${list.length===1?'paciente confirmado':'pacientes confirmados'}`;
  if(!list.length){root.innerHTML='<div class="selected-patient-empty">Nenhum paciente confirmado para este dia.<br>Solicitações aguardando pagamento ficam na aba Confirmações e não aparecem na agenda.</div>';return}
  root.innerHTML=list.map(a=>`<div class="selected-patient-row confirmed"><div class="selected-patient-time">${escapeHtml(a._slot.start)}</div><div class="selected-patient-info"><strong>${escapeHtml(a.name||'Paciente')}</strong><small>${escapeHtml(a._slot.start)} às ${escapeHtml(a._slot.end)} · ${escapeHtml(a.phone||'Sem telefone')}</small></div><div class="selected-patient-status">${badge(a.status)}</div></div>`).join('');
}
function renderAvailable(date=selectedDate){
  selectedDate=date;const label=document.getElementById('selectedDateLabel');if(label)label.textContent=formatDate(date);renderSelectedDayPatients(date);
  const list=getSlotsForDate(date),root=document.getElementById('slots');if(!root)return;
  if(!list.length){root.innerHTML='<div class="closed-day">Agenda fechada ou sem horários neste dia. Você pode configurar os horários em Meu perfil, na seção Agenda e link.</div>';return}
  root.innerHTML=list.map(slot=>{const booked=blockingAppointmentForSlot(date,slot),busy=!!booked;let detail='';if(booked){if(booked.status==='Confirmado')detail=`<br><small style="color:var(--muted)">${escapeHtml(booked.name)} · Confirmado</small>`;else detail=`<br><small style="color:var(--muted)">Reserva em andamento · ${escapeHtml(booked.status)}</small>`}return `<div class="slot"><span><strong>Horário ${slot.index+1}</strong> · ${slot.start} às ${slot.end}${detail}</span>${busy?`<span class="slot-occupied-label">${booked?.status==='Confirmado'?'Ocupada':'Reservada'}</span>`:`<button onclick="openApptFor('${date}','${slot.start}','${slot.end}')">Disponível</button>`}</div>`}).join('')
}
function calendarIso(y,m,d){return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`}
function renderCalendar(){
  const y=calendarCursor.getFullYear(),m=calendarCursor.getMonth(),first=new Date(y,m,1).getDay(),days=new Date(y,m+1,0).getDate(),prevDays=new Date(y,m,0).getDate(),cells=[];
  const monthLabel=document.getElementById('calendarMonthLabel');if(monthLabel)monthLabel.textContent=new Date(y,m,1).toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
  for(let i=first-1;i>=0;i--)cells.push({d:prevDays-i,muted:true,date:''});for(let d=1;d<=days;d++)cells.push({d,muted:false,date:calendarIso(y,m,d)});let n=1;while(cells.length<42)cells.push({d:n++,muted:true,date:''});
  const today=isoToday();
  calendar.innerHTML=cells.map(c=>{if(c.muted)return `<div class="day muted"><span class="num">${c.d}</span></div>`;const aps=agendaAppointmentsForDate(c.date),preview=aps.slice(0,2);const chips=preview.map(a=>`<div class="calendar-patient-chip confirmed"><span class="calendar-patient-time">${escapeHtml(a._slot.start)}</span><span class="calendar-patient-name">✓ ${escapeHtml(a.name)}</span></div>`).join('');const more=aps.length>2?`<div class="calendar-more">+${aps.length-2} paciente${aps.length-2===1?'':'s'}</div>`:'';return `<div class="day ${c.date===today?'today':''} ${c.date===selectedDate?'selected-day':''}" data-date="${c.date}"><span class="num">${c.d}</span><div class="day-patient-preview">${chips}${more}</div></div>`}).join('');
  document.querySelectorAll('.day[data-date]').forEach(el=>el.onclick=()=>{selectedDate=el.dataset.date;renderCalendar();renderAvailable(selectedDate)});
}
function moveCalendarMonth(delta){
  const currentDay=Math.min(Number(selectedDate.split('-')[2]||1),28);calendarCursor=new Date(calendarCursor.getFullYear(),calendarCursor.getMonth()+delta,1);const y=calendarCursor.getFullYear(),m=calendarCursor.getMonth(),max=new Date(y,m+1,0).getDate();selectedDate=calendarIso(y,m,Math.min(currentDay,max));renderCalendar();renderAvailable(selectedDate);
}
document.getElementById('prevCalendarMonth')?.addEventListener('click',()=>moveCalendarMonth(-1));
document.getElementById('nextCalendarMonth')?.addEventListener('click',()=>moveCalendarMonth(1));
function nextSlotFrom(dayIndex){const slots=availability[dayIndex].slots||[];if(!slots.length)return{start:'08:00',end:'11:00'};const last=slots[slots.length-1];const[h,m]=last.end.split(':').map(Number);let startM=h*60+m,endM=Math.min(startM+180,23*60+59);const f=v=>`${String(Math.floor(v/60)).padStart(2,'0')}:${String(v%60).padStart(2,'0')}`;return{start:f(startM),end:f(endM)}}
function renderAvailabilityEditor(){const root=document.getElementById('availabilityEditor');root.innerHTML=dayNames.map((name,i)=>{const c=availability[i]||{open:false,slots:[]},slots=c.slots||[];return `<div class="availability-day-card ${c.open?'':'closed'}" data-day="${i}"><div class="availability-day-head"><label class="availability-day-name"><input type="checkbox" class="day-open" ${c.open?'checked':''}><strong>${name}</strong></label><span class="slot-count">${slots.length} ${slots.length===1?'horário':'horários'}</span><button type="button" class="add-slot-btn" data-add-slot="${i}">+ Adicionar horário</button></div><div class="day-slots">${slots.length?slots.map((s,j)=>`<div class="slot-edit-row" data-slot="${j}"><span class="slot-name">Horário ${j+1}</span><input type="time" class="slot-start" value="${s.start}"><span class="sep">às</span><input type="time" class="slot-end" value="${s.end}"><button type="button" class="remove-slot-btn" data-remove-slot="${i}:${j}">Remover</button></div>`).join(''):'<div class="no-slots">Nenhum horário cadastrado para este dia.</div>'}</div></div>`}).join('');document.querySelectorAll('.day-open').forEach(cb=>cb.onchange=()=>{const card=cb.closest('.availability-day-card');card.classList.toggle('closed',!cb.checked)});document.querySelectorAll('[data-add-slot]').forEach(btn=>btn.onclick=()=>{const i=Number(btn.dataset.addSlot);availability[i].slots=availability[i].slots||[];availability[i].slots.push(nextSlotFrom(i));availability[i].open=true;renderAvailabilityEditor()});document.querySelectorAll('[data-remove-slot]').forEach(btn=>btn.onclick=()=>{const[i,j]=btn.dataset.removeSlot.split(':').map(Number);availability[i].slots.splice(j,1);renderAvailabilityEditor()})}
function saveAvailability(){
  const proposed={};let error='';
  document.querySelectorAll('.availability-day-card').forEach(card=>{if(error)return;const i=Number(card.dataset.day),rows=[...card.querySelectorAll('.slot-edit-row')];const slots=rows.map(row=>({start:row.querySelector('.slot-start').value,end:row.querySelector('.slot-end').value})).filter(s=>s.start&&s.end).sort((a,b)=>timeToMinutes(a.start)-timeToMinutes(b.start));
    for(let j=0;j<slots.length;j++){if(timeToMinutes(slots[j].end)<=timeToMinutes(slots[j].start)){error=`Em ${dayNames[i]}, o fim do horário deve ser depois do início.`;break}if(j>0&&timeToMinutes(slots[j].start)<timeToMinutes(slots[j-1].end)){error=`Em ${dayNames[i]}, existem horários sobrepostos. Cada intervalo deve ser exclusivo para um único paciente.`;break}}
    proposed[i]={open:card.querySelector('.day-open').checked,slots};
  });
  if(error){toast(error);return}
  availability=proposed;localStorage.setItem(dentistKey('AvailabilityV3'),JSON.stringify(availability));renderAvailabilityEditor();renderAvailable(selectedDate);renderCalendar();refreshPatientLink();toast('Horários desta agenda salvos com sucesso. Cada horário é exclusivo para um paciente.');
}
function updateApptTimes(){const date=document.getElementById('apptDate').value,sel=document.getElementById('apptTime'),list=getSlotsForDate(date),free=list.filter(slot=>!isSlotBusy(date,slot));sel.innerHTML=free.length?free.map(slot=>`<option value="${slot.start}|${slot.end}">${slot.label}</option>`).join(''):'<option value="">Sem horários disponíveis</option>'}
function openApptFor(date,start,end){document.getElementById('apptDate').value=date;updateApptTimes();document.getElementById('apptTime').value=`${start}|${end}`;openAppt()}
function getPaymentConfig(){return{amount:localStorage.getItem(dentistKey('PaymentAmount'))||'100',method:localStorage.getItem(dentistKey('PaymentMethod'))||'PIX',required:(localStorage.getItem(dentistKey('PaymentRequired'))??'1')==='1',explanation:localStorage.getItem(dentistKey('PaymentExplanation'))||'O profissional poderá orientar sobre o pagamento necessário para confirmar a reserva do horário.',pixKey:activeDentist.pixKey||'',pixReceiver:activeDentist.pixReceiver||'',cardPaymentLink:activeDentist.cardPaymentLink||''}}
function getBookingModel(){const saved=localStorage.getItem(dentistKey('BookingModelV1'));return saved==='calendar'?'calendar':'list'}
function syncBookingModelControls(){const model=getBookingModel(),list=document.getElementById('bookingModelList'),calendarOption=document.getElementById('bookingModelCalendar');if(list&&calendarOption&&!list.checked&&!calendarOption.checked){list.checked=model==='list';calendarOption.checked=model==='calendar'}document.querySelectorAll('.booking-model-option').forEach(el=>el.classList.toggle('selected',!!el.querySelector('input')?.checked))}
function saveBookingModel(){const selected=document.querySelector('input[name="bookingModel"]:checked');const model=selected?.value==='calendar'?'calendar':'list';localStorage.setItem(dentistKey('BookingModelV1'),model);syncBookingModelControls();refreshPatientLink();toast(model==='calendar'?'Modelo calendário por etapas salvo.':'Modelo lista de dias e horários salvo.')}
function encodePublicState(){const payload={dentist:activeDentist,availability,busy:appointments.filter(a=>a.status!=='Cancelado').map(a=>({date:a.date,time:a.time,end:a.end||'',slotStart:a.slotStart||'',slotEnd:a.slotEnd||'',status:a.status})),payment:getPaymentConfig(),bookingModel:getBookingModel()};try{return btoa(unescape(encodeURIComponent(JSON.stringify(payload))))}catch(e){return''}}
function decodePublicState(raw){if(!raw)return null;try{return JSON.parse(decodeURIComponent(escape(atob(raw))))}catch(e){return null}}
function patientRouteParams(){
  const search=new URLSearchParams(location.search);
  if(search.get('paciente')==='1')return search;
  const rawHash=String(location.hash||'').replace(/^#/,'');
  return new URLSearchParams(rawHash);
}
function buildPatientLink(){
  const state=encodePublicState();
  const cleanBase=window.location.href.split('#')[0].split('?')[0];
  if(location.protocol==='file:'){
    return `${cleanBase}#paciente=1${state?`&agenda=${encodeURIComponent(state)}`:''}`;
  }
  const url=new URL(cleanBase);
  url.searchParams.set('paciente','1');
  if(state)url.searchParams.set('agenda',state);
  return url.toString();
}
function refreshPatientLink(){const el=document.getElementById('patientLink');if(el)el.value=buildPatientLink()}
function openPatientPreview(){
  refreshPatientLink();
  if(location.protocol==='file:'){
    const state=encodePublicState();
    const hash=`#paciente=1${state?`&agenda=${encodeURIComponent(state)}`:''}`;
    history.pushState({rootisPatientPreview:true},'',hash);
    document.body.classList.add('patient-mode');
    renderPatientPortal();
    window.scrollTo({top:0,behavior:'smooth'});
    return;
  }
  window.open(buildPatientLink(),'_blank','noopener');
}
function syncPatientModeFromUrl(){
  const isPatient=patientRouteParams().get('paciente')==='1';
  document.body.classList.toggle('patient-mode',isPatient);
  if(isPatient){renderPatientPortal();window.scrollTo({top:0});}
}
function dateKey(d){return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function publicFormatDate(date){return new Date(date+'T12:00:00').toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long'})}
let publicSelected=null;
let publicCalendarCursor=null;
let publicPortalModel='list';
function safeExternalUrl(raw){try{const u=new URL(String(raw||''));return /^https?:$/.test(u.protocol)?u.toString():''}catch(e){return''}}
function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))}
function setPublicChosenSlot(date,start,end){
  publicSelected={date,start,end};
  document.querySelectorAll('.public-slot').forEach(b=>b.classList.toggle('selected',b.dataset.publicDate===date&&b.dataset.publicStart===start&&b.dataset.publicEnd===end));
  const chosen=document.getElementById('chosenSlot');if(chosen)chosen.innerHTML=`<strong>${publicFormatDate(date)}</strong><br>${start} às ${end}`;
  const success=document.getElementById('patientSuccess');if(success)success.style.display='none';
  const formCard=document.getElementById('patientFormCard');if(formCard)formCard.style.display='';
  document.querySelectorAll('.public-step').forEach(step=>{const n=Number(step.dataset.step||0);step.classList.toggle('done',n<3);step.classList.toggle('active',n===3)});
  if(publicPortalModel==='calendar'&&window.innerWidth<760)setTimeout(()=>formCard?.scrollIntoView({behavior:'smooth',block:'start'}),80);
}
function renderPublicListModel(root,days){
  publicPortalModel='list';
  const title=document.getElementById('publicAvailabilityTitle'),sub=document.getElementById('publicAvailabilitySub'),formCard=document.getElementById('patientFormCard');
  if(title)title.textContent='Dias e horários disponíveis';if(sub)sub.textContent='Próximas datas com agenda aberta';if(formCard)formCard.style.display='';
  const visible=days.slice(0,10);
  if(!visible.length){root.innerHTML='<div class="patient-empty">No momento não há horários disponíveis para agendamento. Novos dias aparecerão aqui assim que o dentista abrir horários.</div>';return}
  root.innerHTML=visible.map(({key,freeSlots})=>`<div class="public-day"><div class="public-day-head"><strong>${publicFormatDate(key)}</strong><span>${freeSlots.length} ${freeSlots.length===1?'horário disponível':'horários disponíveis'}</span></div><div class="public-slots">${freeSlots.map(slot=>`<button type="button" class="public-slot ${publicSelected&&publicSelected.date===key&&publicSelected.start===slot.start&&publicSelected.end===slot.end?'selected':''}" data-public-date="${key}" data-public-start="${slot.start}" data-public-end="${slot.end}">${slot.start} às ${slot.end}</button>`).join('')}</div></div>`).join('');
  document.querySelectorAll('.public-slot').forEach(btn=>btn.onclick=()=>setPublicChosenSlot(btn.dataset.publicDate,btn.dataset.publicStart,btn.dataset.publicEnd));
}
function renderPublicCalendarModel(root,days){
  publicPortalModel='calendar';
  const title=document.getElementById('publicAvailabilityTitle'),sub=document.getElementById('publicAvailabilitySub'),formCard=document.getElementById('patientFormCard');
  if(title)title.textContent='Agendamento por etapas';if(sub)sub.textContent='Escolha a data, depois o horário e finalize com seus dados';
  if(!days.length){if(formCard)formCard.style.display='none';root.innerHTML='<div class="patient-empty">No momento não há horários disponíveis para agendamento. Novos dias aparecerão aqui assim que o dentista abrir horários.</div>';return}
  const map=new Map(days.map(d=>[d.key,d]));
  const first=new Date(days[0].key+'T12:00:00'),last=new Date(days[days.length-1].key+'T12:00:00');
  if(!publicCalendarCursor)publicCalendarCursor=new Date(first.getFullYear(),first.getMonth(),1);
  const cursorKey=publicCalendarCursor.getFullYear()*12+publicCalendarCursor.getMonth(),minKey=first.getFullYear()*12+first.getMonth(),maxKey=last.getFullYear()*12+last.getMonth();
  if(cursorKey<minKey)publicCalendarCursor=new Date(first.getFullYear(),first.getMonth(),1);
  if(cursorKey>maxKey)publicCalendarCursor=new Date(last.getFullYear(),last.getMonth(),1);
  const y=publicCalendarCursor.getFullYear(),m=publicCalendarCursor.getMonth(),firstWeekday=new Date(y,m,1).getDay(),monthDays=new Date(y,m+1,0).getDate(),cells=[];
  for(let i=0;i<firstWeekday;i++)cells.push(null);
  for(let d=1;d<=monthDays;d++){const key=calendarIso(y,m,d);cells.push({key,d,available:map.has(key)})}
  while(cells.length%7)cells.push(null);
  const selectedDay=publicSelected?.date&&map.get(publicSelected.date);const selectedSlots=selectedDay?.freeSlots||[];
  const monthTitle=new Date(y,m,1).toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
  const previousDisabled=(y*12+m)<=minKey,nextDisabled=(y*12+m)>=maxKey;
  root.innerHTML=`<div class="public-stepper"><div class="public-step ${publicSelected?.date?'done':'active'}" data-step="1"><span>1</span><div><strong>Data</strong><small>Escolha um dia</small></div></div><div class="public-step ${publicSelected?.date?(publicSelected?.start?'done':'active'):''}" data-step="2"><span>2</span><div><strong>Horário</strong><small>Escolha uma vaga</small></div></div><div class="public-step ${publicSelected?.start?'active':''}" data-step="3"><span>3</span><div><strong>Seus dados</strong><small>Finalize o pedido</small></div></div></div>
  <div class="public-calendar-shell">
    <div class="public-calendar-head"><button type="button" id="publicPrevMonth" ${previousDisabled?'disabled':''}>‹</button><strong>${monthTitle}</strong><button type="button" id="publicNextMonth" ${nextDisabled?'disabled':''}>›</button></div>
    <div class="public-calendar-week"><span>Dom</span><span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span></div>
    <div class="public-calendar-grid">${cells.map(c=>c?`<button type="button" class="public-calendar-day ${c.available?'available':'disabled'} ${publicSelected?.date===c.key?'selected':''}" data-public-calendar-date="${c.available?c.key:''}" ${c.available?'':'disabled'}><span>${c.d}</span>${c.available?'<i></i>':''}</button>`:'<span class="public-calendar-blank"></span>').join('')}</div>
  </div>
  <div class="public-calendar-times" id="publicCalendarTimes">${selectedDay?`<div class="public-calendar-times-head"><strong>${publicFormatDate(selectedDay.key)}</strong><span>${selectedSlots.length} ${selectedSlots.length===1?'horário livre':'horários livres'}</span></div><div class="public-slots">${selectedSlots.map(slot=>`<button type="button" class="public-slot ${publicSelected?.start===slot.start&&publicSelected?.end===slot.end?'selected':''}" data-public-date="${selectedDay.key}" data-public-start="${slot.start}" data-public-end="${slot.end}">${slot.start} às ${slot.end}</button>`).join('')}</div>`:'<div class="public-calendar-hint">Toque em um dia disponível no calendário para ver os horários.</div>'}</div>`;
  if(formCard)formCard.style.display=publicSelected?.start?'':'none';
  document.getElementById('publicPrevMonth')?.addEventListener('click',()=>{publicCalendarCursor=new Date(y,m-1,1);renderPublicCalendarModel(root,days)});
  document.getElementById('publicNextMonth')?.addEventListener('click',()=>{publicCalendarCursor=new Date(y,m+1,1);renderPublicCalendarModel(root,days)});
  root.querySelectorAll('[data-public-calendar-date]').forEach(btn=>btn.onclick=()=>{const key=btn.dataset.publicCalendarDate;if(!key)return;publicSelected={date:key,start:'',end:''};renderPublicCalendarModel(root,days)});
  root.querySelectorAll('.public-slot').forEach(btn=>btn.onclick=()=>setPublicChosenSlot(btn.dataset.publicDate,btn.dataset.publicStart,btn.dataset.publicEnd));
}
function renderPatientPortal(){
  const params=patientRouteParams(),snap=decodePublicState(params.get('agenda')),pubAvailability=snap&&snap.availability?snap.availability:availability,dentist=snap&&snap.dentist?snap.dentist:activeDentist,payment=snap&&snap.payment?snap.payment:getPaymentConfig(),bookingModel=snap&&snap.bookingModel?snap.bookingModel:getBookingModel();
  const snapshotBusy=snap&&Array.isArray(snap.busy)?snap.busy:[];
  const liveBusy=appointments.filter(a=>a.status!=='Cancelado').map(a=>({date:a.date,time:a.time,end:a.end||'',slotStart:a.slotStart||'',slotEnd:a.slotEnd||'',status:a.status}));
  const busyList=[...snapshotBusy,...liveBusy];
  document.getElementById('publicDentistName').textContent=dentist.name;document.getElementById('publicDentistFooter').textContent=`Rootis · Agendamento com ${dentist.name}`;const root=document.getElementById('publicDays');if(!root)return;const start=new Date();start.setHours(12,0,0,0);if(activeDentistId===CARLA_DENTIST_ID&&!snap){const demo=new Date('2026-09-25T12:00:00');if(start>demo)start.setTime(demo.getTime())}const days=[];
  for(let k=0;k<45;k++){
    const d=new Date(start);d.setDate(start.getDate()+k);const key=dateKey(d),cfg=pubAvailability[d.getDay()];
    if(!cfg||!cfg.open||!(cfg.slots||[]).length)continue;
    const freeSlots=(cfg.slots||[]).map((slot,i)=>({...slot,originalIndex:i})).filter(slot=>!busyList.some(b=>bookingOverlapsSlot(b,key,slot,pubAvailability)));
    if(freeSlots.length)days.push({key,freeSlots});
  }
  if(bookingModel==='calendar')renderPublicCalendarModel(root,days);else renderPublicListModel(root,days);
  const cardUrl=safeExternalUrl(payment.cardPaymentLink||dentist.cardPaymentLink||'');const pix=String(payment.pixKey||dentist.pixKey||'').trim();const receiver=String(payment.pixReceiver||dentist.pixReceiver||'').trim();let methods='';
  if(pix)methods+=`<div class="payment-method-box"><div class="payment-method-title">PIX</div><div class="pix-display"><code id="publicPixKey">${escapeHtml(pix)}</code><button class="btn btn-ghost" type="button" id="copyPublicPix">Copiar PIX</button></div>${receiver?`<div class="payment-receiver">Recebedor: ${escapeHtml(receiver)}</div>`:''}</div>`;
  if(cardUrl)methods+=`<div class="payment-method-box"><div class="payment-method-title">Cartão</div><div class="payment-actions-public"><a class="btn btn-primary public-card-link" href="${escapeHtml(cardUrl)}" target="_blank" rel="noopener noreferrer">Pagar com cartão</a></div></div>`;
  document.getElementById('publicPayment').innerHTML=`<strong>Pagamento / confirmação do horário</strong><br>${escapeHtml(payment.explanation)}<br><br><strong>Referência:</strong> R$ ${Number(payment.amount||0).toFixed(2).replace('.',',')} · ${escapeHtml(payment.method)}${methods||'<div class="payment-wait-note">O dentista ainda não cadastrou uma chave PIX ou link de cartão nesta agenda.</div>'}<div class="payment-wait-note">Após solicitar o horário, aguarde a confirmação do dentista. O pagamento, quando exigido, não substitui a confirmação do atendimento.</div>`;
  document.getElementById('copyPublicPix')?.addEventListener('click',async()=>{const value=document.getElementById('publicPixKey')?.textContent||'';try{await navigator.clipboard.writeText(value);alert('Chave PIX copiada.')}catch(e){const ta=document.createElement('textarea');ta.value=value;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();alert('Chave PIX copiada.')}});
}
function initPatientMode(){const params=patientRouteParams();if(params.get('paciente')!=='1')return false;document.body.classList.add('patient-mode');renderPatientPortal();return true}


function formatPatientWhatsapp(value){return whatsappFieldValue(value)}
function isValidPatientWhatsapp(value){return validLocalWhatsapp(value)}
function normalizePhone(phone){let n=localWhatsappDigits(phone);if(!validLocalWhatsapp(n))return'';return '55'+n}
function brDate(date){if(!date)return'';const [y,m,d]=date.split('-');return `${d}/${m}/${y}`}
function refreshPatientNext(patientName){const p=patients.find(x=>String(x.name).toLowerCase()===String(patientName).toLowerCase());if(!p)return;const today=appToday();const next=appointments.filter(a=>a.status==='Confirmado'&&!a.attended&&String(a.name).toLowerCase()===String(patientName).toLowerCase()&&String(a.date||'')>=today).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time))[0];p.next=next?`${next.date.split('-').reverse().slice(0,2).join('/')} · ${next.time}`:'—';persistPatients()}
function whatsappTextFor(a,type='confirmed'){
  const clinic=activeDentist.clinic?` na ${activeDentist.clinic}`:'';const period=a.end?`${a.time} às ${a.end}`:a.time;
  if(type==='cancelled')return `Olá, ${a.name}. Informamos que seu atendimento com ${activeDentist.name}, previsto para ${brDate(a.date)} às ${a.time}, foi cancelado. Entre em contato conosco caso queira solicitar um novo horário.`;
  const pay=getPaymentConfig();let payment='';
  if(pay.pixKey)payment+=`\nPIX para confirmação da consulta: ${pay.pixKey}.`;
  if(pay.cardPaymentLink)payment+=`\nPagamento por cartão: ${pay.cardPaymentLink}`;
  if(type==='payment_pending')return `Olá, ${a.name}. Seu pedido de agendamento com ${activeDentist.name}${clinic} foi registrado e encontra-se aguardando o pagamento da taxa de confirmação da consulta para que o horário seja efetivamente reservado.\n\nData prevista: ${brDate(a.date)}.\nHorário: ${period}.${payment}\n\nApós a identificação do pagamento, você receberá uma nova mensagem confirmando definitivamente o seu atendimento. Se precisar alterar sua solicitação, avise com antecedência.`;
  return `Olá, ${a.name}. Informamos que o pagamento foi identificado e seu agendamento com ${activeDentist.name}${clinic} está CONFIRMADO para ${brDate(a.date)}, das ${period}. Por favor, compareça no horário combinado.\n\nSe precisar alterar, avise com antecedência.`;
}
function openWhatsappForAppointment(a,type='confirmed'){const phone=normalizePhone(a.phone);if(!phone){toast('Este paciente não possui WhatsApp/telefone cadastrado.');return false}const url=`https://wa.me/${phone}?text=${encodeURIComponent(whatsappTextFor(a,type))}`;window.open(url,'_blank','noopener');return true}
let paymentTargets=[];
function buildPaymentTargets(){
  const items=[],seen=new Set();
  [...appointments].filter(a=>a.status!=='Cancelado').sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)).forEach(a=>{
    const key=`${String(a.name).toLowerCase()}|${normalizePhone(a.phone)}`;if(seen.has(key))return;seen.add(key);items.push({name:a.name,phone:a.phone||'',appointmentId:a.id,date:a.date,time:a.time,end:a.end||''});
  });
  patients.forEach((p,i)=>{const key=`${String(p.name).toLowerCase()}|${normalizePhone(p.phone)}`;if(seen.has(key))return;seen.add(key);items.push({name:p.name,phone:p.phone||'',patientIndex:i,date:'',time:'',end:''})});
  return items;
}
function populatePaymentTargets(){
  paymentTargets=buildPaymentTargets();const select=document.getElementById('paymentPatientSelect');if(!select)return;
  select.innerHTML=paymentTargets.length?paymentTargets.map((t,i)=>`<option value="${i}">${escapeHtml(t.name)}${t.date?` · ${brDate(t.date)} · ${escapeHtml(t.time)}`:''}${t.phone?` · ${escapeHtml(t.phone)}`:' · sem WhatsApp'}</option>`).join(''):'<option value="">Nenhum paciente disponível</option>';
}
function paymentMethodLines(method,amount){
  const pay=getPaymentConfig(),value=moneyBR(amount),lines=[`Valor da cobrança: ${value}.`];
  if((method==='PIX'||method==='PIX ou cartão')&&pay.pixKey){lines.push(`PIX: ${pay.pixKey}.`);if(pay.pixReceiver)lines.push(`Recebedor: ${pay.pixReceiver}.`)}
  if((method==='Cartão'||method==='PIX ou cartão')&&safeExternalUrl(pay.cardPaymentLink)){lines.push(`Pagamento por cartão: ${safeExternalUrl(pay.cardPaymentLink)}`)}
  return lines;
}
function paymentMethodIsReady(method){
  const pay=getPaymentConfig(),hasPix=!!String(pay.pixKey||'').trim(),hasCard=!!safeExternalUrl(pay.cardPaymentLink);
  if(method==='PIX'&&!hasPix)return{ok:false,message:'Cadastre uma chave PIX em Meu perfil > Recebimentos antes de enviar esta cobrança.'};
  if(method==='Cartão'&&!hasCard)return{ok:false,message:'Cadastre um link de pagamento por cartão em Meu perfil > Recebimentos antes de enviar esta cobrança.'};
  if(method==='PIX ou cartão'&&!hasPix&&!hasCard)return{ok:false,message:'Cadastre uma chave PIX ou um link de cartão em Meu perfil > Recebimentos antes de enviar esta cobrança.'};
  return{ok:true};
}
function buildDirectPaymentMessage(target,amount,method,custom){
  const intro=String(custom||'').trim()||`Olá, ${target.name}. Seguem os dados para pagamento do seu atendimento com ${activeDentist.name}.`;
  return `${intro}\n\n${paymentMethodLines(method,amount).join('\n')}\n\nApós o pagamento, envie o comprovante por este WhatsApp para confirmarmos o recebimento.`;
}
function updatePaymentSendPreview(){
  const preview=document.getElementById('paymentSendPreview'),select=document.getElementById('paymentPatientSelect'),method=document.getElementById('paymentChargeMethod'),amount=document.getElementById('paymentChargeAmount');if(!preview)return;
  const target=paymentTargets[Number(select?.value||0)],selectedMethod=method?.value||'PIX',value=Number(amount?.value||0),ready=paymentMethodIsReady(selectedMethod);
  if(!target){preview.innerHTML='<strong>Nenhum paciente disponível.</strong><span>Cadastre um paciente ou agendamento antes de gerar a cobrança.</span>';return}
  preview.innerHTML=`<strong>Envio pelo WhatsApp</strong><span>${escapeHtml(target.name)} · ${moneyBR(value)} · ${escapeHtml(selectedMethod)}</span><small>${ready.ok?'A cobrança usará os dados salvos em Meu perfil > Recebimentos.':escapeHtml(ready.message)}</small>`;
}
function sendPaymentRequestFromModal(){
  const select=document.getElementById('paymentPatientSelect'),target=paymentTargets[Number(select?.value)],amount=Math.max(0,Number(document.getElementById('paymentChargeAmount')?.value||0)),method=document.getElementById('paymentChargeMethod')?.value||'PIX',custom=document.getElementById('paymentModalMessage')?.value||'';
  if(!target){toast('Escolha um paciente para gerar a cobrança.');return}
  const phone=normalizePhone(target.phone);if(!phone){toast('Este paciente não possui WhatsApp cadastrado.');return}
  const ready=paymentMethodIsReady(method);if(!ready.ok){toast(ready.message);return}
  const patient=patients.find(p=>String(p.name||'').toLowerCase()===String(target.name||'').toLowerCase());
  if(patient){patient.amountDue=Math.max(Number(patient.amountDue)||0,(Number(patient.amountPaid)||0)+amount);persistPatients()}
  if(target.appointmentId){const a=appointments.find(x=>x.id===target.appointmentId);if(a&&a.status!=='Confirmado'){a.status='Aguardando pagamento';a.paymentStatus='Aguardando pagamento';rerenderAfterAppointmentChange(a)}}
  renderPatients(patientSearch?.value||'');
  const text=buildDirectPaymentMessage(target,amount,method,custom);closePay();toast('Cobrança preparada. Abrindo o WhatsApp do paciente...');window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`,'_blank','noopener');
}
function remainingAppointments(){
  const today=appToday();return appointments.filter(a=>a.status!=='Cancelado'&&!a.attended&&String(a.date||'')>=today).sort((a,b)=>(String(a.date||'')+String(a.time||'')).localeCompare(String(b.date||'')+String(b.time||'')));
}
function renderDashboardQuickData(){
  const remaining=remainingAppointments(),pendingEl=document.getElementById('quickPendingCount');if(pendingEl)pendingEl.textContent=`${remaining.length} ${remaining.length===1?'atendimento pela frente':'atendimentos pela frente'}`;
  const key=currentRevenueMonthKey(),monthTotal=revenueForMonth(key),revenueEl=document.getElementById('quickRevenueSummary');if(revenueEl)revenueEl.textContent=`${moneyBR(monthTotal)} em ${revenueMonthLabel(key)}`;
}
function refreshFinancialViews(){
  renderDentistFinancialSummary();renderDashboardQuickData();
  if(document.getElementById('revenueModal')?.classList.contains('open'))renderRevenueModal();
}
function renderPendingAppointmentsModal(){
  const list=remainingAppointments(),root=document.getElementById('pendingAppointmentsList'),total=document.getElementById('pendingAppointmentsTotal');if(total)total.textContent=list.length;if(!root)return;
  root.innerHTML=list.length?list.map(a=>`<article class="dashboard-detail-row"><div class="detail-date"><strong>${brDate(a.date)}</strong><span>${escapeHtml(a.time)}${a.end?`–${escapeHtml(a.end)}`:''}</span></div><div class="detail-main"><strong>${escapeHtml(a.name||'Paciente')}</strong><small>${escapeHtml(a.phone||'Sem WhatsApp informado')}</small></div><div class="detail-status">${badge(a.status)}</div></article>`).join(''):'<div class="confirmation-empty">Não há atendimentos restantes nesta agenda.</div>';
}
function openPendingAppointmentsModal(){renderPendingAppointmentsModal();document.getElementById('pendingAppointmentsModal')?.classList.add('open')}
function closePendingAppointmentsModal(){document.getElementById('pendingAppointmentsModal')?.classList.remove('open')}
function revenueGroups(){
  const groups={};paymentLedger.forEach(e=>{const key=revenueMonthKey(e.date);if(!key||Math.abs(Number(e.amount)||0)<0.005)return;if(!groups[key])groups[key]={key,total:0,count:0,items:[]};groups[key].total+=Number(e.amount)||0;groups[key].count++;groups[key].items.push(e)});return Object.values(groups).sort((a,b)=>b.key.localeCompare(a.key));
}
function ledgerRecordLabel(e){return e.label||(e.source==='appointment'?'Pagamento de atendimento':'Pagamento registrado')}
function renderRevenueModal(){
  const mode=document.getElementById('revenueViewMode')?.value||'current',heroLabel=document.getElementById('revenueHeroLabel'),heroValue=document.getElementById('revenueHeroValue'),heroMeta=document.getElementById('revenueHeroMeta'),root=document.getElementById('revenueDetailList');if(!root)return;
  const records=[...paymentLedger].filter(e=>Math.abs(Number(e.amount)||0)>=0.005).sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))),currentKey=currentRevenueMonthKey();
  const row=e=>`<article class="dashboard-detail-row"><div class="detail-date"><strong>${brDate(e.date)}</strong><span>${escapeHtml(ledgerRecordLabel(e))}</span></div><div class="detail-main"><strong>${escapeHtml(e.patientName||'Paciente')}</strong><small>${e.source==='manual'?'Lançamento manual':e.source==='opening'?'Saldo anterior':'Pagamento confirmado'}</small></div><div class="detail-money ${Number(e.amount)<0?'money-negative':''}">${moneyBR(e.amount)}</div></article>`;
  if(mode==='current'){
    const items=records.filter(e=>revenueMonthKey(e.date)===currentKey),total=items.reduce((s,e)=>s+(Number(e.amount)||0),0);heroLabel.textContent=`Faturado em ${revenueMonthLabel(currentKey)}`;heroValue.textContent=moneyBR(total);heroMeta.textContent=`${items.length} ${items.length===1?'movimentação registrada':'movimentações registradas'}`;root.innerHTML=items.length?items.map(row).join(''):'<div class="confirmation-empty">Nenhum recebimento registrado neste mês.</div>';
  }else if(mode==='months'){
    const groups=revenueGroups(),total=groups.reduce((s,g)=>s+g.total,0);heroLabel.textContent='Faturamento por meses';heroValue.textContent=moneyBR(total);heroMeta.textContent=`${groups.length} ${groups.length===1?'mês com faturamento':'meses com faturamento'}`;root.innerHTML=groups.length?groups.map(g=>`<article class="dashboard-detail-row revenue-month-row"><div class="detail-main"><strong>${revenueMonthLabel(g.key)}</strong><small>${g.count} ${g.count===1?'movimentação':'movimentações'}</small></div><div class="detail-money">${moneyBR(g.total)}</div></article>`).join(''):'<div class="confirmation-empty">Ainda não há faturamento registrado.</div>';
  }else{
    const total=records.reduce((s,e)=>s+(Number(e.amount)||0),0);heroLabel.textContent='Faturamento total';heroValue.textContent=moneyBR(total);heroMeta.textContent=`${records.length} ${records.length===1?'movimentação financeira':'movimentações financeiras'} em toda a agenda`;root.innerHTML=revenueGroups().length?revenueGroups().map(g=>`<article class="dashboard-detail-row revenue-month-row"><div class="detail-main"><strong>${revenueMonthLabel(g.key)}</strong><small>${g.count} ${g.count===1?'movimentação':'movimentações'}</small></div><div class="detail-money">${moneyBR(g.total)}</div></article>`).join(''):'<div class="confirmation-empty">Ainda não há faturamento registrado.</div>';
  }
}
function openRevenueModal(){const select=document.getElementById('revenueViewMode');if(select)select.value='current';renderRevenueModal();document.getElementById('revenueModal')?.classList.add('open')}
function closeRevenueModal(){document.getElementById('revenueModal')?.classList.remove('open')}
function openBookingLinkModal(){const input=document.getElementById('quickPatientLink');if(input)input.value=buildPatientLink();document.getElementById('bookingLinkModal')?.classList.add('open')}
function closeBookingLinkModal(){document.getElementById('bookingLinkModal')?.classList.remove('open')}
async function copyQuickPatientLink(){const input=document.getElementById('quickPatientLink');if(!input)return;input.value=buildPatientLink();try{await navigator.clipboard.writeText(input.value);toast('Link de agendamento copiado.')}catch(e){input.select();document.execCommand('copy');toast('Link de agendamento copiado.')}}
function updateConfirmationCounts(){const pending=appointments.filter(a=>a.status==='Aguardando confirmação'||String(a.status||'').toLowerCase().includes('pagamento')).length;['pendingConfirmationsCount','confirmationPendingTotal','sidebarPendingCount'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent=pending})}
let confirmationFilter='pending';
function renderConfirmations(){
  const root=document.getElementById('confirmationList');if(!root)return;updateConfirmationCounts();const filter=document.getElementById('confirmationFilter');if(filter)confirmationFilter=filter.value||confirmationFilter;let items=[...appointments].sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
  if(confirmationFilter==='pending')items=items.filter(a=>a.status==='Aguardando confirmação'||String(a.status||'').toLowerCase().includes('pagamento'));
  if(confirmationFilter==='confirmed')items=items.filter(a=>a.status==='Confirmado');if(confirmationFilter==='cancelled')items=items.filter(a=>a.status==='Cancelado');if(!items.length){root.innerHTML='<div class="confirmation-empty">Nenhum atendimento encontrado neste filtro.</div>';return}
  const payRequired=getPaymentConfig().required;
  root.innerHTML=items.map(a=>{const waitingPayment=String(a.status||'').toLowerCase().includes('pagamento');return `<article class="confirmation-card"><div class="confirmation-card-top"><div class="confirmation-person"><div class="confirmation-avatar">${initials(a.name)}</div><div><h3>${escapeHtml(a.name||'Paciente')}</h3><p>${escapeHtml(a.phone||'Telefone não informado')}${a.email?` · ${escapeHtml(a.email)}`:''}</p></div></div>${badge(a.status)}</div><div class="confirmation-meta"><div><small>Data</small><strong>${brDate(a.date)}</strong></div><div><small>Horário</small><strong>${escapeHtml(a.time)}${a.end?` às ${escapeHtml(a.end)}`:''}</strong></div><div><small>Origem</small><strong>${escapeHtml(a.source||'Dentista')}</strong></div><div><small>Pagamento</small><strong>${escapeHtml(a.paymentStatus||'Não informado')}</strong></div></div>${a.note?`<div class="confirmation-note"><strong>Observação:</strong> ${escapeHtml(a.note)}</div>`:''}<div class="confirmation-actions">${a.status==='Aguardando confirmação'?(payRequired?`<button class="btn btn-primary" type="button" data-request-payment="${a.id}">Solicitar pagamento + WhatsApp</button>`:`<button class="btn btn-primary" type="button" data-confirm-appt="${a.id}">Confirmar + WhatsApp</button>`):''}${waitingPayment?`<button class="btn btn-primary" type="button" data-confirm-payment="${a.id}">Pagamento recebido · Confirmar</button><button class="btn btn-whatsapp" type="button" data-payment-whatsapp="${a.id}">Reenviar solicitação de pagamento</button>`:''}${a.status==='Confirmado'?`<button class="btn btn-whatsapp" type="button" data-whatsapp-appt="${a.id}">Enviar confirmação novamente</button>`:''}${a.status!=='Cancelado'?`<button class="btn btn-danger" type="button" data-cancel-appt="${a.id}">Cancelar atendimento</button>`:''}${a.status==='Cancelado'&&a.phone?`<button class="btn btn-whatsapp" type="button" data-cancel-whatsapp="${a.id}">Reenviar aviso de cancelamento</button>`:''}</div></article>`}).join('');
  document.querySelectorAll('[data-request-payment]').forEach(btn=>btn.onclick=()=>requestPaymentForAppointment(btn.dataset.requestPayment));document.querySelectorAll('[data-confirm-payment]').forEach(btn=>btn.onclick=()=>confirmPaymentAndAppointment(btn.dataset.confirmPayment));document.querySelectorAll('[data-payment-whatsapp]').forEach(btn=>btn.onclick=()=>{const a=appointments.find(x=>x.id===btn.dataset.paymentWhatsapp);if(a)openWhatsappForAppointment(a,'payment_pending')});document.querySelectorAll('[data-confirm-appt]').forEach(btn=>btn.onclick=()=>confirmAppointment(btn.dataset.confirmAppt));document.querySelectorAll('[data-cancel-appt]').forEach(btn=>btn.onclick=()=>cancelAppointment(btn.dataset.cancelAppt));document.querySelectorAll('[data-whatsapp-appt]').forEach(btn=>btn.onclick=()=>{const a=appointments.find(x=>x.id===btn.dataset.whatsappAppt);if(a)openWhatsappForAppointment(a,'confirmed')});document.querySelectorAll('[data-cancel-whatsapp]').forEach(btn=>btn.onclick=()=>{const a=appointments.find(x=>x.id===btn.dataset.cancelWhatsapp);if(a)openWhatsappForAppointment(a,'cancelled')});
}
function rerenderAfterAppointmentChange(a){persistAppointments();refreshPatientNext(a.name);renderToday();renderPatients();renderCalendar();renderAvailable(selectedDate);renderConfirmations();refreshFinancialViews();refreshPatientLink()}
function requestPaymentForAppointment(id){const a=appointments.find(x=>x.id===id);if(!a)return;a.status='Aguardando pagamento';a.paymentStatus='Aguardando pagamento';rerenderAfterAppointmentChange(a);toast('Solicitação de pagamento preparada. Abrindo o WhatsApp do paciente...');openWhatsappForAppointment(a,'payment_pending')}
function canConfirmAppointmentWithoutConflict(a){const slot=getConfiguredSlotForBooking(a);if(!slot){toast('Este pedido não corresponde a um horário válido da agenda. Remarque o paciente em um horário disponível.');return false}const conflict=blockingAppointmentForSlot(a.date,slot,a.id);if(conflict){toast(`Não é possível confirmar: o horário ${slot.start} às ${slot.end} já está reservado para outro paciente.`);return false}a.time=slot.start;a.end=slot.end;a.slotStart=slot.start;a.slotEnd=slot.end;return true}
function confirmPaymentAndAppointment(id){const a=appointments.find(x=>x.id===id);if(!a)return;if(!canConfirmAppointmentWithoutConflict(a))return;a.status='Confirmado';a.paymentStatus='Pago';if(!Number(a.paymentAmount))a.paymentAmount=Number(getPaymentConfig().amount)||0;syncAppointmentPaymentLedger(a);persistPaymentLedger();refreshPatientFinancialMinimums(a.name);rerenderAfterAppointmentChange(a);renderPatients(patientSearch?.value||'');refreshFinancialViews();toast('Pagamento registrado e faturamento atualizado. Abrindo o WhatsApp do paciente...');openWhatsappForAppointment(a,'confirmed')}
function confirmAppointment(id){const a=appointments.find(x=>x.id===id);if(!a)return;if(!canConfirmAppointmentWithoutConflict(a))return;a.status='Confirmado';if(!a.paymentStatus||a.paymentStatus==='Não informado')a.paymentStatus='Não exigido';rerenderAfterAppointmentChange(a);renderDentistFinancialSummary();toast('Atendimento confirmado. Abrindo o WhatsApp do paciente...');openWhatsappForAppointment(a,'confirmed')}
function cancelAppointment(id){const a=appointments.find(x=>x.id===id);if(!a)return;if(!confirm(`Cancelar o atendimento de ${a.name} em ${brDate(a.date)} às ${a.time}?`))return;a.status='Cancelado';rerenderAfterAppointmentChange(a);toast('Atendimento cancelado. Abrindo o WhatsApp do paciente...');openWhatsappForAppointment(a,'cancelled')}

let reportRadiographs={initial:null,final:null,additional:[]};
const clinicalReportModal=document.getElementById('clinicalReportModal'),clinicalReportForm=document.getElementById('clinicalReportForm');
function isoToday(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function reportPatient(){return patients[selectedPatientIndex]||patients[0]||{name:'Paciente',phone:'',email:''}}
function resetTemporaryReport(){
  reportRadiographs={initial:null,final:null,additional:[]};
  const initial=document.getElementById('reportRadiographInitial'),final=document.getElementById('reportRadiographFinal'),additional=document.getElementById('reportRadiographsAdditional');
  if(initial)initial.value='';if(final)final.value='';if(additional)additional.value='';
  const pi=document.getElementById('reportRadiographInitialPreview'),pf=document.getElementById('reportRadiographFinalPreview'),pa=document.getElementById('reportRadiographsAdditionalPreview');
  if(pi)pi.innerHTML='<div class="report-empty-images">A prévia do raio X inicial aparecerá aqui.</div>';
  if(pf)pf.innerHTML='<div class="report-empty-images">A prévia do raio X final aparecerá aqui.</div>';
  if(pa)pa.innerHTML='<div class="report-empty-images">As prévias das radiografias adicionais aparecerão aqui.</div>';
  const si=document.getElementById('reportRadiographInitialStatus'),sf=document.getElementById('reportRadiographFinalStatus'),sa=document.getElementById('reportRadiographsAdditionalStatus');
  if(si)si.textContent='Nenhuma imagem selecionada';if(sf)sf.textContent='Nenhuma imagem selecionada';if(sa)sa.textContent='Nenhuma imagem adicional selecionada';
  document.getElementById('reportRadiographInitialBox')?.classList.remove('has-image');document.getElementById('reportRadiographFinalBox')?.classList.remove('has-image');document.getElementById('reportRadiographsAdditionalBox')?.classList.remove('has-image');
}
function openClinicalReport(){
  if(!patients.length){toast('Cadastre ou selecione um paciente primeiro.');return}
  const p=reportPatient();clinicalReportForm.reset();resetTemporaryReport();
  document.getElementById('reportPatientName').value=p.name||'';document.getElementById('reportDentistName').value=activeDentist.name||'';document.getElementById('reportDentistCro').value=activeDentist.cro||'';document.getElementById('reportClinic').value=activeDentist.clinic||'';
  const related=appointments.filter(a=>String(a.name).toLowerCase()===String(p.name).toLowerCase()).sort((a,b)=>(b.date+b.time).localeCompare(a.date+a.time));document.getElementById('reportAttendanceDate').value=related[0]?.date||isoToday();
  clinicalReportModal.classList.add('open');
}
function closeClinicalReport(){clinicalReportModal.classList.remove('open');resetTemporaryReport();clinicalReportForm.reset()}
document.getElementById('openClinicalReport')?.addEventListener('click',openClinicalReport);document.querySelectorAll('[data-close-report]').forEach(b=>b.addEventListener('click',closeClinicalReport));
clinicalReportModal?.addEventListener('click',e=>{if(e.target===clinicalReportModal)closeClinicalReport()});
async function fileToReportImage(file){
  if(!file||!file.type.startsWith('image/'))return null;
  const data=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file)});
  return {name:file.name,data};
}
function reportImageCard(x,label,alt){return `<div class="report-radiograph-item"><div class="rx-kind">${label}</div><img src="${x.data}" alt="${alt}"><span>${x.name}</span></div>`}
const radiographInitialInput=document.getElementById('reportRadiographInitial');
radiographInitialInput?.addEventListener('change',async e=>{
  reportRadiographs.initial=await fileToReportImage(e.target.files?.[0]);
  const prev=document.getElementById('reportRadiographInitialPreview'),status=document.getElementById('reportRadiographInitialStatus'),box=document.getElementById('reportRadiographInitialBox');prev.innerHTML=reportRadiographs.initial?reportImageCard(reportRadiographs.initial,'Raio X inicial','Raio X inicial'):'<div class="report-empty-images">A prévia do raio X inicial aparecerá aqui.</div>';if(status)status.textContent=reportRadiographs.initial?`Selecionado: ${reportRadiographs.initial.name}`:'Nenhuma imagem selecionada';box?.classList.toggle('has-image',!!reportRadiographs.initial);
});
const radiographFinalInput=document.getElementById('reportRadiographFinal');
radiographFinalInput?.addEventListener('change',async e=>{
  reportRadiographs.final=await fileToReportImage(e.target.files?.[0]);
  const prev=document.getElementById('reportRadiographFinalPreview'),status=document.getElementById('reportRadiographFinalStatus'),box=document.getElementById('reportRadiographFinalBox');prev.innerHTML=reportRadiographs.final?reportImageCard(reportRadiographs.final,'Raio X final','Raio X final'):'<div class="report-empty-images">A prévia do raio X final aparecerá aqui.</div>';if(status)status.textContent=reportRadiographs.final?`Selecionado: ${reportRadiographs.final.name}`:'Nenhuma imagem selecionada';box?.classList.toggle('has-image',!!reportRadiographs.final);
});
const radiographsAdditionalInput=document.getElementById('reportRadiographsAdditional');
radiographsAdditionalInput?.addEventListener('change',async e=>{
  const files=[...e.target.files].filter(f=>f.type.startsWith('image/')).slice(0,8);reportRadiographs.additional=[];
  for(const file of files){const item=await fileToReportImage(file);if(item)reportRadiographs.additional.push(item)}
  const prev=document.getElementById('reportRadiographsAdditionalPreview'),status=document.getElementById('reportRadiographsAdditionalStatus'),box=document.getElementById('reportRadiographsAdditionalBox');prev.innerHTML=reportRadiographs.additional.length?reportRadiographs.additional.map((x,i)=>reportImageCard(x,`Raio X adicional ${i+1}`,`Radiografia adicional ${i+1}`)).join(''):'<div class="report-empty-images">As prévias das radiografias adicionais aparecerão aqui.</div>';if(status)status.textContent=reportRadiographs.additional.length?`${reportRadiographs.additional.length} imagem(ns) selecionada(s)`:'Nenhuma imagem adicional selecionada';box?.classList.toggle('has-image',reportRadiographs.additional.length>0);if(e.target.files.length>8)toast('Foram usadas somente as 8 primeiras radiografias adicionais.');
});
function escReport(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function lineReport(label,value){return value?`<div class="report-line"><strong>${escReport(label)}:</strong> ${escReport(value)}</div>`:''}
function fmtReportDate(v){if(!v)return'';const d=new Date(v+'T12:00:00');return d.toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'})}
function reportChannels(data){const rows=[1,2,3].map(i=>({name:data.get(`ch${i}name`),cad:data.get(`ch${i}cad`),crt:data.get(`ch${i}crt`),ini:data.get(`ch${i}ini`),fin:data.get(`ch${i}fin`),cone:data.get(`ch${i}cone`),pat:data.get(`ch${i}pat`)})).filter(r=>Object.values(r).some(v=>String(v||'').trim()));if(!rows.length)return'';return `<div class="rtable"><div class="rtr rh"><span>Canal</span><span>CAD</span><span>CRT</span><span>Lima Ini.</span><span>Lima Fin.</span><span>Cone</span><span>PAT</span></div>${rows.map(r=>`<div class="rtr">${[r.name,r.cad,r.crt,r.ini,r.fin,r.cone,r.pat].map(v=>`<span>${escReport(v)}</span>`).join('')}</div>`).join('')}</div>`}
function buildPrintableClinicalReport(data){
  const now=new Date(),issued=now.toLocaleDateString('pt-BR')+', '+now.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}),patient=escReport(data.get('patientName')),dentist=escReport(data.get('dentistName')),cro=escReport(data.get('dentistCro')),clinic=escReport(data.get('clinic')),tooth=escReport(data.get('tooth')),procedure=escReport(data.get('procedure')),session=escReport(data.get('sessionType')),recipient=escReport(data.get('recipient')),evolution=escReport(data.get('clinicalEvolution')).replace(/\n/g,'<br>');
  const orderedRadiographs=[];if(reportRadiographs.initial)orderedRadiographs.push({...reportRadiographs.initial,label:'Raio X inicial'});if(reportRadiographs.final)orderedRadiographs.push({...reportRadiographs.final,label:'Raio X final'});reportRadiographs.additional.forEach((x,i)=>orderedRadiographs.push({...x,label:`Raio X adicional ${i+1}`}));
  const images=orderedRadiographs.length?`<section><h2>DOCUMENTAÇÃO RADIOGRÁFICA</h2><div class="rx-grid">${orderedRadiographs.map((x,i)=>`<div class="rx"><div class="rx-label">${escReport(x.label)}</div><img src="${x.data}"><div>${escReport(x.name||`Imagem ${i+1}`)}</div></div>`).join('')}</div></section>`:'';
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Relatório clínico - ${patient}</title><style>
  @page{size:A4;margin:0}*{box-sizing:border-box}body{margin:0;font-family:Arial,Helvetica,sans-serif;color:#363636;background:#fff;font-size:12px;line-height:1.45}.page{width:210mm;min-height:297mm;margin:0 auto;background:#fff}.header{background:#0b5199;color:#fff;padding:13mm 14mm 8mm;display:flex;justify-content:space-between;gap:15mm}.header h1{margin:0;font-size:24px;letter-spacing:.01em}.header .dentist{font-size:13px;line-height:1.35}.header .issued{text-align:right;font-size:10px;align-self:flex-end}.content{padding:7mm 14mm 13mm}section{margin:0 0 8mm;break-inside:auto}h2{margin:0 0 3.5mm;color:#0b5199;font-size:15px}h3{margin:2.5mm 0 1.5mm;font-size:12px}.report-line{margin:1mm 0}.rtable{margin:2mm 0 3mm;border-collapse:collapse;width:100%}.rtr{display:grid;grid-template-columns:1fr repeat(6,1fr);min-height:7mm}.rtr span{padding:1.4mm 2mm;border-bottom:1px solid #e7ebef}.rh{background:#0b5199;color:#fff;font-weight:bold}.rh span{border-bottom:0}.evolution{font-size:12px;line-height:1.55;text-align:justify}.signature{margin-top:5mm}.rx-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:7mm 5mm}.rx{break-inside:avoid;text-align:center;color:#777;font-size:8px;font-style:italic}.rx-label{font-style:normal;font-weight:bold;color:#0b5199;font-size:9px;margin-bottom:1.5mm;text-transform:uppercase}.rx img{width:100%;height:45mm;object-fit:contain;background:#f6f6f6;display:block;margin-bottom:2mm}.footer{padding:0 14mm 7mm;color:#777;font-size:8px;display:flex;justify-content:space-between}.privacy{color:#6f7f79}.page-break{break-before:page}@media print{body{print-color-adjust:exact;-webkit-print-color-adjust:exact}.page{margin:0;box-shadow:none}}@media screen{body{background:#edf1f4}.page{box-shadow:0 4px 30px rgba(0,0,0,.14)}}
  </style></head><body><div class="page"><div class="header"><div><h1>RELATÓRIO CLÍNICO</h1><div class="dentist">${dentist}${cro?`<br>${cro}`:''}</div></div><div class="issued">ROOTIS<br>Emitido em: ${escReport(issued)}</div></div><div class="content">
  <section><h2>DADOS DO PACIENTE</h2>${lineReport('Nome',data.get('patientName'))}</section>
  <section><h2>HISTÓRICO MÉDICO E ODONTOLÓGICO</h2><h3>Anamnese Endodôntica</h3>${lineReport('Sensibilidade',data.get('sensitivity'))}${lineReport('Testes clínicos',data.get('clinicalTests'))}${lineReport('Sinais clínicos',data.get('clinicalSigns'))}<h3>Diagnóstico Endodôntico</h3>${lineReport('Condição pulpar',data.get('pulpCondition'))}${lineReport('Diagnóstico periapical',data.get('periapicalDiagnosis'))}${lineReport('Histórico de trauma',data.get('trauma'))}${lineReport('Condição sistêmica / observações',data.get('systemicCondition'))}</section>
  <section><h2>FICHA ENDODÔNTICA</h2>${lineReport('Elemento dentário',data.get('tooth'))}${reportChannels(data)}${lineReport('Lima memória',data.get('memoryFile'))}${lineReport('Sistema de instrumentação',data.get('instrumentation'))}${lineReport('Solução irrigadora',data.get('irrigant'))}${lineReport('Solução química auxiliar',data.get('auxSolution'))}${lineReport('Quelante',data.get('chelator'))}${lineReport('Ativação de irrigante',data.get('activation'))}${lineReport('Cimento obturador',data.get('sealer'))}${lineReport('Técnica de obturação',data.get('obturation'))}${lineReport('Blindagem imediata',data.get('immediateSeal'))}</section>
  <section><h2>INFORMAÇÕES DO ATENDIMENTO</h2>${lineReport('Procedimento',data.get('procedure'))}${lineReport('Dente',data.get('tooth'))}${lineReport('Tipo de sessão',data.get('sessionType'))}${lineReport('Data',fmtReportDate(data.get('attendanceDate')))}${lineReport('Clínica',data.get('clinic'))}</section>
  <section class="page-break"><h2>EVOLUÇÃO CLÍNICA</h2>${recipient?`<div style="margin-bottom:3mm">Prezado(a) ${recipient},</div>`:''}<div class="evolution">${evolution||'Sem evolução clínica informada.'}</div><div class="signature">Atenciosamente,<br><br>${dentist}${cro?` · ${cro}`:''}</div></section>${images}
  </div><div class="footer"><span>Gerado localmente por Rootis</span><span class="privacy">Relatório exportado sob demanda - não armazenado pelo sistema</span></div></div></body></html>`;
}
function exportClinicalReportPdf(){const data=new FormData(clinicalReportForm),w=window.open('','_blank');if(!w){toast('O navegador bloqueou a janela de exportação. Permita pop-ups e tente novamente.');return}w.document.open();w.document.write(buildPrintableClinicalReport(data));w.document.close();w.focus();setTimeout(()=>{toast('Na janela de impressão, escolha “Salvar como PDF”.');w.print()},500)}
clinicalReportForm?.addEventListener('submit',e=>{e.preventDefault();exportClinicalReportPdf()});
document.getElementById('exportClinicalPdf')?.addEventListener('click',exportClinicalReportPdf);

function bindWhatsappDigitFields(){
  const bind=el=>{
    if(!el||el.dataset.whatsappBound==='1')return;
    el.dataset.whatsappBound='1';el.inputMode='numeric';el.maxLength=11;el.pattern='\\d{11}';
    const validate=()=>{const clean=localWhatsappDigits(el.value);if(el.value!==clean)el.value=clean;const required=el.required;el.setCustomValidity((required||clean)&&clean.length!==11?'Digite exatamente 11 números, por exemplo 98981452367.':'')};
    el.addEventListener('input',validate);
    el.addEventListener('blur',validate);
    el.addEventListener('paste',ev=>{const pasted=localWhatsappDigits(ev.clipboardData?.getData('text')||'');if(!pasted)return;ev.preventDefault();el.value=pasted;validate();if(pasted.length!==11)el.reportValidity()});
    validate();
  };
  ['patientWhatsapp','patientEditPhone','profileDentistWhatsapp','dentistWhatsapp'].forEach(id=>bind(document.getElementById(id)));
  document.querySelectorAll('input[name="phone"], input[name="whatsapp"]').forEach(bind);
}
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}
const apptModal=document.getElementById('apptModal'),payModal=document.getElementById('payModal');function openAppt(){apptModal.classList.add('open');if(!document.getElementById('apptDate').value)document.getElementById('apptDate').value=selectedDate;updateApptTimes()}function closeAppt(){apptModal.classList.remove('open')}function openPay(){populatePaymentTargets();const config=getPaymentConfig(),amount=document.getElementById('paymentChargeAmount'),method=document.getElementById('paymentChargeMethod'),message=document.getElementById('paymentModalMessage');if(amount)amount.value=String(config.amount||100);if(method)method.value=config.method||'PIX';const saved=localStorage.getItem(dentistKey('PaymentExplanation'));if(message)message.value=saved||'Olá! Para confirmar seu horário, realize o pagamento da taxa de agendamento. Após a confirmação, seu horário ficará reservado.';updatePaymentSendPreview();payModal.classList.add('open')}function closePay(){payModal.classList.remove('open')}
[newAppt,newAppt2,quickAppt].forEach(b=>b.onclick=openAppt);[openPayment,quickPay].forEach(b=>b.onclick=openPay);document.querySelectorAll('[data-close]').forEach(b=>b.onclick=closeAppt);document.querySelectorAll('[data-close-pay]').forEach(b=>b.onclick=closePay);
['paymentPatientSelect','paymentChargeMethod','paymentChargeAmount'].forEach(id=>document.getElementById(id)?.addEventListener('change',updatePaymentSendPreview));document.getElementById('paymentChargeAmount')?.addEventListener('input',updatePaymentSendPreview);
document.getElementById('quickPendingAppointments')?.addEventListener('click',openPendingAppointmentsModal);
document.querySelectorAll('[data-close-pending]').forEach(b=>b.addEventListener('click',closePendingAppointmentsModal));
document.querySelector('[data-go-confirmations]')?.addEventListener('click',()=>{closePendingAppointmentsModal();showPage('confirmacoes')});
document.getElementById('quickRevenue')?.addEventListener('click',openRevenueModal);
document.querySelectorAll('[data-close-revenue]').forEach(b=>b.addEventListener('click',closeRevenueModal));
document.getElementById('revenueViewMode')?.addEventListener('change',renderRevenueModal);
document.getElementById('quickBookingLink')?.addEventListener('click',openBookingLinkModal);
document.querySelectorAll('[data-close-booking-link]').forEach(b=>b.addEventListener('click',closeBookingLinkModal));
document.getElementById('quickCopyPatientLink')?.addEventListener('click',copyQuickPatientLink);
document.getElementById('quickOpenPatientLink')?.addEventListener('click',()=>{closeBookingLinkModal();openPatientPreview()});
apptForm.onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),apptPhone=whatsappFieldValue(f.get('phone'));if(!validLocalWhatsapp(apptPhone)){toast('Informe o WhatsApp do paciente com 11 números, por exemplo 98981452367.');return}const raw=String(f.get('slot')||''),[start,end]=raw.split('|');if(!start||!end){toast('Escolha um horário disponível.');return}const date=String(f.get('date')||''),slot=getSlotsForDate(date).find(s=>s.start===start&&s.end===end);if(!slot){toast('Este horário não existe mais na agenda. Atualize a data e escolha novamente.');updateApptTimes();return}if(isSlotBusy(date,slot)){toast(`O horário ${slot.start} às ${slot.end} já está ocupado ou reservado.`);updateApptTimes();return}const status=String(f.get('status')||'Aguardando confirmação'),booking={id:`appt-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,name:f.get('name'),phone:apptPhone,email:f.get('email'),time:slot.start,end:slot.end,slotStart:slot.start,slotEnd:slot.end,date,status,paymentStatus:status==='Confirmado'?'Pago':(status.toLowerCase().includes('pagamento')?'Aguardando pagamento':'Não informado'),paymentAmount:status==='Confirmado'?(Number(getPaymentConfig().amount)||0):0,source:'Dentista'};appointments.push(booking);syncAppointmentPaymentLedger(booking);persistPaymentLedger();persistAppointments();upsertPatient(booking);refreshPatientFinancialMinimums(booking.name);renderToday();renderPatients();renderCalendar();renderAvailable(selectedDate);renderConfirmations();refreshFinancialViews();refreshPatientLink();closeAppt();toast(status==='Confirmado'?`Atendimento confirmado no horário ${slot.start} às ${slot.end}.`:`Solicitação reservada no horário ${slot.start} às ${slot.end} e ainda não aparece na agenda.`)};payForm.onsubmit=e=>{e.preventDefault();sendPaymentRequestFromModal()};
document.getElementById('apptDate').addEventListener('change',updateApptTimes);document.getElementById('saveAvailability').addEventListener('click',saveAvailability);
const activePix=document.getElementById('activeDentistPix'),activePixReceiver=document.getElementById('activeDentistPixReceiver'),activeCardLink=document.getElementById('activeDentistCardLink');if(activePix)activePix.value=activeDentist.pixKey||'';if(activePixReceiver)activePixReceiver.value=activeDentist.pixReceiver||'';if(activeCardLink)activeCardLink.value=activeDentist.cardPaymentLink||'';document.getElementById('saveDentistPaymentData')?.addEventListener('click',()=>{activeDentist.pixKey=activePix.value.trim();activeDentist.pixReceiver=activePixReceiver.value.trim();activeDentist.cardPaymentLink=activeCardLink.value.trim();dentists=dentists.map(d=>d.id===activeDentistId?{...d,pixKey:activeDentist.pixKey,pixReceiver:activeDentist.pixReceiver,cardPaymentLink:activeDentist.cardPaymentLink}:d);saveDentists();renderDentistCentral();refreshPatientLink();toast('PIX e link de cartão salvos para esta agenda.');});
const payment=getPaymentConfig();document.getElementById('paymentExplanation').value=payment.explanation;document.getElementById('paymentAmount').value=payment.amount;document.getElementById('paymentMethod').value=payment.method;document.getElementById('paymentRequired').checked=payment.required;
document.getElementById('savePaymentConfig').addEventListener('click',()=>{localStorage.setItem(dentistKey('PaymentExplanation'),document.getElementById('paymentExplanation').value);localStorage.setItem(dentistKey('PaymentAmount'),document.getElementById('paymentAmount').value);localStorage.setItem(dentistKey('PaymentMethod'),document.getElementById('paymentMethod').value);localStorage.setItem(dentistKey('PaymentRequired'),document.getElementById('paymentRequired').checked?'1':'0');toast('Configuração de pagamento desta agenda salva.');refreshPatientLink();renderDentistFinancialSummary()});
syncBookingModelControls();
document.querySelectorAll('input[name="bookingModel"]').forEach(input=>input.addEventListener('change',syncBookingModelControls));
document.getElementById('saveBookingModel')?.addEventListener('click',saveBookingModel);
const reminderIds=['patientReminder8h','patientReminder2h','dentistReminder7d','dentistReminder1d','dentistReminder2h','weeklySummaryEnabled'];reminderIds.forEach(id=>{const el=document.getElementById(id),saved=localStorage.getItem(dentistKey('Reminder_'+id));if(saved!==null)el.checked=saved==='1'});const savedDentistWhatsapp=localStorage.getItem(dentistKey('DentistWhatsapp'))||activeDentist.whatsapp;if(savedDentistWhatsapp)document.getElementById('dentistWhatsapp').value=savedDentistWhatsapp;const savedSummaryDay=localStorage.getItem(dentistKey('WeeklySummaryDay'));if(savedSummaryDay!==null)document.getElementById('weeklySummaryDay').value=savedSummaryDay;const savedSummaryTime=localStorage.getItem(dentistKey('WeeklySummaryTime'));if(savedSummaryTime)document.getElementById('weeklySummaryTime').value=savedSummaryTime;
document.getElementById('saveReminderConfig').addEventListener('click',()=>{const phone=whatsappFieldValue(document.getElementById('dentistWhatsapp').value);if(phone&&!validLocalWhatsapp(phone)){toast('O WhatsApp do dentista deve ter exatamente 11 números, por exemplo 98981452367.');return}reminderIds.forEach(id=>localStorage.setItem(dentistKey('Reminder_'+id),document.getElementById(id).checked?'1':'0'));localStorage.setItem(dentistKey('DentistWhatsapp'),phone);localStorage.setItem(dentistKey('WeeklySummaryDay'),document.getElementById('weeklySummaryDay').value);localStorage.setItem(dentistKey('WeeklySummaryTime'),document.getElementById('weeklySummaryTime').value);activeDentist.whatsapp=phone;dentists=dentists.map(d=>d.id===activeDentistId?{...d,whatsapp:phone}:d);saveDentists();renderDentistCentral();toast('Configuração de lembretes desta agenda salva.')});
const patientLink=document.getElementById('patientLink'),copyPatientLink=document.getElementById('copyPatientLink'),previewPatientLink=document.getElementById('previewPatientLink');if(patientLink)refreshPatientLink();if(copyPatientLink)copyPatientLink.addEventListener('click',async()=>{refreshPatientLink();try{await navigator.clipboard.writeText(patientLink.value);toast('Link do paciente copiado.')}catch(e){patientLink.select();document.execCommand('copy');toast('Link do paciente copiado.')}});if(previewPatientLink)previewPatientLink.addEventListener('click',openPatientPreview);
const patientBookingForm=document.getElementById('patientBookingForm');
if(patientBookingForm){
  const patientWhatsappInput=patientBookingForm.querySelector('input[name="phone"]');
  const patientWhatsappConfirmed=patientBookingForm.querySelector('#patientWhatsappConfirmed');
  if(patientWhatsappInput){
    patientWhatsappInput.addEventListener('input',()=>{
      patientWhatsappInput.value=formatPatientWhatsapp(patientWhatsappInput.value);
      patientWhatsappInput.setCustomValidity('');
    });
    patientWhatsappInput.addEventListener('blur',()=>{
      if(patientWhatsappInput.value&&!isValidPatientWhatsapp(patientWhatsappInput.value)){
        patientWhatsappInput.setCustomValidity('Informe exatamente 11 números, por exemplo 98981452367.');
      }else patientWhatsappInput.setCustomValidity('');
    });
  }
  patientBookingForm.addEventListener('submit',e=>{
    e.preventDefault();
    const success=document.getElementById('patientSuccess');
    if(patientWhatsappInput&&!isValidPatientWhatsapp(patientWhatsappInput.value)){
      patientWhatsappInput.setCustomValidity('Informe exatamente 11 números, por exemplo 98981452367.');
      patientWhatsappInput.reportValidity();
      success.style.display='block';
      success.textContent='Revise o WhatsApp informado. Use somente 11 números, por exemplo 98981452367.';
      return;
    }
    if(patientWhatsappConfirmed&&!patientWhatsappConfirmed.checked){
      patientWhatsappConfirmed.reportValidity();
      success.style.display='block';
      success.textContent='Confirme que você verificou o número do WhatsApp antes de solicitar o agendamento.';
      return;
    }
    if(!publicSelected){success.style.display='block';success.textContent='Escolha primeiro um dos horários disponíveis.';return}
    const slot=getSlotsForDate(publicSelected.date).find(s=>s.start===publicSelected.start&&s.end===publicSelected.end);
    if(!slot||isSlotBusy(publicSelected.date,slot)){success.style.display='block';success.textContent='Este horário acabou de ser reservado por outra pessoa. Escolha outro horário disponível.';renderPatientPortal();publicSelected=null;return}
    const f=new FormData(e.target),publicPhone=whatsappFieldValue(f.get('phone')),payRequired=getPaymentConfig().required,booking={id:`appt-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,name:f.get('name'),phone:publicPhone,email:f.get('email'),note:f.get('note'),time:slot.start,end:slot.end,slotStart:slot.start,slotEnd:slot.end,date:publicSelected.date,status:payRequired?'Aguardando pagamento':'Aguardando confirmação',source:'Paciente',paymentStatus:payRequired?'Aguardando pagamento':'Não exigido',paymentAmount:0};
    appointments.push(booking);persistAppointments();upsertPatient(booking);renderConfirmations();refreshPatientLink();
    success.style.display='block';
    success.innerHTML=`<strong>Obrigado! Sua solicitação de agendamento foi recebida.</strong><br><br>Seu atendimento para <strong>${publicFormatDate(booking.date)}</strong>, das <strong>${booking.time} às ${booking.end}</strong>, está <strong>aguardando confirmação</strong>. Assim que o agendamento for confirmado, enviaremos uma mensagem para o WhatsApp <strong>${escapeHtml(booking.phone)}</strong> informado por você.<br><br>Agradecemos pela preferência.`;
    e.target.reset();publicSelected=null;publicCalendarCursor=null;renderPatientPortal();document.getElementById('chosenSlot').textContent='Nenhum horário selecionado.';
  });
}
document.getElementById('confirmationFilter')?.addEventListener('change',e=>{confirmationFilter=e.target.value;renderConfirmations()});
document.getElementById('patientBackButton')?.addEventListener('click',()=>{
  if(location.protocol==='file:'&&patientRouteParams().get('paciente')==='1'){
    history.back();
    setTimeout(()=>{if(patientRouteParams().get('paciente')==='1'){history.replaceState({},'',window.location.href.split('#')[0].split('?')[0]);document.body.classList.remove('patient-mode');window.scrollTo({top:0})}},120);
    return;
  }
  if(history.length>1)history.back();else{document.body.classList.remove('patient-mode');history.replaceState({},'',window.location.href.split('#')[0].split('?')[0]);}
});
window.addEventListener('popstate',syncPatientModeFromUrl);
window.addEventListener('hashchange',syncPatientModeFromUrl);

const monthlyGoalInput=document.getElementById('monthlyGoalInput');
if(monthlyGoalInput){monthlyGoalInput.addEventListener('change',saveMonthlyGoal);monthlyGoalInput.addEventListener('blur',()=>{const saved=getMonthlyGoal();if(Number(monthlyGoalInput.value)!==saved)saveMonthlyGoal()})}
renderDentistFinancialSummary();
bindWhatsappDigitFields();

// Fecha modais com a tecla Esc no computador e preserva todos os botões de retorno no mobile.
document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;document.querySelectorAll('.modal.open').forEach(m=>m.classList.remove('open'))});


// ===== ROOTIS V9 · autenticação local pronta para backend =====
let pendingRegister=null,pendingRecovery=null;
function sixDigitCode(){return String(Math.floor(100000+Math.random()*900000))}
function authView(id){document.querySelectorAll('.auth-view').forEach(v=>v.classList.toggle('active',v.id===id));window.scrollTo({top:0,behavior:'smooth'})}
function maskedDestination(channel,value){const raw=String(value||'');if(channel==='email'){const [u,d]=raw.split('@');return u&&d?`${u.slice(0,2)}***@${d}`:raw}const digits=whatsappFieldValue(raw);return digits.length>=4?`(**) *****-${digits.slice(-4)}`:raw}
function demoCodeMessage(channel,destination,code){const names={email:'e-mail',whatsapp:'WhatsApp',sms:'SMS'};return `Código preparado para <strong>${names[channel]||channel}</strong> em ${maskedDestination(channel,destination)}.<br><strong>Modo local:</strong> use o código <strong>${code}</strong>. Na publicação, este código será enviado pelo provedor conectado ao Rootis.`}
function validAuthPhone(v){return /^\d{11}$/.test(whatsappFieldValue(v))}
function uniqueDentistId(name){const base=String(name||'dentista').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'dentista';let id=base,n=1;while(dentists.some(d=>d.id===id)||authAccounts.some(a=>a.userId===id))id=`${base}-${++n}`;return id}
function loginAs(account){localStorage.setItem(ROOTIS_SESSION_USER_KEY,account.userId);localStorage.setItem(ROOTIS_ACTIVE_DENTIST_KEY,account.userId);sessionStorage.setItem('rootisOpenPageAfterReload',account.role==='owner'?'administrador':'dashboard');location.reload()}
function logoutRootis(){localStorage.removeItem(ROOTIS_SESSION_USER_KEY);sessionStorage.removeItem('rootisOpenPageAfterReload');location.reload()}
function showAuth(){document.body.classList.remove('rootis-authenticated');document.getElementById('authShell')?.removeAttribute('hidden');authView('authLoginView')}
function hideAuth(){document.getElementById('authShell')?.setAttribute('hidden','');document.body.classList.add('rootis-authenticated')}
function bindAuthV9(){
  document.getElementById('openRegister')?.addEventListener('click',()=>authView('authRegisterView'));
  document.getElementById('openRecovery')?.addEventListener('click',()=>authView('authRecoveryView'));
  document.querySelectorAll('[data-auth-login]').forEach(b=>b.addEventListener('click',()=>authView('authLoginView')));
  document.getElementById('fillDemoDentist')?.addEventListener('click',()=>{const e=document.getElementById('loginEmail'),p=document.getElementById('loginPassword');if(e)e.value=ROOTIS_DEMO_EMAIL;if(p)p.value='Dentista123*';e?.focus()});
  document.getElementById('loginForm')?.addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.target),account=accountByLogin(f.get('email'));if(!account||rootisLocalHash(f.get('password'))!==account.passwordHash){toast('E-mail ou senha incorretos.');return}loginAs(account)});
  document.getElementById('sendRegisterCode')?.addEventListener('click',()=>{
    const form=document.getElementById('registerForm'),f=new FormData(form),name=String(f.get('name')||'').trim(),email=String(f.get('email')||'').trim().toLowerCase(),phone=whatsappFieldValue(f.get('phone')),password=String(f.get('password')||''),confirm=String(f.get('passwordConfirm')||''),channel=String(f.get('channel')||'email');
    if(!name||!email||!phone){toast('Preencha nome, e-mail e celular.');return}if(!validAuthPhone(phone)){toast('Informe um celular com 11 números.');return}if(password.length<6){toast('A senha precisa ter pelo menos 6 caracteres.');return}if(password!==confirm){toast('As senhas não conferem.');return}if(authAccounts.some(a=>String(a.email||'').toLowerCase()===email)){toast('Já existe uma conta com este e-mail.');return}
    const code=sixDigitCode(),destination=channel==='email'?email:phone;pendingRegister={code,expires:Date.now()+10*60*1000,data:{name,email,phone,cro:String(f.get('cro')||'').trim(),specialty:String(f.get('specialty')||'').trim(),clinic:String(f.get('clinic')||'').trim(),passwordHash:rootisLocalHash(password),channel}};
    const step=document.getElementById('registerCodeStep'),status=document.getElementById('registerDeliveryStatus');if(step)step.hidden=false;if(status)status.innerHTML=demoCodeMessage(channel,destination,code);document.getElementById('registerCodeInput')?.focus();
  });
  document.getElementById('confirmRegister')?.addEventListener('click',()=>{
    const code=String(document.getElementById('registerCodeInput')?.value||'').trim();if(!pendingRegister||Date.now()>pendingRegister.expires){toast('O código expirou. Envie um novo código.');return}if(code!==pendingRegister.code){toast('Código de ativação incorreto.');return}
    const d=pendingRegister.data,id=uniqueDentistId(d.name),dentist={id,name:d.name,cro:d.cro,specialty:d.specialty,clinic:d.clinic,whatsapp:d.phone,email:d.email,pixKey:'',pixReceiver:'',cardPaymentLink:'',createdAt:new Date().toISOString()};dentists.push(dentist);saveDentists();authAccounts.push({userId:id,role:'dentist',name:d.name,email:d.email,phone:d.phone,passwordHash:d.passwordHash,verified:true,createdAt:new Date().toISOString()});saveAuthAccounts();pendingRegister=null;loginAs(authAccounts[authAccounts.length-1]);
  });
  document.getElementById('sendRecoveryCode')?.addEventListener('click',()=>{
    const identifier=document.getElementById('recoveryIdentifier')?.value||'',channel=document.getElementById('recoveryChannel')?.value||'email',account=accountByLogin(identifier);if(!account){toast('Conta não encontrada.');return}if(channel==='email'&&!account.email){toast('Essa conta não possui e-mail de recuperação.');return}if(channel==='sms'&&!account.phone){toast('Essa conta não possui celular de recuperação.');return}
    const code=sixDigitCode(),destination=channel==='email'?account.email:account.phone;pendingRecovery={code,expires:Date.now()+10*60*1000,userId:account.userId};const step=document.getElementById('recoveryCodeStep'),status=document.getElementById('recoveryDeliveryStatus');if(step)step.hidden=false;if(status)status.innerHTML=demoCodeMessage(channel,destination,code);document.getElementById('recoveryCodeInput')?.focus();
  });
  document.getElementById('confirmRecovery')?.addEventListener('click',()=>{
    const code=String(document.getElementById('recoveryCodeInput')?.value||'').trim(),password=String(document.getElementById('recoveryNewPassword')?.value||''),confirm=String(document.getElementById('recoveryNewPasswordConfirm')?.value||'');if(!pendingRecovery||Date.now()>pendingRecovery.expires){toast('O código expirou. Solicite outro.');return}if(code!==pendingRecovery.code){toast('Código de recuperação incorreto.');return}if(password.length<6){toast('A nova senha precisa ter pelo menos 6 caracteres.');return}if(password!==confirm){toast('As novas senhas não conferem.');return}
    authAccounts=authAccounts.map(a=>a.userId===pendingRecovery.userId?{...a,passwordHash:rootisLocalHash(password),passwordUpdatedAt:new Date().toISOString()}:a);saveAuthAccounts();pendingRecovery=null;toast('Senha atualizada. Entre com a nova senha.');document.getElementById('loginEmail').value=String(document.getElementById('recoveryIdentifier')?.value||'');document.getElementById('loginPassword').value='';authView('authLoginView');
  });
  document.getElementById('logoutButton')?.addEventListener('click',logoutRootis);
}
function startRootisV9(){
  bindAuthV9();
  const patientMode=initPatientMode();
  if(patientMode){document.getElementById('authShell')?.setAttribute('hidden','');document.body.classList.remove('rootis-authenticated');return}
  const account=accountByUserId(sessionUserId);if(!account){showAuth();return}
  if(account.role!=='owner'){activeDentistId=account.userId;localStorage.setItem(ROOTIS_ACTIVE_DENTIST_KEY,activeDentistId);if(!dentists.some(d=>d.id===activeDentistId)){localStorage.removeItem(ROOTIS_SESSION_USER_KEY);showAuth();return}}
  hideAuth();renderDentistUI();renderDentistCentral();renderToday();renderPatients();renderAvailabilityEditor();renderCalendar();renderAvailable(selectedDate);renderConfirmations();const requested=sessionStorage.getItem('rootisOpenPageAfterReload');if(requested){sessionStorage.removeItem('rootisOpenPageAfterReload');if(titles[requested]&&(requested!=='administrador'||isPlatformOwner()))showPage(requested,{remember:false,scroll:false});}
}
startRootisV9();
