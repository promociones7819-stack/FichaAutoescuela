(() => {
  const DBKEY='ficha-autoescuela-v2';
  const ACTIVE_KEY='ficha-autoescuela-active-student';
  const RETURN_KEY='ficha-autoescuela-open-student';

  const style=document.createElement('style');
  style.textContent=`
    .historyEditActions{display:flex;gap:8px;align-items:center}.historyEditBtn{background:#fff;color:var(--blue2);border:1px solid var(--line)}
    .historyVehicle{font-size:12px;color:var(--muted);margin-top:3px}
    .editClassBackdrop{position:fixed;inset:0;background:rgba(0,0,0,.38);z-index:1000;display:flex;align-items:center;justify-content:center;padding:18px}
    .editClassModal{width:min(720px,100%);max-height:90vh;overflow:auto;background:#fff;border-radius:18px;padding:18px;box-shadow:0 20px 60px rgba(0,0,0,.25)}
    .editClassModal h2{margin:0 0 6px}.editClassGrid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.editClassGrid .full{grid-column:1/-1}.editClassActions{display:flex;gap:10px;margin-top:16px}.editClassActions button{flex:1}
    @media(max-width:620px){.editClassGrid{grid-template-columns:1fr}.editClassGrid .full{grid-column:auto}.historyHead{gap:10px}.historyEditActions{flex-direction:column;align-items:stretch}}
  `;
  document.head.appendChild(style);

  function readDb(){try{return JSON.parse(localStorage.getItem(DBKEY)||'{"students":{}}')}catch{return{students:{}}}}
  function permitKey(){const t=document.querySelector('.permitChip.active')?.textContent?.trim();return Object.keys(window.DGT_DATA||{}).find(k=>window.DGT_DATA[k].label===t)||null}
  function activeStudent(db){
    const stored=localStorage.getItem(ACTIVE_KEY);if(stored&&db.students?.[stored])return db.students[stored];
    const title=document.querySelector('#studentTitle')?.textContent?.trim();
    return title?Object.values(db.students||{}).find(s=>(s.name||'').trim()===title)||null:null;
  }
  function vehicleLabel(v){return v==='manual'?'Manual':v==='automatico'?'Automático':v==='adaptado'?'Adaptado':'Sin indicar'}

  function enhanceCards(){
    const cards=[...document.querySelectorAll('#historyList .historyCard')];if(!cards.length)return;
    const db=readDb(),student=activeStudent(db),permit=permitKey(),pdata=student&&permit?student.permits?.[permit]:null;if(!pdata)return;
    const entries=[...(pdata.history||[])].sort((a,b)=>{const d=(b.date||'').localeCompare(a.date||'');return d||(b.createdAt||'').localeCompare(a.createdAt||'')});
    cards.forEach((card,i)=>{
      const entry=entries[i];if(!entry||card.dataset.editReady==='1')return;card.dataset.editReady='1';card.dataset.entryId=entry.id;
      const head=card.querySelector('.historyHead');const oldDelete=head?.querySelector('button');if(!head||!oldDelete)return;
      const actions=document.createElement('div');actions.className='historyEditActions';
      const edit=document.createElement('button');edit.type='button';edit.className='mini historyEditBtn';edit.textContent='Editar';edit.dataset.editClass=entry.id;
      oldDelete.parentNode.insertBefore(actions,oldDelete);actions.append(edit,oldDelete);
      const meta=card.querySelector('.historyMeta');if(meta&&!card.querySelector('.historyVehicle')){const v=document.createElement('div');v.className='historyVehicle';v.textContent=`Vehículo: ${vehicleLabel(entry.vehicleType)}`;meta.insertAdjacentElement('afterend',v)}
    });
  }

  function openEditor(entryId){
    const db=readDb(),student=activeStudent(db),permit=permitKey(),pdata=student&&permit?student.permits?.[permit]:null;if(!pdata)return;
    const entry=(pdata.history||[]).find(e=>e.id===entryId);if(!entry)return;
    const overlay=document.createElement('div');overlay.className='editClassBackdrop';
    overlay.innerHTML=`<div class="editClassModal" role="dialog" aria-modal="true">
      <h2>Editar clase</h2><p class="help">Modifica los datos de la sesión. Las puntuaciones prácticas guardadas no se alteran.</p>
      <div class="editClassGrid">
        <label>Fecha<input id="ecDate" type="date" value="${entry.date||''}"></label>
        <label>Duración (minutos)<input id="ecMinutes" type="number" min="0" step="5" value="${Number(entry.minutes)||0}"></label>
        <label>Itinerario / zona<input id="ecRoute" type="text" value="${String(entry.route||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;')}"></label>
        <label>Tipo de vehículo<select id="ecVehicle"><option value="manual">Manual</option><option value="automatico">Automático</option><option value="adaptado">Adaptado</option></select></label>
        <label class="full">Observaciones<textarea id="ecNotes">${String(entry.notes||'').replace(/&/g,'&amp;').replace(/</g,'&lt;')}</textarea></label>
      </div>
      <div class="editClassActions"><button type="button" class="secondary" id="ecCancel">Cancelar</button><button type="button" id="ecSave">Guardar cambios</button></div>
    </div>`;
    document.body.append(overlay);overlay.querySelector('#ecVehicle').value=entry.vehicleType||'manual';
    overlay.querySelector('#ecCancel').addEventListener('click',()=>overlay.remove());
    overlay.addEventListener('click',e=>{if(e.target===overlay)overlay.remove()});
    overlay.querySelector('#ecSave').addEventListener('click',()=>{
      const date=overlay.querySelector('#ecDate').value;const vehicleType=overlay.querySelector('#ecVehicle').value;
      if(!date){alert('Indica la fecha de la clase.');return}if(!vehicleType){alert('Selecciona el tipo de vehículo.');return}
      entry.date=date;entry.minutes=Number(overlay.querySelector('#ecMinutes').value)||0;entry.route=overlay.querySelector('#ecRoute').value.trim();entry.notes=overlay.querySelector('#ecNotes').value.trim();entry.vehicleType=vehicleType;entry.editedAt=new Date().toISOString();
      student.updatedAt=new Date().toISOString();localStorage.setItem(DBKEY,JSON.stringify(db));sessionStorage.setItem(RETURN_KEY,student.id);location.reload();
    });
  }

  document.addEventListener('click',e=>{const b=e.target.closest('[data-edit-class]');if(!b)return;e.preventDefault();openEditor(b.dataset.editClass)});
  new MutationObserver(enhanceCards).observe(document.querySelector('#tabContent')||document.body,{childList:true,subtree:true});
  enhanceCards();
})();