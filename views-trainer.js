/* Trainer-Bereich: Analyse, Klient:innen, Tipps, Übungen, Pläne */
'use strict';


async function loadAdm(force){
  if(state.adm&&!force) return state.adm;
  const [profiles,events,logs]=await Promise.all([
    fetchAll('profiles','*','created_at',q=>q.eq('role','client')),
    fetchAll('events','user_id,type,detail,created_at','created_at'),
    fetchAll('workout_logs','*','log_date')
  ]);
  state.adm={profiles,events,logs}; return state.adm;
}
function computeClients(adm){
  const now=Date.now();
  return adm.profiles.map(p=>{
    const ev=adm.events.filter(e=>e.user_id===p.id), lg=adm.logs.filter(l=>l.user_id===p.id);
    const logins=ev.filter(e=>e.type==='login');
    const lastLogin=logins.length?logins[0].created_at:null;
    const times=[ev.length?ev[0].created_at:null,...lg.map(l=>l.created_at)].filter(Boolean).sort();
    const lastAct=times.length?times[times.length-1]:null;
    const days=new Set(lg.map(l=>l.log_date));
    const train28=new Set(lg.filter(l=>new Date(l.log_date+'T00:00:00')>=daysAgo(28)).map(l=>l.log_date)).size;
    const age=lastAct?(now-new Date(lastAct))/864e5:null;
    const status=age==null?'neu':age<=7?'aktiv':age<=14?'ruhig':'inaktiv';
    return {p,logins:logins.length,lastLogin,lastAct,entries:lg.length,trainDays:days.size,train28,status,lastTrain:lg.length?lg[0].log_date:null};
  }).sort((a,b)=>(b.lastAct||'').localeCompare(a.lastAct||'')||(a.p.display_name||'').localeCompare(b.p.display_name||''));
}
function clientTable(rows){
  if(!rows.length) return '<p class="muted">Noch keine Klient:innen angelegt.</p>';
  return `<div class="tablewrap"><table><thead><tr><th>Name</th><th>Status</th><th>Letzter Login</th><th>Logins</th><th>Einträge</th><th>Trainingstage (28 T)</th><th>Letztes Training</th></tr></thead><tbody>${rows.map(r=>`<tr class="click" data-act="open-client" data-id="${r.p.id}"><td><b>${esc(r.p.display_name||r.p.email)}</b> ${r.p.is_demo?'<span class="badge">DEMO</span>':''}</td><td><span class="badge ${r.status}">${r.status}</span></td><td>${fmtDT(r.lastLogin)}</td><td>${r.logins}</td><td>${r.entries}</td><td>${r.train28}</td><td>${r.lastTrain?fmtDate(r.lastTrain):'–'}</td></tr>`).join('')}</tbody></table></div>`;
}
function barList(pairs){
  if(!pairs.length) return '<p class="muted">Noch keine Daten.</p>';
  const max=Math.max(...pairs.map(p=>p[1]));
  return `<div class="bars">${pairs.map(([n,c])=>`<div class="b"><span>${esc(n)}</span><i style="width:${Math.max(4,c/max*100)}%"></i><b>${c}</b></div>`).join('')}</div>`;
}
views['a-stats']=async function(box){
  const adm=await loadAdm(true);
  const rows=computeClients(adm), real=rows.filter(r=>!r.p.is_demo), ids=new Set(real.map(r=>r.p.id));
  const ev=adm.events.filter(e=>ids.has(e.user_id)), lg=adm.logs.filter(l=>ids.has(l.user_id));
  const t7=Date.now()-7*864e5;
  const logins=ev.filter(e=>e.type==='login'), logins7=logins.filter(e=>new Date(e.created_at)>=t7).length;
  const active7=real.filter(r=>r.lastAct&&new Date(r.lastAct)>=t7).length;
  const mob=logins.length?Math.round(logins.filter(e=>e.detail==='mobile').length/logins.length*100):0;
  const sess7=new Set(lg.filter(l=>new Date(l.log_date+'T00:00:00')>=daysAgo(7)).map(l=>l.user_id+l.log_date)).size;
  const views={}; ev.filter(e=>e.type==='view').forEach(e=>{const n=TAB_NAMES[e.detail]||e.detail;views[n]=(views[n]||0)+1;});
  const exc={}; lg.forEach(l=>exc[l.exercise]=(exc[l.exercise]||0)+1);
  const topEx=Object.entries(exc).sort((a,b)=>b[1]-a[1]).slice(0,6);
  const topViews=Object.entries(views).sort((a,b)=>b[1]-a[1]);
  const quiet=real.filter(r=>r.status==='inaktiv'||r.status==='neu');
  const days=[]; for(let i=29;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);days.push(localDay(d));}
  const loginsPerDay=days.map(d=>logins.filter(e=>localDay(e.created_at)===d).length);
  const trainPerDay=days.map(d=>new Set(lg.filter(l=>l.log_date===d).map(l=>l.user_id)).size);
  box.innerHTML=pageHead('Trainer','Die <span class="t">Analyse.</span>','Ohne Demo-User gerechnet.')+backupHint()+`
  <section class="kpis">${kpi(real.length,'Klient:innen')}${kpi(active7,'Aktiv (7 Tage)')}${kpi(logins.length,'Logins gesamt')}${kpi(logins7,'Logins (7 Tage)')}${kpi(lg.length,'Logbuch-Einträge')}${kpi(sess7,'Trainings (7 Tage)')}${kpi(mob+' %','Logins per Handy')}</section>
  <section class="card"><h3>Letzte 30 Tage</h3><div class="chartbox"><canvas></canvas></div></section>
  <section class="card"><h3>Brauchen einen Anstoß</h3>${quiet.length?quiet.map(r=>`<p><button class="link" data-act="open-client" data-id="${r.p.id}" style="color:var(--ink);font-weight:650">${esc(r.p.display_name||r.p.email)}</button> <span class="badge ${r.status}">${r.status}</span> <span class="muted">zuletzt aktiv: ${fmtDT(r.lastAct)}</span></p>`).join(''):'<p class="muted">Alle sind dabei 🎉</p>'}</section>
  <section class="grid-f" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr))"><div class="card"><h3>Meistgenutzte Bereiche</h3>${barList(topViews)}</div><div class="card"><h3>Häufigste Übungen im Logbuch</h3>${barList(topEx)}</div></section>`;
  box._after=()=>{ if(typeof Chart==='undefined') return;
    const a1=css('--accent'),a2=css('--accent2'),grid=css('--line');
    state.charts.stats=new Chart($('canvas',box),{type:'bar',data:{labels:days.map(fmtShort),datasets:[
      {label:'Logins',data:loginsPerDay,backgroundColor:a1,borderRadius:4},
      {type:'line',label:'Aktive Trainierende',data:trainPerDay,borderColor:a2,tension:.3,pointRadius:2,borderWidth:2}]},
      options:{responsive:true,maintainAspectRatio:false,scales:{x:{grid:{color:grid}},y:{beginAtZero:true,ticks:{precision:0},grid:{color:grid}}}}});
  };
};

/* ---------- Klient:innen ---------- */
const SB_USERS=()=>`https://supabase.com/dashboard/project/${CONFIG.PROJECT_REF}/auth/users`;
views['a-clients']=async function(box){
  const adm=await loadAdm(true);
  box.innerHTML=pageHead('Trainer','Klient:innen <span class="t">verwalten.</span>','Neue Person anlegen dauert etwa zwei Minuten – Schritt für Schritt.')
  +`<section class="card rv" data-newclient><h3>Neue Klient:in anlegen</h3>
    <label>Anmeldename der neuen Person<input data-act="gen-creds" placeholder="z. B. marius" autocapitalize="none" autocorrect="off" spellcheck="false"></label>
    <p class="err" data-dup></p>
    <ol class="steps" style="margin-top:10px">
      <li><div><b>Anmeldenamen oben eintragen.</b><p class="muted">Am besten der Vorname in Kleinbuchstaben, z. B. <span class="code">marius</span>. Bei gleichen Vornamen z. B. <span class="code">marius-k</span>. Umlaute werden automatisch umgewandelt (ö → oe).</p></div></li>
      <li><div><b>Supabase öffnen und anmelden.</b><p class="muted">Mit deinem <u>Supabase-Konto</u> (das ist dein Zugang zu supabase.com – nicht dein Trainer-Geheimwort für diese App). Du landest direkt bei „Authentication → Users“.</p><a class="btn ghost" href="${esc(SB_USERS())}" target="_blank" rel="noopener">Supabase öffnen ↗</a></div></li>
      <li><div><b>Oben rechts auf „Add user“ klicken</b> und dann <b>„Create new user“</b> wählen.</div></li>
      <li><div><b>Bei „Email address“ einfügen:</b><p><span class="code" data-slot="email">(erscheint, sobald oben ein Name steht)</span> <button class="mini" data-act="copy" data-slot-copy="email" disabled>Kopieren</button></p><p class="muted">Das ist keine echte Mailadresse. Es wird nie eine E-Mail verschickt.</p></div></li>
      <li><div><b>Bei „Password“ einfügen:</b><p><span class="code" data-slot="pass">(erscheint, sobald oben ein Name steht)</span> <button class="mini" data-act="copy" data-slot-copy="pass" disabled>Kopieren</button></p><p class="muted">Dieses Startpasswort darf ruhig „erratbar“ sein: Es gilt nur bis zum ersten Login. Dort legt die Person ihre eigene PIN fest – ab dann ist es wertlos. Dein eigenes Passwort tippst du hier nirgends ein, und niemand sieht es.</p></div></li>
      <li><div><b>Haken bei „Auto Confirm User“ setzen.</b></div></li>
      <li><div><b>Auf „Create user“ klicken.</b><p class="muted">Das Profil entsteht automatisch. Danach erscheint die Person hier in der Liste (Seite neu laden).</p></div></li>
      <li><div><b>Der Person Bescheid geben.</b><p class="muted">Diese Nachricht kannst du kopieren und per WhatsApp schicken:</p><p><button class="btn ghost" data-act="copy" data-slot-copy="msg" disabled>Nachricht kopieren</button></p></div></li>
    </ol></section>
  <h3 class="group rv">Alle Klient:innen</h3>
  ${clientTable(computeClients(adm))}
  <h3 class="group rv">Sicherheit</h3>${backupCard()}`;
};
document.addEventListener('input',e=>{
  const el=e.target;if(!(el.dataset&&el.dataset.act==='gen-creds'))return;
  const c=el.closest('[data-newclient]'),s=toSlug(el.value);
  const taken=s&&state.adm&&state.adm.profiles.some(p=>(p.email||'').toLowerCase()===emailFor(s));
  const vals={email:s?emailFor(s):'',pass:s?passFor(s):'',msg:s?`Hola ${s.charAt(0).toUpperCase()+s.slice(1)}! Hier ist deine Trainingsseite: ${location.origin}${location.pathname.replace(/index\.html$/,'')}\nDein Anmeldename: ${s}\nBeim ersten Mal legst du dir eine PIN (6–8 Ziffern) fest. Tipp: Auf dem Handy kannst du die Seite als App auf den Startbildschirm legen.`:''};
  $('[data-dup]',c).textContent=taken?'⚠ Diesen Namen gibt es schon. Bitte einen anderen wählen.':'';
  $$('[data-slot]',c).forEach(x=>x.textContent=vals[x.dataset.slot]||'(erscheint, sobald oben ein Name steht)');
  $$('[data-slot-copy]',c).forEach(b=>{b.dataset.text=vals[b.dataset.slotCopy]||'';b.disabled=!s;});
});
views['a-client']=async function(box){
  const adm=await loadAdm(false); const id=state.clientId;
  const p=adm.profiles.find(x=>x.id===id); if(!p){ box.innerHTML='<p>Nicht gefunden.</p>'; return; }
  const r=computeClients({profiles:[p],events:adm.events,logs:adm.logs})[0];
  const logs=adm.logs.filter(l=>l.user_id===id), ob=p.onboarding||{};
  const ownItems=state.planItems.filter(i=>i.user_id===id&&i.by_user).sort((a,b)=>a.position-b.position);
  const nm=i=>{const ex=state.exercises.find(e=>e.id===i.exercise_id);return ex?ex.name+(ex.owner_id?' (eigene)':''):'?';};
  box.innerHTML=`<button class="link" data-act="back-clients">← Alle Klient:innen</button>
  ${pageHead('Klient:in',esc(p.display_name||p.email)+' <span class="badge '+r.status+'" style="font-size:.9rem">'+r.status+'</span>',`Anmeldename: <span class="code">${esc((p.email||'').split('@')[0])}</span> · angelegt ${fmtDate(p.created_at)} · PIN: ${p.pin_set?'gesetzt ✓ <button class="mini" data-act="reset-pin" data-id="'+p.id+'">PIN zurücksetzen</button>':'noch nicht gesetzt'}`)}
  <section class="kpis">${kpi(r.logins,'Logins')}${kpi(r.entries,'Einträge')}${kpi(r.trainDays,'Trainingstage')}${kpi(r.train28,'Trainingstage (28 T)')}</section>
  <section class="card"><h3>Angaben der Person</h3>${p.onboarded||p.onboarding?`<ul class="biglist">
    <li><span>Ziele</span><b>${esc((ob.goals||[]).join(', ')||'–')}</b></li>
    <li><span>Erfahrung</span><b>${esc(ob.experience||'–')}</b></li>
    <li><span>Wochenziel</span><b>${p.week_goal?p.week_goal+'× pro Woche':'–'}</b></li>
    <li><span>Einschränkungen</span><b>${ob.limitation==='ja'?esc(ob.limitation_text||'ja (ohne Text)'):ob.limitation==='nein'?'keine angegeben':'–'}</b></li>
    <li><span>Einwilligung</span><b>${p.consent_at?fmtDate(p.consent_at):'–'}</b></li></ul>`:'<p class="muted">Noch keine Willkommens-Angaben.</p>'}
    <p class="muted" style="margin-bottom:0">Aktiver Plan: <b>${p.plan_mode==='own'?'eigener Plan der Person':'dein Plan'}</b></p></section>
  <section class="card" data-profile="${p.id}"><h3>Profil &amp; Notizen</h3><div class="form-grid">
    <label>Anzeigename<input data-k="display_name" value="${esc(p.display_name||'')}"></label>
    <label>Ziel<input data-k="goal" value="${esc(p.goal||'')}" placeholder="z. B. Rücken stärken, 2× pro Woche"></label>
    <label>Start des Plans (daraus errechnet die Seite die aktuelle Woche)<input data-k="program_start" type="date" value="${esc(p.program_start||'')}"></label>
    <label>Meine Notizen (nur für dich sichtbar)<textarea data-k="notes" rows="4">${esc(p.notes||'')}</textarea></label>
    <div><button class="btn" data-act="save-client">Speichern</button></div></div></section>
  <h3 class="group">Fortschritt</h3>${progressBlock(logs)}
  <h3 class="group">Individueller Plan</h3><div class="card">${planEditor(id)}</div>
  ${ownItems.length?`<h3 class="group">Eigener Plan der Person</h3><div class="card"><ol class="cues">${ownItems.map(i=>`<li>${esc(nm(i))}</li>`).join('')}</ol></div>`:''}
  <h3 class="group">Logbuch</h3>${logTable(logs,false)}
  <h3 class="group">Konto</h3><div class="card"><p class="muted">Löscht die Person samt Logbuch und Plänen endgültig (z. B. auf Wunsch).</p><button class="btn danger" data-act="admin-delete" data-id="${p.id}" data-name="${esc(p.display_name||p.email)}">Konto löschen</button></div>`;
  box._after=()=>initProgress(box,logs,'client');
};
acts['admin-delete']=async el=>{
  if(!confirm(`„${el.dataset.name}“ samt allen Daten endgültig löschen?`))return;
  const {error}=await sb.rpc('admin_delete_user',{target:el.dataset.id});if(error)throw error;
  state.adm=null;toast('Gelöscht');acts.nav({dataset:{tab:'a-clients'}});
};

/* ---------- Trainer: Tipps, Übungen, Pläne ---------- */
const TIP_FIELDS=[
  {key:'title',label:'Titel'},{key:'category',label:'Kapitel (Kategorie)'},{key:'body',label:'Text',type:'textarea'},
  {key:'position',label:'Reihenfolge (Zahl)',type:'number'},
  {key:'icon',label:'Symbol (Grafik beim Tipp)',type:'icon'},{key:'color',label:'Farbe des Tipps',type:'color'},
  {key:'stat',label:'Große Zahl (optional, z. B. 7.000)'},{key:'stat_label',label:'Beschriftung zur Zahl (optional)'},
  {key:'image_url',label:'Eigenes Foto statt Grafik (optional, Link https://…)'}];
const EX_FIELDS=[
  {key:'name',label:'Name der Übung'},{key:'muscle',label:'Abschnitt im Plan / Muskelgruppe (z. B. Rücken)'},
  {key:'dose',label:'Dosierung (z. B. 2 Sätze × 10–12 Wiederholungen)'},
  {key:'hint',label:'Ausführung & Tipps (eine Zeile pro Punkt, mit „- “ davor)',type:'textarea'},
  {key:'image_url',label:'Bild-Link(s) (https://…, mehrere mit Leerzeichen)'},{key:'video_url',label:'Video-Link (YouTube oder .mp4)'}];

/* ---------- Bild-Finder: freie Übungsdatenbank (Public Domain / Unlicense) ----------
   Quelle: github.com/yuhonas/free-exercise-db – Fotos mit Start- und Endposition        */
const EXDB='https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/';
const DE_EN=[['kniebeuge','squat'],['goblet','goblet squat'],['beinpresse','leg press'],['beinstrecker','leg extension'],['beinbeuger','leg curl'],['ausfallschritt','lunge'],['kreuzheben','deadlift'],['bankdrücken','bench press'],['brustpresse','chest press'],['fliegende','fly'],['butterfly','fly'],['liegestütz','push up'],['rudern','row'],['latzug','pulldown'],['klimmzug','pull up'],['schulterdrücken','shoulder press'],['seitheben','lateral raise'],['frontheben','front raise'],['bizeps','curl'],['curl','curl'],['trizeps','triceps'],['plank','plank'],['unterarmstütz','plank'],['crunch','crunch'],['bauchpresse','crunch'],['hüftheben','glute bridge'],['hip thrust','hip thrust'],['wadenheben','calf raise'],['kurzhantel','dumbbell'],['langhantel','barbell'],['kabel','cable'],['maschine','machine'],['gerät','machine']];
const STOPWORDS=new Set(['am','an','im','mit','der','die','das','und','auf','zur','zum','von','ohne','for','the','with']);
const EQUIP={'machine':'Gerät','dumbbell':'Kurzhantel','barbell':'Langhantel','cable':'Kabelzug','body only':'Eigengewicht','kettlebells':'Kettlebell','bands':'Widerstandsband','e-z curl bar':'SZ-Stange','exercise ball':'Gymnastikball','medicine ball':'Medizinball','foam roll':'Faszienrolle','other':'Sonstiges'};
const MUSC={'quadriceps':'Oberschenkel vorn','hamstrings':'Oberschenkel hinten','glutes':'Po','chest':'Brust','lats':'Latissimus','middle back':'mittlerer Rücken','lower back':'unterer Rücken','shoulders':'Schultern','biceps':'Bizeps','triceps':'Trizeps','abdominals':'Bauch','calves':'Waden','forearms':'Unterarme','traps':'Trapez','abductors':'Abduktoren','adductors':'Adduktoren','neck':'Nacken'};
const normName=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
/* Bevorzugte englische Suchbegriffe für die Übungen deines Plans (in dieser Reihenfolge probiert) */
const EX_QUERIES=new Map([
  ['Hip Thrust an der Maschine',['hip thrust machine','barbell hip thrust','hip thrust']],
  ['Glute Bridge',['glute bridge','butt lift bridge','single leg glute bridge']],
  ['Kabel-Kickbacks',['cable glute kickback','glute kickback','cable kickback','kickback']],
  ['Abduktionsmaschine',['thigh abductor','hip abduction machine','abductor']],
  ['Beinpresse',['leg press']],
  ['Goblet Squat',['goblet squat']],
  ['Kniebeuge an der Smith Machine',['smith machine squat','smith squat']],
  ['Beinbeuger sitzend',['seated leg curl']],
  ['Beinbeuger liegend',['lying leg curls','lying leg curl']],
  ['Rumänisches Kreuzheben mit Kurzhanteln',['romanian deadlift with dumbbells','dumbbell romanian deadlift','romanian deadlift']],
  ['Rückenstrecker mit Gesäßfokus',['hyperextensions back extensions','hyperextension','back extension']],
  ['Rudern am Kabelzug',['seated cable rows','seated cable row','cable row']],
  ['Rudermaschine',['leverage high row','lever seated row','machine row','seated row']],
  ['Latzug',['wide grip lat pulldown','lat pulldown']],
  ['Unterstützte Klimmzüge',['assisted pull up','machine assisted pull up','pull up']],
  ['Brustpresse an der Maschine',['leverage chest press','machine bench press','chest press machine','chest press']],
  ['Kurzhantel-Bankdrücken',['dumbbell bench press']],
  ['Dead Bug',['dead bug']],
  ['Unterarmstütz (Plank)',['plank']],
  ['Pallof Press am Kabelzug',['pallof press','cable pallof press']],
  ['Seitstütz',['side bridge','side plank']]
].map(([k,v])=>[normName(k),v]));
const FINDER_HTML=`<div class="card" style="background:var(--card2);box-shadow:none"><b>📷 Bild für diese Übung vorschlagen</b>
  <p class="muted" style="margin:.3em 0 .6em">Sucht in einer freien Übungsdatenbank (Public Domain, Fotos mit Start- und Endposition). Bitte prüfen, ob die Übung wirklich passt – gerade bei Geräten.</p>
  <label>Eigener Suchbegriff (optional, englisch klappt am besten)<input data-fq placeholder="z. B. goblet squat"></label>
  <div class="row" style="margin-top:12px"><button class="btn ghost" type="button" data-act="finder" data-target="image_url">🔎 Bild suchen</button><button class="btn ghost" type="button" data-act="yt-search">▶ Video auf YouTube suchen</button></div>
  <div data-fout style="margin-top:12px"></div></div>`;
async function loadExDb(){
  if(state.exdb) return state.exdb;
  const r=await fetch(EXDB+'dist/exercises.json'); if(!r.ok) throw new Error('Übungsdatenbank nicht erreichbar');
  state.exdb=await r.json(); return state.exdb;
}
function toEnglishQuery(s){
  const t=String(s||'').toLowerCase(), out=[];
  DE_EN.forEach(([de,en])=>{ if(t.includes(de)) out.push(en); });
  return out.length?out.join(' '):t;
}
function searchExDb(db,query){
  const toks=[...new Set(toEnglishQuery(query).replace(/[^a-z0-9 ]/g,' ').split(/\s+/).filter(x=>x.length>1&&!STOPWORDS.has(x)))];
  if(!toks.length) return [];
  const need=Math.max(1,Math.ceil(toks.length/2));
  return db.map(x=>{const h=String(x.name||'').toLowerCase().replace(/[-_]/g,' '),hj=h.replace(/ /g,'');
      return {x,s:toks.filter(t=>h.includes(t)||hj.includes(t)).length,len:h.length};})
    .filter(r=>r.s>=need&&r.x.images&&r.x.images.length)
    .sort((a,b)=>b.s-a.s||a.len-b.len).slice(0,8).map(r=>r.x);
}
function bestMatch(db,queries){
  const withImg=db.filter(x=>x.images&&x.images.length);
  for(const q of queries){
    const nq=normName(q), hit=withImg.find(x=>normName(x.name)===nq);
    if(hit) return hit;
    const toks=nq.split(' ').filter(Boolean);
    const c=withImg.filter(x=>{const n=normName(x.name);return toks.every(t=>n.includes(t));}).sort((a,b)=>a.name.length-b.name.length);
    if(c.length) return c[0];
  }
  return null;
}
const exUrls=x=>x.images.slice(0,2).map(p=>EXDB+'exercises/'+encodeURI(p));
const AUTO_HTML=`<div class="card"><h3>📷 Bilder automatisch zuordnen</h3>
  <p class="muted">Ordnet allen Übungen <b>ohne Bild</b> ein passendes Foto aus der freien Übungsdatenbank zu. Schon eingetragene Bilder bleiben unverändert. Danach unten prüfen, ob alles passt – falsche Treffer kannst du in der Übung mit dem Bild-Finder ersetzen.</p>
  <button class="btn" data-act="auto-images">Fehlende Bilder jetzt zuordnen</button><div id="autoOut" style="margin-top:14px"></div></div>`;
function crudHtml(table,fields,items,titleFn){
  const extra=table==='exercises'?FINDER_HTML:'';
  const form=it=>fields.map(f=>{
    const v=it&&it[f.key]!=null?it[f.key]:'';
    if(f.type==='textarea') return `<label>${esc(f.label)}<textarea data-k="${f.key}" data-t="text" rows="5">${esc(v)}</textarea></label>`;
    if(f.type==='icon') return `<div><label>${esc(f.label)}</label><input type="hidden" data-k="icon" data-t="text" value="${esc(v)}"><details class="icopick"><summary class="mini" style="display:inline-block;margin-top:6px">${v?ic(v):''} <span data-iconname>${esc(v||'Symbol wählen …')}</span></summary>${ICON_GROUPS.map(([g,list])=>`<div class="icogroup">${esc(g)}</div><div class="icongrid">${list.map(([k,l])=>`<button type="button" class="${k===v?'on':''}" data-act="pick-icon" data-v="${k}">${ic(k)}<span>${esc(l)}</span></button>`).join('')}</div>`).join('')}</details></div>`;
    if(f.type==='color') return `<div><label>${esc(f.label)} (leer = automatisch)</label><input type="hidden" data-k="color" data-t="text" value="${esc(v)}"><div class="colorrow">${TIP_COLORS.map(([k,l])=>`<button type="button" class="${k} ${k===v?'on':''}" title="${esc(l)}" data-act="pick-color" data-v="${k}" aria-label="${esc(l)}"></button>`).join('')}<button type="button" class="mini ${v?'':'on'}" data-act="pick-color" data-v="">Auto</button></div></div>`;
    if(f.type==='select') return `<label>${esc(f.label)}<select data-k="${f.key}" data-t="text">${['',...f.options].map(o=>`<option value="${esc(o)}" ${o===v?'selected':''}>${esc(o||'– keins –')}</option>`).join('')}</select></label>`;
    return `<label>${esc(f.label)}<input data-k="${f.key}" data-t="${f.type||'text'}" type="${f.type||'text'}" value="${esc(v)}"></label>`;
  }).join('');
  const req=fields[0].key;
  return `<details class="card"><summary>＋ Neu anlegen</summary><div class="form-grid" data-id="">${form(null)}${extra}<div><button class="btn" data-act="crud-save" data-table="${table}" data-req="${req}">Anlegen</button></div></div></details>`
   + items.map(it=>`<details class="card"><summary>${esc(titleFn(it))}</summary><div class="form-grid" data-id="${it.id}">${form(it)}${extra}<div class="row"><button class="btn" data-act="crud-save" data-table="${table}" data-req="${req}">Speichern</button><button class="btn danger" data-act="crud-del" data-table="${table}">Löschen</button></div></div></details>`).join('');
}

views['a-tips']=async function(box){ box.innerHTML=pageHead('Trainer','Tipps &amp; <span class="t">Tricks.</span>','Diese Tipps sehen alle Teilnehmer:innen – als Scroll-Seite, nach Kapiteln gruppiert. Die Kapitel-Bezeichnung „Erster Tag im Studio“ ist der Studio-Leitfaden.')+crudHtml('tips',TIP_FIELDS,state.tips,t=>`${t.category?t.category+' · ':''}${t.title}`); };
views['a-ex']=async function(box){ box.innerHTML=pageHead('Trainer','Die <span class="t">Übungen.</span>','Das ist die Übungsbibliothek, aus der alle auswählen können. Die Zuordnung zu Plänen machst du unter „Standardplan“ bzw. bei der Klient:in. Eigene Übungen der Klient:innen erscheinen hier nicht.')+AUTO_HTML+crudHtml('exercises',EX_FIELDS,state.exercises.filter(e=>!e.owner_id),e=>(e.muscle?e.muscle+' · ':'')+e.name); };
function planEditor(uid){
  const key=uid||'';
  const items=state.planItems.filter(i=>(i.user_id||'')===key&&!i.by_user).sort((a,b)=>a.position-b.position);
  const opts=state.exercises.filter(e=>!e.owner_id).slice().sort((a,b)=>(a.muscle||'').localeCompare(b.muscle||'')||a.name.localeCompare(b.name)).map(e=>`<option value="${e.id}">${esc((e.muscle?e.muscle+' – ':'')+e.name)}</option>`).join('');
  return `<div class="plan-ed" data-uid="${key}">
    ${items.map(it=>{const ex=state.exercises.find(e=>e.id===it.exercise_id);return `<div class="pe-row" data-id="${it.id}"><b>${esc(ex?ex.name:'?')}</b>${state.v3?`<select data-k="variant"><option ${(it.variant||'A')==='A'?'selected':''}>A</option><option ${it.variant==='B'?'selected':''}>B</option></select>`:''}<input data-k="sets" type="number" min="1" value="${it.sets==null?'':it.sets}" placeholder="Sätze"><input data-k="reps" value="${esc(it.reps||'')}" placeholder="Wdh."><input data-k="note" value="${esc(it.note||'')}" placeholder="Hinweis"><span class="row"><button class="mini" data-act="plan-save" title="Speichern">💾</button><button class="mini" data-act="plan-move" data-dir="-1">↑</button><button class="mini" data-act="plan-move" data-dir="1">↓</button><button class="mini" data-act="plan-del">🗑</button></span></div>`;}).join('')||'<p class="muted">Noch keine Übungen.</p>'}
    <p class="muted" style="font-size:.82rem">${state.v3?'A/B: Wähle pro Übung Plan A oder B. Gibt es nur A, sehen die Teilnehmer:innen keinen Umschalter. ':''}Sätze/Wdh. leer lassen = die Dosierung der Übung wird angezeigt. Ausfüllen = überschreibt sie für diese Person.</p>
    <hr style="border:0;border-top:1px solid var(--line);margin:14px 0">
    <div class="pe-add"><select data-k="exercise_id">${opts}</select>${state.v3?'<select data-k="variant"><option>A</option><option>B</option></select>':''}<input data-k="sets" type="number" min="1" placeholder="Sätze"><input data-k="reps" placeholder="Wdh. (z. B. 10-12)"><input data-k="note" placeholder="Hinweis"><button class="btn" data-act="plan-add">＋ Hinzufügen</button></div>
    ${uid&&!items.length?'<button class="btn ghost" data-act="plan-copy" style="margin-top:8px">Standardplan als Startpunkt kopieren</button>':''}
  </div>`;
}
views['a-plan']=async function(box){
  box.innerHTML=pageHead('Trainer','Der <span class="t">Standardplan.</span>','Diesen Plan sehen alle Teilnehmer:innen, die (noch) keinen persönlichen Plan haben – auch der Demo-User.')+`<div class="card">${planEditor(null)}</div>`;
};

Object.assign(acts,{
  finder:async el=>{
    const w=el.closest('.form-grid'),target=el.dataset.target,nameKey='name';
    const manual=$('[data-fq]',w).value.trim(),name=manual||$(`[data-k="${nameKey}"]`,w).value.trim(),out=$('[data-fout]',w);
    if(!name){toast('Bitte erst den Namen der Übung eintragen.',true);return;}
    out.innerHTML='<p class="muted">Suche …</p>';
    let db;try{db=await loadExDb();}catch(e){out.innerHTML='<p class="err">Die Bilddatenbank ist gerade nicht erreichbar. Später nochmal versuchen.</p>';return;}
    const res=searchExDb(db,name);
    out.innerHTML=res.length
      ?`<p class="muted">Vorschläge für „${esc(name)}“ (gesucht nach: ${esc(toEnglishQuery(name))}). Gefällt keiner? Oben einen eigenen Suchbegriff eintragen.</p><div class="fgrid">${res.map(x=>{
          const urls=exUrls(x);
          return `<div class="fcard">${media(urls.join(' '))}
            <b>${esc(x.name)}</b><br><span class="muted">${esc(EQUIP[x.equipment]||x.equipment||'–')} · ${esc((x.primaryMuscles||[]).map(m=>MUSC[m]||m).join(', '))}</span>
            <div style="margin-top:8px"><button class="btn" type="button" data-act="finder-pick" data-target="${esc(target)}" data-urls="${esc(urls.join(' '))}">Übernehmen</button></div></div>`;}).join('')}</div>`
      :'<p class="muted">Nichts gefunden. Probiere einen englischen Suchbegriff, z. B. „leg press“.</p>';
  },
  'finder-pick':el=>{
    const w=el.closest('.form-grid');$(`[data-k="${el.dataset.target}"]`,w).value=el.dataset.urls;
    toast('Bild eingetragen – jetzt unten auf „Speichern“ klicken ✔');
  },
  'auto-images':async el=>{
    const out=$('#autoOut');out.innerHTML='<p class="muted">Lade die Übungsdatenbank …</p>';el.disabled=true;
    try{
      let db;try{db=await loadExDb();}catch(e){out.innerHTML='<p class="err">Die Bilddatenbank ist gerade nicht erreichbar (Internet? Werbeblocker?). Später nochmal versuchen.</p>';return;}
      const todo=[];
      state.exercises.forEach(ex=>{
        if(!ex.image_url) todo.push({ex,key:'image_url',name:ex.name});
      });
      if(!todo.length){out.innerHTML='<p>Alle Übungen haben schon Bilder. 👍</p>';return;}
      const ok=[],miss=[];
      for(const t of todo){
        const qs=EX_QUERIES.get(normName(t.name))||[toEnglishQuery(t.name)];
        const m=bestMatch(db,qs);
        if(!m){miss.push(t.name);continue;}
        const urls=exUrls(m),{error}=await sb.from('exercises').update({[t.key]:urls.join(' ')}).eq('id',t.ex.id);
        if(error) throw error; ok.push({name:t.name,match:m.name,urls});
      }
      await loadCommon();
      out.innerHTML=`<p><b>${ok.length}</b> Bilder zugeordnet${miss.length?`, <b>${miss.length}</b> ohne Treffer`:''}. Bitte kurz prüfen:</p>
        <div class="fgrid">${ok.map(r=>`<div class="fcard">${media(r.urls.join(' '))}<b>${esc(r.name)}</b><br><span class="muted">Treffer: ${esc(r.match)}</span></div>`).join('')}</div>
        ${miss.length?`<p class="err" style="margin-top:12px">Kein Treffer für: ${miss.map(esc).join(', ')} – bitte bei der Übung mit dem Bild-Finder suchen.</p>`:''}`;
    }catch(err){out.innerHTML='<p class="err">'+esc(err.message||err)+'</p>';}
    finally{el.disabled=false;}
  },
  'yt-search':el=>{
    const w=el.closest('.form-grid'),n=$('[data-fq]',w).value.trim()||$('[data-k="name"]',w).value.trim();
    if(!n){toast('Bitte erst den Namen der Übung eintragen.',true);return;}
    window.open('https://www.youtube.com/results?search_query='+encodeURIComponent(n+' Übung richtig ausführen'),'_blank','noopener');
  },
  'reset-pin':async el=>{
    if(!confirm('PIN wirklich zurücksetzen? Die Person legt beim nächsten Login eine neue PIN fest.'))return;
    const {error}=await sb.rpc('admin_reset_pin',{target:el.dataset.id});if(error)throw error;
    state.adm=null;toast('PIN zurückgesetzt ✔');renderView(true);
  },
  'crud-save':async el=>{
    const wrap=el.closest('.form-grid'),table=el.dataset.table,o={};
    $$('[data-k]',wrap).forEach(i=>{let v=i.value.trim();o[i.dataset.k]=i.dataset.t==='number'?(v===''?0:Number(v)):(v||null);});
    if(!o[el.dataset.req]){toast('Das erste Feld darf nicht leer sein.',true);return;}
    const q=wrap.dataset.id?sb.from(table).update(o).eq('id',wrap.dataset.id):sb.from(table).insert(o);
    const {error}=await q;if(error)throw error;await loadCommon();toast('Gespeichert ✔');renderView(true);
  },
  'crud-del':async el=>{
    if(!confirm('Wirklich löschen? (Übungen verschwinden dabei auch aus allen Plänen.)'))return;
    const {error}=await sb.from(el.dataset.table).delete().eq('id',el.closest('.form-grid').dataset.id);if(error)throw error;
    await loadCommon();toast('Gelöscht');renderView(true);
  },
  'plan-add':async el=>{
    const w=el.closest('.plan-ed'),uid=w.dataset.uid||null,v=k=>$(`[data-k="${k}"]`,$('.pe-add',w)).value.trim();
    if(!v('exercise_id')){toast('Bitte zuerst unter „Übungen“ eine Übung anlegen.',true);return;}
    const mine=state.planItems.filter(i=>(i.user_id||null)===uid&&!i.by_user);
    const o={user_id:uid,by_user:false,exercise_id:Number(v('exercise_id')),position:(mine.reduce((m,i)=>Math.max(m,i.position||0),0))+1,sets:v('sets')?Number(v('sets')):null,reps:v('reps')||null,note:v('note')||null};if(state.v3)o.variant=v('variant')||'A';
    const {error}=await sb.from('plan_items').insert(o);if(error)throw error;await loadCommon();renderView(true);
  },
  'plan-save':async el=>{
    const r=el.closest('.pe-row'),g=k=>$(`[data-k="${k}"]`,r).value.trim();
    const {error}=await sb.from('plan_items').update({sets:g('sets')?Number(g('sets')):null,reps:g('reps')||null,note:g('note')||null,...(state.v3?{variant:g('variant')||'A'}:{})}).eq('id',r.dataset.id);
    if(error)throw error;await loadCommon();toast('Gespeichert ✔');
  },
  'plan-del':async el=>{const {error}=await sb.from('plan_items').delete().eq('id',el.closest('.pe-row').dataset.id);if(error)throw error;await loadCommon();renderView(true);},
  'plan-move':async el=>{
    const uid=el.closest('.plan-ed').dataset.uid||null,id=Number(el.closest('.pe-row').dataset.id),dir=Number(el.dataset.dir);
    const list=state.planItems.filter(i=>(i.user_id||null)===uid&&!i.by_user).sort((a,b)=>a.position-b.position);
    const i=list.findIndex(x=>x.id===id),j=i+dir;if(j<0||j>=list.length)return;
    [list[i],list[j]]=[list[j],list[i]];
    await Promise.all(list.map((it,idx)=>it.position!==idx+1?sb.from('plan_items').update({position:idx+1}).eq('id',it.id):null));
    await loadCommon();renderView(true);
  },
  'plan-copy':async el=>{
    const uid=el.closest('.plan-ed').dataset.uid;
    const rows=state.planItems.filter(i=>!i.user_id).map(i=>({user_id:uid,by_user:false,exercise_id:i.exercise_id,position:i.position,sets:i.sets,reps:i.reps,note:i.note}));
    if(!rows.length){toast('Der Standardplan ist leer.',true);return;}
    const {error}=await sb.from('plan_items').insert(rows);if(error)throw error;await loadCommon();renderView(true);
  },
  'pick-icon':el=>{const w=el.closest('.form-grid');$('[data-k="icon"]',w).value=el.dataset.v;$$('[data-act="pick-icon"]',w).forEach(b=>b.classList.toggle('on',b===el));$('[data-iconname]',w).textContent=el.dataset.v;},
  'pick-color':el=>{const w=el.closest('.form-grid');$('[data-k="color"]',w).value=el.dataset.v;$$('[data-act="pick-color"]',w).forEach(b=>b.classList.toggle('on',b===el));}
});

Object.assign(acts,{
  'open-client':el=>{state.clientId=el.dataset.id;state.tab='a-client';$$('.nav button').forEach(b=>b.classList.toggle('on',b.dataset.tab==='a-clients'));renderView();},
  'back-clients':()=>acts.nav({dataset:{tab:'a-clients'}}),
  'save-client':async el=>{
    const c=el.closest('[data-profile]');const o={};$$('[data-k]',c).forEach(i=>o[i.dataset.k]=i.value.trim()||null);
    const {error}=await sb.from('profiles').update(o).eq('id',c.dataset.profile);if(error)throw error;
    state.adm=null;toast('Gespeichert ✔');
  },
});


/* ---------- Datensicherung ---------- */
const lastBackup=()=>{try{return localStorage.getItem('obert-lastbackup');}catch(e){return null;}};
function backupHint(){
  const lb=lastBackup(), age=lb?Math.floor((Date.now()-new Date(lb))/864e5):null;
  if(lb&&age<=30) return '';
  return `<p class="warnbox">${lb?`Deine letzte Datensicherung ist ${age} Tage alt.`:'Du hast noch keine Datensicherung gemacht.'} <button class="link" style="color:var(--ink);font-weight:700;text-decoration:underline" data-act="nav" data-tab="a-clients">Jetzt sichern →</button></p>`;
}
const backupCard=()=>{const lb=lastBackup();return `<section class="card rv"><h3>Datensicherung</h3>
  <p class="muted" style="margin-top:0">Lädt alle Daten als Datei auf dein Gerät: Profile (inkl. Willkommens-Angaben), Logbücher, Pläne, Übungen, Tipps. ${lb?`Zuletzt gesichert: ${fmtDT(lb)}.`:'Bisher noch nicht gesichert.'}</p>
  <div class="row"><button class="btn" data-act="backup-json">${ic('download')} Alles sichern (JSON)</button><button class="btn ghost" data-act="backup-csv">Logbücher als Tabelle (CSV)</button></div>
  <p class="warnbox" style="margin:14px 0 0">Die Datei enthält persönliche und teils gesundheitsbezogene Daten. Bitte nur privat speichern (z. B. verschlüsselter Ordner) und <b>niemals</b> bei GitHub hochladen oder weitergeben. Empfehlung: einmal im Monat.</p></section>`;};
const dl=(name,text,type)=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),3000);};
const stamp=()=>localDay(new Date());
Object.assign(acts,{
  'backup-json':async()=>{
    toast('Sicherung wird erstellt …');
    const [profiles,events,logs,plans,exs,tips]=await Promise.all([fetchAll('profiles','*','created_at'),fetchAll('events','*','created_at'),fetchAll('workout_logs','*','log_date'),fetchAll('plan_items','*','id'),fetchAll('exercises','*','id'),fetchAll('tips','*','id')]);
    dl(`obert-sicherung-${stamp()}.json`,JSON.stringify({erstellt_am:new Date().toISOString(),profile:profiles,logbuch:logs,plaene:plans,uebungen:exs,tipps:tips,ereignisse:events},null,1),'application/json');
    try{localStorage.setItem('obert-lastbackup',new Date().toISOString());}catch(e){}
    toast('Sicherung heruntergeladen ✔');renderView(true);
  },
  'backup-csv':async()=>{
    const [profiles,logs]=await Promise.all([fetchAll('profiles','*','created_at'),fetchAll('workout_logs','*','log_date')]);
    const nm={};profiles.forEach(p=>nm[p.id]=p.display_name||p.email);
    const c=v=>{v=v==null?'':String(v);return /[;"\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v;};
    const rows=[['Person','Woche','Datum','Übung','Sätze','Wiederholungen','Gewicht (kg)','Notiz']].concat(logs.slice().reverse().map(l=>[nm[l.user_id]||l.user_id,l.week,l.log_date,l.exercise,l.sets,l.reps,l.weight==null?'':String(l.weight).replace('.',','),l.note]));
    dl(`obert-logbuecher-${stamp()}.csv`,'\ufeff'+rows.map(r=>r.map(c).join(';')).join('\r\n'),'text/csv;charset=utf-8');
    toast('Tabelle heruntergeladen ✔');
  }
});
