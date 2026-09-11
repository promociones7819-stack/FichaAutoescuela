(() => {
  const style = document.createElement('style');
  style.textContent = `
    .legacyStudentsPanel,.legacyDataPanel{display:none!important}
    .studentNameLegacy,.legacyDeleteStudent{display:none!important}
    .sidebar{gap:12px}.sidebar .panel{box-shadow:none}.app{grid-template-columns:280px minmax(0,1fr)}
    @media(max-width:900px){.app{grid-template-columns:1fr}.sidebar{order:2}.content{order:1}}
  `;document.head.appendChild(style);

  function simplify(){
    const sidebar=document.querySelector('.sidebar');if(!sidebar)return;
    const studentList=document.querySelector('#studentList');studentList?.closest('.panel')?.classList.add('legacyStudentsPanel');
    const studentName=document.querySelector('#studentName');const dataPanel=studentName?.closest('.panel');dataPanel?.classList.add('legacyDataPanel');studentName?.closest('label')?.classList.add('studentNameLegacy');document.querySelector('#deleteStudentBtn')?.classList.add('legacyDeleteStudent');
    const syncPanel=[...sidebar.querySelectorAll('.panel')].find(p=>p.textContent.includes('Sincronización sin servidor')||p.textContent.includes('Copia y sincronización'));
    if(syncPanel){const h2=syncPanel.querySelector('h2');if(h2)h2.textContent='Copia y sincronización';const help=syncPanel.querySelector('.help');if(help)help.textContent='Exporta o importa una copia para pasar alumnos, clases, profesores y autoescuelas entre iPad y Mac.'}
  }
  simplify();new MutationObserver(simplify).observe(document.body,{childList:true,subtree:true});
})();