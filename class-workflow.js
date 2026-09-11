(() => {
  const DBKEY='ficha-autoescuela-v2';
  const DRAFTKEY='ficha-autoescuela-active-class';
  const ACTIVE_KEY='ficha-autoescuela-active-student';
  let finishing=false;

  function tabs(){return {history:document.querySelector('.tab[data-tab="history"]'),practical:document.querySelector('.tab[data-tab="practical"]')}}
  function draft(){try{return JSON.parse(sessionStorage.getItem(DRAFTKEY)||'null')}catch{return null}}
  function setDraft(v){if(v)sessionStorage.setItem(DRAFTKEY,JSON.stringify(v));else sessionStorage.removeItem(DRAFTKEY)}
  function selectedCount(){return document.querySelectorAll('.rating button.selected').length}
  function clearVisibleRatings(){let guard=0;while(guard++<500){const b=document.querySelector('.rating button.selected');if(!b)break;b.click()}}
  function persistCurrentAppState(){document.querySelector('#saveBtn')?.click()}
  function readDb(){try{const db=JSON.parse(localStorage.getItem(DBKEY)||'{"students":{}}');db.teachers=db.teachers||{};db.schools=db.schools||{};return db}catch{return{students:{},teachers:{},schools:{}}}}
  function permitKey(){const t=document.querySelector('.permitChip.active')?.textContent?.trim();return Object.keys(window.DGT_DATA||{}).find(k=>window.DGT_DATA[k].label===t)||null}
  function activeStudentId(db){const stored=localStorage.getItem(ACTIVE_KEY);if(stored&&db.students?.[stored])return stored;const title=document.querySelector('#studentTitle')?.textContent?.trim();if(title){const found=Object.values(db.students||{}).find(s=>(s.name||'').trim()===title);if(found)return found.id}return null}
  function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
  function optionList(items,placeholder){return `<option value="">${placeholder}</option>`+Object.values(items||{}).sort((a,b)=>(a.name||'').localeCompare(b.name||'')).map(x=>`<option value="${esc(x.id)}">${esc(x.name)}</option>`).join('')}

  function addContextFields(){
    const form=document.querySelector('.historyForm');if(!form)return;
    const db=readDb();
    if(!document.querySelector('#hVehicleType')){const box=document.createElement('div');box.className='historyField';box.innerHTML='<div class="historyFieldLabel">Tipo de vehículo</div><select id="hVehicleType"><option value="">Seleccionar…</option><option value="manual">Manual</option><option value="automatico">Automático</option><option value="adaptado">Adaptado</option></select>';form.append(box)}
    if(!document.querySelector('#hTeacherId')){const box=document.createElement('div');box.className='historyField';box.innerHTML=`<div class="historyFieldLabel">Profesor</div><select id="hTeacherId">${optionList(db.teachers,'Seleccionar profesor…')}</select>`;form.append(box)}
    if(!document.querySelector('#hSchoolId')){const box=document.createElement('div');box.className='historyField';box.innerHTML=`<div class="historyFieldLabel">Autoescuela</div><select id="hSchoolId">${optionList(db.schools,'Seleccionar autoescuela…')}</select>`;form.append(box)}
  }

  function enhanceHistory(){
    addContextFields();
    const btn=document.querySelector('#addClass');if(!btn||btn.dataset.workflow==='1')return;
    btn.dataset.workflow='1';btn.textContent='Comenzar clase y puntuar';
    const panel=btn.closest('.panel');if(panel&&!panel.querySelector('.workflowHint')){const hint=document.createElement('div');hint.className='workflowHint';hint.textContent='Indica fecha, vehículo, profesor y autoescuela. Después pasarás directamente a la valoración práctica del día.';btn.parentElement?.insertAdjacentElement('beforebegin',hint)}
  }

  function startClass(){
    const db=readDb();
    const date=document.querySelector('#hDate')?.value||'',minutes=Number(document.querySelector('#hMinutes')?.value)||0,route=document.querySelector('#hRoute')?.value.trim()||'',notes=document.querySelector('#hNotes')?.value.trim()||'',vehicleType=document.querySelector('#hVehicleType')?.value||'',teacherId=document.querySelector('#hTeacherId')?.value||'',schoolId=document.querySelector('#hSchoolId')?.value||'';
    if(!date)return alert('Selecciona la fecha de la clase.');
    if(!vehicleType)return alert('Selecciona el tipo de vehículo de esta clase.');
    if(!teacherId)return alert('Selecciona el profesor que imparte esta clase.');
    if(!schoolId)return alert('Selecciona la autoescuela de esta clase.');
    const teacher=db.teachers?.[teacherId],school=db.schools?.[schoolId];
    if(!teacher)return alert('El profesor seleccionado ya no existe.');if(!school)return alert('La autoescuela seleccionada ya no existe.');
    setDraft({date,minutes,route,notes,vehicleType,teacherId,teacherName:teacher.name,schoolId,schoolName:school.name,startedAt:new Date().toISOString()});
    tabs().practical?.click();setTimeout(()=>{clearVisibleRatings();persistCurrentAppState();injectPracticalBanner();window.scrollTo({top:0,behavior:'smooth'})},0);
  }

  function vehicleLabel(v){return v==='manual'?'Manual':v==='automatico'?'Automático':v==='adaptado'?'Adaptado':''}
  function injectPracticalBanner(){const d=draft();if(!d)return;const content=document.querySelector('#tabContent');if(!content||content.querySelector('.activeClassBanner'))return;const banner=document.createElement('div');banner.className='activeClassBanner';banner.innerHTML=`<div><strong>Clase en curso · ${esc(d.date)}</strong><span>${d.minutes?`${d.minutes} min · `:''}${esc(d.route||'sin itinerario indicado')} · ${vehicleLabel(d.vehicleType)} · ${esc(d.teacherName)} · ${esc(d.schoolName)}</span></div><button id="finishClassBtn" type="button">Guardar y finalizar clase</button>`;content.prepend(banner)}

  function patchSavedClass(d){
    const db=readDb(),studentId=activeStudentId(db),permit=permitKey(),pdata=studentId&&permit?db.students?.[studentId]?.permits?.[permit]:null;if(!pdata)return false;
    const history=pdata.history||[];let entry=[...history].filter(e=>e.date===d.date&&Number(e.minutes||0)===Number(d.minutes||0)&&String(e.route||'')===String(d.route||'')).sort((a,b)=>(b.createdAt||'').localeCompare(a.createdAt||''))[0];if(!entry)entry=[...history].sort((a,b)=>(b.createdAt||'').localeCompare(a.createdAt||''))[0]||history.at(-1);if(!entry)return false;
    Object.assign(entry,{vehicleType:d.vehicleType,vehicleLabel:vehicleLabel(d.vehicleType),teacherId:d.teacherId,teacherName:d.teacherName,schoolId:d.schoolId,schoolName:d.schoolName,date:d.date,minutes:d.minutes,route:d.route,notes:d.notes,updatedAt:new Date().toISOString()});
    db.students[studentId].updatedAt=new Date().toISOString();localStorage.setItem(DBKEY,JSON.stringify(db));return true;
  }

  function finishClass(){
    const d=draft();if(!d)return;if(selectedCount()===0&&!confirm('No has marcado ninguna puntuación. ¿Guardar igualmente la clase?'))return;
    finishing=true;tabs().history?.click();setTimeout(()=>{
      const map=[['#hDate','date'],['#hMinutes','minutes'],['#hRoute','route'],['#hNotes','notes'],['#hVehicleType','vehicleType'],['#hTeacherId','teacherId'],['#hSchoolId','schoolId']];map.forEach(([sel,key])=>{const el=document.querySelector(sel);if(el)el.value=d[key]||''});
      const btn=document.querySelector('#addClass');if(btn){btn.dataset.allowOriginal='1';btn.click()}
      setTimeout(()=>{tabs().practical?.click();setTimeout(()=>{clearVisibleRatings();persistCurrentAppState();setTimeout(()=>{patchSavedClass(d);setDraft(null);finishing=false;tabs().history?.click()},100)},0)},50);
    },0);
  }

  document.addEventListener('click',e=>{const add=e.target.closest('#addClass');if(add&&!finishing&&add.dataset.allowOriginal!=='1'){e.preventDefault();e.stopImmediatePropagation();startClass();return}if(add&&add.dataset.allowOriginal==='1'){delete add.dataset.allowOriginal;return}if(e.target.closest('#finishClassBtn')){e.preventDefault();finishClass();return}if(e.target.closest('.tab[data-tab="practical"]'))setTimeout(injectPracticalBanner,0);if(e.target.closest('.tab[data-tab="history"]'))setTimeout(enhanceHistory,0)},true);

  const style=document.createElement('style');style.textContent=`.workflowHint{margin:8px 0 10px;color:var(--muted);font-size:13px}.historyForm{grid-template-columns:repeat(3,minmax(0,1fr))!important}.historyFieldLabel{font-size:13px;font-weight:700;color:var(--muted);margin-bottom:5px}.activeClassBanner{display:flex;align-items:center;justify-content:space-between;gap:14px;background:#fff7d6;border:1px solid #f0cf47;border-radius:14px;padding:12px 14px;margin-bottom:12px;position:sticky;top:8px;z-index:8}.activeClassBanner strong{display:block}.activeClassBanner span{display:block;margin-top:3px;color:var(--muted);font-size:13px}.activeClassBanner button{white-space:nowrap}@media(max-width:900px){.historyForm{grid-template-columns:1fr 1fr!important}}@media(max-width:620px){.historyForm{grid-template-columns:1fr!important}.activeClassBanner{align-items:stretch;flex-direction:column}.activeClassBanner button{width:100%}}`;document.head.appendChild(style);
  const obs=new MutationObserver(()=>{enhanceHistory();if(draft())injectPracticalBanner()});obs.observe(document.querySelector('#tabContent')||document.body,{childList:true,subtree:true});enhanceHistory();if(draft())setTimeout(injectPracticalBanner,0);
})();