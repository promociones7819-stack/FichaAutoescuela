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
  function readDb(){try{return JSON.parse(localStorage.getItem(DBKEY)||'{"students":{}}')}catch{return{students:{}}}}
  function permitKey(){const t=document.querySelector('.permitChip.active')?.textContent?.trim();return Object.keys(window.DGT_DATA||{}).find(k=>window.DGT_DATA[k].label===t)||null}

  function addVehicleField(){
    const form=document.querySelector('.historyForm');
    if(!form||document.querySelector('#hVehicleType'))return;
    const box=document.createElement('div');box.className='historyField';
    box.innerHTML='<div class="historyFieldLabel">Tipo de vehículo</div><select id="hVehicleType"><option value="">Seleccionar…</option><option value="manual">Manual</option><option value="automatico">Automático</option><option value="adaptado">Adaptado</option></select>';
    form.append(box);
  }

  function enhanceHistory(){
    addVehicleField();
    const btn=document.querySelector('#addClass');
    if(!btn||btn.dataset.workflow==='1')return;
    btn.dataset.workflow='1';
    btn.textContent='Comenzar clase y puntuar';
    const panel=btn.closest('.panel');
    if(panel&&!panel.querySelector('.workflowHint')){
      const hint=document.createElement('div');hint.className='workflowHint';
      hint.textContent='Crea la clase indicando también el tipo de vehículo. Después pasarás directamente a la valoración práctica del día.';
      btn.parentElement?.insertAdjacentElement('beforebegin',hint);
    }
  }

  function startClass(){
    const date=document.querySelector('#hDate')?.value||'';
    const minutes=Number(document.querySelector('#hMinutes')?.value)||0;
    const route=document.querySelector('#hRoute')?.value.trim()||'';
    const notes=document.querySelector('#hNotes')?.value.trim()||'';
    const vehicleType=document.querySelector('#hVehicleType')?.value||'';
    if(!date){alert('Selecciona la fecha de la clase.');return}
    if(!vehicleType){alert('Selecciona el tipo de vehículo de esta clase: Manual, Automático o Adaptado.');return}
    setDraft({date,minutes,route,notes,vehicleType,startedAt:new Date().toISOString()});
    tabs().practical?.click();
    setTimeout(()=>{clearVisibleRatings();persistCurrentAppState();injectPracticalBanner();window.scrollTo({top:0,behavior:'smooth'});},0);
  }

  function vehicleLabel(v){return v==='manual'?'Manual':v==='automatico'?'Automático':v==='adaptado'?'Adaptado':''}
  function injectPracticalBanner(){
    const d=draft();if(!d)return;
    const content=document.querySelector('#tabContent');if(!content||content.querySelector('.activeClassBanner'))return;
    const banner=document.createElement('div');banner.className='activeClassBanner';
    banner.innerHTML=`<div><strong>Clase en curso · ${d.date}</strong><span>${d.minutes?`${d.minutes} min · `:''}${d.route||'sin itinerario indicado'} · ${vehicleLabel(d.vehicleType)}</span></div><button id="finishClassBtn" type="button">Guardar y finalizar clase</button>`;
    content.prepend(banner);
  }

  function patchSavedClassVehicle(d){
    const db=readDb();const studentId=localStorage.getItem(ACTIVE_KEY);const permit=permitKey();
    const pdata=db.students?.[studentId]?.permits?.[permit];if(!pdata)return;
    const candidates=[...(pdata.history||[])].filter(e=>e.date===d.date && Number(e.minutes||0)===Number(d.minutes||0) && String(e.route||'')===String(d.route||''));
    const entry=candidates.sort((a,b)=>(b.createdAt||'').localeCompare(a.createdAt||''))[0] || (pdata.history||[]).at(-1);
    if(entry)entry.vehicleType=d.vehicleType;
    // Keep a fallback for old cumulative PDFs, but the authoritative value is per class.
    pdata.vehicleType=d.vehicleType;
    db.students[studentId].updatedAt=new Date().toISOString();
    localStorage.setItem(DBKEY,JSON.stringify(db));
  }

  function finishClass(){
    const d=draft();if(!d)return;
    if(selectedCount()===0&&!confirm('No has marcado ninguna puntuación. ¿Guardar igualmente la clase?'))return;
    finishing=true;tabs().history?.click();
    setTimeout(()=>{
      const date=document.querySelector('#hDate'),mins=document.querySelector('#hMinutes'),route=document.querySelector('#hRoute'),notes=document.querySelector('#hNotes'),vehicle=document.querySelector('#hVehicleType');
      if(date)date.value=d.date;if(mins)mins.value=d.minutes||'';if(route)route.value=d.route||'';if(notes)notes.value=d.notes||'';if(vehicle)vehicle.value=d.vehicleType||'';
      const btn=document.querySelector('#addClass');if(btn){btn.dataset.allowOriginal='1';btn.click()}
      setTimeout(()=>{
        patchSavedClassVehicle(d);
        tabs().practical?.click();
        setTimeout(()=>{clearVisibleRatings();persistCurrentAppState();setDraft(null);finishing=false;tabs().history?.click();},0);
      },20);
    },0);
  }

  document.addEventListener('click',e=>{
    const add=e.target.closest('#addClass');
    if(add&&!finishing&&add.dataset.allowOriginal!=='1'){e.preventDefault();e.stopImmediatePropagation();startClass();return}
    if(add&&add.dataset.allowOriginal==='1'){delete add.dataset.allowOriginal;return}
    if(e.target.closest('#finishClassBtn')){e.preventDefault();finishClass();return}
    if(e.target.closest('.tab[data-tab="practical"]'))setTimeout(injectPracticalBanner,0);
    if(e.target.closest('.tab[data-tab="history"]'))setTimeout(enhanceHistory,0);
  },true);

  const style=document.createElement('style');style.textContent=`
    .workflowHint{margin:8px 0 10px;color:var(--muted);font-size:13px}
    .activeClassBanner{display:flex;align-items:center;justify-content:space-between;gap:14px;background:#fff7d6;border:1px solid #f0cf47;border-radius:14px;padding:12px 14px;margin-bottom:12px;position:sticky;top:8px;z-index:8}
    .activeClassBanner strong{display:block}.activeClassBanner span{display:block;margin-top:3px;color:var(--muted);font-size:13px}.activeClassBanner button{white-space:nowrap}
    @media(max-width:620px){.activeClassBanner{align-items:stretch;flex-direction:column}.activeClassBanner button{width:100%}}
  `;document.head.appendChild(style);

  const obs=new MutationObserver(()=>{enhanceHistory();if(draft())injectPracticalBanner()});
  obs.observe(document.querySelector('#tabContent')||document.body,{childList:true,subtree:true});
  enhanceHistory();if(draft())setTimeout(injectPracticalBanner,0);
})();