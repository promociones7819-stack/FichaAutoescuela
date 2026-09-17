const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const fs=require('fs');
(async()=>{
const browser=await chromium.launch({headless:true});const page=await browser.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.setContent('<div id="root"></div>');await page.addScriptTag({content:fs.readFileSync('reduced.js','utf8')});
await page.evaluate(()=>{window.student={name:'Prueba',dni:'original',absences:[]};window.p={history:[]};window.saves=0;window.openReduced=(entryId)=>renderReduced({container:document.querySelector('#root'),p,student,save:()=>saves++,uid:()=>String(Math.random()),entryId});openReduced()});
await page.locator('[data-goal="4"]').check();await page.locator('#rConfirm').click();
if(await page.locator('#rGoals').getAttribute('open')!==null)throw Error('Goals did not collapse');
await page.locator('[data-result="4"]').selectOption('Parcialmente');await page.locator('[data-choice="goal-4"]').selectOption('Escribir…');await page.locator('[data-custom="goal-4"]').fill('Repetir glorietas');
await page.locator('#rAbsenceDate').fill('12-09-2026');await page.locator('#rAddAbsence').click();
await page.locator('#rFinish').click();await page.getByRole('button',{name:'Nueva clase',exact:true}).click();
if(!await page.getByText('Repetir glorietas',{exact:false}).count())throw Error('Prior lesson not linked');
await page.evaluate(()=>{if(p.history.length!==1||student.absences[0]!=='2026-09-12'||student.dni!=='original')throw Error('Persistence/identity');if(ReducedModel.parseDate('31-02-2026')!==null)throw Error('Invalid date accepted');openReduced(p.history[0].id)});
await page.locator('[data-result="4"]').selectOption('Logrado');await page.locator('#rFinish').click();
await page.evaluate(()=>{if(p.history.length!==1||p.history[0].reduced.results[4]!=='Logrado')throw Error('Edit duplicated or lost')});
if(errors.length)throw Error(errors.join('\n'));console.log('PASS: goals, collapse, custom observations, absence date, next-class reference, edit, identity');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
