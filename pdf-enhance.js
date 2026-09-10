(() => {
  const DBKEY = 'ficha-autoescuela-v2';
  const XCOLS = [424, 444, 464, 484, 503];

  const LAYOUTS = {
    'B': { fields:{pages:[3,8],xName:78,xTeacher:240,xDate:408}, groups:{
      'Aprendizaje a motor parado':{page:3,ys:[399,423,447,591,615,639,672]},
      'Automatismos básicos':{page:4,ys:[357,378,396,417,438,456,477]},
      'Dominio de mandos':{page:4,ys:[579,603,627,648,672]},
      'Circulación':{page:5,ys:[264,288,309,333,354,378,399,423,447,468,492]},
      'Condiciones especiales':{page:6,ys:[234,255,279,300,324,348,366,396]},
      'Valoración global':{page:6,ys:[483,504,528,549]}
    }, itineraryPage:7,
    summary:{page:8,groups:{
      'Aprendizaje a motor parado':{xs:[57,57,57,58,58,58,58],ys:[292,311,329,455,474,502,531]},
      'Automatismos básicos':{xs:[234,234,234,234,234,234,234],ys:[279,298,316,335,353,372,390]},
      'Dominio de mandos':{xs:[234,234,234,234,234],ys:[465,484,502,521,539]},
      'Circulación':{xs:[404,404,404,404,404,404,404,404,404,404,404],ys:[291,319,348,376,395,413,432,451,469,488,507]},
      'Condiciones especiales':{xs:[404,404,404,404,404,404,404,404],ys:[582,601,619,638,656,675,693,722]}
    }}},
    'A1/A2': { fields:{pages:[3,8],xName:78,xTeacher:240,xDate:408}, groups:{
      'Aprendizaje a motor parado':{page:3,ys:[399,423,447,471,495,591,615,639,663]},
      'Automatismos básicos':{page:4,ys:[357,378,396,417,438,456,477]},
      'Dominio de mandos':{page:4,ys:[585,606,630,654,675]},
      'Maniobras específicas':{page:5,ys:[234,258,282,306,330,354,378]},
      'Circulación':{page:5,ys:[507,531,552,573,594,624,648,669,693,714,735]},
      'Condiciones especiales':{page:6,ys:[222,246,270,294,318,342,366]},
      'Valoración global':{page:6,ys:[453,477,501,525]}
    }, itineraryPage:7},
    'AM': { fields:{pages:[3,6],xName:78,xTeacher:240,xDate:408}, groups:{
      'Aprendizaje a motor parado':{page:3,ys:[399,423,447,471,495,591,615,639,663]},
      'Automatismos básicos':{page:4,ys:[357,378,396,417,438,456,477]},
      'Dominio de mandos':{page:4,ys:[582,606,627,651]},
      'Maniobras específicas':{page:5,ys:[231,255,279,303]},
      'Valoración global':{page:5,ys:[429,462,486,510,534,558,582]}
    }},
    'C1/C': { fields:{pages:[3,8],xName:78,xTeacher:240,xDate:408}, groups:{
      'Aprendizaje a motor parado':{page:3,ys:[399,423,447,471,591,615,651,687]},
      'Maniobras específicas':{page:4,ys:[300,321,342,363,381,402]},
      'Automatismos básicos':{page:4,ys:[594,615,639,666,690,711,735]},
      'Dominio de mandos':{page:5,ys:[249,270,294,315,339,363]},
      'Circulación':{page:5,ys:[513,552,570,591,609,639,657,675,693,711,729,750]},
      'Condiciones especiales':{page:6,ys:[234,255,279,300,324,348,366,396,420]},
      'Valoración global':{page:6,ys:[504,525,549,573]}
    }, itineraryPage:7},
    'D1/D': { fields:{pages:[3,8],xName:78,xTeacher:240,xDate:408}, groups:{
      'Aprendizaje a motor parado':{page:3,ys:[399,423,447,471,591,615,651,687]},
      'Maniobras específicas':{page:4,ys:[297,318,339,360,378,399]},
      'Automatismos básicos':{page:4,ys:[594,615,639,666,690,711,735]},
      'Dominio de mandos':{page:5,ys:[249,270,294,315,339,363]},
      'Circulación':{page:5,ys:[513,552,570,591,609,639,657,675,693,711,729,750]},
      'Condiciones especiales':{page:6,ys:[234,255,279,300,324,348,366,396,420]},
      'Valoración global':{page:6,ys:[504,525,549,573]}
    }, itineraryPage:7}
  };

  const ITINERARY_TOPS = [176,198,218,238,259,279,298,316,335,353,371,390,408,427,445,464,482,500,519,537,556,574,593,611,629,648,666,685,703,722];

  function getActiveContext() {
    const db = JSON.parse(localStorage.getItem(DBKEY) || '{"students":{}}');
    const buttons = [...document.querySelectorAll('#studentList .studentBtn')];
    const active = document.querySelector('#studentList .studentBtn.active');
    if (!active) return null;
    const q = (document.querySelector('#studentSearch')?.value || '').trim().toLowerCase();
    const rows = Object.values(db.students || {}).filter(s => (s.name || '').toLowerCase().includes(q)).sort((a,b)=>(a.name||'').localeCompare(b.name||''));
    const student = rows[buttons.indexOf(active)];
    if (!student) return null;
    const activePermitText = document.querySelector('.permitChip.active')?.textContent?.trim();
    const permit = Object.keys(window.DGT_DATA || {}).find(k => window.DGT_DATA[k].label === activePermitText);
    if (!permit || !student.permits?.[permit]) return null;
    return { student, permit, pdata: student.permits[permit] };
  }

  function proxyUrl(permit) { return `/api/dgt-pdf?permit=${encodeURIComponent(permit)}`; }
  function downloadBlob(bytes, name) {
    const blob = new Blob([bytes], {type:'application/pdf'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download=name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url), 2500);
  }

  function stampIdentity(pages,font,student,pdata,layout){
    for (const pi of layout.fields.pages || []) {
      const page = pages[pi]; if (!page) continue;
      const top = pi === 3 ? 151 : 143;
      const y = page.getHeight() - top;
      if (student.name) page.drawText(String(student.name).slice(0,42),{x:layout.fields.xName,y,size:8,font});
      if (student.teacher) page.drawText(String(student.teacher).slice(0,38),{x:layout.fields.xTeacher,y,size:8,font});
      if (pdata.started) page.drawText(String(pdata.started),{x:layout.fields.xDate,y,size:8,font});
    }
  }

  function stampRatings(pages,font,pdata,permit,layout){
    for (const [group,cfg] of Object.entries(layout.groups || {})) {
      const items = window.DGT_DATA?.[permit]?.practical?.[group] || [];
      const page = pages[cfg.page]; if (!page) continue;
      const h = page.getHeight();
      items.forEach((item,i)=>{
        const value = Number(pdata.practical?.[item]) || 0;
        if (value < 1 || value > 5 || cfg.ys[i] == null) return;
        page.drawText('X',{x:XCOLS[value-1]-2.5,y:h-(cfg.ys[i]+8),size:9,font});
      });
    }
  }

  function stampSummary(pages,font,pdata,permit,layout){
    if (!layout.summary) return;
    const page = pages[layout.summary.page]; if (!page) return;
    const h = page.getHeight();
    for (const [group,cfg] of Object.entries(layout.summary.groups || {})) {
      const items = window.DGT_DATA?.[permit]?.practical?.[group] || [];
      items.forEach((item,i)=>{
        const value = Number(pdata.practical?.[item]) || 0;
        if (!value || cfg.xs[i] == null || cfg.ys[i] == null) return;
        page.drawText('X',{x:cfg.xs[i]-3,y:h-(cfg.ys[i]+4),size:9,font});
      });
    }
  }

  function stampItinerary(pages,font,pdata,layout){
    if (layout.itineraryPage == null) return;
    const page = pages[layout.itineraryPage]; if (!page) return;
    const h = page.getHeight();
    const history = [...(pdata.history || [])].sort((a,b)=>(a.date||'').localeCompare(b.date||''));
    history.slice(0,30).forEach((entry,i)=>{
      const route = String(entry.route || '').trim();
      if (!route) return;
      const yTop = ITINERARY_TOPS[i];
      page.drawText(route.slice(0,78),{x:128,y:h-(yTop+9),size:8,font});
    });
  }

  async function generate() {
    const ctx = getActiveContext();
    if (!ctx) return alert('Selecciona un alumno y un permiso.');
    if (!window.PDFLib) return alert('No se ha cargado el motor PDF.');
    const layout = LAYOUTS[ctx.permit];
    if (!layout) return alert('Este permiso todavía no tiene plantilla calibrada.');
    try {
      const response = await fetch(proxyUrl(ctx.permit));
      if (!response.ok) throw new Error('No se pudo obtener el PDF oficial');
      const doc = await PDFLib.PDFDocument.load(await response.arrayBuffer());
      const font = await doc.embedFont(PDFLib.StandardFonts.Helvetica);
      const pages = doc.getPages();
      stampIdentity(pages,font,ctx.student,ctx.pdata,layout);
      stampRatings(pages,font,ctx.pdata,ctx.permit,layout);
      stampSummary(pages,font,ctx.pdata,ctx.permit,layout);
      stampItinerary(pages,font,ctx.pdata,layout);
      downloadBlob(await doc.save(), `Ficha-${(ctx.student.name||'alumno').replace(/[^\w\-]+/g,'_')}-${ctx.permit.replace('/','-')}.pdf`);
    } catch (err) {
      console.error(err); alert('No se ha podido generar el PDF oficial. Comprueba la conexión.');
    }
  }

  document.addEventListener('click', e => {
    const target = e.target.closest('#pdfFilled, #pdfBase');
    if (!target) return;
    const ctx = getActiveContext(); if (!ctx) return;
    e.preventDefault(); e.stopImmediatePropagation();
    if (target.id === 'pdfBase') window.open(proxyUrl(ctx.permit),'_blank');
    else generate();
  }, true);
})();