(() => {
  const DBKEY='ficha-autoescuela-v2';
  const VIEWKEY='ficha-autoescuela-view';

  const style=document.createElement('style');
  style.textContent=`
    .homeTopBtn{background:#fff!important;color:var(--blue2)!important;border:1px solid rgba(255,255,255,.65)!important;min-height:40px;padding:8px 13px}
    .homeView,.catalogView{max-width:1500px;margin:0 auto;padding:18px}.homeHero{padding:26px}.homeHero h2{font-size:28px;margin:0 0 7px}.homeGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-top:16px}.homeCard{background:#fff;border:1px solid var(--line);border-radius:18px;padding:18px;text-align:left;color:var(--ink);min-height:150px}.homeCard strong{display:block;font-size:20px;margin-bottom:7px}.homeCard span{display:block;color:var(--muted);font-weight:500;line-height:1.45}.homeCard .count{font-size:30px;color:var(--blue);font-weight:850;margin-top:12px}
    .catalogToolbar{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:14px}.catalogToolbar h2{margin:0}.catalogGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px}.catalogCard{background:#fff;border:1px solid var(--line);border-radius:16px;padding:14px}.catalogCard h3{margin:0 0 5px}.catalogCard .meta{font-size:13px;color:var(--muted);line-height:1.45}.catalogActions{display:flex;gap:8px;margin-top:12px}.catalogActions button{flex:1}.catalogForm{max-width:680px;margin:0 auto}.catalogFormGrid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.catalogFormGrid .full{grid-column:1/-1}.catalogFormActions{display:flex;gap:10px;margin-top:16px}.catalogFormActions button{flex:1}
    @media(max-width:800px){.homeGrid{grid-template-columns:1fr}.homeView,.catalogView{padding:10px}.catalogToolbar{align-items:stretch;flex-direction:column}.catalogFormGrid{grid-template-columns:1fr}.catalogFormGrid .full{grid-column:auto}}
  `;
  document.head.appendChild(style);

  function readDb(){try{const db=JSON.parse(localStorage.getItem(DBKEY)||'{"students":{}}');db.students=db.students||{};db.teachers=db.teachers||{};db.schools=db.schools||{};return db}catch{return{students:{},teachers:{},schools:{}}}}
  function writeDb(db){localStorage.setItem(DBKEY,JSON.stringify(db))}
  function uid(){return crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random().toString(16).slice(2)}
  function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}

  const app=document.querySelector('main.app');
  const studentsView=document.querySelector('#studentsView');
  const primaryNav=document.querySelector('.primaryNav');
  if(!app||!primaryNav)return;

  const homeView=document.createElement('section');homeView.id='homeView';homeView.className='homeView hidden';
  const catalogView=document.createElement('section');catalogView.id='catalogView';catalogView.className='catalogView hidden';
  (studentsView||app).parentNode.insertBefore(homeView,(studentsView||app).nextSibling);
  homeView.parentNode.insertBefore(catalogView,homeView.nextSibling);

  const homeBtn=document.createElement('button');homeBtn.type='button';homeBtn.id='navHome';homeBtn.textContent='Inicio';primaryNav.prepend(homeBtn);
  const teacherBtn=document.createElement('button');teacherBtn.type='button';teacherBtn.id='navTeachers';teacherBtn.textContent='Profesores';primaryNav.append(teacherBtn);
  const schoolBtn=document.createElement('button');schoolBtn.type='button';schoolBtn.id='navSchools';schoolBtn.textContent='Autoescuelas';primaryNav.append(schoolBtn);

  const topActions=document.querySelector('.topactions');
  const topHome=document.createElement('button');topHome.type='button';topHome.className='homeTopBtn';topHome.textContent='⌂ Inicio';topActions?.prepend(topHome);

  function hideAll(){app.classList.add('hidden');studentsView?.classList.add('hidden');homeView.classList.add('hidden');catalogView.classList.add('hidden');[...primaryNav.querySelectorAll('button')].forEach(b=>b.classList.remove('active'))}
  function showHome(){hideAll();homeView.classList.remove('hidden');homeBtn.classList.add('active');localStorage.setItem(VIEWKEY,'home');renderHome()}
  function showCatalog(type){hideAll();catalogView.classList.remove('hidden');(type==='teachers'?teacherBtn:schoolBtn).classList.add('active');localStorage.setItem(VIEWKEY,type);renderCatalog(type)}
  function showFicha(){hideAll();app.classList.remove('hidden');document.querySelector('#navFicha')?.classList.add('active');localStorage.setItem(VIEWKEY,'ficha')}
  function showStudents(){hideAll();studentsView?.classList.remove('hidden');document.querySelector('#navStudents')?.classList.add('active');localStorage.setItem(VIEWKEY,'students')}

  function renderHome(){
    const db=readDb();
    homeView.innerHTML=`<div class="panel homeHero"><div class="eyebrow">PANEL PRINCIPAL</div><h2>Ficha Autoescuela</h2><p class="help">Gestiona alumnos, profesores y autoescuelas desde un único punto. Puedes volver aquí desde cualquier pantalla.</p><div class="homeGrid">
      <button class="homeCard" data-home-go="students"><strong>Alumnos</strong><span>Altas, datos personales, permisos y fichas de seguimiento.</span><span class="count">${Object.keys(db.students).length}</span></button>
      <button class="homeCard" data-home-go="teachers"><strong>Profesores</strong><span>Crea los profesores disponibles para asignarlos a cada clase práctica.</span><span class="count">${Object.keys(db.teachers).length}</span></button>
      <button class="homeCard" data-home-go="schools"><strong>Autoescuelas</strong><span>Registra las distintas autoescuelas en las que impartes clases.</span><span class="count">${Object.keys(db.schools).length}</span></button>
    </div></div>`;
  }

  function renderCatalog(type){
    const db=readDb(),isTeacher=type==='teachers',items=Object.values(isTeacher?db.teachers:db.schools).sort((a,b)=>(a.name||'').localeCompare(b.name||''));
    catalogView.innerHTML=`<div class="panel"><div class="catalogToolbar"><div><h2>${isTeacher?'Profesores':'Autoescuelas'}</h2><div class="help">${isTeacher?'Profesores que pueden impartir una clase.':'Centros que pueden seleccionarse en cada clase.'}</div></div><button id="catalogNew">＋ ${isTeacher?'Nuevo profesor':'Nueva autoescuela'}</button></div><div id="catalogGrid" class="catalogGrid"></div></div>`;
    const grid=catalogView.querySelector('#catalogGrid');
    if(!items.length)grid.innerHTML=`<div class="help">Todavía no has creado ${isTeacher?'profesores':'autoescuelas'}.</div>`;
    items.forEach(item=>{const card=document.createElement('article');card.className='catalogCard';card.innerHTML=`<h3>${esc(item.name)}</h3><div class="meta">${isTeacher?(item.phone?'Tel.: '+esc(item.phone):''):[item.address,item.phone].filter(Boolean).map(esc).join('<br>')}</div><div class="catalogActions"><button class="secondary" data-cat-edit="${item.id}">Editar</button><button class="danger" data-cat-delete="${item.id}">Eliminar</button></div>`;grid.append(card)});
    catalogView.querySelector('#catalogNew').addEventListener('click',()=>renderCatalogForm(type));
    grid.addEventListener('click',e=>{const edit=e.target.closest('[data-cat-edit]');if(edit)return renderCatalogForm(type,edit.dataset.catEdit);const del=e.target.closest('[data-cat-delete]');if(del)deleteCatalog(type,del.dataset.catDelete)});
  }

  function renderCatalogForm(type,id=null){
    const db=readDb(),isTeacher=type==='teachers',item=id?(isTeacher?db.teachers[id]:db.schools[id]):null;
    catalogView.innerHTML=`<div class="panel catalogForm"><h2>${item?'Editar':'Nuevo'} ${isTeacher?'profesor':'autoescuela'}</h2><p class="help">Estos datos estarán disponibles al crear o editar una clase.</p><div class="catalogFormGrid">
      <label class="full">Nombre<input id="catName" type="text" value="${esc(item?.name||'')}"></label>
      <label>Teléfono<input id="catPhone" type="tel" value="${esc(item?.phone||'')}"></label>
      ${isTeacher?'<label>N.º profesor / referencia<input id="catRef" type="text" value="'+esc(item?.reference||'')+'"></label>':'<label>Dirección<input id="catAddress" type="text" value="'+esc(item?.address||'')+'"></label>'}
    </div><div class="catalogFormActions"><button class="secondary" id="catCancel">Cancelar</button><button id="catSave">Guardar</button></div></div>`;
    catalogView.querySelector('#catCancel').addEventListener('click',()=>renderCatalog(type));
    catalogView.querySelector('#catSave').addEventListener('click',()=>{const name=catalogView.querySelector('#catName').value.trim();if(!name)return alert('Indica un nombre.');const now=new Date().toISOString();const target=item||{id:uid(),createdAt:now};target.name=name;target.phone=catalogView.querySelector('#catPhone').value.trim();if(isTeacher)target.reference=catalogView.querySelector('#catRef').value.trim();else target.address=catalogView.querySelector('#catAddress').value.trim();target.updatedAt=now;if(isTeacher)db.teachers[target.id]=target;else db.schools[target.id]=target;writeDb(db);renderCatalog(type)});
  }

  function deleteCatalog(type,id){
    const db=readDb(),isTeacher=type==='teachers',item=(isTeacher?db.teachers:db.schools)[id];if(!item)return;if(!confirm(`¿Eliminar ${item.name}? Las clases antiguas conservarán el nombre que tenían guardado.`))return;delete (isTeacher?db.teachers:db.schools)[id];writeDb(db);renderCatalog(type);
  }

  homeBtn.addEventListener('click',showHome);topHome.addEventListener('click',showHome);teacherBtn.addEventListener('click',()=>showCatalog('teachers'));schoolBtn.addEventListener('click',()=>showCatalog('schools'));
  document.addEventListener('click',e=>{const go=e.target.closest('[data-home-go]');if(go){const dest=go.dataset.homeGo;if(dest==='students'){document.querySelector('#navStudents')?.click();showStudents()}else showCatalog(dest);return}if(e.target.closest('#navStudents'))localStorage.setItem(VIEWKEY,'students');if(e.target.closest('#navFicha,[data-open]'))localStorage.setItem(VIEWKEY,'ficha')},true);

  const initial=localStorage.getItem(VIEWKEY)||'home';
  if(initial==='teachers'||initial==='schools')showCatalog(initial);else if(initial==='students')showStudents();else if(initial==='ficha')showFicha();else showHome();
})();