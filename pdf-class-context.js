(() => {
  const DBKEY='ficha-autoescuela-v2';
  const ACTIVE_KEY='ficha-autoescuela-active-student';

  function readDb(){try{return JSON.parse(localStorage.getItem(DBKEY)||'{"students":{}}')}catch{return{students:{}}}}
  function permitKey(){const t=document.querySelector('.permitChip.active')?.textContent?.trim();return Object.keys(window.DGT_DATA||{}).find(k=>window.DGT_DATA[k].label===t)||null}
  function activeStudent(db){const id=localStorage.getItem(ACTIVE_KEY);if(id&&db.students?.[id])return db.students[id];const title=document.querySelector('#studentTitle')?.textContent?.trim();return title?Object.values(db.students||{}).find(s=>(s.name||'').trim()===title)||null:null}

  function prepareContext(mode){
    const db=readDb(),student=activeStudent(db),permit=permitKey();if(!student||!permit)return;
    const pdata=student.permits?.[permit];if(!pdata)return;
    let entry=null;
    if(mode==='class'){const id=document.querySelector('#pdfClassSelect')?.value;entry=(pdata.history||[]).find(e=>e.id===id)||null}
    if(!entry){entry=[...(pdata.history||[])].sort((a,b)=>{const d=(a.date||'').localeCompare(b.date||'');return d||(a.createdAt||'').localeCompare(b.createdAt||'')}).at(-1)||null}
    if(!entry)return;
    student.teacher=entry.teacherName||db.teachers?.[entry.teacherId]?.name||student.teacher||'';
    student.school=entry.schoolName||db.schools?.[entry.schoolId]?.name||student.school||'';
    window.__fichaPdfSchoolName=student.school||'';
    localStorage.setItem(DBKEY,JSON.stringify(db));
  }

  document.addEventListener('click',e=>{if(e.target.closest('#pdfClassDownload'))prepareContext('class');else if(e.target.closest('#pdfFilled'))prepareContext('cumulative')},true);

  if(window.PDFLib?.PDFPage?.prototype?.drawText){
    const proto=window.PDFLib.PDFPage.prototype;if(!proto.__fichaSchoolStamp){const original=proto.drawText;proto.drawText=function(text,options={}){const result=original.call(this,text,options);if(Number(options.size)===8&&Math.abs(Number(options.x)-240)<1&&window.__fichaPdfSchoolName){try{original.call(this,String(window.__fichaPdfSchoolName).slice(0,42),{x:78,y:636,size:8,font:options.font})}catch{}}return result};proto.__fichaSchoolStamp=true}
  }
})();