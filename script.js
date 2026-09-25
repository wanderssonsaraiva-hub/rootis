const ROOTIS_DENTISTS_KEY='rootisDentistsV2';
const ROOTIS_ACTIVE_DENTIST_KEY='rootisActiveDentistIdV2';
const DEFAULT_DENTIST_ID='wandersson-saraiva';
const CARLA_DENTIST_ID='carla-matos-demo';
const ROOTIS_SESSION_USER_KEY='rootisSessionUserIdV2';
// Dr. Wandersson é o proprietário da plataforma. Isso só é exibido na aba Administrador.
let sessionUserId=localStorage.getItem(ROOTIS_SESSION_USER_KEY)||DEFAULT_DENTIST_ID;
const isPlatformOwner=()=>sessionUserId===DEFAULT_DENTIST_ID;
const defaultDentist={id:DEFAULT_DENTIST_ID,name:'Dr. Wandersson Saraiva',cro:'8240',specialty:'Implantes e Endodontia',clinic:'Rootis',whatsapp:'',email:'saraiva@gmail.com',pixKey:'',pixReceiver:'',cardPaymentLink:'',createdAt:'2026-09-25'};
const carlaDemoDentist={id:CARLA_DENTIST_ID,name:'Dra. Carla Matos',cro:'CRO-SP 12345',specialty:'Endodontia e Dentística',clinic:'Clínica Carla Matos',whatsapp:'(11) 99999-1234',email:'carla.matos@exemplo.com',pixKey:'carla.matos@exemplo.com',pixReceiver:'Dra. Carla Matos',cardPaymentLink:'',createdAt:'2026-09-25',isDemo:true};
let dentists=JSON.parse(localStorage.getItem(ROOTIS_DENTISTS_KEY)||'null')||[defaultDentist,carlaDemoDentist];
if(!Array.isArray(dentists)||!dentists.length)dentists=[defaultDentist,carlaDemoDentist];
// Garante que proprietário e dentista de demonstração existam nesta versão.
if(!dentists.some(d=>d.id===DEFAULT_DENTIST_ID))dentists.unshift(defaultDentist);
if(!dentists.some(d=>d.id===CARLA_DENTIST_ID))dentists.push(carlaDemoDentist);
dentists=dentists.map(d=>({...d,pixKey:d.pixKey||'',pixReceiver:d.pixReceiver||'',cardPaymentLink:d.cardPaymentLink||''}));
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
function upsertPatient(booking){
  if(!booking.name)return;
  let p=patients.find(x=>x.name.toLowerCase()===String(booking.name).toLowerCase());
  const next=`${booking.date.split('-').reverse().slice(0,2).join('/')} · ${booking.time}`;
  if(!p){p={name:booking.name,phone:booking.phone||'',email:booking.email||'',last:'—',next};patients.push(p)}else{if(booking.phone)p.phone=booking.phone;if(booking.email)p.email=booking.email;p.next=next}
  persistPatients();
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
if(dentistForm)dentistForm.addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.target);const name=String(f.get('name')||'').trim();if(!name)return;const base=name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'dentista';const id=`${base}-${Date.now().toString().slice(-6)}`;const d={id,name,cro:String(f.get('cro')||'').trim(),specialty:String(f.get('specialty')||'').trim(),clinic:String(f.get('clinic')||'').trim(),whatsapp:String(f.get('whatsapp')||'').trim(),email:String(f.get('email')||'').trim(),pixKey:String(f.get('pixKey')||'').trim(),pixReceiver:'',cardPaymentLink:String(f.get('cardPaymentLink')||'').trim(),createdAt:new Date().toISOString()};dentists.push(d);saveDentists();localStorage.setItem(ROOTIS_ACTIVE_DENTIST_KEY,id);location.reload()});
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


function badge(s){s=String(s||'');const c=s==='Confirmado'?'ok':s==='Cancelado'?'cancelled':s.includes('pagamento')?'paid':'pending';return `<span class="badge ${c}">${s||'Sem status'}</span>`}
function renderToday(){
  const today='2026-09-25';
  const confirmedItems=appointments.filter(a=>a.status==='Confirmado');
  const items=confirmedItems.filter(a=>a.date===today).sort((a,b)=>String(a.time||'').localeCompare(String(b.time||'')));
  todayList.innerHTML=items.length?items.map(a=>{const slot=getConfiguredSlotForBooking(a);const start=slot?.start||a.time,end=slot?.end||a.end;return `<div class="appt"><div class="time">${start}${end?`<br><span style="font-size:8px;color:var(--muted)">até ${end}</span>`:''}</div><div><strong>${a.name}</strong><small>Agendamento confirmado</small></div>${badge(a.status)}</div>`}).join(''):'<div class="closed-day">Nenhum atendimento confirmado nesta agenda hoje.</div>';
  const stat=document.getElementById('statToday');if(stat)stat.textContent=items.length;
  const next=confirmedItems.filter(a=>a.date>=today).sort((a,b)=>(a.date+(getConfiguredSlotForBooking(a)?.start||a.time||'')).localeCompare(b.date+(getConfiguredSlotForBooking(b)?.start||b.time||'')))[0];
  const nextSlot=next?getConfiguredSlotForBooking(next):null;
  document.getElementById('nextApptTime').textContent=next?(nextSlot?.start||next.time):'—';document.getElementById('nextApptName').textContent=next?next.name:'Sem próximo atendimento confirmado';
  document.getElementById('pendingPayments').textContent=appointments.filter(a=>a.status!=='Cancelado'&&String(a.status).toLowerCase().includes('pagamento')).length;
  updateConfirmationCounts();
}
let selectedPatientIndex=0;
function renderSelectedPatient(){
  if(!patients.length){document.getElementById('patientReport').style.display='none';return}
  if(selectedPatientIndex<0||selectedPatientIndex>=patients.length)selectedPatientIndex=0;
  document.getElementById('patientReport').style.display='block';
  const p=patients[selectedPatientIndex],patientAppts=appointments.filter(a=>String(a.name).toLowerCase()===String(p.name).toLowerCase()).sort((a,b)=>(b.date+b.time).localeCompare(a.date+a.time));
  const email=p.email||patientAppts.find(a=>a.email)?.email||'';
  document.getElementById('patientReportAvatar').textContent=initials(p.name);
  document.getElementById('patientReportName').textContent=p.name;
  document.getElementById('patientReportContact').textContent=[p.phone,email].filter(Boolean).join(' · ')||'Contato não informado';
  document.getElementById('patientReportLast').textContent=p.last||'—';document.getElementById('patientReportNext').textContent=p.next||'—';document.getElementById('patientReportTotal').textContent=patientAppts.length;
  const tl=document.getElementById('patientTimeline');tl.innerHTML=patientAppts.length?patientAppts.slice(0,5).map(a=>`<div class="tl"><strong>${String(a.date||'').split('-').reverse().join('/')} · ${a.time||''}</strong><p>${a.status||'Atendimento odontológico'}${a.note?` · ${a.note}`:''}</p></div>`).join(''):'<div class="tl"><strong>Sem histórico registrado</strong><p>Os atendimentos deste paciente aparecerão aqui.</p></div>';
}
function renderPatients(f=''){
  const q=f.toLowerCase();const found=patients.map((p,i)=>({p,i})).filter(({p})=>p.name.toLowerCase().includes(q)||String(p.phone||'').includes(q));
  patientRows.innerHTML=found.length?found.map(({p,i})=>`<tr><td><strong>${p.name}</strong></td><td>${p.phone||'—'}</td><td>${p.last||'—'}</td><td>${p.next||'—'}</td><td><button class="linkbtn patient-report-link" data-patient-index="${i}">Relatório</button></td></tr>`).join(''):'<tr><td colspan="5" style="text-align:center;color:var(--muted)">Nenhum paciente cadastrado nesta agenda.</td></tr>';
  if(patientMobileCards)patientMobileCards.innerHTML=found.length?found.map(({p,i})=>`<article class="patient-mobile-card"><div class="patient-mobile-card-head"><strong>${p.name}</strong><span>${p.phone||'Sem telefone'}</span></div><div class="patient-mobile-card-grid"><div><small>Último atendimento</small><b>${p.last||'—'}</b></div><div><small>Próximo</small><b>${p.next||'—'}</b></div></div><button class="btn btn-primary patient-report-link" type="button" data-patient-index="${i}">Abrir paciente e relatório</button></article>`).join(''):'<div class="closed-day">Nenhum paciente cadastrado nesta agenda.</div>';
  document.querySelectorAll('.patient-report-link').forEach(btn=>btn.onclick=()=>{selectedPatientIndex=Number(btn.dataset.patientIndex);renderSelectedPatient();document.getElementById('patientReport').scrollIntoView({behavior:'smooth',block:'start'})});renderSelectedPatient()
}
patientSearch.oninput=e=>renderPatients(e.target.value);
const dayNames=['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
const baseSlots=()=>[{start:'08:00',end:'11:00'},{start:'12:00',end:'15:00'},{start:'16:00',end:'19:00'}];
const defaultAvailability={0:{open:false,slots:[]},1:{open:true,slots:baseSlots()},2:{open:true,slots:baseSlots()},3:{open:true,slots:baseSlots()},4:{open:true,slots:baseSlots()},5:{open:true,slots:baseSlots()},6:{open:false,slots:[]}};
let availability=JSON.parse(localStorage.getItem(dentistKey('AvailabilityV3'))||'null')||JSON.parse(JSON.stringify(defaultAvailability));
let selectedDate='2026-09-25';
let calendarCursor=new Date(selectedDate+'T12:00:00');
// Corrige somente o conjunto demonstrativo antigo que possuía horários sobrepostos (08:00 e 09:30 na mesma vaga).
if(activeDentistId===CARLA_DENTIST_ID){
  const legacyDemo=appointments.some(a=>a.name==='Lucas Martins'&&a.date==='2026-09-25'&&a.time==='09:30')&&appointments.some(a=>a.name==='Mariana Souza'&&a.date==='2026-09-25'&&a.time==='08:00');
  if(legacyDemo){appointments=seedAppointments.map((a,i)=>({...a,id:`demo-${i+1}`}));persistAppointments();}
}
function formatDate(date){return new Date(date+'T12:00:00').toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long'})}
function timeToMinutes(value){const [h,m]=String(value||'00:00').split(':').map(Number);return (Number.isFinite(h)?h:0)*60+(Number.isFinite(m)?m:0)}
function getSlotsForDate(date,sourceAvailability=availability){if(!date)return[];const d=new Date(date+'T12:00:00'),cfg=sourceAvailability[d.getDay()];if(!cfg||!cfg.open)return[];return(cfg.slots||[]).map((s,i)=>({...s,index:i,label:`Vaga ${i+1} · ${s.start} às ${s.end}`})).sort((a,b)=>timeToMinutes(a.start)-timeToMinutes(b.start))}
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
  if(!list.length){root.innerHTML='<div class="closed-day">Agenda fechada ou sem vagas neste dia. Você pode configurar as vagas em Meu perfil, na seção Agenda e link.</div>';return}
  root.innerHTML=list.map(slot=>{const booked=blockingAppointmentForSlot(date,slot),busy=!!booked;let detail='';if(booked){if(booked.status==='Confirmado')detail=`<br><small style="color:var(--muted)">${escapeHtml(booked.name)} · Confirmado</small>`;else detail=`<br><small style="color:var(--muted)">Reserva em andamento · ${escapeHtml(booked.status)}</small>`}return `<div class="slot"><span><strong>Vaga ${slot.index+1}</strong> · ${slot.start} às ${slot.end}${detail}</span>${busy?`<span class="slot-occupied-label">${booked?.status==='Confirmado'?'Ocupada':'Reservada'}</span>`:`<button onclick="openApptFor('${date}','${slot.start}','${slot.end}')">Disponível</button>`}</div>`}).join('')
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
function renderAvailabilityEditor(){const root=document.getElementById('availabilityEditor');root.innerHTML=dayNames.map((name,i)=>{const c=availability[i]||{open:false,slots:[]},slots=c.slots||[];return `<div class="availability-day-card ${c.open?'':'closed'}" data-day="${i}"><div class="availability-day-head"><label class="availability-day-name"><input type="checkbox" class="day-open" ${c.open?'checked':''}><strong>${name}</strong></label><span class="slot-count">${slots.length} ${slots.length===1?'vaga':'vagas'}</span><button type="button" class="add-slot-btn" data-add-slot="${i}">+ Adicionar vaga</button></div><div class="day-slots">${slots.length?slots.map((s,j)=>`<div class="slot-edit-row" data-slot="${j}"><span class="slot-name">Vaga ${j+1}</span><input type="time" class="slot-start" value="${s.start}"><span class="sep">às</span><input type="time" class="slot-end" value="${s.end}"><button type="button" class="remove-slot-btn" data-remove-slot="${i}:${j}">Remover</button></div>`).join(''):'<div class="no-slots">Nenhuma vaga cadastrada para este dia.</div>'}</div></div>`}).join('');document.querySelectorAll('.day-open').forEach(cb=>cb.onchange=()=>{const card=cb.closest('.availability-day-card');card.classList.toggle('closed',!cb.checked)});document.querySelectorAll('[data-add-slot]').forEach(btn=>btn.onclick=()=>{const i=Number(btn.dataset.addSlot);availability[i].slots=availability[i].slots||[];availability[i].slots.push(nextSlotFrom(i));availability[i].open=true;renderAvailabilityEditor()});document.querySelectorAll('[data-remove-slot]').forEach(btn=>btn.onclick=()=>{const[i,j]=btn.dataset.removeSlot.split(':').map(Number);availability[i].slots.splice(j,1);renderAvailabilityEditor()})}
function saveAvailability(){
  const proposed={};let error='';
  document.querySelectorAll('.availability-day-card').forEach(card=>{if(error)return;const i=Number(card.dataset.day),rows=[...card.querySelectorAll('.slot-edit-row')];const slots=rows.map(row=>({start:row.querySelector('.slot-start').value,end:row.querySelector('.slot-end').value})).filter(s=>s.start&&s.end).sort((a,b)=>timeToMinutes(a.start)-timeToMinutes(b.start));
    for(let j=0;j<slots.length;j++){if(timeToMinutes(slots[j].end)<=timeToMinutes(slots[j].start)){error=`Em ${dayNames[i]}, o fim da vaga deve ser depois do início.`;break}if(j>0&&timeToMinutes(slots[j].start)<timeToMinutes(slots[j-1].end)){error=`Em ${dayNames[i]}, existem vagas sobrepostas. Cada intervalo deve ser exclusivo para um único paciente.`;break}}
    proposed[i]={open:card.querySelector('.day-open').checked,slots};
  });
  if(error){toast(error);return}
  availability=proposed;localStorage.setItem(dentistKey('AvailabilityV3'),JSON.stringify(availability));renderAvailabilityEditor();renderAvailable(selectedDate);renderCalendar();refreshPatientLink();toast('Vagas desta agenda salvas com sucesso. Cada vaga é exclusiva para um paciente.');
}
function updateApptTimes(){const date=document.getElementById('apptDate').value,sel=document.getElementById('apptTime'),list=getSlotsForDate(date),free=list.filter(slot=>!isSlotBusy(date,slot));sel.innerHTML=free.length?free.map(slot=>`<option value="${slot.start}|${slot.end}">${slot.label}</option>`).join(''):'<option value="">Sem vagas disponíveis</option>'}
function openApptFor(date,start,end){document.getElementById('apptDate').value=date;updateApptTimes();document.getElementById('apptTime').value=`${start}|${end}`;openAppt()}
function getPaymentConfig(){return{amount:localStorage.getItem(dentistKey('PaymentAmount'))||'100',method:localStorage.getItem(dentistKey('PaymentMethod'))||'PIX',required:(localStorage.getItem(dentistKey('PaymentRequired'))??'1')==='1',explanation:localStorage.getItem(dentistKey('PaymentExplanation'))||'O profissional poderá orientar sobre o pagamento necessário para confirmar a reserva do horário.',pixKey:activeDentist.pixKey||'',pixReceiver:activeDentist.pixReceiver||'',cardPaymentLink:activeDentist.cardPaymentLink||''}}
function encodePublicState(){const payload={dentist:activeDentist,availability,busy:appointments.filter(a=>a.status!=='Cancelado').map(a=>({date:a.date,time:a.time,end:a.end||'',slotStart:a.slotStart||'',slotEnd:a.slotEnd||'',status:a.status})),payment:getPaymentConfig()};try{return btoa(unescape(encodeURIComponent(JSON.stringify(payload))))}catch(e){return''}}
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
function safeExternalUrl(raw){try{const u=new URL(String(raw||''));return /^https?:$/.test(u.protocol)?u.toString():''}catch(e){return''}}
function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))}
function renderPatientPortal(){
  const params=patientRouteParams(),snap=decodePublicState(params.get('agenda')),pubAvailability=snap&&snap.availability?snap.availability:availability,busyList=snap&&Array.isArray(snap.busy)?snap.busy:appointments.filter(a=>a.status!=='Cancelado').map(a=>({date:a.date,time:a.time,end:a.end||'',slotStart:a.slotStart||'',slotEnd:a.slotEnd||'',status:a.status})),dentist=snap&&snap.dentist?snap.dentist:activeDentist,payment=snap&&snap.payment?snap.payment:getPaymentConfig();
  document.getElementById('publicDentistName').textContent=dentist.name;document.getElementById('publicDentistFooter').textContent=`Rootis · Agendamento com ${dentist.name}`;const root=document.getElementById('publicDays');if(!root)return;const start=new Date();start.setHours(12,0,0,0);const days=[];for(let k=0;k<45;k++){const d=new Date(start);d.setDate(start.getDate()+k);const key=dateKey(d),cfg=pubAvailability[d.getDay()];if(cfg&&cfg.open&&(cfg.slots||[]).length)days.push({key,cfg});if(days.length>=10)break}
  if(!days.length){root.innerHTML='<div class="patient-empty">No momento não há datas abertas para agendamento.</div>';return}
  root.innerHTML=days.map(({key,cfg})=>`<div class="public-day"><div class="public-day-head"><strong>${publicFormatDate(key)}</strong><span>${cfg.slots.length} ${cfg.slots.length===1?'vaga':'vagas'}</span></div><div class="public-slots">${cfg.slots.map((slot,i)=>{const busy=busyList.some(b=>bookingOverlapsSlot(b,key,slot,pubAvailability));return `<button type="button" class="public-slot ${busy?'busy':''}" ${busy?'disabled':''} data-public-date="${key}" data-public-start="${slot.start}" data-public-end="${slot.end}">${busy?'Ocupada':`Vaga ${i+1} · ${slot.start} às ${slot.end}`}</button>`}).join('')}</div></div>`).join('');
  document.querySelectorAll('.public-slot:not(.busy)').forEach(btn=>btn.onclick=()=>{publicSelected={date:btn.dataset.publicDate,start:btn.dataset.publicStart,end:btn.dataset.publicEnd};document.querySelectorAll('.public-slot').forEach(b=>b.classList.remove('selected'));btn.classList.add('selected');document.getElementById('chosenSlot').innerHTML=`<strong>${publicFormatDate(publicSelected.date)}</strong><br>${publicSelected.start} às ${publicSelected.end}`;document.getElementById('patientSuccess').style.display='none'});
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
function rerenderAfterAppointmentChange(a){persistAppointments();refreshPatientNext(a.name);renderToday();renderPatients();renderCalendar();renderAvailable(selectedDate);renderConfirmations();refreshPatientLink()}
function requestPaymentForAppointment(id){const a=appointments.find(x=>x.id===id);if(!a)return;a.status='Aguardando pagamento';a.paymentStatus='Aguardando pagamento';rerenderAfterAppointmentChange(a);toast('Solicitação de pagamento preparada. Abrindo o WhatsApp do paciente...');openWhatsappForAppointment(a,'payment_pending')}
function canConfirmAppointmentWithoutConflict(a){const slot=getConfiguredSlotForBooking(a);if(!slot){toast('Este pedido não corresponde a uma vaga válida da agenda. Remarque o paciente em uma vaga disponível.');return false}const conflict=blockingAppointmentForSlot(a.date,slot,a.id);if(conflict){toast(`Não é possível confirmar: a vaga ${slot.start} às ${slot.end} já está reservada para outro paciente.`);return false}a.time=slot.start;a.end=slot.end;a.slotStart=slot.start;a.slotEnd=slot.end;return true}
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
apptForm.onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),raw=String(f.get('slot')||''),[start,end]=raw.split('|');if(!start||!end){toast('Escolha uma vaga disponível.');return}const date=String(f.get('date')||''),slot=getSlotsForDate(date).find(s=>s.start===start&&s.end===end);if(!slot){toast('Esta vaga não existe mais na agenda. Atualize a data e escolha novamente.');updateApptTimes();return}if(isSlotBusy(date,slot)){toast(`A vaga ${slot.start} às ${slot.end} já está ocupada ou reservada.`);updateApptTimes();return}const status=String(f.get('status')||'Aguardando confirmação'),booking={id:`appt-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,name:f.get('name'),phone:f.get('phone'),email:f.get('email'),time:slot.start,end:slot.end,slotStart:slot.start,slotEnd:slot.end,date,status,paymentStatus:status==='Confirmado'?'Pago':(status.toLowerCase().includes('pagamento')?'Aguardando pagamento':'Não informado'),paymentAmount:status==='Confirmado'?(Number(getPaymentConfig().amount)||0):0,source:'Dentista'};appointments.push(booking);persistAppointments();upsertPatient(booking);renderToday();renderPatients();renderCalendar();renderAvailable(selectedDate);renderConfirmations();refreshPatientLink();closeAppt();toast(status==='Confirmado'?`Atendimento confirmado na vaga ${slot.start} às ${slot.end}.`:`Solicitação reservada na vaga ${slot.start} às ${slot.end} e ainda não aparece na agenda.`)};payForm.onsubmit=e=>{e.preventDefault();closePay();toast('Cobrança gerada. Na versão online, ela será enviada ao paciente.')};
document.getElementById('apptDate').addEventListener('change',updateApptTimes);document.getElementById('saveAvailability').addEventListener('click',saveAvailability);
const activePix=document.getElementById('activeDentistPix'),activePixReceiver=document.getElementById('activeDentistPixReceiver'),activeCardLink=document.getElementById('activeDentistCardLink');if(activePix)activePix.value=activeDentist.pixKey||'';if(activePixReceiver)activePixReceiver.value=activeDentist.pixReceiver||'';if(activeCardLink)activeCardLink.value=activeDentist.cardPaymentLink||'';document.getElementById('saveDentistPaymentData')?.addEventListener('click',()=>{activeDentist.pixKey=activePix.value.trim();activeDentist.pixReceiver=activePixReceiver.value.trim();activeDentist.cardPaymentLink=activeCardLink.value.trim();dentists=dentists.map(d=>d.id===activeDentistId?{...d,pixKey:activeDentist.pixKey,pixReceiver:activeDentist.pixReceiver,cardPaymentLink:activeDentist.cardPaymentLink}:d);saveDentists();renderDentistCentral();refreshPatientLink();toast('PIX e link de cartão salvos para esta agenda.');});
const payment=getPaymentConfig();document.getElementById('paymentExplanation').value=payment.explanation;document.getElementById('paymentAmount').value=payment.amount;document.getElementById('paymentMethod').value=payment.method;document.getElementById('paymentRequired').checked=payment.required;
document.getElementById('savePaymentConfig').addEventListener('click',()=>{localStorage.setItem(dentistKey('PaymentExplanation'),document.getElementById('paymentExplanation').value);localStorage.setItem(dentistKey('PaymentAmount'),document.getElementById('paymentAmount').value);localStorage.setItem(dentistKey('PaymentMethod'),document.getElementById('paymentMethod').value);localStorage.setItem(dentistKey('PaymentRequired'),document.getElementById('paymentRequired').checked?'1':'0');toast('Configuração de pagamento desta agenda salva.');refreshPatientLink();renderDentistFinancialSummary()});
const reminderIds=['patientReminder8h','patientReminder2h','dentistReminder7d','dentistReminder1d','dentistReminder2h','weeklySummaryEnabled'];reminderIds.forEach(id=>{const el=document.getElementById(id),saved=localStorage.getItem(dentistKey('Reminder_'+id));if(saved!==null)el.checked=saved==='1'});const savedDentistWhatsapp=localStorage.getItem(dentistKey('DentistWhatsapp'))||activeDentist.whatsapp;if(savedDentistWhatsapp)document.getElementById('dentistWhatsapp').value=savedDentistWhatsapp;const savedSummaryDay=localStorage.getItem(dentistKey('WeeklySummaryDay'));if(savedSummaryDay!==null)document.getElementById('weeklySummaryDay').value=savedSummaryDay;const savedSummaryTime=localStorage.getItem(dentistKey('WeeklySummaryTime'));if(savedSummaryTime)document.getElementById('weeklySummaryTime').value=savedSummaryTime;
document.getElementById('saveReminderConfig').addEventListener('click',()=>{reminderIds.forEach(id=>localStorage.setItem(dentistKey('Reminder_'+id),document.getElementById(id).checked?'1':'0'));const phone=document.getElementById('dentistWhatsapp').value.trim();localStorage.setItem(dentistKey('DentistWhatsapp'),phone);localStorage.setItem(dentistKey('WeeklySummaryDay'),document.getElementById('weeklySummaryDay').value);localStorage.setItem(dentistKey('WeeklySummaryTime'),document.getElementById('weeklySummaryTime').value);activeDentist.whatsapp=phone;dentists=dentists.map(d=>d.id===activeDentistId?{...d,whatsapp:phone}:d);saveDentists();renderDentistCentral();toast('Configuração de lembretes desta agenda salva.')});
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
    if(!publicSelected){success.style.display='block';success.textContent='Escolha primeiro uma das vagas disponíveis.';return}
    const slot=getSlotsForDate(publicSelected.date).find(s=>s.start===publicSelected.start&&s.end===publicSelected.end);
    if(!slot||isSlotBusy(publicSelected.date,slot)){success.style.display='block';success.textContent='Esta vaga acabou de ser reservada por outra pessoa. Escolha outro horário disponível.';renderPatientPortal();publicSelected=null;return}
    const f=new FormData(e.target),payRequired=getPaymentConfig().required,booking={id:`appt-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,name:f.get('name'),phone:f.get('phone'),email:f.get('email'),note:f.get('note'),time:slot.start,end:slot.end,slotStart:slot.start,slotEnd:slot.end,date:publicSelected.date,status:payRequired?'Aguardando pagamento':'Aguardando confirmação',source:'Paciente',paymentStatus:payRequired?'Aguardando pagamento':'Não exigido',paymentAmount:0};
    appointments.push(booking);persistAppointments();upsertPatient(booking);renderConfirmations();refreshPatientLink();
    success.style.display='block';
    success.innerHTML=`Solicitação registrada para <strong>${publicFormatDate(booking.date)}</strong>, na vaga exclusiva das <strong>${booking.time} às ${booking.end}</strong>. ${payRequired?'O horário fica reservado enquanto o pagamento de confirmação é aguardado. Depois que o dentista identificar o pagamento, o atendimento aparecerá na agenda como confirmado.':'Aguarde a confirmação definitiva do dentista.'} <strong>A confirmação da consulta será enviada para o WhatsApp ${escapeHtml(booking.phone)}.</strong>`;
    e.target.reset();renderPatientPortal();publicSelected=null;
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

// Fecha modais com a tecla Esc no computador e preserva todos os botões de retorno no mobile.
document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;document.querySelectorAll('.modal.open').forEach(m=>m.classList.remove('open'))});

renderDentistUI();renderDentistCentral();const patientMode=initPatientMode();if(!patientMode){renderToday();renderPatients();renderAvailabilityEditor();renderCalendar();renderAvailable(selectedDate);renderConfirmations();const requested=sessionStorage.getItem('rootisOpenPageAfterReload');if(requested){sessionStorage.removeItem('rootisOpenPageAfterReload');if(titles[requested]&&(requested!=='administrador'||isPlatformOwner()))showPage(requested,{remember:false,scroll:false});}}
