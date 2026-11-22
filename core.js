/* Kern: Verbindung, Symbole, Helfer, Pausen-Timer, Rechtstexte, Ereignisse */
'use strict';
/* Statt einer schwarzen Seite zeigen wir bei einem Startfehler eine verständliche Meldung */
function showFatal(msg){
  const a=document.getElementById('app'); if(!a) return;
  a.innerHTML='<section class="login"><div class="card login-in" style="text-align:left"><h2>Hoppla – die Seite konnte nicht starten</h2><p class="muted">Technische Meldung:</p><p class="code">'+String(msg).replace(/[<>&]/g,' ')+'</p><p class="muted">Mögliche Ursachen: Supabase-Daten in <b>config.js</b> falsch eingetragen (URL muss mit https:// beginnen und auf .supabase.co enden), keine Internetverbindung, oder ein Werbeblocker blockiert cdn.jsdelivr.net.</p></div></section>';
}
window.addEventListener('error',e=>showFatal(e.message||'Unbekannter Fehler'));
window.addEventListener('unhandledrejection',e=>showFatal((e.reason&&e.reason.message)||e.reason||'Unbekannter Fehler'));

const configured = !CONFIG.SUPABASE_URL.includes('DEIN-PROJEKT');
let sb = null;
if(configured){
  try{
    if(typeof supabase==='undefined') throw new Error('Die Supabase-Bibliothek konnte nicht geladen werden (Internet oder Werbeblocker?).');
    sb = supabase.createClient(CONFIG.SUPABASE_URL.trim(), CONFIG.SUPABASE_ANON_KEY.trim());
  }catch(err){ showFatal(err.message||err); }
}

/* ---------- Symbole (eigene Linien-Icons, 24×24) ---------- */
const ICONS={
  /* Navigation / Oberfläche */
  home:'M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10',
  tips:'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.4 1.1 2.2h5c0-.8.4-1.6 1.1-2.2A6 6 0 0 0 12 3z',
  plan:'M9 4h6v2H9zM7 5H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-1M9 12h6M9 16h4',
  log:'M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4',
  progress:'M3 17l6-6 4 4 8-8M15 7h6v6',
  stats:'M5 20V10M12 20V4M19 20v-7',
  users:'M16 20v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM20 20v-1a4 4 0 0 0-3-3.9M16 4.2a3.5 3.5 0 0 1 0 6.6',
  user:'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
  download:'M12 4v11M7 11l5 5 5-5M5 20h14',
  trash:'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
  arrow:'M12 5v14M6 13l6 6 6-6',
  /* Training */
  dumbbell:'M6 7v10M3 9.5v5M18 7v10M21 9.5v5M6 12h12',
  barbell:'M2 12h20M5 8v8M8 6v12M16 6v12M19 8v8',
  kettlebell:'M9 9V6a3 3 0 0 1 6 0v3M12 21a7 7 0 1 0 0-14 7 7 0 0 0 0 14z',
  plate:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  repeat:'M17 2l4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3',
  layers:'M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5',
  infinity:'M7 8a4 4 0 1 0 0 8c4 0 6-8 10-8a4 4 0 1 1 0 8c-4 0-6-8-10-8z',
  wave:'M3 12c3-6 6-6 9 0s6 6 9 0',
  target:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 12h.01',
  ruler:'M3 15l12-12 6 6L9 21l-6-6zM8 10l2 2M11 7l2 2M5 13l2 2',
  /* Körper */
  body:'M12 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM5 9h14M12 9v6M9 22l3-7 3 7',
  stretch:'M12 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM5 3l5 6h4l5-6M12 9v6M9 22l3-7 3 7',
  run:'M15 4a2 2 0 1 0 0-.01M12 8l-3 3 3 3-1 6M12 8l4 3 3-1M9 11l-4 1',
  bike:'M6 19a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM18 19a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM6 15l4-7h6l2 7M10 8L8 6H6',
  shoe:'M2 17v-4l5-1 3 2h4l6 2v3H2zM2 17h20',
  steps:'M8 4c-1.7 0-3 2-3 4.5S6.3 12 8 12s3-1 3-3.5S9.7 4 8 4zM8 14.5V16M16 9c-1.7 0-3 2-3 4.5S14.3 17 16 17s3-1 3-3.5S17.7 9 16 9zM16 19.5V21',
  stairs:'M3 20h5v-5h5v-5h5V5h3',
  pulse:'M3 12h4l2-6 4 12 2-6h6',
  heart:'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z',
  brain:'M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 4 3 3 0 0 0 6 1V4a3 3 0 0 0-3 0zM15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 4 3 3 0 0 1-6 1',
  /* Ernährung */
  apple:'M12 7c-2-2-7-1-7 5 0 4 3 9 5 9 1 0 1.5-.5 2-.5s1 .5 2 .5c2 0 5-5 5-9 0-6-5-7-7-5zM12 7c0-2 1-4 3-4',
  egg:'M12 3c-4 0-7 6-7 11a7 7 0 0 0 14 0c0-5-3-11-7-11z',
  leaf:'M5 19C5 10 10 5 20 4c0 10-5 15-14 15zM5 19c3-5 6-8 10-10',
  bowl:'M3 11h18a9 9 0 0 1-18 0zM8 8c0-2 2-3 4-3M12 5c2 0 4 1 4 3',
  utensils:'M7 3v7a2 2 0 0 0 4 0V3M9 10v11M17 3c-2 2-3 5-3 8h3v10',
  drop:'M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z',
  bottle:'M10 3h4v3l2 3v11a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V9l2-3V3zM8 13h8',
  cup:'M5 8h12v6a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5V8zM17 10h2a2 2 0 0 1 0 4h-2M8 3v2M12 3v2',
  /* Erholung */
  moon:'M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z',
  bed:'M3 18V7M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5',
  battery:'M3 8h15a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1zM22 11v2M6 11v2M10 11v2',
  sun:'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  sunrise:'M3 18h18M7 18a5 5 0 0 1 10 0M12 4v4M5 9l2 2M19 9l-2 2',
  wind:'M3 9h11a3 3 0 1 0-3-3M3 15h15a3 3 0 1 1-3 3M3 12h7',
  smile:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8.5 14a4 4 0 0 0 7 0M9 10h.01M15 10h.01',
  cycle:'M20 12a8 8 0 1 1-3-6.2M20 4v4h-4',
  thermo:'M10 14V5a2 2 0 0 1 4 0v9a4 4 0 1 1-4 0z',
  /* Zeit & Planung */
  timer:'M12 8v5l3 2M9 2h6M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16z',
  clock:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  sandglass:'M6 3h12M6 21h12M7 3c0 5 5 6 5 9s-5 4-5 9M17 3c0 5-5 6-5 9s5 4 5 9',
  calendar:'M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM4 10h16M8 3v4M16 3v4',
  bell:'M6 16V11a6 6 0 0 1 12 0v5l2 2H4l2-2zM10 21h4',
  /* Fortschritt & Motivation */
  trend:'M3 17l6-6 4 4 8-8M15 7h6v6',
  notebook:'M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM9 8h7M9 12h7M9 16h4',
  clipboard:'M9 4h6v3H9zM7 5H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-1M9 14l2 2 4-4',
  camera:'M4 7h3l2-3h6l2 3h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  scale:'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM8 8a5 5 0 0 1 8 0M12 12l2-3',
  flame:'M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-9z',
  bolt:'M13 2L4 14h7l-1 8 9-12h-7z',
  trophy:'M8 4h8v5a4 4 0 0 1-8 0V4zM8 6H4v1a3 3 0 0 0 4 3M16 6h4v1a3 3 0 0 1-4 3M12 13v4M8 21h8M10 17h4',
  medal:'M8 3l4 7 4-7M12 21a5 5 0 1 0 0-10 5 5 0 0 0 0 10z',
  star:'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3z',
  flag:'M5 21V4M5 4h11l-2 4 2 4H5',
  mountain:'M3 19l6-10 4 6 2-3 6 7H3z',
  rocket:'M5 19c0-3 1-4 3-4l1 1c0 2-1 3-4 3zM9 15l-1-1c0-6 5-11 12-11 0 7-5 12-11 12zM15 9h.01',
  spark:'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z',
  check:'M5 12l5 5 9-10',
  /* Sicherheit & Studio */
  shield:'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3zM9 12l2 2 4-4',
  lock:'M6 11h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1zM8 11V8a4 4 0 0 1 8 0v3',
  key:'M8 15a4 4 0 1 1 3.5-6H21v3h-2v2h-3v-2h-4.5A4 4 0 0 1 8 15z',
  chat:'M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H10l-5 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM8 10h8M8 13h5',
  bag:'M6 8h12l1 13H5L6 8zM9 8V6a3 3 0 0 1 6 0v2',
  door:'M6 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17M4 21h16M14 12h.01',
  building:'M4 21V7l8-4 8 4v14M9 21v-6h6v6M8 10h.01M12 10h.01M16 10h.01',
  phone:'M8 3h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM11 18h2',
  balance:'M12 3v18M5 21h14M5 7h14M5 7l-3 7a3 3 0 0 0 6 0L5 7zM19 7l-3 7a3 3 0 0 0 6 0l-3-7z'
};
/* Auswahl für den Tipp-Editor: Gruppen mit deutschen Namen */
const ICON_GROUPS=[
  ['Training',[['dumbbell','Hantel'],['barbell','Langhantel'],['kettlebell','Kettlebell'],['plate','Scheibe'],['repeat','Wiederholen'],['layers','Ebenen'],['infinity','Abwechslung'],['wave','Bewegung'],['target','Ziel'],['ruler','Einstellen']]],
  ['Körper',[['body','Körper'],['stretch','Dehnen'],['run','Laufen'],['bike','Radfahren'],['shoe','Schuh'],['steps','Schritte'],['stairs','Treppe'],['pulse','Puls'],['heart','Herz'],['brain','Kopf']]],
  ['Ernährung',[['apple','Apfel'],['egg','Ei'],['leaf','Gemüse'],['bowl','Bowl'],['utensils','Besteck'],['drop','Wasser'],['bottle','Flasche'],['cup','Kaffee']]],
  ['Erholung',[['moon','Schlaf'],['bed','Bett'],['battery','Akku'],['sun','Sonne'],['sunrise','Morgen'],['wind','Atmen'],['smile','Wohlbefinden'],['cycle','Zyklus'],['thermo','Temperatur']]],
  ['Planung',[['timer','Timer'],['clock','Uhr'],['sandglass','Geduld'],['calendar','Kalender'],['bell','Erinnerung'],['balance','Balance']]],
  ['Fortschritt',[['trend','Trend'],['notebook','Notizbuch'],['clipboard','Checkliste'],['camera','Foto'],['scale','Waage'],['flame','Flamme'],['bolt','Energie'],['trophy','Pokal'],['medal','Medaille'],['star','Stern'],['flag','Ziel-Flagge'],['mountain','Gipfel'],['rocket','Raketenstart'],['spark','Funke']]],
  ['Studio & Sicherheit',[['shield','Schutz'],['lock','Sicher'],['key','Schlüssel'],['chat','Nachricht'],['bag','Tasche'],['door','Eingang'],['building','Studio'],['phone','Handy']]]
];
const ICON_KEYS=ICON_GROUPS.flatMap(g=>g[1].map(x=>x[0]));
const TIP_COLORS=[['v1','Orange'],['v2','Blau-Türkis'],['v3','Grün'],['v4','Pink-Rot'],['v5','Violett'],['v6','Bernstein'],['v7','Petrol'],['v8','Beere']];
const ic=(n,cls)=>`<svg class="ic ${cls||''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${ICONS[n]||ICONS.bolt}"/></svg>`;

const CLIENT_TABS = [['home','Start','home'],['tips','Tipps','tips'],['plan','Plan','plan'],['log','Logbuch','log'],['progress','Fortschritt','progress']];
const ADMIN_TABS  = [['a-stats','Analyse','stats'],['a-clients','Klient:innen','users'],['a-tips','Tipps','tips'],['a-ex','Übungen','dumbbell'],['a-plan','Standardplan','plan']];
const TAB_NAMES = {home:'Start',tips:'Tipps',plan:'Mein Plan',log:'Logbuch',progress:'Fortschritt',studio:'Erster Tag im Studio',profile:'Profil'};
const STUDIO_CAT = 'Erster Tag im Studio';

const state = {user:null,profile:null,isAdmin:false,v2:true,tab:'home',tips:[],exercises:[],planItems:[],logs:null,adm:null,clientId:null,prefill:'',charts:{},progLogs:{},timer:null,io:null,onScroll:null,exdb:null,editPlan:false,obStep:0,ob:{}};
const acts = {};      // Klick-Aktionen (werden in den views-Dateien ergänzt)
const forms = {};     // Formular-Aktionen
const views = {};     // Ansichten
/* ---------- Helfer ---------- */
const $ = (s, el=document) => el.querySelector(s);
const $$ = (s, el=document) => Array.from(el.querySelectorAll(s));
const esc = s => String(s==null?'':s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pick = a => a[Math.floor(Math.random()*a.length)];
const safeUrl = u => /^https?:\/\//i.test(u||'') ? u : '';
const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const pad2 = n => String(n).padStart(2,'0');
const isDark = () => { const t=document.documentElement.getAttribute('data-theme'); return t ? t==='dark' : !!(window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches); };
const themeBtn = fab => `<button class="iconbtn ${fab?'theme-fab':''}" data-act="theme" aria-label="Zwischen hellem und dunklem Design wechseln" title="Hell / Dunkel">${ic(isDark()?'sun':'moon')}</button>`;
const reduced = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
const fmtDate = d => d ? new Date(d.length===10 ? d+'T00:00:00' : d).toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric'}) : '–';
const fmtShort = d => new Date(d+'T00:00:00').toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit'});
const fmtDT = d => d ? new Date(d).toLocaleString('de-DE',{dateStyle:'short',timeStyle:'short'}) : '–';
const localDay = x => { const d = new Date(x); return new Date(d - d.getTimezoneOffset()*60000).toISOString().slice(0,10); };
const today = () => localDay(new Date());
const daysAgo = n => Date.now() - n*864e5;
const device = () => /Android|iPhone|iPad|iPod|Mobi/i.test(navigator.userAgent) ? 'mobile' : 'desktop';
const toSlug = s => String(s||'').trim().toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').replace(/\s+/g,'-').replace(/[^a-z0-9._-]/g,'');
const emailFor = slug => `${slug}@${CONFIG.EMAIL_DOMAIN}`;
const passFor = slug => `obert-${slug}-fit`;               // Startpasswort (bis die Person ihre PIN festlegt)
const pinPass = (slug,pin) => `obert-${slug}-pin-${pin}`;   // echtes Passwort nach dem Festlegen der PIN
function toast(m,bad){const t=$('#toast');t.textContent=m;t.className='show'+(bad?' bad':'');clearTimeout(toast.t);toast.t=setTimeout(()=>t.className='',3200);}
function destroyCharts(){
  Object.values(state.charts).forEach(c=>{try{c.destroy()}catch(e){}});state.charts={};
  clearInterval(state.timer);
  if(state.onScroll){window.removeEventListener('scroll',state.onScroll);state.onScroll=null;}
  if(state.io){state.io.disconnect();state.io=null;}
}
async function fetchAll(table, cols, orderCol, filter){
  let all=[], from=0;
  for(;;){
    let q = sb.from(table).select(cols).order(orderCol,{ascending:false}).order('id',{ascending:false}).range(from,from+999);
    if(filter) q = filter(q);
    const {data,error} = await q; if(error) throw error;
    all = all.concat(data); if(data.length<1000) break; from+=1000; if(from>60000) break;
  }
  return all;
}
function track(type,detail){ if(state.isAdmin||!state.user||state.profile&&state.profile.is_demo&&false) return; sb.from('events').insert({user_id:state.user.id,type,detail}).then(()=>{},()=>{}); }

/* Scroll-Animationen: Elemente mit class="rv" blenden beim Hineinscrollen ein; Zahlen zählen hoch */
function observeReveals(root){
  $$('[data-count]',root).filter(e=>!e.closest('.rv')).forEach(countUp);   // Zahlen außerhalb von Scroll-Bereichen sofort hochzählen
  const els=$$('.rv',root); if(!els.length) return;
  if(!('IntersectionObserver' in window)){els.forEach(e=>e.classList.add('in'));return;}
  state.io=new IntersectionObserver(entries=>entries.forEach(en=>{
    if(!en.isIntersecting) return;
    const el=en.target; el.classList.add('in'); state.io&&state.io.unobserve(el);
    $$('[data-count]',el).forEach(countUp);
  }),{threshold:.2,rootMargin:'0px 0px -6% 0px'});
  els.forEach(e=>state.io.observe(e));
}
function countUp(el){
  const to=Number(el.dataset.count); if(!to||reduced()) return;
  const dec=Number(el.dataset.dec||0),grp=el.dataset.grp==='1';
  const fmt=v=>v.toLocaleString('de-DE',{minimumFractionDigits:dec,maximumFractionDigits:dec,useGrouping:grp});
  const t0=performance.now(),dur=1400;
  (function step(t){const p=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-p,3);el.textContent=fmt(to*e);if(p<1)requestAnimationFrame(step);else el.textContent=fmt(to);})(t0);
}
/* Zahlen in Texten (z. B. "7–9", "1,0–1,5", "7.000", "29,6 t") werden einzeln hochgezählt */
function statHtml(s){
  s=String(s==null?'':s);
  return esc(s).replace(/\d+(?:[.,]\d+)*/g,tok=>{
    let dec=0,grp=0,val;
    if(/^\d{1,3}(\.\d{3})+$/.test(tok)){grp=1;val=Number(tok.replace(/\./g,''));}
    else if(/^\d+,\d+$/.test(tok)){dec=tok.split(',')[1].length;val=Number(tok.replace(',','.'));}
    else if(/^\d+\.\d+$/.test(tok)){dec=tok.split('.')[1].length;val=Number(tok);}
    else val=Number(tok);
    return `<span data-count="${val}" data-dec="${dec}" data-grp="${grp}">${tok}</span>`;
  });
}

/* ---------- Medien ---------- */
function media(img,label){
  const imgs=String(img||'').split(/[\s,]+/).map(safeUrl).filter(Boolean).slice(0,4);
  if(!imgs.length) return `<div class="ph">${ic('dumbbell')}<span>${esc(label||'Bild folgt')}</span></div>`;
  const tags=imgs.map(u=>`<img class="ex-img" loading="lazy" alt="Übungsbild" src="${esc(u)}">`);
  if(imgs.length===2) return `<div class="flip">${tags.join('')}</div><span class="cap">Start- und Endposition im Wechsel</span>`;
  return `<div class="imgs n${imgs.length}">${tags.join('')}</div>`;
}
function videoParts(vid){   // -> [Block, Button]
  vid=safeUrl(vid); if(!vid) return ['',''];
  if(/youtube\.com\/results/.test(vid)) return ['',`<a class="btn ghost" href="${esc(vid)}" target="_blank" rel="noopener">▶ Videos auf YouTube</a>`];
  const m=vid.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/);
  if(m) return [`<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/${m[1]}" loading="lazy" allowfullscreen title="Video"></iframe></div>`,''];
  if(/\.(mp4|webm)(\?|$)/i.test(vid)) return [`<video class="ex-img" controls preload="none" src="${esc(vid)}"></video>`,''];
  return ['',`<a class="btn ghost" href="${esc(vid)}" target="_blank" rel="noopener">▶ Video öffnen</a>`];
}
function hintHtml(t){
  const items=String(t||'').split('\n').map(l=>l.trim().replace(/^(?:[-•*]|\d+[.)])\s+/,'')).filter(Boolean);
  if(!items.length) return '<p class="muted">Hinweise folgen.</p>';
  return items.length>1?`<ol class="cues">${items.map(i=>`<li>${esc(i)}</li>`).join('')}</ol>`:`<p class="hint">${esc(items[0])}</p>`;
}

/* ---------- Seitenkopf: überall gleich groß wie auf Start & Tipps ---------- */
const pageHead=(eyebrow,title,lead,extra)=>`<header class="page-head rv"><p class="eyebrow">${esc(eyebrow)}</p><h2 class="mega">${title}</h2>${lead?`<p class="lead muted">${lead}</p>`:''}${extra||''}</header>`;

/* ---------- Pausen-Timer (schwebende Pille, nur für Teilnehmer:innen) ---------- */
const rest={left:0,total:0,iv:null,open:false};
function beep(){
  try{
    const C=window.AudioContext||window.webkitAudioContext; if(!C) return;
    const a=new C(),o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.frequency.value=880;g.gain.value=.15;o.start();
    setTimeout(()=>{o.frequency.value=1175},180);setTimeout(()=>{o.stop();a.close()},420);
  }catch(e){}
  try{navigator.vibrate&&navigator.vibrate([200,100,200]);}catch(e){}
}
function restRender(){
  const el=$('#rt'); if(!el) return;
  const run=rest.left>0;
  const fmt=s=>Math.floor(s/60)+':'+pad2(s%60);
  el.innerHTML=(rest.open&&!run?`<div class="rt-menu">${[60,90,120].map(s=>`<button class="choice" data-act="rest-start" data-s="${s}">${s} s</button>`).join('')}</div>`:'')
    +`<button class="rt-pill ${run?'run':''}" data-act="rest-toggle" aria-label="Pausen-Timer">${ic('timer')}<span>${run?fmt(rest.left):'Pause'}</span></button>`;
}
function restStart(s){
  clearInterval(rest.iv);rest.left=s;rest.total=s;rest.open=false;restRender();
  rest.iv=setInterval(()=>{rest.left--;if(rest.left<=0){clearInterval(rest.iv);rest.left=0;beep();toast('Pause vorbei – weiter geht\'s 💪');}restRender();},1000);
}
Object.assign(acts,{
  'rest-toggle':()=>{ if(rest.left>0){clearInterval(rest.iv);rest.left=0;rest.open=false;}else rest.open=!rest.open; restRender(); },
  'rest-start':el=>restStart(Number(el.dataset.s))
});

/* ---------- Rechtstexte ---------- */
function showLegal(which){
  const t=which==='impressum'?'Impressum':'Datenschutz';
  const m=document.createElement('div');m.className='modal';m.setAttribute('role','dialog');
  m.innerHTML=`<div class="box"><div class="row" style="justify-content:space-between"><h3 style="margin:0">${t}</h3><button class="x" data-act="close-modal" aria-label="Schließen">✕</button></div>${LEGAL[which]}</div>`;
  m.addEventListener('click',e=>{if(e.target===m)m.remove();});
  document.body.appendChild(m);
}
const legalLinks=()=>`<p class="legal"><button data-act="legal" data-w="datenschutz">Datenschutz</button>·<button data-act="legal" data-w="impressum">Impressum</button></p>`;
Object.assign(acts,{'legal':el=>showLegal(el.dataset.w),'close-modal':el=>el.closest('.modal').remove()});

/* ---------- Installieren (Web-App) ---------- */
let deferredInstall=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;});
const isStandalone=()=>window.matchMedia&&matchMedia('(display-mode: standalone)').matches||navigator.standalone;
const isIOS=()=>/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
acts['install']=async()=>{
  if(deferredInstall){deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null;return;}
  toast(isIOS()?'Tippe unten auf „Teilen“ und dann „Zum Home-Bildschirm“.':'Öffne das Browser-Menü (⋮) und wähle „App installieren“ bzw. „Zum Startbildschirm“.');
};
if('serviceWorker' in navigator && /^https?:$/.test(location.protocol)){
  window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
}
