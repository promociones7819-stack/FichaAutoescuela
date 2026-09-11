(() => {
  const ACTIVE_KEY='ficha-autoescuela-active-student';
  const RETURN_KEY='ficha-autoescuela-open-student';
  const hadReturn=!!sessionStorage.getItem(RETURN_KEY);
  const active=localStorage.getItem(ACTIVE_KEY);

  // Evita que students-ui reabra automáticamente la ficha anterior en cada carga.
  // Solo se permite esa reapertura cuando venimos explícitamente de "Abrir ficha".
  if(!hadReturn && active){
    sessionStorage.setItem('ficha-autoescuela-active-backup',active);
    localStorage.removeItem(ACTIVE_KEY);
  }

  setTimeout(()=>{
    const backup=sessionStorage.getItem('ficha-autoescuela-active-backup');
    if(backup){
      localStorage.setItem(ACTIVE_KEY,backup);
      sessionStorage.removeItem('ficha-autoescuela-active-backup');
    }

    const app=document.querySelector('main.app');
    const students=document.querySelector('#studentsView');
    const home=document.querySelector('#homeView');
    const catalog=document.querySelector('#catalogView');
    const nav=document.querySelector('.primaryNav');

    if(hadReturn){
      // Si se acaba de abrir un alumno, deja visible solo su ficha.
      home?.classList.add('hidden');
      catalog?.classList.add('hidden');
      students?.classList.add('hidden');
      app?.classList.remove('hidden');
      nav?.querySelectorAll('button').forEach(b=>b.classList.remove('active'));
      document.querySelector('#navFicha')?.classList.add('active');
      localStorage.setItem('ficha-autoescuela-view','ficha');
    }else{
      // En una carga normal siempre se entra por Inicio.
      document.querySelector('#navHome')?.click();
      localStorage.setItem('ficha-autoescuela-view','home');
    }
  },120);
})();
