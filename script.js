const ROOTIS_DENTISTS_KEY='rootisDentistsV1';
const ROOTIS_ACTIVE_DENTIST_KEY='rootisActiveDentistId';
const DEFAULT_DENTIST_ID='wandersson-saraiva';
const defaultDentist={id:DEFAULT_DENTIST_ID,name:'Dr. Wandersson Saraiva',cro:'',specialty:'Implantes e Endodontia',clinic:'Rootis',whatsapp:'',email:'',pixKey:'',pixReceiver:'',cardPaymentLink:'',createdAt:'2026-09-25'};
let dentists=JSON.parse(localStorage.getItem(ROOTIS_DENTISTS_KEY)||'null')||[defaultDentist];
if(!Array.isArray(dentists)||!dentists.length)dentists=[defaultDentist];
dentists=dentists.map(d=>({...d,pixKey:d.pixKey||'',pixReceiver:d.pixReceiver||'',cardPaymentLink:d.cardPaymentLink||''}));
let activeDentistId=localStorage.getItem(ROOTIS_ACTIVE_DENTIST_KEY)||dentists[0].id;
if(!dentists.some(d=>d.id===activeDentistId)){activeDentistId=dentists[0].id;localStorage.setItem(ROOTIS_ACTIVE_DENTIST_KEY,activeDentistId)}
let activeDentist=dentists.find(d=>d.id===activeDentistId)||dentists[0];
const dentistKey=(suffix,id=activeDentistId)=>`rootisDentist_${id}_${suffix}`;
function migrateLegacy(){
  if(activeDentistId!==DEFAULT_DENTIST_ID)return;
  const map={AppointmentsV1:'rootisAppointmentsV1',AvailabilityV3:'rootisAvailabilityV3',PaymentExplanation:'rootisPaymentExplanation',PaymentAmount:'rootisPaymentAmount',PaymentMethod:'rootisPaymentMethod',PaymentRequired:'rootisPaymentRequired',DentistWhatsapp:'rootisDentistWhatsapp',WeeklySummaryDay:'rootisWeeklySummaryDay',WeeklySummaryTime:'rootisWeeklySummaryTime'};
  Object.entries(map).forEach(([suffix,legacy])=>{if(localStorage.getItem(dentistKey(suffix))===null&&localStorage.getItem(legacy)!==null)localStorage.setItem(dentistKey(suffix),localStorage.getItem(legacy))});
  ['patientReminder8h','patientReminder2h','dentistReminder7d','dentistReminder1d','dentistReminder2h','weeklySummaryEnabled'].forEach(id=>{const legacy='rootisReminder_'+id;if(localStorage.getItem(dentistKey('Reminder_'+id))===null&&localStorage.getItem(legacy)!==null)localStorage.setItem(dentistKey('Reminder_'+id),localStorage.getItem(legacy))});
}
migrateLegacy();

const seedAppointments=[
 {name:'Mariana Souza',phone:'(11) 99999-0000',time:'08:00',date:'2026-09-25',status:'Confirmado'},
 {name:'Lucas Martins',phone:'(11) 98888-1111',time:'09:30',date:'2026-09-25',status:'Confirmado'},
 {name:'Ana Ferreira',phone:'(11) 97777-2222',time:'11:00',date:'2026-09-25',status:'Aguardando confirmação'},
 {name:'Carlos Mendes',phone:'(11) 96666-3333',time:'14:00',date:'2026-09-25',status:'Pendente de pagamento'},
 {name:'Juliana Rocha',phone:'',time:'10:00',date:'2026-09-28',status:'Confirmado'},
 {name:'Rafael Nunes',phone:'',time:'15:30',date:'2026-09-30',status:'Confirmado'}
];
const seedPatients=[
 {name:'Mariana Souza',phone:'(11) 99999-0000',last:'25/09/2026',next:'02/10 · 10:00'},
 {name:'Lucas Martins',phone:'(11) 98888-1111',last:'24/09/2026',next:'—'},
 {name:'Ana Ferreira',phone:'(11) 97777-2222',last:'23/09/2026',next:'30/09 · 11:00'},
 {name:'Carlos Mendes',phone:'(11) 96666-3333',last:'20/09/2026',next:'01/10 · 14:00'}
];
let appointments=JSON.parse(localStorage.getItem(dentistKey('AppointmentsV1'))||'null');
if(!appointments)appointments=activeDentistId===DEFAULT_DENTIST_ID?seedAppointments.map(a=>({...a})):[];
appointments=appointments.map((a,i)=>({...a,id:a.id||`appt-${String(a.date||'').replace(/\D/g,'')}-${String(a.time||'').replace(/\D/g,'')}-${i}`}));
let patients=JSON.parse(localStorage.getItem(dentistKey('PatientsV1'))||'null');
if(!patients)patients=activeDentistId===DEFAULT_DENTIST_ID?seedPatients.map(p=>({...p})):[];
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
const titles={central:['Central de dentistas','Cadastre e alterne entre agendas profissionais.'],dashboard:['Dashboard','Sua agenda de forma simples.'],confirmacoes:['Confirmações','Aprove, cancele e avise pacientes pelo WhatsApp.'],agenda:['Agenda','Calendário e horários disponíveis.'],pacientes:['Pacientes','Cadastros e relatórios individuais.'],configuracoes:['Administrador','Defina agenda aberta, pagamentos e lembretes.']};
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
function renderDentistUI(){
  document.getElementById('sidebarDentistName').textContent=activeDentist.name;document.getElementById('sidebarDentistInitials').textContent=initials(activeDentist.name);
  document.getElementById('welcomeDentist').textContent=`Bom dia, ${activeDentist.name}. Aqui está sua agenda de hoje.`;
  document.getElementById('dentistReminderTitle').textContent=`Dentista · ${activeDentist.name}`;
  document.title=`Rootis | ${activeDentist.name}`;
  const wh=document.getElementById('dentistWhatsapp');if(wh&&!wh.value&&activeDentist.whatsapp)wh.value=activeDentist.whatsapp;
}
function saveDentists(){localStorage.setItem(ROOTIS_DENTISTS_KEY,JSON.stringify(dentists))}
function renderDentistCentral(){
  const count=document.getElementById('dentistCount');if(count)count.textContent=dentists.length;
  const active=document.getElementById('activeDentistCard');if(active)active.innerHTML=`<div class="central-dentist-profile"><div class="central-avatar">${initials(activeDentist.name)}</div><div><h4>${activeDentist.name}</h4><p>${profileMeta(activeDentist)}</p><p>${activeDentist.whatsapp||'WhatsApp ainda não informado'}${activeDentist.email?` · ${activeDentist.email}`:''}</p><p>${activeDentist.pixKey?'PIX cadastrado':'PIX não cadastrado'} · ${activeDentist.cardPaymentLink?'Cartão cadastrado':'Link de cartão não cadastrado'}</p></div></div>`;
  const list=document.getElementById('dentistList');if(!list)return;
  list.innerHTML=dentists.map(d=>`<div class="dentist-item ${d.id===activeDentistId?'active-dentist':''}"><div class="dentist-item-avatar">${initials(d.name)}</div><div><strong>${d.name}</strong><small>${profileMeta(d)}</small></div><div class="dentist-item-actions">${d.id===activeDentistId?'<button type="button" disabled>Agenda ativa</button>':`<button type="button" class="open-dentist" data-open-dentist="${d.id}">Abrir agenda</button>`}<button type="button" class="remove-dentist" data-remove-dentist="${d.id}" ${dentists.length===1?'disabled':''}>Excluir</button></div></div>`).join('');
  document.querySelectorAll('[data-open-dentist]').forEach(btn=>btn.onclick=()=>{localStorage.setItem(ROOTIS_ACTIVE_DENTIST_KEY,btn.dataset.openDentist);location.reload()});
  document.querySelectorAll('[data-remove-dentist]').forEach(btn=>btn.onclick=()=>removeDentist(btn.dataset.removeDentist));
}
function removeDentist(id){
  const d=dentists.find(x=>x.id===id);if(!d||dentists.length===1)return;
  if(!confirm(`Excluir o perfil de ${d.name}? Os dados locais desta agenda também serão apagados neste navegador.`))return;
  Object.keys(localStorage).filter(k=>k.startsWith(`rootisDentist_${id}_`)).forEach(k=>localStorage.removeItem(k));
  dentists=dentists.filter(x=>x.id!==id);saveDentists();
  if(activeDentistId===id){localStorage.setItem(ROOTIS_ACTIVE_DENTIST_KEY,dentists[0].id);location.reload();return}
  renderDentistCentral();toast('Dentista removido da Central.');
}
const dentistForm=document.getElementById('dentistForm');
if(dentistForm)dentistForm.addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.target);const name=String(f.get('name')||'').trim();if(!name)return;const base=name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'dentista';const id=`${base}-${Date.now().toString().slice(-6)}`;const d={id,name,cro:String(f.get('cro')||'').trim(),specialty:String(f.get('specialty')||'').trim(),clinic:String(f.get('clinic')||'').trim(),whatsapp:String(f.get('whatsapp')||'').trim(),email:String(f.get('email')||'').trim(),pixKey:String(f.get('pixKey')||'').trim(),pixReceiver:'',cardPaymentLink:String(f.get('cardPaymentLink')||'').trim(),createdAt:new Date().toISOString()};dentists.push(d);saveDentists();localStorage.setItem(ROOTIS_ACTIVE_DENTIST_KEY,id);location.reload()});

function badge(s){s=String(s||'');const c=s==='Confirmado'?'ok':s==='Cancelado'?'cancelled':s.includes('pagamento')?'paid':'pending';return `<span class="badge ${c}">${s||'Sem status'}</span>`}
function renderToday(){
  const today='2026-09-25',activeItems=appointments.filter(a=>a.status!=='Cancelado'),items=activeItems.filter(a=>a.date===today).sort((a,b)=>a.time.localeCompare(b.time));todayList.innerHTML=items.length?items.map(a=>`<div class="appt"><div class="time">${a.end?`${a.time}<br><span style="font-size:8px;color:var(--muted)">até ${a.end}</span>`:a.time}</div><div><strong>${a.name}</strong><small>Agendamento odontológico</small></div>${badge(a.status)}</div>`).join(''):'<div class="closed-day">Nenhum atendimento nesta agenda hoje.</div>';
  const stat=document.getElementById('statToday');if(stat)stat.textContent=items.length;
  const next=activeItems.filter(a=>a.date>=today).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time))[0];document.getElementById('nextApptTime').textContent=next?next.time:'—';document.getElementById('nextApptName').textContent=next?next.name:'Sem próximo atendimento';
  document.getElementById('pendingPayments').textContent=appointments.filter(a=>a.status!=='Cancelado'&&String(a.status).includes('pagamento')).length;
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
function formatDate(date){return new Date(date+'T12:00:00').toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long'})}
function getSlotsForDate(date){if(!date)return[];const d=new Date(date+'T12:00:00'),cfg=availability[d.getDay()];if(!cfg||!cfg.open)return[];return(cfg.slots||[]).map((s,i)=>({...s,index:i,label:`Vaga ${i+1} · ${s.start} às ${s.end}`}))}
function isSlotBusy(date,slot){return appointments.some(a=>a.status!=='Cancelado'&&a.date===date&&a.time===slot.start)}
function renderAvailable(date=selectedDate){selectedDate=date;document.getElementById('selectedDateLabel').textContent=formatDate(date);const list=getSlotsForDate(date),root=document.getElementById('slots');if(!list.length){root.innerHTML='<div class="closed-day">Agenda fechada ou sem vagas neste dia. Você pode configurar as vagas na aba Administrador.</div>';return}root.innerHTML=list.map(slot=>{const busy=isSlotBusy(date,slot);return `<div class="slot"><span><strong>Vaga ${slot.index+1}</strong> · ${slot.start} às ${slot.end}</span>${busy?'<span style="color:#9a6c27;font-size:8px">Ocupada</span>':`<button onclick="openApptFor('${date}','${slot.start}','${slot.end}')">Disponível</button>`}</div>`}).join('')}
function renderCalendar(){const y=2026,m=8,first=new Date(y,m,1).getDay(),days=new Date(y,m+1,0).getDate(),prev=new Date(y,m,0).getDate(),cells=[];for(let i=first-1;i>=0;i--)cells.push({d:prev-i,muted:true,date:''});for(let d=1;d<=days;d++)cells.push({d,muted:false,date:`2026-09-${String(d).padStart(2,'0')}`});let n=1;while(cells.length<42)cells.push({d:n++,muted:true,date:''});calendar.innerHTML=cells.map(c=>`<div class="day ${c.muted?'muted':''} ${c.date==='2026-09-25'?'today':''} ${c.date===selectedDate?'selected-day':''}" ${c.date?`data-date="${c.date}"`:''}><span class="num">${c.d}</span>${c.date?appointments.filter(a=>a.status!=='Cancelado'&&a.date===c.date).slice(0,2).map(a=>`<div class="event">${a.time} · ${a.name.split(' ')[0]}</div>`).join(''):''}</div>`).join('');document.querySelectorAll('.day[data-date]').forEach(el=>el.onclick=()=>{selectedDate=el.dataset.date;renderCalendar();renderAvailable(selectedDate)})}
function nextSlotFrom(dayIndex){const slots=availability[dayIndex].slots||[];if(!slots.length)return{start:'08:00',end:'11:00'};const last=slots[slots.length-1];const[h,m]=last.end.split(':').map(Number);let startM=h*60+m,endM=Math.min(startM+180,23*60+59);const f=v=>`${String(Math.floor(v/60)).padStart(2,'0')}:${String(v%60).padStart(2,'0')}`;return{start:f(startM),end:f(endM)}}
function renderAvailabilityEditor(){const root=document.getElementById('availabilityEditor');root.innerHTML=dayNames.map((name,i)=>{const c=availability[i]||{open:false,slots:[]},slots=c.slots||[];return `<div class="availability-day-card ${c.open?'':'closed'}" data-day="${i}"><div class="availability-day-head"><label class="availability-day-name"><input type="checkbox" class="day-open" ${c.open?'checked':''}><strong>${name}</strong></label><span class="slot-count">${slots.length} ${slots.length===1?'vaga':'vagas'}</span><button type="button" class="add-slot-btn" data-add-slot="${i}">+ Adicionar vaga</button></div><div class="day-slots">${slots.length?slots.map((s,j)=>`<div class="slot-edit-row" data-slot="${j}"><span class="slot-name">Vaga ${j+1}</span><input type="time" class="slot-start" value="${s.start}"><span class="sep">às</span><input type="time" class="slot-end" value="${s.end}"><button type="button" class="remove-slot-btn" data-remove-slot="${i}:${j}">Remover</button></div>`).join(''):'<div class="no-slots">Nenhuma vaga cadastrada para este dia.</div>'}</div></div>`}).join('');document.querySelectorAll('.day-open').forEach(cb=>cb.onchange=()=>{const card=cb.closest('.availability-day-card');card.classList.toggle('closed',!cb.checked)});document.querySelectorAll('[data-add-slot]').forEach(btn=>btn.onclick=()=>{const i=Number(btn.dataset.addSlot);availability[i].slots=availability[i].slots||[];availability[i].slots.push(nextSlotFrom(i));availability[i].open=true;renderAvailabilityEditor()});document.querySelectorAll('[data-remove-slot]').forEach(btn=>btn.onclick=()=>{const[i,j]=btn.dataset.removeSlot.split(':').map(Number);availability[i].slots.splice(j,1);renderAvailabilityEditor()})}
function saveAvailability(){document.querySelectorAll('.availability-day-card').forEach(card=>{const i=Number(card.dataset.day),rows=[...card.querySelectorAll('.slot-edit-row')];availability[i]={open:card.querySelector('.day-open').checked,slots:rows.map(row=>({start:row.querySelector('.slot-start').value,end:row.querySelector('.slot-end').value})).filter(s=>s.start&&s.end)}});localStorage.setItem(dentistKey('AvailabilityV3'),JSON.stringify(availability));renderAvailabilityEditor();renderAvailable(selectedDate);renderCalendar();refreshPatientLink();toast('Vagas desta agenda salvas com sucesso.')}
function updateApptTimes(){const date=document.getElementById('apptDate').value,sel=document.getElementById('apptTime'),list=getSlotsForDate(date),free=list.filter(slot=>!isSlotBusy(date,slot));sel.innerHTML=free.length?free.map(slot=>`<option value="${slot.start}|${slot.end}">${slot.label}</option>`).join(''):'<option value="">Sem vagas disponíveis</option>'}
function openApptFor(date,start,end){document.getElementById('apptDate').value=date;updateApptTimes();document.getElementById('apptTime').value=`${start}|${end}`;openAppt()}
function getPaymentConfig(){return{amount:localStorage.getItem(dentistKey('PaymentAmount'))||'100',method:localStorage.getItem(dentistKey('PaymentMethod'))||'PIX',required:(localStorage.getItem(dentistKey('PaymentRequired'))??'1')==='1',explanation:localStorage.getItem(dentistKey('PaymentExplanation'))||'O profissional poderá orientar sobre o pagamento necessário para confirmar a reserva do horário.',pixKey:activeDentist.pixKey||'',pixReceiver:activeDentist.pixReceiver||'',cardPaymentLink:activeDentist.cardPaymentLink||''}}
function encodePublicState(){const payload={dentist:activeDentist,availability,busy:appointments.filter(a=>a.status!=='Cancelado').map(a=>({date:a.date,time:a.time})),payment:getPaymentConfig()};try{return btoa(unescape(encodeURIComponent(JSON.stringify(payload))))}catch(e){return''}}
function decodePublicState(raw){if(!raw)return null;try{return JSON.parse(decodeURIComponent(escape(atob(raw))))}catch(e){return null}}
function buildPatientLink(){const url=new URL(window.location.href);url.search='';url.hash='';url.searchParams.set('paciente','1');const state=encodePublicState();if(state)url.searchParams.set('agenda',state);return url.toString()}
function refreshPatientLink(){const el=document.getElementById('patientLink');if(el)el.value=buildPatientLink()}
function dateKey(d){return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function publicFormatDate(date){return new Date(date+'T12:00:00').toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long'})}
let publicSelected=null;
function safeExternalUrl(raw){try{const u=new URL(String(raw||''));return /^https?:$/.test(u.protocol)?u.toString():''}catch(e){return''}}
function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))}
function renderPatientPortal(){
  const params=new URLSearchParams(location.search),snap=decodePublicState(params.get('agenda')),pubAvailability=snap&&snap.availability?snap.availability:availability,busyList=snap&&Array.isArray(snap.busy)?snap.busy:appointments.filter(a=>a.status!=='Cancelado').map(a=>({date:a.date,time:a.time})),dentist=snap&&snap.dentist?snap.dentist:activeDentist,payment=snap&&snap.payment?snap.payment:getPaymentConfig();
  document.getElementById('publicDentistName').textContent=dentist.name;document.getElementById('publicDentistFooter').textContent=`Rootis · Agendamento com ${dentist.name}`;const root=document.getElementById('publicDays');if(!root)return;const start=new Date();start.setHours(12,0,0,0);const days=[];for(let k=0;k<45;k++){const d=new Date(start);d.setDate(start.getDate()+k);const key=dateKey(d),cfg=pubAvailability[d.getDay()];if(cfg&&cfg.open&&(cfg.slots||[]).length)days.push({key,cfg});if(days.length>=10)break}
  if(!days.length){root.innerHTML='<div class="patient-empty">No momento não há datas abertas para agendamento.</div>';return}
  root.innerHTML=days.map(({key,cfg})=>`<div class="public-day"><div class="public-day-head"><strong>${publicFormatDate(key)}</strong><span>${cfg.slots.length} ${cfg.slots.length===1?'vaga':'vagas'}</span></div><div class="public-slots">${cfg.slots.map((slot,i)=>{const busy=busyList.some(b=>b.date===key&&b.time===slot.start);return `<button type="button" class="public-slot ${busy?'busy':''}" ${busy?'disabled':''} data-public-date="${key}" data-public-start="${slot.start}" data-public-end="${slot.end}">${busy?'Ocupada':`Vaga ${i+1} · ${slot.start} às ${slot.end}`}</button>`}).join('')}</div></div>`).join('');
  document.querySelectorAll('.public-slot:not(.busy)').forEach(btn=>btn.onclick=()=>{publicSelected={date:btn.dataset.publicDate,start:btn.dataset.publicStart,end:btn.dataset.publicEnd};document.querySelectorAll('.public-slot').forEach(b=>b.classList.remove('selected'));btn.classList.add('selected');document.getElementById('chosenSlot').innerHTML=`<strong>${publicFormatDate(publicSelected.date)}</strong><br>${publicSelected.start} às ${publicSelected.end}`;document.getElementById('patientSuccess').style.display='none'});
  const cardUrl=safeExternalUrl(payment.cardPaymentLink||dentist.cardPaymentLink||'');const pix=String(payment.pixKey||dentist.pixKey||'').trim();const receiver=String(payment.pixReceiver||dentist.pixReceiver||'').trim();let methods='';
  if(pix)methods+=`<div class="payment-method-box"><div class="payment-method-title">PIX</div><div class="pix-display"><code id="publicPixKey">${escapeHtml(pix)}</code><button class="btn btn-ghost" type="button" id="copyPublicPix">Copiar PIX</button></div>${receiver?`<div class="payment-receiver">Recebedor: ${escapeHtml(receiver)}</div>`:''}</div>`;
  if(cardUrl)methods+=`<div class="payment-method-box"><div class="payment-method-title">Cartão</div><div class="payment-actions-public"><a class="btn btn-primary public-card-link" href="${escapeHtml(cardUrl)}" target="_blank" rel="noopener noreferrer">Pagar com cartão</a></div></div>`;
  document.getElementById('publicPayment').innerHTML=`<strong>Pagamento / confirmação do horário</strong><br>${escapeHtml(payment.explanation)}<br><br><strong>Referência:</strong> R$ ${Number(payment.amount||0).toFixed(2).replace('.',',')} · ${escapeHtml(payment.method)}${methods||'<div class="payment-wait-note">O dentista ainda não cadastrou uma chave PIX ou link de cartão nesta agenda.</div>'}<div class="payment-wait-note">Após solicitar o horário, aguarde a confirmação do dentista. O pagamento, quando exigido, não substitui a confirmação do atendimento.</div>`;
  document.getElementById('copyPublicPix')?.addEventListener('click',async()=>{const value=document.getElementById('publicPixKey')?.textContent||'';try{await navigator.clipboard.writeText(value);alert('Chave PIX copiada.')}catch(e){const ta=document.createElement('textarea');ta.value=value;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();alert('Chave PIX copiada.')}});
}
function initPatientMode(){const params=new URLSearchParams(location.search);if(params.get('paciente')!=='1')return false;document.body.classList.add('patient-mode');renderPatientPortal();return true}


function normalizePhone(phone){let n=String(phone||'').replace(/\D/g,'');if(!n)return'';if(n.length===10||n.length===11)n='55'+n;return n}
function brDate(date){if(!date)return'';const [y,m,d]=date.split('-');return `${d}/${m}/${y}`}
function refreshPatientNext(patientName){const p=patients.find(x=>String(x.name).toLowerCase()===String(patientName).toLowerCase());if(!p)return;const next=appointments.filter(a=>a.status!=='Cancelado'&&String(a.name).toLowerCase()===String(patientName).toLowerCase()).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time))[0];p.next=next?`${next.date.split('-').reverse().slice(0,2).join('/')} · ${next.time}`:'—';persistPatients()}
function whatsappTextFor(a,type='confirmed'){
  const clinic=activeDentist.clinic?` na ${activeDentist.clinic}`:'';const period=a.end?`${a.time} às ${a.end}`:a.time;
  if(type==='cancelled')return `Olá, ${a.name}. Informamos que seu atendimento com ${activeDentist.name}, previsto para ${brDate(a.date)} às ${a.time}, foi cancelado. Entre em contato conosco caso queira solicitar um novo horário.`;
  const pay=getPaymentConfig();let payment='';if(pay.required){if(pay.pixKey)payment+=`\nPIX para reserva: ${pay.pixKey}.`;if(pay.cardPaymentLink)payment+=`\nPagamento por cartão: ${pay.cardPaymentLink}`}
  return `Olá, ${a.name}! Seu agendamento com ${activeDentist.name}${clinic} foi CONFIRMADO para ${brDate(a.date)}, das ${period}. Por favor, chegue no horário combinado.${payment}\n\nSe precisar alterar, avise com antecedência.`;
}
function openWhatsappForAppointment(a,type='confirmed'){const phone=normalizePhone(a.phone);if(!phone){toast('Este paciente não possui WhatsApp/telefone cadastrado.');return false}const url=`https://wa.me/${phone}?text=${encodeURIComponent(whatsappTextFor(a,type))}`;window.open(url,'_blank','noopener');return true}
function updateConfirmationCounts(){const pending=appointments.filter(a=>a.status==='Aguardando confirmação').length;['pendingConfirmationsCount','confirmationPendingTotal','sidebarPendingCount'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent=pending})}
let confirmationFilter='pending';
function renderConfirmations(){
  const root=document.getElementById('confirmationList');if(!root)return;updateConfirmationCounts();const filter=document.getElementById('confirmationFilter');if(filter)confirmationFilter=filter.value||confirmationFilter;let items=[...appointments].sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));if(confirmationFilter==='pending')items=items.filter(a=>a.status==='Aguardando confirmação');if(confirmationFilter==='confirmed')items=items.filter(a=>a.status==='Confirmado');if(confirmationFilter==='cancelled')items=items.filter(a=>a.status==='Cancelado');if(!items.length){root.innerHTML='<div class="confirmation-empty">Nenhum atendimento encontrado neste filtro.</div>';return}
  root.innerHTML=items.map(a=>`<article class="confirmation-card"><div class="confirmation-card-top"><div class="confirmation-person"><div class="confirmation-avatar">${initials(a.name)}</div><div><h3>${escapeHtml(a.name||'Paciente')}</h3><p>${escapeHtml(a.phone||'Telefone não informado')}${a.email?` · ${escapeHtml(a.email)}`:''}</p></div></div>${badge(a.status)}</div><div class="confirmation-meta"><div><small>Data</small><strong>${brDate(a.date)}</strong></div><div><small>Horário</small><strong>${escapeHtml(a.time)}${a.end?` às ${escapeHtml(a.end)}`:''}</strong></div><div><small>Origem</small><strong>${escapeHtml(a.source||'Dentista')}</strong></div><div><small>Pagamento</small><strong>${escapeHtml(a.paymentStatus||'Não informado')}</strong></div></div>${a.note?`<div class="confirmation-note"><strong>Observação:</strong> ${escapeHtml(a.note)}</div>`:''}<div class="confirmation-actions">${a.status==='Aguardando confirmação'?`<button class="btn btn-primary" type="button" data-confirm-appt="${a.id}">Confirmar + WhatsApp</button>`:''}${a.status==='Confirmado'?`<button class="btn btn-whatsapp" type="button" data-whatsapp-appt="${a.id}">Enviar confirmação novamente</button>`:''}${a.status!=='Cancelado'?`<button class="btn btn-danger" type="button" data-cancel-appt="${a.id}">Cancelar atendimento</button>`:''}${a.status==='Cancelado'&&a.phone?`<button class="btn btn-whatsapp" type="button" data-cancel-whatsapp="${a.id}">Reenviar aviso de cancelamento</button>`:''}</div></article>`).join('');
  document.querySelectorAll('[data-confirm-appt]').forEach(btn=>btn.onclick=()=>confirmAppointment(btn.dataset.confirmAppt));document.querySelectorAll('[data-cancel-appt]').forEach(btn=>btn.onclick=()=>cancelAppointment(btn.dataset.cancelAppt));document.querySelectorAll('[data-whatsapp-appt]').forEach(btn=>btn.onclick=()=>{const a=appointments.find(x=>x.id===btn.dataset.whatsappAppt);if(a)openWhatsappForAppointment(a,'confirmed')});document.querySelectorAll('[data-cancel-whatsapp]').forEach(btn=>btn.onclick=()=>{const a=appointments.find(x=>x.id===btn.dataset.cancelWhatsapp);if(a)openWhatsappForAppointment(a,'cancelled')});
}
function rerenderAfterAppointmentChange(a){persistAppointments();refreshPatientNext(a.name);renderToday();renderPatients();renderCalendar();renderAvailable(selectedDate);renderConfirmations();refreshPatientLink()}
function confirmAppointment(id){const a=appointments.find(x=>x.id===id);if(!a)return;a.status='Confirmado';rerenderAfterAppointmentChange(a);toast('Atendimento confirmado. Abrindo o WhatsApp do paciente...');openWhatsappForAppointment(a,'confirmed')}
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
apptForm.onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),raw=String(f.get('slot')||''),[start,end]=raw.split('|');if(!start){toast('Escolha uma vaga disponível.');return}const booking={id:`appt-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,name:f.get('name'),phone:f.get('phone'),email:f.get('email'),time:start,end:end||'',date:f.get('date'),status:f.get('status'),source:'Dentista'};appointments.push(booking);persistAppointments();upsertPatient(booking);renderToday();renderPatients();renderCalendar();renderAvailable(selectedDate);closeAppt();toast(`Agendamento salvo na agenda de ${activeDentist.name}.`)};payForm.onsubmit=e=>{e.preventDefault();closePay();toast('Cobrança gerada. Na versão online, ela será enviada ao paciente.')};
document.getElementById('apptDate').addEventListener('change',updateApptTimes);document.getElementById('saveAvailability').addEventListener('click',saveAvailability);
const activePix=document.getElementById('activeDentistPix'),activePixReceiver=document.getElementById('activeDentistPixReceiver'),activeCardLink=document.getElementById('activeDentistCardLink');if(activePix)activePix.value=activeDentist.pixKey||'';if(activePixReceiver)activePixReceiver.value=activeDentist.pixReceiver||'';if(activeCardLink)activeCardLink.value=activeDentist.cardPaymentLink||'';document.getElementById('saveDentistPaymentData')?.addEventListener('click',()=>{activeDentist.pixKey=activePix.value.trim();activeDentist.pixReceiver=activePixReceiver.value.trim();activeDentist.cardPaymentLink=activeCardLink.value.trim();dentists=dentists.map(d=>d.id===activeDentistId?{...d,pixKey:activeDentist.pixKey,pixReceiver:activeDentist.pixReceiver,cardPaymentLink:activeDentist.cardPaymentLink}:d);saveDentists();renderDentistCentral();refreshPatientLink();toast('PIX e link de cartão salvos para esta agenda.');});
const payment=getPaymentConfig();document.getElementById('paymentExplanation').value=payment.explanation;document.getElementById('paymentAmount').value=payment.amount;document.getElementById('paymentMethod').value=payment.method;document.getElementById('paymentRequired').checked=payment.required;
document.getElementById('savePaymentConfig').addEventListener('click',()=>{localStorage.setItem(dentistKey('PaymentExplanation'),document.getElementById('paymentExplanation').value);localStorage.setItem(dentistKey('PaymentAmount'),document.getElementById('paymentAmount').value);localStorage.setItem(dentistKey('PaymentMethod'),document.getElementById('paymentMethod').value);localStorage.setItem(dentistKey('PaymentRequired'),document.getElementById('paymentRequired').checked?'1':'0');toast('Configuração de pagamento desta agenda salva.');refreshPatientLink()});
const reminderIds=['patientReminder8h','patientReminder2h','dentistReminder7d','dentistReminder1d','dentistReminder2h','weeklySummaryEnabled'];reminderIds.forEach(id=>{const el=document.getElementById(id),saved=localStorage.getItem(dentistKey('Reminder_'+id));if(saved!==null)el.checked=saved==='1'});const savedDentistWhatsapp=localStorage.getItem(dentistKey('DentistWhatsapp'))||activeDentist.whatsapp;if(savedDentistWhatsapp)document.getElementById('dentistWhatsapp').value=savedDentistWhatsapp;const savedSummaryDay=localStorage.getItem(dentistKey('WeeklySummaryDay'));if(savedSummaryDay!==null)document.getElementById('weeklySummaryDay').value=savedSummaryDay;const savedSummaryTime=localStorage.getItem(dentistKey('WeeklySummaryTime'));if(savedSummaryTime)document.getElementById('weeklySummaryTime').value=savedSummaryTime;
document.getElementById('saveReminderConfig').addEventListener('click',()=>{reminderIds.forEach(id=>localStorage.setItem(dentistKey('Reminder_'+id),document.getElementById(id).checked?'1':'0'));const phone=document.getElementById('dentistWhatsapp').value.trim();localStorage.setItem(dentistKey('DentistWhatsapp'),phone);localStorage.setItem(dentistKey('WeeklySummaryDay'),document.getElementById('weeklySummaryDay').value);localStorage.setItem(dentistKey('WeeklySummaryTime'),document.getElementById('weeklySummaryTime').value);activeDentist.whatsapp=phone;dentists=dentists.map(d=>d.id===activeDentistId?{...d,whatsapp:phone}:d);saveDentists();renderDentistCentral();toast('Configuração de lembretes desta agenda salva.')});
const patientLink=document.getElementById('patientLink'),copyPatientLink=document.getElementById('copyPatientLink'),previewPatientLink=document.getElementById('previewPatientLink');if(patientLink)refreshPatientLink();if(copyPatientLink)copyPatientLink.addEventListener('click',async()=>{refreshPatientLink();try{await navigator.clipboard.writeText(patientLink.value);toast('Link do paciente copiado.')}catch(e){patientLink.select();document.execCommand('copy');toast('Link do paciente copiado.')}});if(previewPatientLink)previewPatientLink.addEventListener('click',()=>{refreshPatientLink();window.open(patientLink.value,'_blank')});
const patientBookingForm=document.getElementById('patientBookingForm');if(patientBookingForm)patientBookingForm.addEventListener('submit',e=>{e.preventDefault();const success=document.getElementById('patientSuccess');if(!publicSelected){success.style.display='block';success.textContent='Escolha primeiro uma das vagas disponíveis.';return}const f=new FormData(e.target),booking={id:`appt-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,name:f.get('name'),phone:f.get('phone'),email:f.get('email'),note:f.get('note'),time:publicSelected.start,end:publicSelected.end,date:publicSelected.date,status:'Aguardando confirmação',source:'Paciente',paymentStatus:'Não informado'};appointments.push(booking);persistAppointments();upsertPatient(booking);success.style.display='block';success.innerHTML=`Solicitação registrada para <strong>${publicFormatDate(booking.date)}</strong>, das <strong>${booking.time} às ${booking.end}</strong>. O horário ficará aguardando confirmação.`;e.target.reset();renderPatientPortal();publicSelected=null});
document.getElementById('confirmationFilter')?.addEventListener('change',e=>{confirmationFilter=e.target.value;renderConfirmations()});
document.getElementById('patientBackButton')?.addEventListener('click',()=>{if(history.length>1)history.back();else toast('Use o botão voltar do navegador para sair desta página.')});

// Fecha modais com a tecla Esc no computador e preserva todos os botões de retorno no mobile.
document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;document.querySelectorAll('.modal.open').forEach(m=>m.classList.remove('open'))});

renderDentistUI();renderDentistCentral();const patientMode=initPatientMode();if(!patientMode){renderToday();renderPatients();renderAvailabilityEditor();renderCalendar();renderAvailable(selectedDate);renderConfirmations();}
