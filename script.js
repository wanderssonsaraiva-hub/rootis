const ROOTIS_DENTISTS_KEY='rootisDentistsV2';
const ROOTIS_ACTIVE_DENTIST_KEY='rootisActiveDentistIdV2';
const DEFAULT_DENTIST_ID='wandersson-saraiva';
const CARLA_DENTIST_ID='carla-matos-demo';
const ROOTIS_SESSION_USER_KEY='rootisSessionUserIdV2';
// Dr. Wandersson é o proprietário da plataforma. Isso só é exibido na aba Administrador.
let sessionUserId=localStorage.getItem(ROOTIS_SESSION_USER_KEY)||DEFAULT_DENTIST_ID;
const isPlatformOwner=()=>sessionUserId===DEFAULT_DENTIST_ID;
const defaultDentist={id:DEFAULT_DENTIST_ID,name:'Dr. Wandersson Saraiva',cro:'8240',specialty:'Implantes e Endodontia',clinic:'Rootis',whatsapp:'',email:'saraiva@gmail.com',pixKey:'',pixReceiver:'',cardPaymentLink:'',bookingView:'calendar',createdAt:'2026-09-25'};
const carlaDemoDentist={id:CARLA_DENTIST_ID,name:'Dra. Carla Matos',cro:'CRO-SP 12345',specialty:'Endodontia e Dentística',clinic:'Clínica Carla Matos',whatsapp:'(11) 99999-1234',email:'carla.matos@exemplo.com',pixKey:'carla.matos@exemplo.com',pixReceiver:'Dra. Carla Matos',cardPaymentLink:'',bookingView:'calendar',createdAt:'2026-09-25',isDemo:true};
let dentists=JSON.parse(localStorage.getItem(ROOTIS_DENTISTS_KEY)||'null')||[defaultDentist,carlaDemoDentist];
if(!Array.isArray(dentists)||!dentists.length)dentists=[defaultDentist,carlaDemoDentist];
// Garante que proprietário e dentista de demonstração existam nesta versão.
if(!dentists.some(d=>d.id===DEFAULT_DENTIST_ID))dentists.unshift(defaultDentist);
if(!dentists.some(d=>d.id===CARLA_DENTIST_ID))dentists.push(carlaDemoDentist);
dentists=dentists.map(d=>({...d,pixKey:d.pixKey||'',pixReceiver:d.pixReceiver||'',cardPaymentLink:d.cardPaymentLink||'',bookingView:(d.bookingView==='list'?'list':'calendar')}));
localStorage.setItem(ROOTIS_DENTISTS_KEY,JSON.stringify(dentists));
// A agenda/perfil de exemplo abre como Dra. Carla Matos; o proprietário continua autenticado como dono.
let activeDentistId=localStorage.getItem(ROOTIS_ACTIVE_DENTIST_KEY)||CARLA_DENTIST_ID;
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
 {name:'Mariana Souza',phone:'(11) 99999-0000',time:'08:00',end:'11:00',slotStart:'08:00',slotEnd:'11:00',date:'2026-09-25',status:'Confirmado',paymentStatus:'Pago'},
 {name:'Lucas Martins',phone:'(11) 98888-1111',time:'12:00',end:'15:00',slotStart:'12:00',slotEnd:'15:00',date:'2026-09-25',status:'Confirmado',paymentStatus:'Pago'},
 {name:'Ana Ferreira',phone:'(11) 97777-2222',time:'16:00',end:'19:00',slotStart:'16:00',slotEnd:'19:00',date:'2026-09-25',status:'Aguardando pagamento',paymentStatus:'Aguardando pagamento'},
 {name:'Carlos Mendes',phone:'(11) 96666-3333',time:'08:00',end:'11:00',slotStart:'08:00',slotEnd:'11:00',date:'2026-09-28',status:'Aguardando pagamento',paymentStatus:'Aguardando pagamento'},
 {name:'Juliana Rocha',phone:'',time:'12:00',end:'15:00',slotStart:'12:00',slotEnd:'15:00',date:'2026-09-28',status:'Confirmado',paymentStatus:'Pago'},
 {name:'Rafael Nunes',phone:'',time:'16:00',end:'19:00',slotStart:'16:00',slotEnd:'19:00',date:'2026-09-30',status:'Confirmado',paymentStatus:'Pago'}
];
const seedPatients=[
 {name:'Mariana Souza',phone:'(11) 99999-0000',last:'25/09/2026',next:'02/10 · 10:00'},
 {name:'Lucas Martins',phone:'(11) 98888-1111',last:'24/09/2026',next:'—'},
 {name:'Ana Ferreira',phone:'(11) 97777-2222',last:'23/09/2026',next:'30/09 · 11:00'},
 {name:'Carlos Mendes',phone:'(11) 96666-3333',last:'20/09/2026',next:'01/10 · 14:00'}
];
let appointments=JSON.parse(localStorage.getItem(dentistKey('AppointmentsV1'))||'null');
if(!appointments)appointments=activeDentistId===CARLA_DENTIST_ID?seedAppointments.map(a=>({...a})):[];
appointments=appointments.map((a,i)=>({...a,id:a.id||`appt-${String(a.date||'').replace(/\D/g,'')}-${String(a.time||'').replace(/\D/g,'')}-${i}`,paymentAmount:Number(a.paymentAmount??((a.status==='Confirmado'&&a.paymentStatus==='Pago')?(localStorage.getItem(dentistKey('PaymentAmount'))||100):0))||0}));
let patients=JSON.parse(localStorage.getItem(dentistKey('PatientsV1'))||'null');
if(!patients)patients=activeDentistId===CARLA_DENTIST_ID?seedPatients.map(p=>({...p})):[];
function persistAppointments(){localStorage.setItem(dentistKey('AppointmentsV1'),JSON.stringify(appointments))}
function persistPatients(){localStorage.setItem(dentistKey('PatientsV1'),JSON.stringify(patients))}
function patientDetailsKey(){return dentistKey('PatientDetailsV1')}
let patientDetails=JSON.parse(localStorage.getItem(patientDetailsKey())||'{}')||{};
function persistPatientDetails(){localStorage.setItem(patientDetailsKey(),JSON.stringify(patientDetails))}
function patientDetailId(patientOrName){const name=typeof patientOrName==='string'?patientOrName:patientOrName?.name;return String(name||'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
function getPatientDetail(patient){const key=patientDetailId(patient);if(!patientDetails[key])patientDetails[key]={};return patientDetails[key]}
function savePatientDetail(patient,patch){const key=patientDetailId(patient);patientDetails[key]={...(patientDetails[key]||{}),...patch};persistPatientDetails();return patientDetails[key]}
function upsertPatient(booking){
  if(!booking.name)return;
  let p=patients.find(x=>x.name.toLowerCase()===String(booking.name).toLowerCase());
  const next=`${booking.date.split('-').reverse().slice(0,2).join('/')} · ${booking.time}`;
  if(!p){p={name:booking.name,phone:booking.phone||'',email:booking.email||'',last:'—',next};patients.push(p)}else{if(booking.phone)p.phone=booking.phone;if(booking.email)p.email=booking.email;p.next=next}
  persistPatients();
}

const title=document.getElementById('title'),subtitle=document.getElementById('subtitle');
const todayList=document.getElementById('todayList'),patientSearch=document.getElementById('patientSearch'),patientDirectory=document.getElementById('patientDirectory');
const attendanceSearch=document.getElementById('attendanceSearch'),attendanceStatusFilter=document.getElementById('attendanceStatusFilter'),attendancePaymentFilter=document.getElementById('attendancePaymentFilter'),attendancePeriodFilter=document.getElementById('attendancePeriodFilter');
const calendar=document.getElementById('calendar');
const newAppt=document.getElementById('newAppt'),newAppt2=document.getElementById('newAppt2'),quickAppt=document.getElementById('quickAppt');
const openPayment=document.getElementById('openPayment'),quickPay=document.getElementById('quickPay');
const apptForm=document.getElementById('apptForm'),payForm=document.getElementById('payForm');
const titles={perfil:['Meu perfil','Cadastro, agenda, pagamentos e lembretes do dentista.'],dashboard:['Dashboard','Sua agenda de forma simples.'],confirmacoes:['Confirmações','Aprove, cancele e avise pacientes pelo WhatsApp.'],agenda:['Agenda','Calendário e horários disponíveis.'],atendimentos:['Atendimentos','Histórico, pagamentos e próximos procedimentos.'],pacientes:['Pacientes','Cadastros e resumos individuais.'],administrador:['Administrador','Área exclusiva do proprietário da plataforma.']};
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
  currentPageId=id;title.textContent=titles[id][0];subtitle.textContent=titles[id][1];updateMobileNavigation(id);if(id==='confirmacoes')renderConfirmations();if(id==='atendimentos')renderAttendances();if(id==='pacientes'){showPatientList();renderPatients(patientSearch?.value||'');}
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
function getMonthlyGoal(){const saved=localStorage.getItem(dentistKey('MonthlyGoal'));return Math.max(0,Number(saved===null?5000:saved)||0)}
function currentMonthRevenue(){
  const now=new Date(),year=now.getFullYear(),month=now.getMonth()+1;
  return appointments.filter(a=>{
    const parts=String(a.date||'').split('-');
    return Number(parts[0])===year&&Number(parts[1])===month&&a.status==='Confirmado'&&a.paymentStatus==='Pago';
  }).reduce((sum,a)=>sum+(Number(a.paymentAmount)||0),0);
}
function renderDentistFinancialSummary(){
  const revenueEl=document.getElementById('monthlyRevenueValue'),goalEl=document.getElementById('monthlyGoalInput'),remainingEl=document.getElementById('monthlyRemainingValue'),labelEl=document.getElementById('monthlyRevenueLabel'),statusEl=document.getElementById('monthlyGoalStatus');
  if(!revenueEl||!goalEl||!remainingEl)return;
  const now=new Date(),monthName=now.toLocaleDateString('pt-BR',{month:'long'}),revenue=currentMonthRevenue(),goal=getMonthlyGoal(),remaining=Math.max(goal-revenue,0);
  if(labelEl)labelEl.textContent=`Faturado em ${monthName}`;
  revenueEl.textContent=moneyBR(revenue);goalEl.value=String(goal);remainingEl.textContent=moneyBR(remaining);
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
  const hour=new Date().getHours();const greeting=hour<12?'Bom dia':hour<18?'Boa tarde':'Boa noite';document.getElementById('welcomeDentist').textContent=`${greeting}, ${activeDentist.name}. Aqui está sua agenda de hoje.`;
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
  document.querySelectorAll('input[name="patientBookingView"]').forEach(r=>r.checked=r.value===(activeDentist.bookingView||'calendar'));
  const del=document.getElementById('deleteOwnDentist'),help=document.getElementById('profileDeleteHelp');
  const ownerProfile=activeDentistId===DEFAULT_DENTIST_ID;
  if(del){del.disabled=ownerProfile;del.textContent=ownerProfile?'Cadastro protegido':'Excluir meu cadastro';}
  if(help)help.textContent=ownerProfile?'Este cadastro principal é protegido e não pode ser excluído por esta tela.':'Ao excluir o cadastro, os dados locais desta agenda serão removidos deste navegador.';
}
function renderDentistCentral(){
  const count=document.getElementById('dentistCount');if(count)count.textContent=dentists.length;
  const active=document.getElementById('activeDentistCard');if(active)active.innerHTML=`<div class="central-dentist-profile"><div class="central-avatar">${initials(activeDentist.name)}</div><div><h4>${activeDentist.name}</h4><p>${profileMeta(activeDentist)}</p><p>${activeDentist.whatsapp||'WhatsApp ainda não informado'}${activeDentist.email?` · ${activeDentist.email}`:''}</p><p>${activeDentist.pixKey?'PIX cadastrado':'PIX não cadastrado'} · ${activeDentist.cardPaymentLink?'Cartão cadastrado':'Link de cartão não cadastrado'}</p></div></div>`;
  const list=document.getElementById('dentistList');if(!list)return;
  list.innerHTML=dentists.map(d=>`<div class="dentist-item ${d.id===activeDentistId?'active-dentist':''}"><div class="dentist-item-avatar">${initials(d.name)}</div><div><strong>${d.name}</strong><small>${profileMeta(d)}</small>${d.id===DEFAULT_DENTIST_ID?'<small class="owner-inline">Proprietário da plataforma</small>':''}</div><div class="dentist-item-actions">${d.id===activeDentistId?'<button type="button" disabled>Agenda ativa</button>':`<button type="button" class="open-dentist" data-open-dentist="${d.id}">Abrir agenda</button>`}<button type="button" class="edit-dentist" data-edit-dentist="${d.id}">Editar perfil</button><button type="button" class="remove-dentist" data-remove-dentist="${d.id}" ${d.id===DEFAULT_DENTIST_ID?'disabled':''}>Excluir</button></div></div>`).join('');
  document.querySelectorAll('[data-open-dentist]').forEach(btn=>btn.onclick=()=>{localStorage.setItem(ROOTIS_ACTIVE_DENTIST_KEY,btn.dataset.openDentist);sessionStorage.setItem('rootisOpenPageAfterReload','dashboard');location.reload()});
  document.querySelectorAll('[data-edit-dentist]').forEach(btn=>btn.onclick=()=>{localStorage.setItem(ROOTIS_ACTIVE_DENTIST_KEY,btn.dataset.editDentist);sessionStorage.setItem('rootisOpenPageAfterReload','perfil');location.reload()});
  document.querySelectorAll('[data-remove-dentist]').forEach(btn=>btn.onclick=()=>removeDentist(btn.dataset.removeDentist));
}
function removeDentist(id){
  const d=dentists.find(x=>x.id===id);if(!d||id===DEFAULT_DENTIST_ID)return toast('A conta proprietária da plataforma é protegida.');
  if(!confirm(`Excluir o perfil de ${d.name}? Os dados locais desta agenda também serão apagados neste navegador.`))return;
  Object.keys(localStorage).filter(k=>k.startsWith(`rootisDentist_${id}_`)).forEach(k=>localStorage.removeItem(k));
  dentists=dentists.filter(x=>x.id!==id);saveDentists();
  if(activeDentistId===id){const fallback=dentists.some(x=>x.id===CARLA_DENTIST_ID)?CARLA_DENTIST_ID:DEFAULT_DENTIST_ID;localStorage.setItem(ROOTIS_ACTIVE_DENTIST_KEY,fallback);sessionStorage.setItem('rootisOpenPageAfterReload','administrador');location.reload();return}
  renderDentistCentral();toast('Dentista removido da plataforma.');
}
const dentistForm=document.getElementById('dentistForm');
if(dentistForm)dentistForm.addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.target);const name=String(f.get('name')||'').trim();if(!name)return;const base=name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'dentista';const id=`${base}-${Date.now().toString().slice(-6)}`;const d={id,name,cro:String(f.get('cro')||'').trim(),specialty:String(f.get('specialty')||'').trim(),clinic:String(f.get('clinic')||'').trim(),whatsapp:String(f.get('whatsapp')||'').trim(),email:String(f.get('email')||'').trim(),pixKey:String(f.get('pixKey')||'').trim(),pixReceiver:'',cardPaymentLink:String(f.get('cardPaymentLink')||'').trim(),bookingView:'calendar',createdAt:new Date().toISOString()};dentists.push(d);saveDentists();localStorage.setItem(ROOTIS_ACTIVE_DENTIST_KEY,id);location.reload()});
const profileDentistForm=document.getElementById('profileDentistForm');
if(profileDentistForm)profileDentistForm.addEventListener('submit',e=>{
  e.preventDefault();const f=new FormData(e.target);const name=String(f.get('name')||'').trim();if(!name)return;
  const patch={name,cro:String(f.get('cro')||'').trim(),specialty:String(f.get('specialty')||'').trim(),clinic:String(f.get('clinic')||'').trim(),whatsapp:String(f.get('whatsapp')||'').trim(),email:String(f.get('email')||'').trim()};
  activeDentist={...activeDentist,...patch};dentists=dentists.map(d=>d.id===activeDentistId?{...d,...patch}:d);saveDentists();
  const dentistWhats=document.getElementById('dentistWhatsapp');if(dentistWhats)dentistWhats.value=activeDentist.whatsapp||'';
  renderDentistUI();renderDentistCentral();refreshPatientLink();toast('Cadastro profissional atualizado.');
});
document.getElementById('deleteOwnDentist')?.addEventListener('click',()=>removeDentist(activeDentistId));
document.querySelectorAll('[data-profile-target]').forEach(btn=>btn.addEventListener('click',()=>{document.getElementById(btn.dataset.profileTarget)?.scrollIntoView({behavior:'smooth',block:'start'})}));



function openDashboardProfileTarget(targetId){
  showPage('perfil');
  setTimeout(()=>document.getElementById(targetId)?.scrollIntoView({behavior:'smooth',block:'start'}),120);
}
document.querySelectorAll('[data-dashboard-profile-target]').forEach(btn=>btn.addEventListener('click',()=>openDashboardProfileTarget(btn.dataset.dashboardProfileTarget)));

const mobileNotificationTimers=[];
function rootisIsMobile(){return window.matchMedia('(max-width: 900px)').matches||/Android|iPhone|iPad|iPod/i.test(navigator.userAgent||'')}
function updateMobileNotificationCard(){
  const card=document.getElementById('mobileNotificationCard');if(!card)return;
  const titleEl=document.getElementById('mobileNotificationTitle'),textEl=document.getElementById('mobileNotificationText'),helpEl=document.getElementById('mobileNotificationHelp'),btn=document.getElementById('enableMobileNotifications');
  if(!rootisIsMobile()){card.style.display='none';return}
  if(localStorage.getItem(dentistKey('MobileNotificationDismissed'))==='1'){card.style.display='none';return}
  card.style.display='flex';card.classList.remove('enabled','blocked');
  if(!('Notification' in window)){
    card.classList.add('blocked');titleEl.textContent='Notificações indisponíveis neste navegador';textEl.textContent='Este navegador não oferece notificações para esta página.';helpEl.textContent='Você continua vendo seus atendimentos normalmente no Dashboard.';btn.style.display='none';return;
  }
  if(Notification.permission==='granted'){
    card.classList.add('enabled');titleEl.textContent='Notificações no celular ativadas';textEl.textContent='O Rootis avisará sobre os próximos atendimentos enquanto esta versão local estiver aberta.';helpEl.textContent='Na versão online, os avisos poderão funcionar também em segundo plano.';btn.style.display='none';return;
  }
  if(Notification.permission==='denied'){
    card.classList.add('blocked');titleEl.textContent='Notificações bloqueadas neste aparelho';textEl.textContent='Libere as notificações nas configurações do navegador para receber os avisos.';helpEl.textContent='Depois, volte ao Rootis e tente novamente.';btn.style.display='none';return;
  }
  titleEl.textContent='Ative as notificações no celular';textEl.textContent='Receba um aviso no celular antes dos seus atendimentos confirmados.';helpEl.textContent='Nesta versão local, os avisos funcionam enquanto o Rootis estiver aberto.';btn.style.display='inline-flex';
}
async function enableMobileNotifications(){
  if(!rootisIsMobile()||!('Notification' in window))return updateMobileNotificationCard();
  try{
    const permission=await Notification.requestPermission();
    updateMobileNotificationCard();
    if(permission==='granted'){
      try{new Notification('Rootis', {body:'Notificações ativadas. Você receberá avisos dos seus atendimentos.'})}catch(e){}
      scheduleMobileAppointmentNotifications();
    }
  }catch(e){updateMobileNotificationCard()}
}
function mobileNotificationKey(a){return dentistKey(`MobileNotif_${a.id}_${a.date}_${a.time}`)}
function sendAppointmentMobileNotification(a){
  if(!rootisIsMobile()||!('Notification' in window)||Notification.permission!=='granted')return;
  const key=mobileNotificationKey(a);if(sessionStorage.getItem(key)==='1')return;
  const slot=getConfiguredSlotForBooking(a);const start=slot?.start||a.time,end=slot?.end||a.end;
  try{new Notification('Rootis • Próximo atendimento',{body:`${a.name} · ${start}${end?` às ${end}`:''}`,tag:key})}catch(e){}
  sessionStorage.setItem(key,'1');
}
function scheduleMobileAppointmentNotifications(){
  mobileNotificationTimers.splice(0).forEach(t=>clearTimeout(t));
  updateMobileNotificationCard();
  if(!rootisIsMobile()||!('Notification' in window)||Notification.permission!=='granted')return;
  const now=Date.now();
  appointments.filter(a=>a.status==='Confirmado').forEach(a=>{
    const slot=getConfiguredSlotForBooking(a);const start=slot?.start||a.time;if(!a.date||!start)return;
    const apptTs=new Date(`${a.date}T${start}:00`).getTime();if(!Number.isFinite(apptTs)||apptTs<=now)return;
    const notifyTs=apptTs-(2*60*60*1000),delay=notifyTs-now;
    if(delay<=0&&apptTs-now<=2*60*60*1000){sendAppointmentMobileNotification(a);return}
    if(delay>0&&delay<2147483647)mobileNotificationTimers.push(setTimeout(()=>sendAppointmentMobileNotification(a),delay));
  });
}
document.getElementById('enableMobileNotifications')?.addEventListener('click',enableMobileNotifications);
document.getElementById('dismissMobileNotification')?.addEventListener('click',()=>{localStorage.setItem(dentistKey('MobileNotificationDismissed'),'1');updateMobileNotificationCard()});
window.addEventListener('resize',updateMobileNotificationCard);

function badge(s){s=String(s||'');const c=s==='Confirmado'?'ok':s==='Cancelado'?'cancelled':s.includes('pagamento')?'paid':'pending';return `<span class="badge ${c}">${s||'Sem status'}</span>`}
function renderToday(){
  const today=isoToday();
  const confirmedItems=appointments.filter(a=>a.status==='Confirmado');
  const items=confirmedItems.filter(a=>a.date===today).sort((a,b)=>String(a.time||'').localeCompare(String(b.time||'')));
  const todayCount=document.getElementById('todayActiveCount');if(todayCount)todayCount.textContent=`${items.length} atendimento${items.length===1?'':'s'} ativo${items.length===1?'':'s'}`;
  const subtitle=document.getElementById('todayAgendaSubtitle');if(subtitle)subtitle.textContent=`${items.length} atendimento${items.length===1?'':'s'} confirmado${items.length===1?'':'s'}`;
  todayList.innerHTML=items.length?items.map(a=>{
    const slot=getConfiguredSlotForBooking(a);const start=slot?.start||a.time,end=slot?.end||a.end;
    const result=String(a.attendanceResult||'');
    return `<div class="dashboard-appt-row ${result==='Atendido'?'is-attended':result==='Não atendido'?'is-missed':''}">
      <div class="dashboard-appt-time">${start}</div>
      <div class="dashboard-appt-main"><strong>${escapeHtml(a.name)}</strong><small>${end?`${start} às ${end}`:start} · ${result||'Aguardando atendimento'}</small></div>
      <div class="dashboard-attendance-actions">
        <button type="button" class="dashboard-attendance-btn attended ${result==='Atendido'?'active':''}" data-attendance-result="Atendido" data-attendance-id="${a.id}">✓ Atendido</button>
        <button type="button" class="dashboard-attendance-btn missed ${result==='Não atendido'?'active':''}" data-attendance-result="Não atendido" data-attendance-id="${a.id}">× Não atendido</button>
      </div>
    </div>`;
  }).join(''):'<div class="dashboard-no-appts">Nenhum atendimento confirmado nesta agenda hoje.</div>';
  document.querySelectorAll('[data-attendance-id]').forEach(btn=>btn.onclick=()=>setDashboardAttendanceResult(btn.dataset.attendanceId,btn.dataset.attendanceResult));
  const stat=document.getElementById('statToday');if(stat)stat.textContent=items.length;
  const statNote=document.getElementById('statTodayNote');if(statNote)statNote.textContent=`${items.length} confirmado${items.length===1?'':'s'} hoje`;
  const now=new Date();
  const next=confirmedItems.filter(a=>{const slot=getConfiguredSlotForBooking(a);const dt=new Date(`${a.date}T${slot?.start||a.time||'00:00'}:00`);return dt>=now}).sort((a,b)=>(a.date+(getConfiguredSlotForBooking(a)?.start||a.time||'')).localeCompare(b.date+(getConfiguredSlotForBooking(b)?.start||b.time||'')))[0];
  const nextSlot=next?getConfiguredSlotForBooking(next):null;
  document.getElementById('nextApptTime').textContent=next?(nextSlot?.start||next.time):'—';document.getElementById('nextApptName').textContent=next?next.name:'Sem próximo atendimento confirmado';
  document.getElementById('pendingPayments').textContent=appointments.filter(a=>a.status!=='Cancelado'&&String(a.status).toLowerCase().includes('pagamento')).length;
  updateConfirmationCounts();
  const quickBadge=document.getElementById('quickPendingBadge');if(quickBadge)quickBadge.textContent=document.getElementById('pendingConfirmationsCount')?.textContent||'0';
  scheduleMobileAppointmentNotifications();
}
function setDashboardAttendanceResult(id,result){
  const appt=appointments.find(a=>a.id===id);if(!appt)return;
  appt.attendanceResult=appt.attendanceResult===result?'':result;
  persistAppointments();renderToday();renderAttendances();
  toast(appt.attendanceResult?`Atendimento marcado como ${appt.attendanceResult.toLowerCase()}.`:'Marcação do atendimento removida.');
}
let selectedPatientIndex=0;
function patientAppointmentsFor(p){return appointments.filter(a=>String(a.name||'').toLowerCase()===String(p?.name||'').toLowerCase()).sort((a,b)=>(String(b.date||'')+String(b.time||'')).localeCompare(String(a.date||'')+String(a.time||'')))}
function displayDateShort(iso){if(!iso)return '—';const d=new Date(iso+'T12:00:00');return Number.isNaN(d.getTime())?'—':d.toLocaleDateString('pt-BR')}
function displayMonthYear(iso){if(!iso)return '—';const d=new Date(iso+'T12:00:00');return Number.isNaN(d.getTime())?'—':d.toLocaleDateString('pt-BR',{month:'short',year:'numeric'}).replace('.','')}
function estimatedAppointmentValue(a){const n=Number(a?.paymentAmount);return n>0?n:(Number(getPaymentConfig().amount)||0)}
function patientMetrics(p){
  const list=patientAppointmentsFor(p),today=isoToday(),detail=getPatientDetail(p);
  const confirmed=list.filter(a=>a.status==='Confirmado');
  const completed=confirmed.filter(a=>String(a.date||'')<=today);
  const futureConfirmed=confirmed.filter(a=>String(a.date||'')>today).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
  const futureAny=list.filter(a=>a.status!=='Cancelado'&&String(a.date||'')>today).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
  const last=completed.sort((a,b)=>(b.date+b.time).localeCompare(a.date+a.time))[0]||null;
  const next=futureConfirmed[0]||futureAny[0]||null;
  const autoPaid=list.filter(a=>a.status==='Confirmado'&&a.paymentStatus==='Pago').reduce((s,a)=>s+(Number(a.paymentAmount)||0),0);
  const autoExpected=list.filter(a=>a.status!=='Cancelado'&&a.paymentStatus!=='Pago').reduce((s,a)=>s+estimatedAppointmentValue(a),0);
  const paid=detail.revenueDone!==undefined?Number(detail.revenueDone)||0:autoPaid;
  const expected=detail.revenueExpected!==undefined?Number(detail.revenueExpected)||0:autoExpected;
  const dated=list.map(a=>a.date).filter(Boolean).sort();
  const since=p.createdAt?.slice?.(0,10)||dated[0]||'';
  const autoTeeth=list.flatMap(a=>{const tooth=a.tooth||a.dente||a.elementoDentario;return tooth?[{tooth:String(tooth),procedure:String(a.procedure||a.note||'Atendimento odontológico')}]:[]});
  const teeth=Array.isArray(detail.teeth)?detail.teeth:autoTeeth;
  return {list,confirmed,last,next,paid,expected,since,teeth,detail};
}
function showPatientList(){const l=document.getElementById('patientListView'),d=document.getElementById('patientDetailView');if(l)l.hidden=false;if(d)d.hidden=true}
function showPatientDetail(index){selectedPatientIndex=Number(index);renderSelectedPatient();const l=document.getElementById('patientListView'),d=document.getElementById('patientDetailView');if(l)l.hidden=true;if(d)d.hidden=false;window.scrollTo({top:0,behavior:'smooth'})}
function renderSelectedPatient(){
  if(!patients.length){showPatientList();return}
  if(selectedPatientIndex<0||selectedPatientIndex>=patients.length)selectedPatientIndex=0;
  const p=patients[selectedPatientIndex],m=patientMetrics(p),email=p.email||m.list.find(a=>a.email)?.email||'',contact=[p.phone,email].filter(Boolean).join(' · ')||'Contato não informado';
  document.getElementById('patientReportAvatar').textContent=initials(p.name);document.getElementById('patientReportName').textContent=p.name;document.getElementById('patientReportContact').textContent=contact;
  document.getElementById('patientSummaryStatus').textContent='Paciente ativo';document.getElementById('patientSummaryContact').textContent=contact;
  document.getElementById('patientMetricAppointments').textContent=m.confirmed.length;document.getElementById('patientRevenueDoneInput').value=Number(m.paid||0).toFixed(2);document.getElementById('patientRevenueExpectedInput').value=Number(m.expected||0).toFixed(2);document.getElementById('patientMetricSince').textContent=displayMonthYear(m.since);document.getElementById('patientMetricTeeth').textContent=m.teeth.length;document.getElementById('patientMetricLastVisit').textContent=m.last?displayDateShort(m.last.date):'—';document.getElementById('patientMetricLastVisitSub').textContent=m.last?`${m.last.time||''}${m.last.end?' às '+m.last.end:''}`:'sem visita concluída';
  const nextInput=document.getElementById('patientNextDate');if(nextInput){nextInput.min=isoToday();if(!nextInput.value)nextInput.value='';}updatePatientNextSlotOptions();
  const lastDate=document.getElementById('patientLastAttendanceDate'),lastText=document.getElementById('patientLastAttendanceText'),nextDate=document.getElementById('patientNextAttendanceDate'),nextText=document.getElementById('patientNextAttendanceText');
  if(m.last){lastDate.textContent=`${displayDateShort(m.last.date)} · ${m.last.time||''}${m.last.end?' às '+m.last.end:''}`;lastText.textContent=m.last.procedure||m.last.note||'Atendimento odontológico confirmado.'}else{lastDate.textContent='Nenhum atendimento concluído';lastText.textContent='O último atendimento confirmado aparecerá aqui.'}
  if(m.next){nextDate.innerHTML=`${displayDateShort(m.next.date)} · ${m.next.time||''}${m.next.end?' às '+m.next.end:''}<span class="patient-next-status">${escapeHtml(m.next.status||'Agendado')}</span>`;nextText.textContent=m.next.procedure||'Atendimento cadastrado para este paciente.'}else{nextDate.textContent='Nenhum atendimento agendado';nextText.textContent='Quando houver um próximo atendimento, ele aparecerá aqui.'}
}
function renderPatients(f=''){
  const q=String(f||'').trim().toLowerCase();const found=patients.map((p,i)=>({p,i,m:patientMetrics(p)})).filter(({p})=>[p.name,p.phone,p.email].some(v=>String(v||'').toLowerCase().includes(q)));
  document.getElementById('patientsTotalCount').textContent=patients.length;document.getElementById('patientsAppointmentsCount').textContent=appointments.filter(a=>a.status==='Confirmado').length;document.getElementById('patientsFoundCount').textContent=found.length;
  if(patientDirectory)patientDirectory.innerHTML=found.length?found.map(({p,i,m})=>`<button class="patient-directory-row" type="button" data-open-patient="${i}"><div class="patient-directory-avatar">${initials(p.name)}</div><div class="patient-directory-main"><strong>${escapeHtml(p.name)}</strong><span>${escapeHtml(p.phone||p.email||'Sem contato cadastrado')}</span></div><div class="patient-directory-meta"><div><small>Atendimentos</small><b>${m.confirmed.length}</b></div><div><small>Última visita</small><b>${m.last?displayDateShort(m.last.date):'Sem visitas'}</b></div><span class="patient-directory-arrow">›</span></div></button>`).join(''):'<div class="closed-day">Nenhum paciente encontrado.</div>';
  document.querySelectorAll('[data-open-patient]').forEach(btn=>btn.onclick=()=>showPatientDetail(btn.dataset.openPatient));
}
if(patientSearch)patientSearch.oninput=e=>renderPatients(e.target.value);
document.getElementById('patientDetailBack')?.addEventListener('click',()=>{showPatientList();window.scrollTo({top:0,behavior:'smooth'})});
function selectedPatient(){return patients[selectedPatientIndex]||null}
function saveRevenueField(field,inputId,label){const p=selectedPatient();if(!p)return;const input=document.getElementById(inputId);const value=Math.max(0,Number(input?.value)||0);savePatientDetail(p,{[field]:value});renderSelectedPatient();if(field==='revenueDone')renderAttendances();toast(`${label} atualizada.`)}
document.getElementById('savePatientRevenueDone')?.addEventListener('click',()=>saveRevenueField('revenueDone','patientRevenueDoneInput','Receita realizada'));
document.getElementById('savePatientRevenueExpected')?.addEventListener('click',()=>saveRevenueField('revenueExpected','patientRevenueExpectedInput','Receita prevista'));

function renderPatientTeethEditor(){
  const p=selectedPatient();if(!p)return;const detail=getPatientDetail(p),m=patientMetrics(p);let teeth=Array.isArray(detail.teeth)?detail.teeth.map(t=>({...t})):m.teeth.map(t=>({...t}));
  if(!teeth.length)teeth=[{tooth:'',procedure:''}];
  const root=document.getElementById('patientTeethEditor');root.innerHTML=teeth.map((t,i)=>`<div class="patient-tooth-row" data-tooth-row="${i}"><label>Dente<input class="patient-tooth-number" value="${escapeHtml(t.tooth||'')}" placeholder="Ex.: 14"/></label><label>Procedimento realizado<input class="patient-tooth-procedure" value="${escapeHtml(t.procedure||'')}" placeholder="Ex.: Tratamento endodôntico"/></label><button class="patient-tooth-remove" type="button" data-remove-patient-tooth="${i}">Remover</button></div>`).join('');
  root.querySelectorAll('[data-remove-patient-tooth]').forEach(btn=>btn.onclick=()=>{btn.closest('.patient-tooth-row')?.remove();if(!root.querySelector('.patient-tooth-row'))root.innerHTML='<div class="patient-teeth-empty">Nenhum dente cadastrado. Use “Adicionar dente”.</div>'});
}
function openPatientTeeth(){renderPatientTeethEditor();document.getElementById('patientTeethModal')?.classList.add('open')}
function closePatientTeeth(){document.getElementById('patientTeethModal')?.classList.remove('open')}
document.getElementById('patientMetricTeethButton')?.addEventListener('click',openPatientTeeth);
document.getElementById('closePatientTeeth')?.addEventListener('click',closePatientTeeth);
document.getElementById('addPatientTooth')?.addEventListener('click',()=>{const root=document.getElementById('patientTeethEditor');root.querySelector('.patient-teeth-empty')?.remove();const row=document.createElement('div');row.className='patient-tooth-row';row.innerHTML='<label>Dente<input class="patient-tooth-number" placeholder="Ex.: 14"/></label><label>Procedimento realizado<input class="patient-tooth-procedure" placeholder="Ex.: Tratamento endodôntico"/></label><button class="patient-tooth-remove" type="button">Remover</button>';row.querySelector('.patient-tooth-remove').onclick=()=>row.remove();root.appendChild(row)});
document.getElementById('savePatientTeeth')?.addEventListener('click',()=>{const p=selectedPatient();if(!p)return;const teeth=[...document.querySelectorAll('#patientTeethEditor .patient-tooth-row')].map(row=>({tooth:row.querySelector('.patient-tooth-number')?.value.trim()||'',procedure:row.querySelector('.patient-tooth-procedure')?.value.trim()||''})).filter(t=>t.tooth||t.procedure);savePatientDetail(p,{teeth});closePatientTeeth();renderSelectedPatient();toast('Dentes tratados atualizados.')});

function updatePatientNextSlotOptions(){
  const date=document.getElementById('patientNextDate')?.value||'',sel=document.getElementById('patientNextSlot');if(!sel)return;
  if(!date){sel.innerHTML='<option value="">Escolha primeiro a data</option>';return}
  const free=getSlotsForDate(date).filter(slot=>!isSlotBusy(date,slot));
  sel.innerHTML=free.length?'<option value="">Selecione um horário</option>'+free.map(slot=>`<option value="${slot.start}|${slot.end}">${slot.start} às ${slot.end}</option>`).join(''):'<option value="">Sem horários disponíveis</option>';
}
document.getElementById('patientNextDate')?.addEventListener('change',updatePatientNextSlotOptions);
document.getElementById('savePatientNextAppointment')?.addEventListener('click',()=>{
  const p=selectedPatient(),date=document.getElementById('patientNextDate')?.value||'',raw=document.getElementById('patientNextSlot')?.value||'';if(!p)return;
  const [start,end]=raw.split('|');if(!date||!start||!end){toast('Escolha uma data e um horário disponível.');return}
  const slot=getSlotsForDate(date).find(s=>s.start===start&&s.end===end);if(!slot||isSlotBusy(date,slot)){toast('Este horário não está mais disponível. Escolha outro.');updatePatientNextSlotOptions();return}
  const payment=getPaymentConfig(),status=payment.required?'Aguardando pagamento':'Confirmado';
  const booking={id:`appt-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,name:p.name,phone:p.phone||'',email:p.email||'',time:start,end,slotStart:start,slotEnd:end,date,status,paymentStatus:payment.required?'Aguardando pagamento':'Pago',paymentAmount:payment.required?0:(Number(payment.amount)||0),source:'Perfil do paciente'};
  appointments.push(booking);persistAppointments();upsertPatient(booking);renderSelectedPatient();renderPatients(patientSearch?.value||'');renderAttendances();renderToday();renderCalendar();renderAvailable(selectedDate);renderConfirmations();refreshPatientLink();toast(payment.required?'Atendimento cadastrado e aguardando pagamento.':'Atendimento cadastrado e confirmado.');
});
document.getElementById('newPatient')?.addEventListener('click',()=>{openAppt();toast('Cadastre o paciente junto com o primeiro agendamento.');});
function attendanceMatchesFilters(a){
  const q=String(attendanceSearch?.value||'').trim().toLowerCase(),status=attendanceStatusFilter?.value||'all',pay=attendancePaymentFilter?.value||'all',period=attendancePeriodFilter?.value||'all',today=isoToday();
  const text=[a.name,a.phone,a.email,a.procedure,a.clinic,activeDentist.clinic].join(' ').toLowerCase();if(q&&!text.includes(q))return false;
  if(status==='confirmed'&&a.status!=='Confirmado')return false;if(status==='cancelled'&&a.status!=='Cancelado')return false;if(status==='waiting'&&(a.status==='Confirmado'||a.status==='Cancelado'))return false;
  if(pay==='paid'&&a.paymentStatus!=='Pago')return false;if(pay==='pending'&&(a.paymentStatus==='Pago'||a.status==='Cancelado'))return false;
  if(period==='today'&&a.date!==today)return false;if(period==='future'&&String(a.date||'')<=today)return false;if(period==='past'&&String(a.date||'')>=today)return false;return true;
}
function paymentBadge(a){const paid=a.paymentStatus==='Pago';return `<span class="attendance-pay-pill ${paid?'paid':'pending'}">${paid?'Pago':'Pendente'}</span>`}
function attendanceStateBadge(a){const cls=a.status==='Confirmado'?'confirmed':a.status==='Cancelado'?'cancelled':'waiting';return `<span class="attendance-state-pill ${cls}">${escapeHtml(a.status||'Aguardando')}</span>`}
function findPatientIndexByName(name){return patients.findIndex(p=>String(p.name||'').toLowerCase()===String(name||'').toLowerCase())}
function totalReceivedFromPatients(){
  const names=new Map();
  patients.forEach(p=>{const key=patientDetailId(p);if(key&&!names.has(key))names.set(key,p.name)});
  appointments.forEach(a=>{const key=patientDetailId(a.name);if(key&&!names.has(key))names.set(key,a.name)});
  let total=0;
  names.forEach((name,key)=>{
    const detail=patientDetails[key]||{};
    if(Object.prototype.hasOwnProperty.call(detail,'revenueDone')){
      total+=Math.max(0,Number(detail.revenueDone)||0);
      return;
    }
    total+=appointments.filter(a=>patientDetailId(a.name)===key&&a.status==='Confirmado'&&a.paymentStatus==='Pago').reduce((sum,a)=>sum+(Number(a.paymentAmount)||0),0);
  });
  return total;
}
function renderAttendances(){
  const active=appointments.filter(a=>a.status!=='Cancelado'),today=isoToday(),received=totalReceivedFromPatients(),pending=appointments.filter(a=>a.status!=='Cancelado'&&a.paymentStatus!=='Pago').reduce((s,a)=>s+estimatedAppointmentValue(a),0),todayItems=active.filter(a=>a.date===today).sort((a,b)=>String(a.time||'').localeCompare(String(b.time||'')));
  const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v};set('attendanceReceived',moneyBR(received));set('attendancePendingValue',moneyBR(pending));set('attendanceTodayCount',todayItems.length);set('attendanceTotalCount',active.length);set('attendanceTodayLabel',`${todayItems.length} ${todayItems.length===1?'atendimento':'atendimentos'}`);
  const todayRoot=document.getElementById('attendanceTodayList');if(todayRoot)todayRoot.innerHTML=todayItems.length?todayItems.map(a=>`<div class="attendance-today-row"><strong>${escapeHtml(a.time||'—')}</strong><div><b>${escapeHtml(a.name||'Paciente')}</b><span>${escapeHtml(a.procedure||'Atendimento odontológico')}</span></div>${attendanceStateBadge(a)}</div>`).join(''):'<div class="attendance-today-empty">Nenhum atendimento registrado para hoje.</div>';
  const list=appointments.filter(attendanceMatchesFilters).sort((a,b)=>(String(b.date||'')+String(b.time||'')).localeCompare(String(a.date||'')+String(a.time||''))),root=document.getElementById('attendanceList');if(!root)return;
  root.innerHTML=list.length?list.map(a=>{const pi=findPatientIndexByName(a.name),value=estimatedAppointmentValue(a);return `<article class="attendance-record"><div class="attendance-record-top"><div><span class="attendance-date">${displayDateShort(a.date)} · ${escapeHtml(a.time||'')}${a.end?' às '+escapeHtml(a.end):''}</span><h3>${escapeHtml(a.name||'Paciente')}</h3><div class="attendance-tags"><span>${escapeHtml(a.procedure||'Atendimento odontológico')}</span>${a.tooth||a.dente?`<span>Dente ${escapeHtml(a.tooth||a.dente)}</span>`:''}</div></div><div class="attendance-record-status">${paymentBadge(a)}${attendanceStateBadge(a)}</div></div><div class="attendance-record-body"><div><small>Local</small><strong>${escapeHtml(a.clinic||activeDentist.clinic||'Consultório')}</strong></div><div><small>Valor</small><strong class="attendance-value">${moneyBR(value)}</strong></div><div><small>Origem</small><strong>${escapeHtml(a.source||'Agenda')}</strong></div></div><div class="attendance-record-actions">${pi>=0?`<button class="btn btn-ghost" type="button" data-attendance-patient="${pi}">Ver paciente</button>`:''}</div></article>`}).join(''):'<div class="closed-day">Nenhum atendimento encontrado com estes filtros.</div>';
  document.querySelectorAll('[data-attendance-patient]').forEach(btn=>btn.onclick=()=>{showPage('pacientes');setTimeout(()=>showPatientDetail(btn.dataset.attendancePatient),0)});
}
[attendanceSearch,attendanceStatusFilter,attendancePaymentFilter,attendancePeriodFilter].filter(Boolean).forEach(el=>el.addEventListener(el.tagName==='INPUT'?'input':'change',renderAttendances));
document.getElementById('attendanceNewAppt')?.addEventListener('click',openAppt);

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
function encodePublicState(){const payload={dentist:activeDentist,bookingView:activeDentist.bookingView||'calendar',availability,busy:appointments.filter(a=>a.status!=='Cancelado').map(a=>({date:a.date,time:a.time,end:a.end||'',slotStart:a.slotStart||'',slotEnd:a.slotEnd||'',status:a.status})),payment:getPaymentConfig()};try{return btoa(unescape(encodeURIComponent(JSON.stringify(payload))))}catch(e){return''}}
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
let publicCalendarSelectedDate=null;
let publicPortalContext=null;
function safeExternalUrl(raw){try{const u=new URL(String(raw||''));return /^https?:$/.test(u.protocol)?u.toString():''}catch(e){return''}}
function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))}
function publicBookingViewFromContext(){return publicPortalContext?.bookingView||activeDentist.bookingView||'calendar'}
function collectPublicAvailableDays(pubAvailability,busyList,maxDays=120){
  const start=new Date();start.setHours(12,0,0,0);const days=[];
  for(let k=0;k<maxDays;k++){
    const d=new Date(start);d.setDate(start.getDate()+k);const key=dateKey(d),cfg=pubAvailability[d.getDay()];
    if(!cfg||!cfg.open||!(cfg.slots||[]).length)continue;
    const freeSlots=(cfg.slots||[]).map((slot,i)=>({...slot,originalIndex:i})).filter(slot=>!busyList.some(b=>bookingOverlapsSlot(b,key,slot,pubAvailability)));
    if(freeSlots.length)days.push({key,freeSlots});
  }
  return days;
}
function publicDurationLabel(start,end){const a=timeToMinutes(start),b=timeToMinutes(end),min=Math.max(0,b-a);if(!min)return'';const h=Math.floor(min/60),m=min%60;return h&&m?`${h}h ${m}min`:h?`${h}h`:`${m}min`}
function publicMonthKey(date){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`}
function renderPublicCalendarStep(){
  const ctx=publicPortalContext,stage=document.getElementById('publicCalendarStage');if(!ctx||!stage)return;
  document.body.classList.remove('calendar-form-visible');publicSelected=null;
  const availableMap=new Map(ctx.days.map(d=>[d.key,d.freeSlots]));
  if(!publicCalendarCursor){const first=ctx.days[0]?.key||dateKey(new Date());const d=new Date(first+'T12:00:00');publicCalendarCursor=new Date(d.getFullYear(),d.getMonth(),1)}
  const y=publicCalendarCursor.getFullYear(),m=publicCalendarCursor.getMonth(),first=new Date(y,m,1).getDay(),count=new Date(y,m+1,0).getDate(),prevCount=new Date(y,m,0).getDate();const cells=[];
  for(let i=first-1;i>=0;i--)cells.push({n:prevCount-i,outside:true,date:''});for(let d=1;d<=count;d++)cells.push({n:d,outside:false,date:`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`});let n=1;while(cells.length<42)cells.push({n:n++,outside:true,date:''});
  const today=dateKey(new Date());
  stage.innerHTML=`<div class="public-calendar-step-head"><span class="step-icon">▣</span><div><h2>Selecione uma data</h2><p>Aparecem destacados somente os dias com horários disponíveis.</p></div></div><div class="public-calendar-box"><div class="public-calendar-monthbar"><button type="button" class="public-calendar-nav" id="publicPrevMonth">‹</button><strong>${new Date(y,m,1).toLocaleDateString('pt-BR',{month:'long',year:'numeric'})}</strong><button type="button" class="public-calendar-nav" id="publicNextMonth">›</button></div><div class="public-calendar-week"><span>dom</span><span>seg</span><span>ter</span><span>qua</span><span>qui</span><span>sex</span><span>sáb</span></div><div class="public-calendar-days">${cells.map(c=>{const available=c.date&&availableMap.has(c.date);return `<button type="button" class="public-calendar-day ${c.outside?'outside':''} ${available?'available':''} ${c.date===today?'today':''}" ${available?`data-public-calendar-date="${c.date}"`: 'disabled'}>${c.n}</button>`}).join('')}</div></div><p class="public-calendar-help">Escolha um dos dias destacados para ver os horários livres.</p>`;
  document.getElementById('publicPrevMonth')?.addEventListener('click',()=>{publicCalendarCursor=new Date(y,m-1,1);renderPublicCalendarStep()});
  document.getElementById('publicNextMonth')?.addEventListener('click',()=>{publicCalendarCursor=new Date(y,m+1,1);renderPublicCalendarStep()});
  stage.querySelectorAll('[data-public-calendar-date]').forEach(btn=>btn.addEventListener('click',()=>{publicCalendarSelectedDate=btn.dataset.publicCalendarDate;renderPublicTimesStep(publicCalendarSelectedDate)}));
}
function renderPublicTimesStep(date){
  const ctx=publicPortalContext,stage=document.getElementById('publicCalendarStage');if(!ctx||!stage)return;document.body.classList.remove('calendar-form-visible');publicSelected=null;
  const entry=ctx.days.find(d=>d.key===date);if(!entry){renderPublicCalendarStep();return}
  const label=new Date(date+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'long'});
  stage.innerHTML=`<div class="public-calendar-step-head"><button type="button" class="public-calendar-back" id="publicCalendarBack">←</button><div><h2>Horários em ${label}</h2><p>Selecione o melhor horário para continuar.</p></div></div><div class="public-times-grid">${entry.freeSlots.map(slot=>`<button type="button" class="public-time-button" data-calendar-time-start="${slot.start}" data-calendar-time-end="${slot.end}">${slot.start} - ${slot.end}<small>${publicDurationLabel(slot.start,slot.end)}</small></button>`).join('')}</div>`;
  document.getElementById('publicCalendarBack')?.addEventListener('click',()=>{publicCalendarSelectedDate=null;renderPublicCalendarStep()});
  stage.querySelectorAll('[data-calendar-time-start]').forEach(btn=>btn.addEventListener('click',()=>{
    publicSelected={date,start:btn.dataset.calendarTimeStart,end:btn.dataset.calendarTimeEnd};
    document.getElementById('chosenSlot').innerHTML=`<strong>${publicFormatDate(date)}</strong><br>${publicSelected.start} às ${publicSelected.end}`;
    document.getElementById('patientSuccess').style.display='none';document.body.classList.add('calendar-form-visible');
    document.querySelector('.patient-form')?.scrollIntoView({behavior:'smooth',block:'start'});
  }));
}
function showPublicCalendarSuccess(booking){
  const stage=document.getElementById('publicCalendarStage');if(!stage)return;document.body.classList.remove('calendar-form-visible');
  stage.innerHTML=`<div class="public-calendar-success"><strong>Obrigado! Sua solicitação foi recebida.</strong>Seu atendimento para <b>${publicFormatDate(booking.date)}</b>, das <b>${booking.time} às ${booking.end}</b>, está <b>aguardando confirmação</b>.<br><br>Assim que o agendamento for confirmado, enviaremos uma mensagem para o WhatsApp <b>${escapeHtml(booking.phone)}</b> informado por você.<br><br>Agradecemos pela preferência.<br><button class="btn btn-primary" type="button" id="publicBookAnother">Ver outros horários</button></div>`;
  document.getElementById('publicBookAnother')?.addEventListener('click',()=>{publicCalendarSelectedDate=null;publicCalendarCursor=null;renderPatientPortal()});
  stage.scrollIntoView({behavior:'smooth',block:'start'});
}
function renderPatientPortal(){
  const params=patientRouteParams(),snap=decodePublicState(params.get('agenda')),pubAvailability=snap&&snap.availability?snap.availability:availability,dentist=snap&&snap.dentist?snap.dentist:activeDentist,payment=snap&&snap.payment?snap.payment:getPaymentConfig();
  const snapshotBusy=snap&&Array.isArray(snap.busy)?snap.busy:[];
  const liveBusy=appointments.filter(a=>a.status!=='Cancelado').map(a=>({date:a.date,time:a.time,end:a.end||'',slotStart:a.slotStart||'',slotEnd:a.slotEnd||'',status:a.status}));
  const busyList=[...snapshotBusy,...liveBusy];
  const bookingView=(snap&&snap.bookingView)||(dentist&&dentist.bookingView)||'calendar';
  const allDays=collectPublicAvailableDays(pubAvailability,busyList,120);
  publicPortalContext={availability:pubAvailability,busyList,dentist,payment,bookingView,days:allDays};
  document.body.classList.toggle('patient-booking-calendar',bookingView==='calendar');document.body.classList.toggle('patient-booking-list',bookingView!=='calendar');document.body.classList.remove('calendar-form-visible');
  document.getElementById('publicDentistName').textContent=dentist.name;document.getElementById('publicDentistFooter').textContent=`Rootis · Agendamento com ${dentist.name}`;
  const calName=document.getElementById('publicCalendarDentistName'),calCro=document.getElementById('publicCalendarDentistCro'),calInit=document.getElementById('publicCalendarDentistInitials'),calIntro=document.getElementById('publicCalendarDentistIntro');
  if(calName)calName.textContent=dentist.name;if(calCro)calCro.textContent=dentist.cro||'Cirurgião-dentista';if(calInit)calInit.textContent=initials(dentist.name);if(calIntro)calIntro.textContent=`Olá! Sou ${dentist.name}${dentist.specialty?`, ${dentist.specialty.toLowerCase()}`:''}. Escolha uma data e um horário para solicitar seu atendimento de forma rápida e prática.`;
  const root=document.getElementById('publicDays');if(!root)return;
  if(bookingView==='calendar'){
    root.innerHTML='';publicCalendarCursor=null;publicCalendarSelectedDate=null;if(!allDays.length){document.getElementById('publicCalendarStage').innerHTML='<div class="public-calendar-empty">No momento não há horários disponíveis para agendamento. Novos dias aparecerão aqui assim que o dentista abrir a agenda.</div>'}else renderPublicCalendarStep();
  }else{
    const days=allDays.slice(0,10);
    if(!days.length){root.innerHTML='<div class="patient-empty">No momento não há horários disponíveis para agendamento. Novos dias aparecerão aqui assim que o dentista abrir horários.</div>';}
    else{
      root.innerHTML=days.map(({key,freeSlots})=>`<div class="public-day"><div class="public-day-head"><strong>${publicFormatDate(key)}</strong><span>${freeSlots.length} ${freeSlots.length===1?'horário disponível':'horários disponíveis'}</span></div><div class="public-slots">${freeSlots.map(slot=>`<button type="button" class="public-slot" data-public-date="${key}" data-public-start="${slot.start}" data-public-end="${slot.end}">${slot.start} às ${slot.end}</button>`).join('')}</div></div>`).join('');
      document.querySelectorAll('.public-slot').forEach(btn=>btn.onclick=()=>{publicSelected={date:btn.dataset.publicDate,start:btn.dataset.publicStart,end:btn.dataset.publicEnd};document.querySelectorAll('.public-slot').forEach(b=>b.classList.remove('selected'));btn.classList.add('selected');document.getElementById('chosenSlot').innerHTML=`<strong>${publicFormatDate(publicSelected.date)}</strong><br>${publicSelected.start} às ${publicSelected.end}`;document.getElementById('patientSuccess').style.display='none'});
    }
  }
  const cardUrl=safeExternalUrl(payment.cardPaymentLink||dentist.cardPaymentLink||'');const pix=String(payment.pixKey||dentist.pixKey||'').trim();const receiver=String(payment.pixReceiver||dentist.pixReceiver||'').trim();let methods='';
  if(pix)methods+=`<div class="payment-method-box"><div class="payment-method-title">PIX</div><div class="pix-display"><code id="publicPixKey">${escapeHtml(pix)}</code><button class="btn btn-ghost" type="button" id="copyPublicPix">Copiar PIX</button></div>${receiver?`<div class="payment-receiver">Recebedor: ${escapeHtml(receiver)}</div>`:''}</div>`;
  if(cardUrl)methods+=`<div class="payment-method-box"><div class="payment-method-title">Cartão</div><div class="payment-actions-public"><a class="btn btn-primary public-card-link" href="${escapeHtml(cardUrl)}" target="_blank" rel="noopener noreferrer">Pagar com cartão</a></div></div>`;
  document.getElementById('publicPayment').innerHTML=`<strong>Pagamento / confirmação do horário</strong><br>${escapeHtml(payment.explanation)}<br><br><strong>Referência:</strong> R$ ${Number(payment.amount||0).toFixed(2).replace('.',',')} · ${escapeHtml(payment.method)}${methods||'<div class="payment-wait-note">O dentista ainda não cadastrou uma chave PIX ou link de cartão nesta agenda.</div>'}<div class="payment-wait-note">Após solicitar o horário, aguarde a confirmação do dentista. O pagamento, quando exigido, não substitui a confirmação do atendimento.</div>`;
  document.getElementById('copyPublicPix')?.addEventListener('click',async()=>{const value=document.getElementById('publicPixKey')?.textContent||'';try{await navigator.clipboard.writeText(value);alert('Chave PIX copiada.')}catch(e){const ta=document.createElement('textarea');ta.value=value;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();alert('Chave PIX copiada.')}});
}
function initPatientMode(){const params=patientRouteParams();if(params.get('paciente')!=='1')return false;document.body.classList.add('patient-mode');renderPatientPortal();return true}

function formatPatientWhatsapp(value){
  const digits=String(value||'').replace(/\D/g,'').slice(0,11);
  if(!digits)return '';
  if(digits.length<=2)return `(${digits}`;
  return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
}
function isValidPatientWhatsapp(value){return /^\(\d{2}\) \d{9}$/.test(String(value||'').trim())}
function normalizePhone(phone){let n=String(phone||'').replace(/\D/g,'');if(!n)return'';if(n.length===10||n.length===11)n='55'+n;return n}
function brDate(date){if(!date)return'';const [y,m,d]=date.split('-');return `${d}/${m}/${y}`}
function refreshPatientNext(patientName){const p=patients.find(x=>String(x.name).toLowerCase()===String(patientName).toLowerCase());if(!p)return;const next=appointments.filter(a=>a.status==='Confirmado'&&String(a.name).toLowerCase()===String(patientName).toLowerCase()).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time))[0];p.next=next?`${next.date.split('-').reverse().slice(0,2).join('/')} · ${next.time}`:'—';persistPatients()}
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
function rerenderAfterAppointmentChange(a){persistAppointments();refreshPatientNext(a.name);renderToday();renderPatients();renderAttendances();renderCalendar();renderAvailable(selectedDate);renderConfirmations();refreshPatientLink()}
function requestPaymentForAppointment(id){const a=appointments.find(x=>x.id===id);if(!a)return;a.status='Aguardando pagamento';a.paymentStatus='Aguardando pagamento';rerenderAfterAppointmentChange(a);toast('Solicitação de pagamento preparada. Abrindo o WhatsApp do paciente...');openWhatsappForAppointment(a,'payment_pending')}
function canConfirmAppointmentWithoutConflict(a){const slot=getConfiguredSlotForBooking(a);if(!slot){toast('Este pedido não corresponde a um horário válido da agenda. Remarque o paciente em um horário disponível.');return false}const conflict=blockingAppointmentForSlot(a.date,slot,a.id);if(conflict){toast(`Não é possível confirmar: o horário ${slot.start} às ${slot.end} já está reservado para outro paciente.`);return false}a.time=slot.start;a.end=slot.end;a.slotStart=slot.start;a.slotEnd=slot.end;return true}
function confirmPaymentAndAppointment(id){const a=appointments.find(x=>x.id===id);if(!a)return;if(!canConfirmAppointmentWithoutConflict(a))return;a.status='Confirmado';a.paymentStatus='Pago';if(!Number(a.paymentAmount))a.paymentAmount=Number(getPaymentConfig().amount)||0;rerenderAfterAppointmentChange(a);renderDentistFinancialSummary();toast('Pagamento registrado e atendimento confirmado. Abrindo o WhatsApp do paciente...');openWhatsappForAppointment(a,'confirmed')}
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
clinicalReportForm?.addEventListener('submit',e=>{e.preventDefault();const data=new FormData(clinicalReportForm),w=window.open('','_blank');if(!w){toast('O navegador bloqueou a janela de exportação. Permita pop-ups e tente novamente.');return}w.document.open();w.document.write(buildPrintableClinicalReport(data));w.document.close();w.focus();setTimeout(()=>w.print(),500)});

function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}
const apptModal=document.getElementById('apptModal'),payModal=document.getElementById('payModal');function openAppt(){apptModal.classList.add('open');if(!document.getElementById('apptDate').value)document.getElementById('apptDate').value=selectedDate;updateApptTimes()}function closeAppt(){apptModal.classList.remove('open')}function openPay(){const saved=localStorage.getItem(dentistKey('PaymentExplanation'));if(saved)document.getElementById('paymentModalMessage').value=saved;payModal.classList.add('open')}function closePay(){payModal.classList.remove('open')}
[newAppt,newAppt2,quickAppt].forEach(b=>b.onclick=openAppt);[openPayment,quickPay].forEach(b=>b.onclick=openPay);document.querySelectorAll('[data-close]').forEach(b=>b.onclick=closeAppt);document.querySelectorAll('[data-close-pay]').forEach(b=>b.onclick=closePay);
apptForm.onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),raw=String(f.get('slot')||''),[start,end]=raw.split('|');if(!start||!end){toast('Escolha um horário disponível.');return}const date=String(f.get('date')||''),slot=getSlotsForDate(date).find(s=>s.start===start&&s.end===end);if(!slot){toast('Este horário não existe mais na agenda. Atualize a data e escolha novamente.');updateApptTimes();return}if(isSlotBusy(date,slot)){toast(`O horário ${slot.start} às ${slot.end} já está ocupado ou reservado.`);updateApptTimes();return}const status=String(f.get('status')||'Aguardando confirmação'),booking={id:`appt-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,name:f.get('name'),phone:f.get('phone'),email:f.get('email'),time:slot.start,end:slot.end,slotStart:slot.start,slotEnd:slot.end,date,status,paymentStatus:status==='Confirmado'?'Pago':(status.toLowerCase().includes('pagamento')?'Aguardando pagamento':'Não informado'),paymentAmount:status==='Confirmado'?(Number(getPaymentConfig().amount)||0):0,source:'Dentista'};appointments.push(booking);persistAppointments();upsertPatient(booking);renderToday();renderPatients();renderAttendances();renderCalendar();renderAvailable(selectedDate);renderConfirmations();refreshPatientLink();closeAppt();toast(status==='Confirmado'?`Atendimento confirmado no horário ${slot.start} às ${slot.end}.`:`Solicitação reservada no horário ${slot.start} às ${slot.end} e ainda não aparece na agenda.`)};payForm.onsubmit=e=>{e.preventDefault();closePay();toast('Cobrança gerada. Na versão online, ela será enviada ao paciente.')};
document.getElementById('apptDate').addEventListener('change',updateApptTimes);document.getElementById('saveAvailability').addEventListener('click',saveAvailability);
const activePix=document.getElementById('activeDentistPix'),activePixReceiver=document.getElementById('activeDentistPixReceiver'),activeCardLink=document.getElementById('activeDentistCardLink');if(activePix)activePix.value=activeDentist.pixKey||'';if(activePixReceiver)activePixReceiver.value=activeDentist.pixReceiver||'';if(activeCardLink)activeCardLink.value=activeDentist.cardPaymentLink||'';document.getElementById('saveDentistPaymentData')?.addEventListener('click',()=>{activeDentist.pixKey=activePix.value.trim();activeDentist.pixReceiver=activePixReceiver.value.trim();activeDentist.cardPaymentLink=activeCardLink.value.trim();dentists=dentists.map(d=>d.id===activeDentistId?{...d,pixKey:activeDentist.pixKey,pixReceiver:activeDentist.pixReceiver,cardPaymentLink:activeDentist.cardPaymentLink}:d);saveDentists();renderDentistCentral();refreshPatientLink();toast('PIX e link de cartão salvos para esta agenda.');});
const payment=getPaymentConfig();document.getElementById('paymentExplanation').value=payment.explanation;document.getElementById('paymentAmount').value=payment.amount;document.getElementById('paymentMethod').value=payment.method;document.getElementById('paymentRequired').checked=payment.required;
document.getElementById('savePaymentConfig').addEventListener('click',()=>{localStorage.setItem(dentistKey('PaymentExplanation'),document.getElementById('paymentExplanation').value);localStorage.setItem(dentistKey('PaymentAmount'),document.getElementById('paymentAmount').value);localStorage.setItem(dentistKey('PaymentMethod'),document.getElementById('paymentMethod').value);localStorage.setItem(dentistKey('PaymentRequired'),document.getElementById('paymentRequired').checked?'1':'0');toast('Configuração de pagamento desta agenda salva.');refreshPatientLink();renderDentistFinancialSummary()});
const reminderIds=['patientReminder8h','patientReminder2h','dentistReminder7d','dentistReminder1d','dentistReminder2h','weeklySummaryEnabled'];reminderIds.forEach(id=>{const el=document.getElementById(id),saved=localStorage.getItem(dentistKey('Reminder_'+id));if(saved!==null)el.checked=saved==='1'});const savedDentistWhatsapp=localStorage.getItem(dentistKey('DentistWhatsapp'))||activeDentist.whatsapp;if(savedDentistWhatsapp)document.getElementById('dentistWhatsapp').value=savedDentistWhatsapp;const savedSummaryDay=localStorage.getItem(dentistKey('WeeklySummaryDay'));if(savedSummaryDay!==null)document.getElementById('weeklySummaryDay').value=savedSummaryDay;const savedSummaryTime=localStorage.getItem(dentistKey('WeeklySummaryTime'));if(savedSummaryTime)document.getElementById('weeklySummaryTime').value=savedSummaryTime;
document.getElementById('saveReminderConfig').addEventListener('click',()=>{reminderIds.forEach(id=>localStorage.setItem(dentistKey('Reminder_'+id),document.getElementById(id).checked?'1':'0'));const phone=document.getElementById('dentistWhatsapp').value.trim();localStorage.setItem(dentistKey('DentistWhatsapp'),phone);localStorage.setItem(dentistKey('WeeklySummaryDay'),document.getElementById('weeklySummaryDay').value);localStorage.setItem(dentistKey('WeeklySummaryTime'),document.getElementById('weeklySummaryTime').value);activeDentist.whatsapp=phone;dentists=dentists.map(d=>d.id===activeDentistId?{...d,whatsapp:phone}:d);saveDentists();renderDentistCentral();toast('Configuração de lembretes desta agenda salva.')});
document.getElementById('saveBookingView')?.addEventListener('click',()=>{const selected=document.querySelector('input[name="patientBookingView"]:checked');if(!selected)return toast('Escolha um modelo de agendamento.');activeDentist.bookingView=selected.value==='list'?'list':'calendar';dentists=dentists.map(d=>d.id===activeDentistId?{...d,bookingView:activeDentist.bookingView}:d);saveDentists();refreshPatientLink();toast(activeDentist.bookingView==='calendar'?'Modelo calendário por etapas salvo.':'Modelo lista de dias e horários salvo.');});
const patientLink=document.getElementById('patientLink'),copyPatientLink=document.getElementById('copyPatientLink'),previewPatientLink=document.getElementById('previewPatientLink');if(patientLink)refreshPatientLink();if(copyPatientLink)copyPatientLink.addEventListener('click',async()=>{refreshPatientLink();try{await navigator.clipboard.writeText(patientLink.value);toast('Link do paciente copiado.')}catch(e){patientLink.select();document.execCommand('copy');toast('Link do paciente copiado.')}});if(previewPatientLink)previewPatientLink.addEventListener('click',openPatientPreview);
document.getElementById('calendarFormBack')?.addEventListener('click',()=>{document.body.classList.remove('calendar-form-visible');publicSelected=null;document.getElementById('chosenSlot').textContent='Nenhum horário selecionado.';if(publicCalendarSelectedDate)renderPublicTimesStep(publicCalendarSelectedDate);document.getElementById('publicCalendarStage')?.scrollIntoView({behavior:'smooth',block:'start'});});
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
        patientWhatsappInput.setCustomValidity('Informe um WhatsApp válido no formato (DDD) 912345678.');
      }else patientWhatsappInput.setCustomValidity('');
    });
  }
  patientBookingForm.addEventListener('submit',e=>{
    e.preventDefault();
    const success=document.getElementById('patientSuccess');
    if(patientWhatsappInput&&!isValidPatientWhatsapp(patientWhatsappInput.value)){
      patientWhatsappInput.setCustomValidity('Informe um WhatsApp válido no formato (DDD) 912345678.');
      patientWhatsappInput.reportValidity();
      success.style.display='block';
      success.textContent='Revise o WhatsApp informado. A confirmação da consulta será enviada para esse número.';
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
    const f=new FormData(e.target),payRequired=getPaymentConfig().required,booking={id:`appt-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,name:f.get('name'),phone:f.get('phone'),email:f.get('email'),note:f.get('note'),time:slot.start,end:slot.end,slotStart:slot.start,slotEnd:slot.end,date:publicSelected.date,status:payRequired?'Aguardando pagamento':'Aguardando confirmação',source:'Paciente',paymentStatus:payRequired?'Aguardando pagamento':'Não exigido',paymentAmount:0};
    appointments.push(booking);persistAppointments();upsertPatient(booking);renderConfirmations();refreshPatientLink();
    const calendarMode=publicBookingViewFromContext()==='calendar';
    e.target.reset();publicSelected=null;document.getElementById('chosenSlot').textContent='Nenhum horário selecionado.';
    if(calendarMode){renderPatientPortal();showPublicCalendarSuccess(booking)}else{success.style.display='block';success.innerHTML=`<strong>Obrigado! Sua solicitação de agendamento foi recebida.</strong><br><br>Seu atendimento para <strong>${publicFormatDate(booking.date)}</strong>, das <strong>${booking.time} às ${booking.end}</strong>, está <strong>aguardando confirmação</strong>. Assim que o agendamento for confirmado, enviaremos uma mensagem para o WhatsApp <strong>${escapeHtml(booking.phone)}</strong> informado por você.<br><br>Agradecemos pela preferência.`;renderPatientPortal();}
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
updateMobileNotificationCard();

// Fecha modais com a tecla Esc no computador e preserva todos os botões de retorno no mobile.
document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;document.querySelectorAll('.modal.open').forEach(m=>m.classList.remove('open'))});



// ===== MENU LATERAL RECOLHÍVEL / RESPONSIVO =====
const rootisApp=document.getElementById('rootisApp');
const sidebarToggle=document.getElementById('sidebarToggle');
const sidebarMobileToggle=document.getElementById('sidebarMobileToggle');
const sidebarBackdrop=document.getElementById('sidebarBackdrop');
const SIDEBAR_COLLAPSED_KEY='rootisSidebarCollapsedV1';
function rootisMobileMenuMode(){return window.matchMedia('(max-width: 900px)').matches}
function applySavedSidebarState(){
  if(!rootisApp)return;
  if(rootisMobileMenuMode()){
    rootisApp.classList.remove('sidebar-collapsed');
    rootisApp.classList.remove('sidebar-mobile-open');
    document.body.classList.remove('sidebar-lock');
  }else{
    rootisApp.classList.toggle('sidebar-collapsed',localStorage.getItem(SIDEBAR_COLLAPSED_KEY)==='1');
  }
  updateSidebarToggleA11y();
}
function updateSidebarToggleA11y(){
  if(!rootisApp||!sidebarToggle)return;
  const collapsed=rootisApp.classList.contains('sidebar-collapsed');
  sidebarToggle.setAttribute('aria-label',collapsed?'Expandir menu':'Recolher menu');
  sidebarToggle.title=collapsed?'Expandir menu':'Recolher menu';
}
function closeMobileSidebar(){
  rootisApp?.classList.remove('sidebar-mobile-open');
  document.body.classList.remove('sidebar-lock');
  sidebarMobileToggle?.setAttribute('aria-expanded','false');
}
function openMobileSidebar(){
  if(!rootisApp)return;
  rootisApp.classList.add('sidebar-mobile-open');
  document.body.classList.add('sidebar-lock');
  sidebarMobileToggle?.setAttribute('aria-expanded','true');
}
sidebarToggle?.addEventListener('click',()=>{
  if(rootisMobileMenuMode())return;
  const collapsed=rootisApp.classList.toggle('sidebar-collapsed');
  localStorage.setItem(SIDEBAR_COLLAPSED_KEY,collapsed?'1':'0');
  updateSidebarToggleA11y();
});
sidebarMobileToggle?.setAttribute('aria-expanded','false');
sidebarMobileToggle?.addEventListener('click',()=>{
  if(rootisApp?.classList.contains('sidebar-mobile-open'))closeMobileSidebar();else openMobileSidebar();
});
sidebarBackdrop?.addEventListener('click',closeMobileSidebar);
document.querySelectorAll('.sidebar .nav,[data-go].profile').forEach(el=>el.addEventListener('click',()=>{if(rootisMobileMenuMode())closeMobileSidebar()}));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&rootisApp?.classList.contains('sidebar-mobile-open'))closeMobileSidebar()});
let sidebarResizeTimer;
window.addEventListener('resize',()=>{clearTimeout(sidebarResizeTimer);sidebarResizeTimer=setTimeout(applySavedSidebarState,100)});
applySavedSidebarState();

renderDentistUI();renderDentistCentral();const patientMode=initPatientMode();if(!patientMode){renderToday();renderPatients();renderAttendances();renderAvailabilityEditor();renderCalendar();renderAvailable(selectedDate);renderConfirmations();const requested=sessionStorage.getItem('rootisOpenPageAfterReload');if(requested){sessionStorage.removeItem('rootisOpenPageAfterReload');if(titles[requested]&&(requested!=='administrador'||isPlatformOwner()))showPage(requested,{remember:false,scroll:false});}}
