/* Teilnehmer:innen: Anmeldung, Willkommen, alle Ansichten */
'use strict';

const T = '<span class="t">(t)</span>';
const TAGLINES = [
  `Sport ist Ober${T}wichtig.`,
  `Ober${T}flächlich war gestern – heute tiefe Kniebeugen.`,
  `Ober${T}arm, Ober${T}schenkel, Ober${T}körper – alles dabei.`,
  `Mit Ober${T} nach oben.`,
  `Hantel in der Hand, Ober${T}hand im Leben.`,
  `Die Ober${T}liga fängt klein an.`,
  `Ober${T}grenze? Gibt's nicht.`,
  `Ober${T}halb der Komfortzone beginnt der Spaß.`,
  `Fürs Ober${T}stübchen: Bewegung macht den Kopf frei.`,
  `Ober${T}klasse: Du hast heute trainiert.`,
  `Nächste Ober${T}stufe: eine Wiederholung mehr als letzte Woche.`,
  `Ober${T}ste Priorität: ein Training, das du auch durchziehst.`,
  `Ober${T}stark – Satz für Satz.`
];
const SUBS = ['Dein Training. Dein Tempo. Mit Plan und einem Grinsen.','Training ist nur ein Teil vom Leben – aber ein verdammt guter.','Dranbleiben, stärker werden, Spaß haben.'];
const MOTIVATION = ['Du musst nicht perfekt sein. Du musst nur anfangen.','Ein kurzes Training ist besser als das perfekte, das nie stattfindet.','Stärker wirst du zwischen den Einheiten – Schlaf und Essen zählen mit.','Jeder Eintrag im Logbuch ist ein Beweis, dass du dranbleibst.'];

/* Wochenziel / Kennzahlen */
const weekGoal = () => (state.profile && state.profile.week_goal) || WEEK_GOAL;
const isTrainerName = s => TRAINER_NAMES.includes(s);
const firstName = () => (state.profile && state.profile.display_name) || 'Champ';

/* ---------- Anmeldung ---------- */
function renderLogin(mode,name){
  const pinStep=mode==='pin', trainerMail=mode==='trainer', tr=pinStep&&isTrainerName(name);
  destroyCharts();
  $('#app').innerHTML = `${themeBtn(true)}<section class="login"><div class="login-in">
    <p class="eyebrow">Dein Training. Dein Tempo.</p>
    <h1 class="slogan">Sport ist Ober<span class="t">(t)</span>wichtig</h1>
    <p class="sub">${esc(pick(SUBS))}</p>
    <form data-form="${trainerMail?'trainer':'login'}" class="card login-card">
      ${trainerMail
        ? `<label>E-Mail<input name="email" type="email" autocomplete="username" required></label>
           <label>Passwort<input name="password" type="password" autocomplete="current-password" required></label>`
        : pinStep
        ? `<input type="hidden" name="name" value="${esc(name)}" autocomplete="username"><p>Hola <b>${esc(name)}</b> – ${tr?'bitte gib dein Trainer-Geheimwort ein.':'bitte gib deine PIN ein.'}</p>
           ${tr?`<label>Geheimwort<input name="pin" type="password" autocomplete="current-password" required autofocus></label>`
                :`<label>PIN<input name="pin" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="8" autocomplete="current-password" required autofocus></label>`}`
        : `<label>Dein Anmeldename<input name="name" autocomplete="username" autocapitalize="none" autocorrect="off" spellcheck="false" placeholder="z. B. anna" required></label>`}
      <button class="btn big" type="submit">${trainerMail||pinStep?'Einloggen':'Los geht\'s'}</button>
      <p class="err" id="loginErr"></p>
    </form>
    ${pinStep?`<button class="link" data-act="show-client-login">← Anderer Name</button>`:trainerMail?`<button class="link" data-act="show-client-login">← Zurück zum normalen Login</button>`:`<button class="link" data-act="show-trainer-login">Trainer-Login per E-Mail</button>`}
    ${legalLinks()}
  </div></section>`;
}
function renderSetPin(){
  destroyCharts();
  const nm=state.profile&&state.profile.display_name?', '+state.profile.display_name:'';
  $('#app').innerHTML=`${themeBtn(true)}<section class="login"><div class="login-in">
    <p class="eyebrow">Hola${esc(nm)}!</p>
    <h1 class="slogan" style="font-size:2.4rem">Lege deine PIN fest</h1>
    <p class="sub">Damit meldest du dich ab jetzt an – zusammen mit deinem Namen. 6 bis 8 Ziffern. Merk sie dir gut.</p>
    <form data-form="setpin" class="card login-card">
      <label>PIN<input name="pin" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="8" autocomplete="new-password" required></label>
      <label>PIN wiederholen<input name="pin2" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="8" autocomplete="new-password" required></label>
      <button class="btn big" type="submit">PIN speichern</button>
      <p class="err" id="loginErr"></p>
    </form>
    <button class="link" data-act="logout">Abbrechen</button>
  </div></section>`;
}

/* ---------- Willkommen: 3 kurze Schritte (alles freiwillig außer der Einwilligung) ---------- */
const GOALS=['Fitter werden','Gesünder leben','Muskeln aufbauen','Schmerzen reduzieren','Wohler fühlen','Besser aussehen'];
const EXPS=['Neuling','Etwas Erfahrung','Erfahren'];
function renderOnboarding(){
  destroyCharts();
  const o=state.ob, s=state.obStep, nm=firstName();
  const dots=`<div class="dots">${[0,1,2].map(i=>`<i class="${i<=s?'on':''}"></i>`).join('')}</div>`;
  let body='';
  if(s===0) body=`<h1 class="slogan" style="font-size:2.3rem">Hola ${esc(nm)}!</h1>
    <p class="sub">Drei kurze Fragen, damit dein Trainer dich besser unterstützen kann. Dauert eine Minute – und du kannst alles überspringen.</p>
    <div class="card login-card"><label>Was ist dein Ziel? (mehrere möglich)</label>
      <div class="chips" style="margin:10px 0 18px">${GOALS.map(g=>`<button type="button" class="choice ${(o.goals||[]).includes(g)?'on':''}" data-act="ob-goal" data-v="${esc(g)}">${esc(g)}</button>`).join('')}</div>
      <label>Wie viel Erfahrung hast du?</label>
      <div class="chips" style="margin:10px 0 18px">${EXPS.map(g=>`<button type="button" class="choice ${o.exp===g?'on':''}" data-act="ob-exp" data-v="${esc(g)}">${esc(g)}</button>`).join('')}</div>
      <label>Wie oft pro Woche möchtest du trainieren?</label>
      <div class="chips" style="margin:10px 0 6px">${[1,2,3,4,5].map(n=>`<button type="button" class="choice ${(o.days||2)===n?'on':''}" data-act="ob-days" data-v="${n}">${n}×</button>`).join('')}</div></div>`;
  if(s===1) body=`<h1 class="slogan" style="font-size:2.3rem">Worauf sollen wir achten?</h1>
    <p class="sub">Verletzungen, Beschwerden oder Besonderheiten (z. B. Schwangerschaft) – nur wenn du magst.</p>
    <div class="card login-card"><div class="chips" style="margin-bottom:14px"><button type="button" class="choice ${o.lim==='nein'?'on':''}" data-act="ob-lim" data-v="nein">Nein, alles gut</button><button type="button" class="choice ${o.lim==='ja'?'on':''}" data-act="ob-lim" data-v="ja">Ja, es gibt etwas</button></div>
      <label class="${o.lim==='ja'?'':'hidden'}" data-limtext>Kurz beschreiben (freiwillig)<textarea name="limtext" rows="4" placeholder="z. B. Knie links, Rücken, Schwangerschaft …">${esc(o.limtext||'')}</textarea></label>
      <p class="warnbox" style="margin:14px 0 0">Bei Herz-Kreislauf-Beschwerden, Schwindel oder Brustschmerz bitte vor dem Training ärztlich abklären lassen. Dein Trainer ersetzt keine Ärztin oder keinen Arzt.</p></div>`;
  if(s===2) body=`<h1 class="slogan" style="font-size:2.3rem">Dein Datenschutz</h1>
    <p class="sub">Transparent und in deiner Hand.</p>
    <div class="card login-card"><p>Ich bin damit einverstanden, dass mein Trainer meine Trainingseinträge und meine freiwilligen Angaben (auch zu Gesundheit) sieht und in dieser App speichert. Ich kann meine Daten jederzeit herunterladen oder mein Konto im Bereich „Profil“ löschen.</p>
      <label style="display:flex;gap:10px;align-items:flex-start;font-size:.95rem;color:var(--ink)"><input type="checkbox" name="consent" style="width:22px;height:22px;margin:0;flex:none" ${o.consent?'checked':''}> <span>Ja, einverstanden. Ich habe die <button type="button" class="link" style="padding:0;text-decoration:underline" data-act="legal" data-w="datenschutz">Datenschutzhinweise</button> gelesen.</span></label>
      <p class="err" id="obErr"></p></div>`;
  $('#app').innerHTML=`${themeBtn(true)}<section class="login"><div class="login-in" style="max-width:520px">${dots}${body}
    <div class="row" style="justify-content:center;margin-top:14px">${s>0?'<button class="btn ghost" data-act="ob-back">Zurück</button>':''}${s<2?'<button class="btn ghost" data-act="ob-next" data-skip="1">Überspringen</button>':''}<button class="btn" data-act="ob-next">${s<2?'Weiter':'Los geht\'s'}</button></div>${legalLinks()}</div></section>`;
}
function obRead(){
  const t=$('[name="limtext"]'); if(t) state.ob.limtext=t.value.trim();
  const c=$('[name="consent"]'); if(c) state.ob.consent=c.checked;
}
Object.assign(acts,{
  'ob-goal':el=>{obRead();const g=state.ob.goals||(state.ob.goals=[]),v=el.dataset.v,i=g.indexOf(v);i>=0?g.splice(i,1):g.push(v);el.classList.toggle('on');},
  'ob-exp':el=>{state.ob.exp=state.ob.exp===el.dataset.v?'':el.dataset.v;$$('[data-act="ob-exp"]').forEach(b=>b.classList.toggle('on',b.dataset.v===state.ob.exp));},
  'ob-days':el=>{state.ob.days=Number(el.dataset.v);$$('[data-act="ob-days"]').forEach(b=>b.classList.toggle('on',Number(b.dataset.v)===state.ob.days));},
  'ob-lim':el=>{obRead();state.ob.lim=el.dataset.v;renderOnboarding();},
  'ob-back':()=>{obRead();state.obStep=Math.max(0,state.obStep-1);renderOnboarding();},
  'ob-next':async el=>{
    obRead();
    if(state.obStep<2){ if(el.dataset.skip&&state.obStep===1){state.ob.lim=null;state.ob.limtext='';} state.obStep++;renderOnboarding();return; }
    if(!state.ob.consent){$('#obErr').textContent='Ohne Einwilligung können wir dein Konto leider nicht einrichten.';return;}
    const o=state.ob,ans={goals:o.goals||[],experience:o.exp||null,limitation:o.lim||null,limitation_text:o.lim==='ja'?(o.limtext||null):null};
    const {error}=await sb.rpc('save_onboarding',{answers:ans,goal:o.days||2,version:CONSENT_VERSION});
    if(error) throw error;
    await enter(false);
  }
});

async function enter(isLogin){
  const {data:p} = await sb.from('profiles').select('*').eq('id',state.user.id).maybeSingle();
  if(!p){ await sb.auth.signOut(); renderLogin(); toast('Konto ist noch nicht vollständig eingerichtet.',true); return; }
  state.profile=p; state.isAdmin=p.role==='admin'; state.v2=('onboarded' in p); state.logs=null; state.adm=null; state.prefill='';
  if(!state.isAdmin && !p.is_demo && !p.pin_set){ renderSetPin(); return; }
  await loadCommon();
  if(!state.isAdmin && state.v2 && !p.is_demo && !p.onboarded){ state.obStep=0; state.ob={days:2}; renderOnboarding(); return; }
  state.tab = state.isAdmin ? 'a-stats' : 'home';
  track(isLogin?'login':'visit', device());
  renderShell();
}
async function loadCommon(){
  const [t,e,p] = await Promise.all([
    sb.from('tips').select('*').order('position').order('id'),
    sb.from('exercises').select('*').order('name'),
    sb.from('plan_items').select('*').order('position').order('id')
  ]);
  [t,e,p].forEach(r=>{ if(r.error) throw r.error; });
  state.tips=t.data; state.exercises=e.data; state.planItems=p.data;
  state.v3 = p.data.length ? ('variant' in p.data[0]) : (await sb.from('plan_items').select('variant').limit(1)).error==null;
}
function renderShell(){
  const tabs = state.isAdmin ? ADMIN_TABS : CLIENT_TABS;
  $('#app').innerHTML = `<header class="top"><div class="wrap bar">
    <div class="brand">Sport ist Ober<span class="t">(t)</span>wichtig ${state.profile.is_demo?'<span class="badge">DEMO</span>':''}${state.isAdmin?'<span class="badge">TRAINER</span>':''}</div>
    <nav class="nav">${tabs.map(([k,l,i])=>`<button data-act="nav" data-tab="${k}" class="${k===state.tab?'on':''}">${ic(i)}<span>${l}</span></button>`).join('')}</nav>
    <div class="bar-r">${themeBtn(false)}${state.isAdmin?'<button class="link out" data-act="logout">Abmelden</button>':`<button class="iconbtn" data-act="nav" data-tab="profile" aria-label="Profil" title="Profil">${ic('user')}</button>`}</div></div></header>
    <main class="wrap" id="view"></main>${state.isAdmin?'':'<div class="rt" id="rt"></div>'}`;
  restRender();
  renderView();
}
async function renderView(keep){
  const v=$('#view'); if(!v) return;
  const y=window.scrollY; destroyCharts();
  if(!keep) v.innerHTML='<div class="skel"></div><div class="skel s2"></div><div class="skel s3"></div>';
  const box=document.createElement('div'); box.className='view';
  try{ await views[state.tab](box); }
  catch(err){ box.innerHTML=`<div class="card"><b>Fehler:</b> ${esc(err.message||err)}</div>`; }
  if(!$('#view')) return;
  if(!state.isAdmin&&!state.v2) box.insertAdjacentHTML('afterbegin','<p class="warnbox">Hinweis für den Trainer: Das Datenbank-Update <b>update_v2.sql</b> wurde noch nicht ausgeführt. Bis dahin sind eigener Plan, Willkommens-Fragen und Datenschutz-Funktionen nicht verfügbar.</p>');
  box.insertAdjacentHTML('beforeend','<p class="foot">Die Tipps auf dieser Seite ersetzen keine ärztliche Beratung. Bei Schmerzen: Übung abbrechen und abklären lassen.</p>');
  v.replaceChildren(box);
  window.scrollTo({top: keep?y:0,behavior:'instant'});
  observeReveals(box);
  if(box._after) box._after();
}

/* ---------- Kennzahlen ---------- */
async function ensureLogs(){
  if(!state.logs) state.logs = await fetchAll('workout_logs','*','log_date',q=>q.eq('user_id',state.user.id));
  return state.logs;
}
function weekStart(d){const x=new Date(d);x.setHours(0,0,0,0);x.setDate(x.getDate()-((x.getDay()+6)%7));return x.getTime();}
function prevWeek(t){const x=new Date(t);x.setDate(x.getDate()-7);return x.getTime();}
function streakWeeks(logs){
  const ws=new Set(logs.map(l=>weekStart(l.log_date+'T00:00:00')));
  let cur=weekStart(new Date()); if(!ws.has(cur)) cur=prevWeek(cur);
  let n=0; while(ws.has(cur)){n++;cur=prevWeek(cur);} return n;
}
function currentWeek(){
  const s=state.profile&&state.profile.program_start;
  if(s){const days=Math.round((new Date(today()+'T00:00:00')-new Date(s+'T00:00:00'))/864e5);return Math.max(1,Math.floor(days/7)+1);}
  const ws=(state.logs||[]).map(l=>l.week).filter(w=>w!=null);
  return ws.length?Math.max(...ws):1;
}
const kpi = (val,label) => `<div class="kpi"><b>${statHtml(val)}</b><span>${esc(label)}</span></div>`;
const fmtSet = l => `${l.sets==null?'–':l.sets}×${l.reps==null?'–':l.reps}${l.weight!=null?' @ '+l.weight+' kg':''}`;
const volumeOf = logs => logs.reduce((s,l)=>s+(Number(l.sets)||1)*(Number(l.reps)||0)*(Number(l.weight)||0),0);
const fmtVol = kg => kg>=1000?(Math.round(kg/100)/10).toLocaleString('de-DE')+' t':Math.round(kg).toLocaleString('de-DE')+' kg';
const planPoolNames = () => { const {items}=myPlan(state.user.id); return items.map(it=>{const ex=state.exercises.find(e=>e.id===it.exercise_id);return ex&&ex.name;}).filter(Boolean); };

/* Wöchentliche Mini-Challenges: werden automatisch aus dem Logbuch geprüft */
function challenge(logs){
  const ws=weekStart(new Date()), thisW=logs.filter(l=>weekStart(l.log_date+'T00:00:00')===ws), before=logs.filter(l=>weekStart(l.log_date+'T00:00:00')<ws);
  const days=new Set(thisW.map(l=>l.log_date)).size, names=new Set(thisW.map(l=>l.exercise));
  const best=(arr,n)=>{let m=-1;arr.filter(l=>l.exercise===n).forEach(l=>{const v=l.weight!=null?Number(l.weight):Number(l.reps)||0;if(v>m)m=v;});return m;};
  let improved=0; names.forEach(n=>{const b=best(before,n);if(b>=0&&best(thisW,n)>b)improved++;});
  const plan=[...new Set(planPoolNames())];
  const list=[
    {icon:'calendar',title:'Wochenziel knacken',text:`Trainiere diese Woche an ${weekGoal()} verschiedenen Tagen.`,val:days,goal:weekGoal()},
    {icon:'layers',title:'Abwechslung',text:'Trage diese Woche vier verschiedene Übungen ein.',val:names.size,goal:4},
    {icon:'trend',title:'Ein bisschen mehr',text:'Steigere bei einer Übung Gewicht oder Wiederholungen gegenüber früher.',val:improved,goal:1},
    {icon:'notebook',title:'Gefühl festhalten',text:'Schreibe bei zwei Einträgen eine kurze Notiz, wie es sich angefühlt hat.',val:thisW.filter(l=>l.note).length,goal:2},
    {icon:'target',title:'Plan komplett',text:'Trage jede Übung deines Plans einmal ein.',val:plan.filter(n=>names.has(n)).length,goal:Math.max(1,plan.length)},
    {icon:'barbell',title:'Satz-Sammler',text:'Sammle diese Woche 20 Sätze.',val:thisW.reduce((s,l)=>s+(Number(l.sets)||1),0),goal:20}
  ];
  const wk=Math.floor(ws/(7*864e5));
  const c=list[wk%list.length]; c.done=c.val>=c.goal; return c;
}
const challengeHtml=c=>`<div class="chal"><span class="chal-ic">${ic(c.icon)}</span><div style="flex:1"><p class="eyebrow" style="margin:0 0 .3em">Challenge der Woche</p><b>${esc(c.title)}</b> ${c.done?'<span class="badge aktiv">GESCHAFFT 🎉</span>':''}<p class="muted" style="margin:.2em 0 0;font-size:.92rem">${esc(c.text)}</p><span class="bar"><i style="--w:${Math.min(100,c.val/c.goal*100)}%"></i></span><small class="muted">${Math.min(c.val,c.goal)} von ${c.goal}</small></div></div>`;

/* Auszeichnungen */
function badges(logs){
  const days=new Set(logs.map(l=>l.log_date)).size, streak=streakWeeks(logs), vol=volumeOf(logs);
  const names=new Set(logs.map(l=>l.exercise)), plan=[...new Set(planPoolNames())];
  const byEx={};logs.slice().sort((a,b)=>a.log_date.localeCompare(b.log_date)).forEach(l=>{if(l.weight==null)return;(byEx[l.exercise]||(byEx[l.exercise]=[])).push(Number(l.weight));});
  const pr=Object.values(byEx).some(a=>a.length>1&&Math.max(...a)>a[0]);
  const wd={};logs.forEach(l=>{const k=weekStart(l.log_date+'T00:00:00');(wd[k]||(wd[k]=new Set())).add(l.log_date);});
  const goalWeek=Object.values(wd).some(s=>s.size>=weekGoal());
  const own=state.exercises.some(e=>e.owner_id===state.user.id)||state.planItems.some(i=>i.by_user);
  const B=(id,icon,title,sub,ok)=>({id,icon,title,sub,ok});
  return [
    B('first','flag','Erster Eintrag','Der Anfang ist gemacht',logs.length>=1),
    B('d5','medal','5 Trainingstage','Du bist dabei',days>=5),
    B('d10','medal','10 Trainingstage','Zweistellig!',days>=10),
    B('d25','trophy','25 Trainingstage','Echte Routine',days>=25),
    B('d50','trophy','50 Trainingstage','Stark!',days>=50),
    B('s2','flame','2 Wochen in Folge','Dranbleiben',streak>=2),
    B('s4','flame','4 Wochen in Folge','Ein ganzer Monat',streak>=4),
    B('s8','flame','8 Wochen in Folge','Unaufhaltsam',streak>=8),
    B('goal','star','Wochenziel geknackt','Mindestens einmal',goalWeek),
    B('pr','trend','Erste Steigerung','Mehr Gewicht als zu Beginn',pr),
    B('t1','kettlebell','1 Tonne bewegt','Gesamtgewicht',vol>=1000),
    B('t10','barbell','10 Tonnen bewegt','Gesamtgewicht',vol>=10000),
    B('var','layers','10 Übungen','Abwechslung',names.size>=10),
    B('plan','target','Plan-Profi','Alle Plan-Übungen probiert',plan.length>0&&plan.every(n=>names.has(n))),
    B('own','rocket','Eigener Weg','Eigener Plan oder Übung',own)
  ];
}
const badgesHtml=list=>`<div class="badges">${list.map(b=>`<div class="bdg st ${b.ok?'':'lock'}" style="--i:${list.indexOf(b)}"><div class="bi">${ic(b.icon)}</div>${esc(b.title)}<small>${esc(b.sub)}</small></div>`).join('')}</div>`;

/* ---------- Start ---------- */
function ringSvg(val,max){
  const size=190,r=size/2-12,c=2*Math.PI*r,p=Math.min(1,max?val/max:0),mid=size/2;
  return `<svg class="ring" viewBox="0 0 ${size} ${size}" role="img" aria-label="${val} von ${max} Trainingstagen diese Woche">
    <defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--accent)"/><stop offset="1" style="stop-color:var(--accent2)"/></linearGradient></defs>
    <circle class="ring-bg" cx="${mid}" cy="${mid}" r="${r}"/>
    <circle class="ring-fg" cx="${mid}" cy="${mid}" r="${r}" stroke-dasharray="${c}" stroke-dashoffset="${c}" data-to="${c*(1-p)}" transform="rotate(-90 ${mid} ${mid})"/></svg>`;
}
const storyTips = () => state.tips.filter(t=>(t.category||'')!==STUDIO_CAT);
const colorOf = (t,i) => t.color||('v'+((i%5)+1));
function pickTip(force){
  const pool=storyTips(); if(!pool.length) return null;
  let last=null; try{last=localStorage.getItem('obert-lasttip');}catch(e){}
  const cand=pool.filter(t=>String(t.id)!==last), t=pick(cand.length?cand:pool);
  try{localStorage.setItem('obert-lasttip',String(t.id));}catch(e){}
  return t;
}
function tipCard(t){
  if(!t) return '';
  const idx=state.tips.indexOf(t), body=String(t.body||''), short=body.length>190?body.slice(0,body.lastIndexOf(' ',190))+' …':body;
  return `<span class="tc-ic ${colorOf(t,idx)}">${ic(t.icon||'bolt')}</span>
    <div><p class="eyebrow" style="margin:0 0 .4em">Tipp für heute</p><h3>${esc(t.title)}</h3><p>${esc(short)}</p>
    <div class="row"><button class="btn ghost" data-act="next-tip">Noch ein Tipp</button><button class="link" data-act="nav" data-tab="tips">Alle Tipps →</button></div></div>`;
}
function planLabel(){
  const m=myPlan(state.user.id);
  return m.source==='own'?'Dein eigener Plan':m.source==='individual'?'Dein persönlicher Plan':'Standardplan';
}
views.home=async function(box){
  const logs=await ensureLogs();
  const total=new Set(logs.map(l=>l.log_date)).size;
  const goal=weekGoal(), thisWeek=new Set(logs.filter(l=>weekStart(l.log_date+'T00:00:00')===weekStart(new Date())).map(l=>l.log_date)).size;
  const last=logs[0], streak=streakWeeks(logs), tip=pickTip();
  let idx=Math.floor(Math.random()*TAGLINES.length);
  const tile=(tab,icon,title,sub)=>`<button class="tile" data-act="nav" data-tab="${tab}">${ic(icon)}<h3>${title}</h3><p>${sub}</p></button>`;
  box.innerHTML=`
  <section class="hero2"><p class="eyebrow">Hola ${esc(firstName())}</p>
    <h1 class="display" data-rot>${TAGLINES[idx]}</h1>
    <p class="lead muted">${esc(pick(MOTIVATION))}</p>
    <div class="row" style="margin-top:18px"><button class="btn" data-act="nav" data-tab="log">Training eintragen</button><button class="btn ghost" data-act="nav" data-tab="plan">Mein Plan ansehen</button></div></section>
  ${tip?`<section class="card tipcard rv" data-tipcard>${tipCard(tip)}</section>`:''}
  <section class="bento">
    <div class="tile tile-ring"><p class="eyebrow" style="margin:0">Diese Woche</p>
      <div class="ringbox">${ringSvg(thisWeek,goal)}<div class="ring-mid"><b>${statHtml(thisWeek)}<span style="font-size:1.3rem;color:var(--muted)">/${goal}</span></b><span>Trainingstage</span></div></div>
      <p>${thisWeek>=goal?'Wochenziel erreicht – stark! 🎉':thisWeek===0?'Noch nichts diese Woche – fang einfach klein an.':'Weiter so, du bist auf dem Weg.'}</p></div>
    <div class="tile tile-stats">
      <div class="mstat"><b>${statHtml(total)}</b><span>Trainingstage gesamt</span></div>
      <div class="mstat"><b>${statHtml(streak)}</b><span>Wochen in Folge</span></div>
      <div class="mstat"><b>W${currentWeek()}</b><span>Trainingswoche</span></div></div>
    ${tile('plan','plan','Mein Plan',esc(planLabel()))}
    ${tile('tips','tips','Tipps &amp; Tricks',`${storyTips().length} Dinge, die zählen`)}
    ${tile('log','log','Logbuch','Training eintragen')}
    ${tile('progress','progress','Fortschritt','Deine Entwicklung')}
    <div class="tile tile-last rv">${challengeHtml(challenge(logs))}</div>
    <div class="tile tile-last">${last
      ? `<p class="eyebrow">Zuletzt eingetragen</p><h3>${esc(last.exercise)}</h3><p>${fmtDate(last.log_date)} · ${esc(fmtSet(last))}</p>`
      : `<p class="eyebrow">Dein erster Eintrag</p><h3>Er wartet schon auf dich</h3><p>Mach eine Übung aus deinem Plan und trag sie im Logbuch ein.</p>`}</div>
    <button class="tile tile-last" data-act="nav" data-tab="studio">${ic('door')}<h3>Erster Tag im Studio</h3><p>Packliste, Aufwärmen, Etikette – entspannt starten.</p></button>
  </section>`;
  box._after=()=>{
    requestAnimationFrame(()=>requestAnimationFrame(()=>$$('.ring-fg',box).forEach(c=>c.style.strokeDashoffset=c.dataset.to)));
    const h=$('[data-rot]',box); if(!h||reduced()) return;
    state.timer=setInterval(()=>{
      if(!h.isConnected){clearInterval(state.timer);return;}
      h.classList.add('out');
      setTimeout(()=>{idx=(idx+1)%TAGLINES.length;h.innerHTML=TAGLINES[idx];h.classList.remove('out');},450);
    },7000);
  };
};
acts['next-tip']=el=>{const c=el.closest('[data-tipcard]'),t=pickTip();if(t)c.innerHTML=tipCard(t);};

/* ---------- Tipps (Scroll-Story) ---------- */
function tipVisual(t,ci){
  const img=safeUrl(t.image_url);
  if(img) return `<img class="tip-img" loading="lazy" alt="" src="${esc(img)}">`;
  const stat=t.stat?`<div class="vis-stat"><b>${statHtml(t.stat)}</b><span>${esc(t.stat_label||'')}</span></div>`:'';
  return `<div class="vis ${t.color||('v'+((ci%5)+1))} ${t.stat?'':'noStat'}"><i class="glow"></i><span class="vis-ic">${ic(t.icon||'bolt')}</span>${stat}</div>`;
}
views.tips=async function(box){
  const tips=storyTips(), chapters=[];
  tips.forEach(t=>{const c=t.category||'Allgemein';let ch=chapters.find(x=>x.name===c);if(!ch){ch={name:c,items:[]};chapters.push(ch);}ch.items.push(t);});
  if(!tips.length){box.innerHTML=pageHead('Tipps & Tricks','Tipps &amp; <span class="t">Tricks</span>','Noch keine Tipps hinterlegt.');return;}
  let n=0;
  box.innerHTML=`<div class="readbar"><i></i></div>
  <header class="story-hero rv"><p class="eyebrow">Tipps &amp; Tricks</p>
    <h2 class="mega">${tips.length} Dinge,<br>die wirklich <span class="t">zählen.</span></h2>
    <p class="lead muted">Kein Fitness-Dogma. Nur das, was dich langfristig weiterbringt. Einfach runterscrollen.</p>
    <div class="scroll-cue" aria-hidden="true">${ic('arrow')}</div></header>`
  + chapters.map((ch,ci)=>`<section class="chapter"><div class="chapter-head rv"><span class="chap-no">${pad2(ci+1)}</span><h3>${esc(ch.name)}</h3></div>`
    + ch.items.map(t=>{n++;return `<article class="tip rv ${n%2===0?'alt':''}"><div class="tip-txt"><span class="tip-n">${pad2(n)} / ${pad2(tips.length)}</span><h3>${esc(t.title)}</h3><p>${esc(t.body||'')}</p></div><div class="tip-vis">${tipVisual(t,ci)}</div></article>`;}).join('')
    + `</section>`).join('')
  + `<section class="endcard rv"><h2>Genug gelesen?</h2><p class="muted">Dann ab in deinen Plan – oder lies, wie dein erster Tag im Studio abläuft.</p><div class="row" style="justify-content:center"><button class="btn" data-act="nav" data-tab="plan">Zu meinem Plan</button><button class="btn ghost" data-act="nav" data-tab="studio">Erster Tag im Studio</button></div></section>`;
  box._after=()=>{
    const bar=$('.readbar i',box);
    state.onScroll=()=>{const h=document.documentElement.scrollHeight-innerHeight;bar.style.width=(h>0?Math.min(100,scrollY/h*100):0)+'%';};
    window.addEventListener('scroll',state.onScroll,{passive:true});state.onScroll();
  };
};

/* ---------- Erster Tag im Studio ---------- */
const studioDone=()=>{try{return JSON.parse(localStorage.getItem('obert-studio')||'[]');}catch(e){return [];}};
views.studio=async function(box){
  const steps=state.tips.filter(t=>t.category===STUDIO_CAT), done=studioDone();
  box.innerHTML=pageHead('Erster Tag im Studio','Dein erster Tag, <span class="t">entspannt.</span>','Neun kleine Schritte von der Packliste bis zum Logbuch. Hake ab, was du erledigt hast.')
  +`<div class="sg">${steps.map((t,i)=>`<article class="card step rv ${done.includes(t.id)?'done':''}" data-id="${t.id}"><span class="tc-ic ${colorOf(t,i)}">${ic(t.icon||'bolt')}</span><div><p class="eyebrow" style="margin:0 0 .3em">Schritt ${i+1}${t.stat?' · '+esc(t.stat)+' '+esc(t.stat_label||''):''}</p><h3>${esc(t.title)}</h3><p>${esc(t.body||'')}</p></div><button class="tick" data-act="studio-tick" data-id="${t.id}" aria-label="Erledigt">${ic('check')}</button></article>`).join('')||'<div class="card"><p class="muted">Der Leitfaden wird gerade vorbereitet (inhalte.sql ausführen).</p></div>'}</div>`;
};
acts['studio-tick']=el=>{
  const id=Number(el.dataset.id),d=studioDone(),i=d.indexOf(id);i>=0?d.splice(i,1):d.push(id);
  try{localStorage.setItem('obert-studio',JSON.stringify(d));}catch(e){}
  el.closest('.step').classList.toggle('done',i<0);
};

/* ---------- Plan ---------- */
const GROUP_ORDER=['Oberschenkel vorne und Gesäß','Gesäß','Hintere Oberschenkel','Oberschenkel innen','Waden','Rücken','Brust','Schultern','Bizeps','Trizeps','Bauch und Rumpfstabilität','Ganzkörper'];
const vOf = i => i.variant||'A';
function myPlan(uid){
  const mine=state.planItems.filter(i=>i.user_id===uid);
  const own=mine.filter(i=>i.by_user), tr=mine.filter(i=>!i.by_user);
  const mode=state.v2&&state.profile&&state.profile.plan_mode==='own'?'own':'trainer';
  let items,source;
  if(mode==='own'){items=own;source='own';}
  else if(tr.length){items=tr;source='individual';}
  else{items=state.planItems.filter(i=>!i.user_id);source='standard';}
  items=items.slice().sort((a,b)=>a.position-b.position);
  const canVariant=state.v3&&(source==='own'||items.some(i=>vOf(i)==='B'));
  return {mode,source,items,own:own.slice().sort((a,b)=>a.position-b.position),canVariant};
}
const exName = it => { const ex=state.exercises.find(e=>e.id===it.exercise_id); return ex?ex.name:null; };
function lastTrainedVariant(m){
  if(!m.canVariant||!state.logs) return null;
  const A=new Set(m.items.filter(i=>vOf(i)==='A').map(exName)),B=new Set(m.items.filter(i=>vOf(i)==='B').map(exName));
  for(const l of state.logs){const a=A.has(l.exercise),b=B.has(l.exercise);if(a&&!b)return 'A';if(b&&!a)return 'B';}
  return null;
}
function currentVariant(m){
  if(!m.canVariant) return 'A';
  let v=null;try{v=localStorage.getItem('obert-planvar');}catch(e){}
  if(v==='A'||v==='B') return v;
  const last=lastTrainedVariant(m);
  return last==='A'?'B':'A';
}
const lastFor = name => (state.logs||[]).find(l=>l.exercise===name);
const lastText = l => `${l.weight!=null?fmtN(Number(l.weight))+' kg · ':''}${l.sets==null?'–':l.sets}×${l.reps==null?'–':l.reps}`;
const lastChip = name => { const l=lastFor(name); return l?`<span class="chip last" title="${esc(fmtDate(l.log_date))}">${ic('clock')} Letztes Mal: ${esc(lastText(l))}</span>`:''; };
function variantHtml(name,dose,hint,img,vid,note,muscle){
  const [vBlock,vBtn]=videoParts(vid);
  return `<div class="vhead"><h3>${esc(name)}</h3>${dose?`<span class="dose">${esc(dose)}</span>`:''}</div>${lastChip(name)}
    <div class="vgrid"><div class="vmedia">${media(img,muscle||name)}</div>
    <div class="vbody">${hintHtml(hint)}${vBlock}${note?`<p class="note">💬 ${esc(note)}</p>`:''}<div class="row">${vBtn}<button class="btn ghost" data-act="to-log" data-ex="${esc(name)}">Ins Logbuch eintragen</button></div></div></div>`;
}
function exOptionsHtml(filter){
  const f=String(filter||'').trim().toLowerCase(), uid=state.user.id;
  const ok=e=>!f||e.name.toLowerCase().includes(f)||(e.muscle||'').toLowerCase().includes(f);
  const glob=state.exercises.filter(e=>!e.owner_id&&ok(e)), mine=state.exercises.filter(e=>e.owner_id===uid&&ok(e));
  const groups=[...new Set(glob.map(e=>e.muscle||'Weitere'))].sort((a,b)=>{const x=GROUP_ORDER.indexOf(a),y=GROUP_ORDER.indexOf(b);return (x<0?99:x)-(y<0?99:y)||a.localeCompare(b);});
  const opt=e=>`<option value="${e.id}">${esc(e.name)}</option>`;
  return groups.map(g=>`<optgroup label="${esc(g)}">${glob.filter(e=>(e.muscle||'Weitere')===g).map(opt).join('')}</optgroup>`).join('')
    +(mine.length?`<optgroup label="Meine eigenen Übungen">${mine.map(opt).join('')}</optgroup>`:'')
    +((glob.length+mine.length)?'':'<option value="">– keine Treffer –</option>');
}
function ownEditor(cv){
  const uid=state.user.id, m=myPlan(uid), list=m.own.filter(i=>vOf(i)===cv);
  const stdSrc=(()=>{const tr=state.planItems.filter(i=>i.user_id===uid&&!i.by_user);return tr.length?tr:state.planItems.filter(i=>!i.user_id);})();
  const hasA=m.own.some(i=>vOf(i)==='A');
  const vt=state.v3?` ${cv}`:'';
  return `<div class="card rv" data-own data-cv="${cv}">
    <h3>Mein Plan${vt} bearbeiten</h3>
    <p class="muted" style="margin-top:0">Wähle Übungen aus der Bibliothek oder lege eigene an. ${state.v3?'Mit Plan A und B kannst du zwei Trainingstage abwechseln (gleiche Muskelgruppen, andere Übungen).':''}</p>
    ${list.length?list.map((it,i)=>{const ex=state.exercises.find(e=>e.id===it.exercise_id);return `<div class="pe-own" data-id="${it.id}"><span><b>${esc(ex?ex.name:'?')}</b> ${ex&&ex.muscle?`<small class="muted">${esc(ex.muscle)}</small>`:''}${ex&&ex.owner_id?' <span class="badge">EIGENE</span>':''}</span><span class="row"><button class="mini" data-act="own-move" data-dir="-1" ${i?'':'disabled'}>↑</button><button class="mini" data-act="own-move" data-dir="1" ${i<list.length-1?'':'disabled'}>↓</button><button class="mini" data-act="own-del" aria-label="Entfernen">🗑</button></span></div>`;}).join(''):`<p class="muted">Plan${vt} ist noch leer.</p>`}
    ${!list.length&&cv==='A'&&!hasA&&stdSrc.length?`<button class="btn ghost" data-act="own-copy" data-from="std" style="margin:8px 0">${state.planItems.some(i=>i.user_id===uid&&!i.by_user)?'Persönlichen Plan':'Standardplan'} als Startpunkt kopieren</button>`:''}
    ${!list.length&&cv==='B'&&hasA?`<button class="btn ghost" data-act="own-copy" data-from="A" style="margin:8px 0">Plan A als Startpunkt für B kopieren</button>`:''}
    <hr style="border:0;border-top:1px solid var(--line);margin:16px 0">
    <label>Übung suchen<input data-filter placeholder="z. B. Kniebeuge, Rücken, Bizeps …" autocomplete="off"></label>
    <label style="margin-top:10px">Übung hinzufügen<select data-add>${exOptionsHtml('')}</select></label>
    <div style="margin-top:10px"><button class="btn" data-act="own-add">＋ Zu Plan${vt} hinzufügen</button></div>
    <details style="margin-top:18px"><summary style="cursor:pointer;font-weight:700">＋ Eigene Übung anlegen</summary>
      <div class="form-grid" data-newex>
        <label>Name der Übung<input data-k="name" placeholder="z. B. Hüftheben mit Band"></label>
        <label>Muskelgruppe (optional)<input data-k="muscle" list="grplist" placeholder="z. B. Gesäß"></label>
        <datalist id="grplist">${GROUP_ORDER.map(g=>`<option value="${esc(g)}">`).join('')}</datalist>
        <label>Dosierung (optional)<input data-k="dose" placeholder="z. B. 3 Sätze × 12 Wiederholungen"></label>
        <label>Hinweise (optional, eine Zeile pro Punkt)<textarea data-k="hint" rows="3"></textarea></label>
        <label>Bild-Link (optional, https://…)<input data-k="image_url"></label>
        <label>Video-Link (optional)<input data-k="video_url"></label>
        <div><button class="btn" data-act="own-create">Übung anlegen und zum Plan hinzufügen</button></div>
      </div></details>
  </div>`;
}
views.plan=async function(box){
  await ensureLogs();
  const m=myPlan(state.user.id), isOwn=m.source==='own', cv=currentVariant(m);
  const items=m.items.filter(i=>!m.canVariant&&!(isOwn&&state.v3)||vOf(i)===cv);
  const last=lastTrainedVariant(m);
  let html=pageHead('Training','Dein <span class="t">Plan.</span>','Deine Übungen mit Hinweisen zur sauberen Ausführung. Du kannst jederzeit einen eigenen Plan zusammenstellen.')
  +`<div class="card srcbar rv"><span class="chip">${ic(isOwn?'rocket':'user')} Aktiv: ${esc(planLabel())}</span>
    ${state.v2?`<div class="seg"><button class="${isOwn?'':'on'}" data-act="plan-mode" data-m="trainer">${state.planItems.some(i=>i.user_id===state.user.id&&!i.by_user)?'Persönlicher Plan':'Standardplan'}</button><button class="${isOwn?'on':''}" data-act="plan-mode" data-m="own">Mein eigener Plan</button></div>`:''}</div>`;
  if(m.canVariant||(isOwn&&state.v3)){
    html+=`<div class="card srcbar rv"><span class="chip">${ic('infinity')} ${last?`Zuletzt trainiert: Plan ${last} · Heute dran: Plan ${last==='A'?'B':'A'}`:'Plan A / Plan B'}</span>
      <div class="seg"><button class="${cv==='A'?'on':''}" data-act="plan-var" data-v="A">Plan A</button><button class="${cv==='B'?'on':''}" data-act="plan-var" data-v="B">Plan B</button></div></div>`;
  }
  if(isOwn&&state.v2) html+=ownEditor(cv);
  let lastGroup=null,gi=0;
  items.forEach(it=>{
    const ex=state.exercises.find(e=>e.id===it.exercise_id); if(!ex) return;
    if(ex.muscle&&ex.muscle!==lastGroup){lastGroup=ex.muscle;gi++;html+=`<h3 class="group rv"><span>${pad2(gi)}</span>${esc(ex.muscle)}</h3>`;}
    const override=(it.sets||it.reps)?`${it.sets||'–'} Sätze × ${it.reps||'–'} Wdh.`:null;
    html+=`<article class="card ex rv">${variantHtml(ex.name,override||ex.dose,ex.hint,ex.image_url,ex.video_url,it.note,ex.muscle)}</article>`;
  });
  box.innerHTML = html + (items.length?'':`<div class="card"><p class="muted">${isOwn?'Dieser Plan ist noch leer – füge oben Übungen hinzu.':'Dein Plan wird gerade vorbereitet.'}</p></div>`);
};
async function ownReload(){ await loadCommon(); renderView(true); }
const nextPos = (list) => list.reduce((m,i)=>Math.max(m,i.position||0),0)+1;
Object.assign(acts,{
  'plan-mode':async el=>{
    const {error}=await sb.rpc('set_plan_mode',{mode:el.dataset.m});if(error)throw error;
    state.profile.plan_mode=el.dataset.m;toast(el.dataset.m==='own'?'Du nutzt jetzt deinen eigenen Plan':`Du nutzt jetzt den ${state.planItems.some(i=>i.user_id===state.user.id&&!i.by_user)?'persönlichen Plan':'Standardplan'}`);renderView(true);
  },
  'plan-var':el=>{try{localStorage.setItem('obert-planvar',el.dataset.v);}catch(e){}renderView(true);},
  'own-add':async el=>{
    const w=el.closest('[data-own]'),id=Number($('[data-add]',w).value),cv=w.dataset.cv;if(!id){toast('Bitte eine Übung wählen.',true);return;}
    const row={user_id:state.user.id,exercise_id:id,position:nextPos(myPlan(state.user.id).own),by_user:true};if(state.v3)row.variant=cv;
    const {error}=await sb.from('plan_items').insert(row);if(error)throw error;await ownReload();
  },
  'own-del':async el=>{const {error}=await sb.from('plan_items').delete().eq('id',el.closest('.pe-own').dataset.id);if(error)throw error;await ownReload();},
  'own-move':async el=>{
    const cv=el.closest('[data-own]').dataset.cv,own=myPlan(state.user.id).own.filter(i=>vOf(i)===cv),id=Number(el.closest('.pe-own').dataset.id),i=own.findIndex(x=>x.id===id),j=i+Number(el.dataset.dir);if(j<0||j>=own.length)return;
    const pa=own[i].position,pb=own[j].position;
    const same=pa===pb;
    [own[i],own[j]]=[own[j],own[i]];
    await Promise.all(own.map((it,idx)=>sb.from('plan_items').update({position:idx+1}).eq('id',it.id)));await ownReload();
  },
  'own-copy':async el=>{
    const uid=state.user.id,cv=el.closest('[data-own]').dataset.cv;let src;
    if(el.dataset.from==='A') src=myPlan(uid).own.filter(i=>vOf(i)==='A');
    else {const tr=state.planItems.filter(i=>i.user_id===uid&&!i.by_user);src=tr.length?tr:state.planItems.filter(i=>!i.user_id);}
    if(!src.length){toast('Es gibt noch nichts zum Kopieren.',true);return;}
    const rows=src.map((i,n)=>{const r={user_id:uid,exercise_id:i.exercise_id,position:n+1,sets:i.sets,reps:i.reps,note:i.note,by_user:true};if(state.v3)r.variant=cv;return r;});
    const {error}=await sb.from('plan_items').insert(rows);if(error)throw error;await ownReload();
  },
  'own-create':async el=>{
    const w=el.closest('[data-newex]'),cv=el.closest('[data-own]').dataset.cv,o={};$$('[data-k]',w).forEach(i=>o[i.dataset.k]=i.value.trim()||null);
    if(!o.name){toast('Bitte einen Namen eintragen.',true);return;}
    if(o.image_url&&!safeUrl(o.image_url)){toast('Der Bild-Link muss mit https:// beginnen.',true);return;}
    if(o.video_url&&!safeUrl(o.video_url)){toast('Der Video-Link muss mit https:// beginnen.',true);return;}
    o.owner_id=state.user.id;
    const {data,error}=await sb.from('exercises').insert(o).select().single();if(error)throw error;
    const row={user_id:state.user.id,exercise_id:data.id,position:nextPos(myPlan(state.user.id).own),by_user:true};if(state.v3)row.variant=cv;
    const r=await sb.from('plan_items').insert(row);if(r.error)throw r.error;
    toast('Übung angelegt ✔');await ownReload();
  },
  'take-last':el=>{
    const f=el.closest('form'),l=lastFor(exFromForm(f));if(!l)return;
    if(l.sets!=null)f.elements.sets.value=l.sets;if(l.reps!=null)f.elements.reps.value=l.reps;if(l.weight!=null)f.elements.weight.value=l.weight;toast('Werte vom letzten Mal übernommen');
  }
});

/* ---------- Logbuch (nach Wochen gruppiert) ---------- */
function exerciseOptions(){
  const m=myPlan(state.user.id), groups=[], seen=new Set();
  const add=(label,name)=>{ if(!name||seen.has(name)) return; seen.add(name); let g=groups.find(x=>x.l===label); if(!g){g={l:label,v:[]};groups.push(g);} g.v.push(name); };
  const vs=m.canVariant||(m.source==='own'&&state.v3)?['A','B']:[null];
  vs.forEach(v=>m.items.filter(i=>v==null||vOf(i)===v).forEach(it=>add(v?`Plan ${v}`:'Aus deinem Plan',exName(it))));
  const lib=state.exercises.filter(e=>!seen.has(e.name)).map(e=>e.name).sort((a,b)=>a.localeCompare(b));
  const own=[...new Set((state.logs||[]).map(l=>l.exercise))].filter(n=>!seen.has(n)&&!lib.includes(n)).sort();
  return {groups,lib,own};
}
function exFromForm(f){
  const s=f.elements.exercise_sel?f.elements.exercise_sel.value:'';
  return s==='__custom__'?(f.elements.exercise_custom.value||'').trim():s;
}
function updateLast(f){
  const out=$('[data-last]',f);if(!out)return;
  const l=lastFor(exFromForm(f));
  out.innerHTML=l?`${ic('clock')} Letztes Mal (${esc(fmtDate(l.log_date))}): <b>${esc(lastText(l))}</b> <button type="button" class="mini" data-act="take-last">Werte übernehmen</button>`:'';
}
function logForm(){
  const {groups,lib,own}=exerciseOptions(), cw=currentWeek();
  const maxW=Math.max(4,cw+2,...(state.logs||[]).map(l=>(l.week||0)+1));
  const pre=state.prefill, all=[...groups.flatMap(g=>g.v),...lib,...own], custom=!!pre&&!all.includes(pre);
  const o=(n)=>`<option value="${esc(n)}" ${n===pre?'selected':''}>${esc(n)}</option>`;
  const field=f=>{
    if(f.type==='week') return `<label>${esc(f.label)}<select name="week">${Array.from({length:maxW},(_,i)=>`<option value="${i+1}" ${i+1===cw?'selected':''}>Woche ${i+1}</option>`).join('')}</select></label>`;
    if(f.type==='exercise') return `<label class="wide">${esc(f.label)}<select name="exercise_sel" data-act="ex-sel">
        <option value="">– Übung wählen –</option>
        ${groups.map(g=>`<optgroup label="${esc(g.l)}">${g.v.map(o).join('')}</optgroup>`).join('')}
        ${own.length?`<optgroup label="Meine eigenen Übungen">${own.map(o).join('')}</optgroup>`:''}
        ${lib.length?`<optgroup label="Übungsbibliothek">${lib.map(o).join('')}</optgroup>`:''}
        <option value="__custom__" ${custom?'selected':''}>＋ Eigene Übung eintragen …</option></select></label>
      <p class="lastinfo wide" data-last></p>
      <label class="wide ${custom?'':'hidden'}" data-custom>Name deiner eigenen Übung<input name="exercise_custom" value="${esc(custom?pre:'')}" placeholder="z. B. Hüftheben mit Band"></label>`;
    const val=f.type==='date'?today():'';
    return `<label class="${f.key==='note'?'wide':''}">${esc(f.label)}<input name="${f.key}" type="${f.type}" ${f.step?`step="${f.step}" min="0" inputmode="decimal"`:''} value="${esc(val)}" ${f.type==='date'?'required':''}></label>`;
  };
  return `<form class="card" data-form="log"><h3>Neuer Eintrag</h3><div class="grid-f">${LOG_FIELDS.map(field).join('')}</div><button class="btn" type="submit">Speichern</button></form>`;
}
function logTable(logs,del,noWeek){
  if(!logs.length) return '<p class="muted">Noch keine Einträge.</p>';
  const F=noWeek?LOG_FIELDS.filter(f=>f.type!=='week'):LOG_FIELDS;
  return `<div class="tablewrap"><table><thead><tr>${F.map(f=>`<th>${esc(f.label)}</th>`).join('')}<th></th></tr></thead><tbody>${logs.slice(0,400).map(l=>`<tr>${F.map(f=>`<td>${f.key==='log_date'?fmtDate(l[f.key]):f.type==='week'?(l[f.key]==null?'–':'W'+l[f.key]):esc(l[f.key]==null?'':l[f.key])}</td>`).join('')}<td>${del?`<button class="x" data-act="del-log" data-id="${l.id}" aria-label="Löschen">✕</button>`:''}</td></tr>`).join('')}</tbody></table></div>`;
}
state.logShown=8;
function logGrouped(logs){
  if(!logs.length) return '<p class="muted">Noch keine Einträge.</p>';
  const g=new Map();logs.forEach(l=>{const k=l.week==null?0:l.week;(g.get(k)||g.set(k,[]).get(k)).push(l);});
  const keys=[...g.keys()].sort((a,b)=>b-a), shown=keys.slice(0,state.logShown);
  return shown.map((k,i)=>{const rows=g.get(k),d=new Set(rows.map(r=>r.log_date)).size;
    return `<details class="card weekgrp" ${i===0?'open':''}><summary><b>${k?'Woche '+k:'Ohne Woche'}</b><span class="muted" style="font-size:.88rem">${d} Trainingstag${d===1?'':'e'} · ${rows.length} Einträge</span></summary>${logTable(rows,true,true)}</details>`;}).join('')
    +(keys.length>shown.length?`<div style="text-align:center"><button class="btn ghost" data-act="log-more">Ältere Wochen anzeigen (${keys.length-shown.length})</button></div>`:'');
}
views.log=async function(box){
  const logs=await ensureLogs(); state.logShown=8;
  const weeks=[...new Set(logs.map(l=>l.week).filter(w=>w!=null))].sort((a,b)=>b-a);
  box.innerHTML=pageHead('Logbuch','Dein <span class="t">Logbuch.</span>','Wochenweise, damit du nach dem Training in Ruhe eintragen kannst – nicht nach jedem Satz.')+logForm()
  +`<div class="row" style="margin-top:24px;justify-content:space-between"><h3 style="margin:0">Meine Einträge</h3>
    ${weeks.length?`<select data-chg="log-filter" style="width:auto;margin:0"><option value="">Alle Wochen</option>${weeks.map(w=>`<option value="${w}">Woche ${w}</option>`).join('')}</select>`:''}</div>
  <div data-logtable style="margin-top:12px">${logGrouped(logs)}</div>`;
  box._after=()=>{const f=$('form[data-form="log"]',box);if(f)updateLast(f);};
};
acts['log-more']=()=>{state.logShown+=8;const sel=$('select[data-chg="log-filter"]'),w=sel?sel.value:'';const rows=w===''?state.logs:state.logs.filter(l=>String(l.week)===w);$('[data-logtable]').innerHTML=logGrouped(rows);};

/* ---------- Fortschritt ---------- */
state.range='6'; state.cal=null;
const RANGES=[['3','3 Monate'],['6','6 Monate'],['12','1 Jahr'],['all','Gesamt']];
const sinceDate=()=>state.range==='all'?'0000-00-00':localDay(Date.now()-Number(state.range)*30.4*864e5);
function sparkline(vals){
  if(vals.length<2) return `<svg class="spark" viewBox="0 0 110 34"><line x1="4" y1="17" x2="106" y2="17" stroke="var(--line)" stroke-width="2" stroke-dasharray="3 4"/></svg>`;
  const mn=Math.min(...vals),mx=Math.max(...vals),rg=mx-mn||1;
  const pts=vals.map((v,i)=>`${(4+i*(102/(vals.length-1))).toFixed(1)},${(30-(v-mn)/rg*26).toFixed(1)}`).join(' ');
  return `<svg class="spark" viewBox="0 0 110 34" aria-hidden="true"><polyline pathLength="100" points="${pts}"/></svg>`;
}
function perExercise(logs){
  const m={};
  logs.slice().sort((a,b)=>a.log_date.localeCompare(b.log_date)||a.id-b.id).forEach(l=>{
    const e=m[l.exercise]||(m[l.exercise]={name:l.exercise,days:{},n:0});e.n++;
    const d=e.days[l.log_date]||(e.days[l.log_date]={w:null,r:0});
    if(l.weight!=null)d.w=Math.max(d.w==null?0:d.w,Number(l.weight));d.r+=(Number(l.sets)||1)*(Number(l.reps)||0);
  });
  return Object.values(m).map(e=>{
    const ds=Object.keys(e.days).sort(),hasW=ds.some(d=>e.days[d].w!=null);
    const series=ds.map(d=>hasW?(e.days[d].w||0):e.days[d].r);
    const first=series[0],lastv=series[series.length-1];
    return {name:e.name,n:e.n,series,hasW,first,last:lastv,delta:lastv-first,pct:first?((lastv-first)/first*100):0,days:ds.length};
  }).sort((a,b)=>b.n-a.n);
}
const fmtN=n=>(Math.round(n*10)/10).toLocaleString('de-DE');
const MON=['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];
/* Balken: Trainingstage pro Woche (bzw. pro Monat bei sehr langen Zeiträumen), gestrichelt = Wochenziel */
function rhythm(logs){
  const goal=weekGoal(), dayset=new Set(logs.map(l=>l.log_date));
  const firstLog=logs.length?logs.map(l=>l.log_date).sort()[0]:today();
  const from=state.range==='all'?firstLog:(sinceDate()>firstLog?sinceDate():firstLog);
  let ws=weekStart(from+'T00:00:00'); const end=weekStart(new Date()),weeks=[];
  while(ws<=end){const d=new Date(ws);let c=0;for(let i=0;i<7;i++){const x=new Date(d);x.setDate(x.getDate()+i);if(dayset.has(localDay(x)))c++;}weeks.push({t:ws,c,label:d});const n=new Date(ws);n.setDate(n.getDate()+7);ws=n.getTime();}
  let bars=weeks,gl=goal,unit='Woche';
  if(weeks.length>60){const m=new Map();weeks.forEach(w=>{const k=w.label.getFullYear()*12+w.label.getMonth();const e=m.get(k)||{t:w.t,c:0,label:w.label};e.c+=w.c;m.set(k,e);});bars=[...m.values()];gl=Math.round(goal*52/12);unit='Monat';}
  const W=600,H=150,L=22,B=22,T=10,n=bars.length||1,bw=(W-L)/n,max=Math.max(gl,...bars.map(b=>b.c),1);
  const y=v=>T+(H-T-B)*(1-v/max);
  const rects=bars.map((b,i)=>{const h=Math.max(b.c?2:0,(H-T-B)*(b.c/max));const lab=unit==='Woche'?`Woche ab ${fmtShort(localDay(b.label))}`:`${MON[b.label.getMonth()]} ${b.label.getFullYear()}`;
    return `<rect class="${b.c>=gl?'ok':'lo'}" style="--i:${i}" x="${(L+i*bw+bw*.15).toFixed(1)}" y="${(H-B-h).toFixed(1)}" width="${(bw*.7).toFixed(1)}" height="${h.toFixed(1)}" rx="2"><title>${lab}: ${b.c} Trainingstage</title></rect>`;}).join('');
  const labels=bars.map((b,i)=>{const d=b.label,prev=i?bars[i-1].label:null;return (!prev||prev.getMonth()!==d.getMonth())?`<text x="${(L+i*bw).toFixed(1)}" y="${H-6}" class="ax">${MON[d.getMonth()]}</text>`:'';}).join('');
  const hit=bars.filter(b=>b.c>=gl).length;
  return {svg:`<svg class="barsvg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Trainingstage pro ${unit}">${rects}<line x1="${L}" x2="${W}" y1="${y(gl)}" y2="${y(gl)}" class="goal"/><text x="0" y="${y(gl)+4}" class="ax">${gl}</text>${labels}</svg>`,hit,total:bars.length,unit,gl};
}
/* Monatskalender zum Durchblättern */
function calendarHtml(logs){
  const now=new Date(); if(!state.cal) state.cal={y:now.getFullYear(),m:now.getMonth()};
  const {y,m}=state.cal, first=new Date(y,m,1), last=new Date(y,m+1,0), lead=(first.getDay()+6)%7;
  const cnt={};logs.forEach(l=>cnt[l.log_date]=(cnt[l.log_date]||0)+1);
  let cells='';for(let i=0;i<lead;i++)cells+='<i class="e"></i>';
  let days=0,entries=0,vol=0;const t=today();
  for(let d=1;d<=last.getDate();d++){const k=`${y}-${pad2(m+1)}-${pad2(d)}`,c=cnt[k]||0;if(c){days++;entries+=c;}
    cells+=`<i class="${c>=6?'l3':c>=3?'l2':c>=1?'l1':''} ${k===t?'today':''}" title="${c?c+' Einträge':''}">${d}</i>`;}
  vol=volumeOf(logs.filter(l=>l.log_date.startsWith(`${y}-${pad2(m+1)}`)));
  const atNow=y===now.getFullYear()&&m===now.getMonth();
  return `<div class="row" style="justify-content:space-between;margin-bottom:10px"><button class="mini" data-act="cal-prev" aria-label="Vorheriger Monat">←</button><b>${first.toLocaleDateString('de-DE',{month:'long',year:'numeric'})}</b><button class="mini" data-act="cal-next" aria-label="Nächster Monat" ${atNow?'disabled':''}>→</button></div>
  <div class="cal"><span>Mo</span><span>Di</span><span>Mi</span><span>Do</span><span>Fr</span><span>Sa</span><span>So</span>${cells}</div>
  <p class="muted" style="margin:12px 0 0;font-size:.9rem">${days} Trainingstag${days===1?'':'e'} · ${entries} Einträge${vol>0?' · '+fmtVol(vol)+' bewegt':''}</p>`;
}
acts['cal-prev']=()=>{const c=state.cal;c.m--;if(c.m<0){c.m=11;c.y--;}$('#calCard').innerHTML=calendarHtml(state.logs);};
acts['cal-next']=()=>{const c=state.cal;c.m++;if(c.m>11){c.m=0;c.y++;}$('#calCard').innerHTML=calendarHtml(state.logs);};
acts['range']=el=>{state.range=el.dataset.v;renderView(true);};
views.progress=async function(box){
  const logs=await ensureLogs(); state.cal=null;
  if(!logs.length){box.innerHTML=pageHead('Fortschritt','Das hast du <span class="t">geschafft.</span>','Sobald im Logbuch etwas steht, erscheint hier deine Entwicklung.')+`<div class="card rv">${challengeHtml(challenge(logs))}</div><h3 class="group">Auszeichnungen</h3><div class="card rv">${badgesHtml(badges(logs))}</div>`;return;}
  const days=new Set(logs.map(l=>l.log_date)).size, streak=streakWeeks(logs), vol=volumeOf(logs);
  const since=sinceDate(), rl=logs.filter(l=>l.log_date>=since), pe=perExercise(rl);
  const top=pe.filter(e=>e.series.length>=2&&e.delta>0).sort((a,b)=>b.pct-a.pct).slice(0,3);
  const rh=rhythm(logs), rangeName=RANGES.find(r=>r[0]===state.range)[1];
  box.innerHTML=pageHead('Fortschritt','Das hast du <span class="t">geschafft.</span>','Alles aus deinem Logbuch – automatisch ausgewertet.')
  +`<section class="kpis rv">${kpi(days,'Trainingstage')}${kpi(streak,'Wochen in Folge')}${kpi(vol>0?fmtVol(vol):'–','Gesamtgewicht bewegt')}${kpi(logs.length,'Einträge')}</section>
  <div class="seg rangeseg rv" role="group" aria-label="Zeitraum">${RANGES.map(([v,l])=>`<button class="${state.range===v?'on':''}" data-act="range" data-v="${v}">${l}</button>`).join('')}</div>
  <section class="card rv"><h3>Dein Rhythmus</h3><p class="muted" style="margin-top:0">Trainingstage pro ${rh.unit}. Gestrichelt: dein Ziel (${rh.gl}). In <b>${rh.hit} von ${rh.total}</b> ${rh.unit==='Woche'?'Wochen':'Monaten'} hast du es erreicht.</p>${rh.svg}</section>
  <section class="card rv" id="calCard">${calendarHtml(logs)}</section>
  <section class="card rv">${challengeHtml(challenge(logs))}</section>
  <section class="card rv"><h3>Deine größten Fortschritte</h3><p class="muted" style="margin-top:0">Zeitraum: ${rangeName}</p>${top.length?`<ul class="biglist">${top.map(e=>`<li><span><b>${esc(e.name)}</b><br><small class="muted">${fmtN(e.first)} → ${fmtN(e.last)} ${e.hasW?'kg':'Wdh.'}</small></span><span class="delta">+${statHtml(String(Math.round(e.pct)))} %</span></li>`).join('')}</ul>`:'<p class="muted">Sobald du bei einer Übung mehr Gewicht oder Wiederholungen schaffst als zu Beginn des Zeitraums, taucht sie hier auf.</p>'}</section>
  <section class="card rv"><h3>Deine Übungen</h3><p class="muted" style="margin-top:0">Von früher bis jetzt (${rangeName}). Tippe auf eine Übung für den Verlauf.</p>${pe.length?pe.map(e=>`<div class="exrow" data-act="prog-pick" data-name="${esc(e.name)}"><span><b>${esc(e.name)}</b><small>${e.series.length>1?fmtN(e.first)+' → ':''}${fmtN(e.last)} ${e.hasW?'kg':'Wdh.'} · ${e.days} Tag${e.days===1?'':'e'}</small></span>${sparkline(e.series)}<span class="delta ${e.delta<=0?'neg':''}">${e.series.length>1?(e.delta>0?'+':'')+fmtN(e.delta):'–'}</span></div>`).join(''):'<p class="muted">In diesem Zeitraum gibt es keine Einträge.</p>'}</section>
  <section class="card rv" id="progDetail">${progressBlock(logs).replace('class="card prog"','class="prog"')}</section>
  <h3 class="group rv">Auszeichnungen</h3><section class="card rv">${badgesHtml(badges(logs))}</section>`;
  box._after=()=>initProgress(box,logs,'me');
};
acts['prog-pick']=el=>{
  const sel=$('#progDetail select');if(!sel)return;sel.value=el.dataset.name;drawProgress(sel.closest('.prog'),sel.closest('.prog').dataset.key,sel.value);
  $('#progDetail').scrollIntoView({behavior:'smooth',block:'center'});
};
function progressBlock(logs){
  if(!logs.length) return '<div class="card"><p class="muted">Noch keine Einträge – sobald im Logbuch etwas steht, erscheint hier der Verlauf.</p></div>';
  const cnt={}; logs.forEach(l=>cnt[l.exercise]=(cnt[l.exercise]||0)+1);
  const names=Object.keys(cnt).sort((a,b)=>cnt[b]-cnt[a]);
  return `<div class="card prog"><label>Verlauf einer Übung<select data-chg="prog-sel">${names.map(n=>`<option>${esc(n)}</option>`).join('')}</select></label><div class="kpis small" data-stats style="margin-top:14px"></div><div class="chartbox"><canvas></canvas></div></div>`;
}
function initProgress(box,logs,key){
  const card=$('.prog',box); if(!card) return;
  card.dataset.key=key; state.progLogs[key]=logs;
  drawProgress(card,key,$('select',card).value);
}
function drawProgress(card,key,name){
  const since=key==='me'?sinceDate():'0000-00-00';
  const rows=(state.progLogs[key]||[]).filter(l=>l.exercise===name&&l.log_date>=since);
  const byDay={};
  rows.forEach(l=>{const d=byDay[l.log_date]||(byDay[l.log_date]={w:null,r:0}); if(l.weight!=null) d.w=Math.max(d.w==null?0:d.w,Number(l.weight)); d.r+=(Number(l.sets)||1)*(Number(l.reps)||0);});
  let days=Object.keys(byDay).sort(), agg=days.length>90, W,R,labels;
  if(agg){   // sehr lange Verläufe: pro Woche zusammenfassen (höchstes Gewicht, Summe Wiederholungen)
    const wk={};days.forEach(d=>{const k=localDay(weekStart(d+'T00:00:00'));const e=wk[k]||(wk[k]={w:null,r:0});if(byDay[d].w!=null)e.w=Math.max(e.w==null?0:e.w,byDay[d].w);e.r+=byDay[d].r;});
    const ks=Object.keys(wk).sort();W=ks.map(k=>wk[k].w);R=ks.map(k=>wk[k].r);labels=ks.map(fmtShort);
  } else {W=days.map(d=>byDay[d].w);R=days.map(d=>byDay[d].r);labels=days.map(fmtShort);}
  const ws=W.filter(x=>x!=null);
  let change;
  if(ws.length>=2){const df=ws[ws.length-1]-ws[0]; change=(df>=0?'+':'')+fmtN(df)+' kg';}
  else if(R.length>=2){const df=R[R.length-1]-R[0]; change=(df>=0?'+':'')+df+' Wdh.';}
  else change='–';
  $('[data-stats]',card).innerHTML = kpi(rows.length,'Einträge')+kpi(days.length,'Trainingstage')+kpi(ws.length?fmtN(Math.max(...ws))+' kg':'–','Bestes Gewicht')+kpi(change,key==='me'?'Im Zeitraum':'Seit dem Start');
  if(typeof Chart==='undefined'){ return; }
  if(state.charts[key]) state.charts[key].destroy();
  const a1=css('--accent'),a2=css('--accent2'),grid=css('--line');
  state.charts[key]=new Chart($('canvas',card),{type:'line',data:{labels,datasets:[
    {label:'Gewicht (kg)',data:W,yAxisID:'y',borderColor:a1,backgroundColor:a1+'33',tension:.35,spanGaps:true,pointRadius:agg?2:4,borderWidth:3},
    {label:'Wiederholungen gesamt',data:R,yAxisID:'y1',borderColor:a2,borderDash:[5,4],tension:.35,pointRadius:agg?0:3,borderWidth:2}]},
    options:{responsive:true,maintainAspectRatio:false,interaction:{mode:'index',intersect:false},
      scales:{x:{grid:{color:grid},ticks:{maxTicksLimit:10}},y:{position:'left',title:{display:true,text:'kg'},grid:{color:grid},beginAtZero:false},y1:{position:'right',title:{display:true,text:'Wdh.'},grid:{drawOnChartArea:false}}},
      plugins:{legend:{labels:{boxWidth:12}}}}});
}

/* ---------- Profil: Konto, Darstellung, App, Datenschutz ---------- */
views.profile=async function(box){
  const p=state.profile, slug=(p.email||'').split('@')[0], demo=p.is_demo;
  box.innerHTML=pageHead('Profil','Hola <span class="t">'+esc(firstName())+'.</span>','Dein Konto, deine Einstellungen, deine Daten.')
  +`<section class="card rv"><h3>Konto</h3>
    <p class="muted">Anmeldename: <span class="code">${esc(slug)}</span> · Plan: ${esc(planLabel())}</p>
    ${state.v2?`<label>Wochenziel (Trainingstage)<select data-chg="week-goal" style="max-width:220px">${[1,2,3,4,5,6,7].map(n=>`<option value="${n}" ${n===weekGoal()?'selected':''}>${n} pro Woche</option>`).join('')}</select></label>`:''}
    <form data-form="pinchange" style="margin-top:18px"><label>Neue PIN (6–8 Ziffern)<input name="pin" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="8" autocomplete="new-password" style="max-width:220px"></label>
    <div style="margin-top:10px"><button class="btn ghost" type="submit">PIN ändern</button></div></form></section>
  <section class="card rv"><h3>Darstellung &amp; App</h3>
    <div class="row"><button class="btn ghost" data-act="theme">Hell / Dunkel wechseln</button>${isStandalone()?'<span class="chip">'+ic('check')+' Als App installiert</span>':'<button class="btn" data-act="install">Als App installieren</button>'}</div>
    <p class="muted" style="margin-bottom:0">${isStandalone()?'':isIOS()?'iPhone/iPad: Tippe unten auf „Teilen“ und dann auf „Zum Home-Bildschirm“.':'Dann hast du ein Symbol auf dem Startbildschirm – die Seite funktioniert weiterhin auch über den Link.'}</p></section>
  <section class="card rv"><h3>Datenschutz</h3>
    <p class="muted">${p.consent_at?`Einwilligung erteilt am ${fmtDate(p.consent_at)}.`:'Keine Einwilligung gespeichert.'} Nur du und dein Trainer sehen deine Daten.</p>
    <div class="row"><button class="btn ghost" data-act="export-data">${ic('download')} Meine Daten herunterladen</button><button class="btn ghost" data-act="legal" data-w="datenschutz">Datenschutzhinweise</button><button class="btn ghost" data-act="legal" data-w="impressum">Impressum</button></div>
    ${!demo&&state.v2?`<hr style="border:0;border-top:1px solid var(--line);margin:18px 0"><p class="muted">Konto löschen entfernt dein Profil, dein Logbuch, deinen eigenen Plan und deine eigenen Übungen <b>sofort und endgültig</b>.</p><button class="btn danger" data-act="delete-account">${ic('trash')} Konto löschen</button>`:''}</section>
  <div class="row" style="margin-top:8px"><button class="btn ghost" data-act="logout">Abmelden</button></div>`;
};
Object.assign(acts,{
  'export-data':async()=>{
    const logs=await ensureLogs(), uid=state.user.id, p=Object.assign({},state.profile);
    const data={exportiert_am:new Date().toISOString(),profil:p,logbuch:logs,eigene_uebungen:state.exercises.filter(e=>e.owner_id===uid),eigener_plan:state.planItems.filter(i=>i.user_id===uid)};
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
    a.download='meine-daten-obert.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2000);toast('Download gestartet ✔');
  },
  'delete-account':async()=>{
    if(!confirm('Konto wirklich endgültig löschen? Alle deine Daten werden entfernt.'))return;
    const w=prompt('Zur Bestätigung bitte LÖSCHEN eintippen:');if((w||'').trim().toUpperCase()!=='LÖSCHEN'){toast('Abgebrochen – Konto bleibt bestehen.');return;}
    const {error}=await sb.rpc('delete_my_account');if(error)throw error;
    await sb.auth.signOut();Object.assign(state,{user:null,profile:null,logs:null});renderLogin();toast('Dein Konto wurde gelöscht.');
  },
  theme:()=>{
    const next=isDark()?'light':'dark';
    document.documentElement.setAttribute('data-theme',next);
    try{localStorage.setItem('obert-theme',next);}catch(e){}
    const col=next==='dark'?'#0e0e11':'#fbfaf7';
    $$('meta[name="theme-color"]').forEach(m=>{m.removeAttribute('media');m.setAttribute('content',col);});
    $$('[data-act="theme"].iconbtn').forEach(b=>b.innerHTML=ic(next==='dark'?'sun':'moon'));
    if(window.Chart) Chart.defaults.color=css('--muted');
    if($('#view')) renderView(true);
  },
  'show-trainer-login':()=>renderLogin('trainer'),
  'show-client-login':()=>renderLogin('client'),
  logout:async()=>{await sb.auth.signOut();clearInterval(rest.iv);rest.left=0;Object.assign(state,{user:null,profile:null,isAdmin:false,logs:null,adm:null});renderLogin();},
  nav:el=>{state.tab=el.dataset.tab;$$('.nav button').forEach(b=>b.classList.toggle('on',b.dataset.tab===state.tab));track('view',state.tab);renderView();},
  variant:el=>{const c=el.closest('.ex');$$('.seg button',c).forEach(b=>b.classList.toggle('on',b===el));$$('.variant',c).forEach(v=>v.classList.toggle('hidden',v.dataset.v!==el.dataset.v));},
  'to-log':el=>{state.prefill=el.dataset.ex;acts.nav({dataset:{tab:'log'}});},
  'del-log':async el=>{if(!confirm('Eintrag wirklich löschen?'))return;const {error}=await sb.from('workout_logs').delete().eq('id',el.dataset.id);if(error)throw error;state.logs=null;toast('Gelöscht');renderView(true);},
  copy:async el=>{try{await navigator.clipboard.writeText(el.dataset.text);toast('Kopiert 📋');}catch(e){toast('Bitte manuell markieren und kopieren.',true);}}
});

/* Änderungen an Auswahlfeldern */
const chg={
  'prog-sel':el=>{const card=el.closest('.prog');drawProgress(card,card.dataset.key,el.value);},
  'log-filter':el=>{const w=el.value,rows=w===''?state.logs:state.logs.filter(l=>String(l.week)===w);$('[data-logtable]').innerHTML=logGrouped(rows);},
  'week-goal':async el=>{const {error}=await sb.rpc('set_week_goal',{goal:Number(el.value)});if(error)throw error;state.profile.week_goal=Number(el.value);toast('Wochenziel gespeichert ✔');}
};
document.addEventListener('input',e=>{
  const el=e.target;if(!el.matches)return;
  if(el.matches('input[data-filter]')){const sel=$('[data-add]',el.closest('[data-own]'));sel.innerHTML=exOptionsHtml(el.value);}
  if(el.matches('input[name="exercise_custom"]')){updateLast(el.closest('form'));}
});
document.addEventListener('click',async e=>{
  const el=e.target.closest('[data-act]');if(!el||el.tagName==='SELECT'||el.tagName==='INPUT')return;
  const fn=acts[el.dataset.act];if(!fn)return;
  try{await fn(el,e);}catch(err){toast(err.message||String(err),true);}
});
document.addEventListener('change',async e=>{
  const el=e.target;if(!el.matches)return;
  try{
    if(el.matches('[data-chg]')&&chg[el.dataset.chg]) await chg[el.dataset.chg](el);
    if(el.matches('select[data-act="ex-sel"]')){const c=$('[data-custom]',el.closest('form')),on=el.value==='__custom__';c.classList.toggle('hidden',!on);if(on)$('input',c).focus();updateLast(el.closest('form'));}
  }catch(err){toast(err.message||String(err),true);}
});

/* ---------- Formulare ---------- */
Object.assign(forms,{
  login:async f=>{
    const fd=new FormData(f), slug=toSlug(fd.get('name')), pin=fd.get('pin');
    if(!slug){$('#loginErr').textContent='Bitte Anmeldenamen eingeben.';return;}
    if(pin!=null){
      const {data,error}=await sb.auth.signInWithPassword({email:emailFor(slug),password:pinPass(slug,isTrainerName(slug)?String(pin):String(pin).trim())});
      if(error){$('#loginErr').textContent=isTrainerName(slug)?'Name oder Geheimwort stimmt nicht.':'Name oder PIN stimmt nicht.';return;}
      state.user=data.user;await enter(true);return;
    }
    if(isTrainerName(slug)){renderLogin('pin',slug);return;}   // Trainer haben kein Startpasswort
    const {data,error}=await sb.auth.signInWithPassword({email:emailFor(slug),password:passFor(slug)});
    if(error){renderLogin('pin',slug);return;}
    state.user=data.user;await enter(true);
  },
  trainer:async f=>{
    const fd=new FormData(f);
    const {data,error}=await sb.auth.signInWithPassword({email:String(fd.get('email')).trim(),password:String(fd.get('password'))});
    if(error){$('#loginErr').textContent='E-Mail oder Passwort stimmt nicht.';return;}
    state.user=data.user;await enter(true);
  },
  setpin:async f=>{
    const fd=new FormData(f),a=String(fd.get('pin')).trim(),b=String(fd.get('pin2')).trim(),err=$('#loginErr');
    if(!/^\d{6,8}$/.test(a)){err.textContent='Die PIN braucht 6 bis 8 Ziffern.';return;}
    if(a!==b){err.textContent='Die beiden PINs sind nicht gleich.';return;}
    const slug=toSlug((state.user.email||'').split('@')[0]);
    const {error}=await sb.auth.updateUser({password:pinPass(slug,a)});
    if(error){err.textContent='Das hat nicht geklappt: '+error.message;return;}
    const r=await sb.rpc('mark_pin_set');if(r.error){err.textContent=r.error.message;return;}
    toast('PIN gespeichert ✔');await enter(true);
  },
  pinchange:async f=>{
    const a=String(new FormData(f).get('pin')||'').trim();
    if(!/^\d{6,8}$/.test(a)){toast('Die PIN braucht 6 bis 8 Ziffern.',true);return;}
    const slug=toSlug((state.user.email||'').split('@')[0]);
    const {error}=await sb.auth.updateUser({password:pinPass(slug,a)});if(error)throw error;
    f.reset();toast('Neue PIN gespeichert ✔');
  },
  log:async f=>{
    const fd=new FormData(f),o={user_id:state.user.id};
    LOG_FIELDS.forEach(x=>{
      let v;
      if(x.type==='exercise'){const s=fd.get('exercise_sel');v=String(s==='__custom__'?(fd.get('exercise_custom')||''):(s||'')).trim()||null;}
      else{v=fd.get(x.key);if(x.type==='number'||x.type==='week')v=(v===''||v==null)?null:Number(v);else v=(v||'').trim()||null;}
      o[x.key]=v;
    });
    if(!o.exercise){toast('Bitte eine Übung wählen oder eine eigene eintragen.',true);return;}
    const {error}=await sb.from('workout_logs').insert(o);if(error)throw error;
    state.logs=null;state.prefill='';toast('Gespeichert 💪');renderView(true);
  }
});
document.addEventListener('submit',async e=>{
  const f=e.target.closest('[data-form]');if(!f)return;e.preventDefault();
  const btn=$('button[type=submit]',f);if(btn)btn.disabled=true;
  try{await forms[f.dataset.form](f);}catch(err){toast(err.message||'Fehler',true);}
  finally{if(btn)btn.disabled=false;}
});

/* ---------- Start ---------- */
(async function boot(){
  if('IntersectionObserver' in window) document.documentElement.classList.add('js');
  if(configured&&!sb) return;
  if(!configured){
    $('#app').innerHTML=`<section class="login"><div class="card login-in" style="text-align:left"><h2>Fast geschafft 🙂</h2><p>Die Seite läuft, ist aber noch nicht mit der Datenbank verbunden. Bitte in <span class="code">config.js</span> URL und Key eintragen.</p></div></section>`;
    return;
  }
  try{
    if(window.Chart){Chart.defaults.color=css('--muted');Chart.defaults.font.family='inherit';}
    const {data:{session}}=await sb.auth.getSession();
    if(session){state.user=session.user;await enter(false);}else renderLogin();
  }catch(err){renderLogin();toast('Verbindung fehlgeschlagen: '+(err.message||err),true);}
})();
