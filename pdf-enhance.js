(() => {
  const DBKEY = 'ficha-autoescuela-v2';
  const XCOLS = [424, 444, 464, 484, 503];
  const LAYOUTS = {
    'B': { fields:{pages:[3,8],xName:130,xTeacher:330,xDate:500,yTop:63}, groups:{
      'Aprendizaje a motor parado':{page:3,ys:[399,423,447,591,615,639,672]},
      'Automatismos básicos':{page:4,ys:[357,378,396,417,438,456,477]},
      'Dominio de mandos':{page:4,ys:[579,603,627,648,672]},
      'Circulación':{page:5,ys:[264,288,309,333,354,378,399,423,447,468,492]},
      'Condiciones especiales':{page:6,ys:[234,255,279,300,324,348,366,396]},
      'Valoración global':{page:6,ys:[483,504,528,549]}
    }},
    'A1/A2': { fields:{pages:[3,8],xName:130,xTeacher:330,xDate:500,yTop:63}, groups:{
      'Aprendizaje a motor parado':{page:3,ys:[399,423,447,471,495,591,615,639,663]},
      'Automatismos básicos':{page:4,ys:[357,378,396,417,438,456,477]},
      'Dominio de mandos':{page:4,ys:[585,606,630,654,675]},
      'Maniobras específicas':{page:5,ys:[234,258,282,306,330,354,378]},
      'Circulación':{page:5,ys:[507,531,552,573,594,624,648,669,693,714,735]},
      'Condiciones especiales':{page:6,ys:[222,246,270,294,318,342,366]},
      'Valoración global':{page:6,ys:[453,477,501,525]}
    }},
    'AM': { fields:{pages:[3,6],xName:130,xTeacher:330,xDate:500,yTop:63}, groups:{
      'Aprendizaje a motor parado':{page:3,ys:[399,423,447,471,495,591,615,639,663]},
      'Automatismos básicos':{page:4,ys:[357,378,396,417,438,456,477]},
      'Dominio de mandos':{page:4,ys:[582,606,627,651]},
      'Maniobras específicas':{page:5,ys:[231,255,279,303]},
      'Valoración global':{page:5,ys:[429,462,486,510,534,558,582]}
    }},
    'C1/C': { fields:{pages:[3,8],xName:130,xTeacher:330,xDate:500,yTop:63}, groups:{
      'Aprendizaje a motor parado':{page:3,ys:[399,423,447,471,591,615,651,687]},
      'Maniobras específicas':{page:4,ys:[300,321,342,363,381,402]},
      'Automatismos básicos':{page:4,ys:[594,615,639,666,690,711,735]},
      'Dominio de mandos':{page:5,ys:[249,270,294,315,339,363]},
      'Circulación':{page:5,ys:[513,552,570,591,609,639,657,675,693,711,729,750]},
      'Condiciones especiales':{page:6,ys:[234,255,279,300,324,348,366,396,420]},
      'Valoración global':{page:6,ys:[504,525,549,573]}
    }},
    'D1/D': { fields:{pages:[3,8],xName:130,xTeacher:330,xDate:500,yTop:63}, groups:{
      'Aprendizaje a motor parado':{page:3,ys:[399,423,447,471,591,615,651,687]},
      'Maniobras específicas':{page:4,ys:[297,318,339,360,378,399]},
      'Automatismos básicos':{page:4,ys:[594,615,639,666,690,711,735]},
      'Dominio de mandos':{page:5,ys:[249,270,294,315,339,363]},
      'Circulación':{page:5,ys:[513,552,570,591,609,639,657,675,693,711,729,750]},
      'Condiciones especiales':{page:6,ys:[234,255,279,300,324,348,366,396,420]},
      'Valoración global':{page:6,ys:[504,525,549,573]}
    }}
  };

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
      const y = page.getHeight() - layout.fields.yTop;
      if (student.name) page.drawText(String(student.name).slice(0,48),{x:layout.fields.xName,y,size:8,font});
      if (student.teacher) page.drawText(String(student.teacher).slice(0,42),{x:layout.fields.xTeacher,y,size:8,font});
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
  function addHistory(doc,font,student,permit,pdata){
    const page = doc.addPage([595.28,841.89]);
    page.drawText('HISTÓRICO DE CLASES',{x:40,y:800,size:16,font});
    page.drawText((student.name||'').slice(0,70),{x:40,y:778,size:11,font});
    page.drawText(window.DGT_DATA[permit].label,{x:40,y:760,size:10,font});
    let y=732;
    [...(pdata.history||[])].sort((a,b)=>(a.date||'').localeCompare(b.date||'')).forEach((e,i)=>{
      if (y<70) return;
      page.drawText(`${i+1}. ${e.date||''}  ${e.minutes||0} min  ${(e.route||'').slice(0,55)}`.slice(0,95),{x:40,y,size:9,font}); y-=15;
      if (e.notes) { page.drawText(String(e.notes).slice(0,105),{x:55,y,size:8,font}); y-=13; }
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
      addHistory(doc,font,ctx.student,ctx.permit,ctx.pdata);
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
