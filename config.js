/* =====================================================================
   EINSTELLUNGEN
   Die URL und der "Publishable key" sind öffentlich gedacht (sie stehen in jeder
   Web-App im Quelltext). Der Schutz kommt aus den Sicherheitsregeln in Supabase.
   NIEMALS hier eintragen: "secret key", "service_role", Datenbank-Passwort.
   ===================================================================== */
const CONFIG = {
  SUPABASE_URL: 'https://zpoohufcgzwdborhyxgm.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_FTKzM1wg5MNJiUHCxxSkrw_hDSI7xiT',
  EMAIL_DOMAIN: 'obertfit.de',      // nur intern für den Namens-Login, es werden keine E-Mails verschickt
  PROJECT_REF: 'zpoohufcgzwdborhyxgm'
};
const TRAINER_NAMES = ['obert99'];  // Diese Anmeldenamen fragen nach dem Trainer-Geheimwort (statt nach einer Zahlen-PIN)
const TRAINER_LABEL = 'Obert';      // So nennt die App dich
const WEEK_GOAL = 2;                // Standard-Wochenziel (Trainingstage), jede Person kann es selbst ändern
const CONSENT_VERSION = '2026-11';

/* Spalten des Logbuchs. Neue Spalte = 1 Zeile hier + 1 SQL-Befehl (siehe ANLEITUNG.md) */
const LOG_FIELDS = [
  {key:'week',     label:'Woche',          type:'week'},
  {key:'log_date', label:'Datum',          type:'date'},
  {key:'exercise', label:'Übung',          type:'exercise'},
  {key:'sets',     label:'Sätze',          type:'number', step:'1'},
  {key:'reps',     label:'Wiederholungen', type:'number', step:'1'},
  {key:'weight',   label:'Gewicht (kg)',   type:'number', step:'0.5'},
  {key:'note',     label:'Notiz',          type:'text'}
];

/* Rechtstexte: BITTE AUSFÜLLEN (alles in [eckigen Klammern]). Das sind Vorlagen, keine Rechtsberatung. */
const LEGAL = {
  impressum: `<h4>Angaben gemäß § 5 DDG</h4><p>[Vor- und Nachname]<br>[Straße und Hausnummer]<br>[PLZ Ort]</p><h4>Kontakt</h4><p>E-Mail: [deine E-Mail-Adresse]</p>`,
  datenschutz: `
<h4>Verantwortlich</h4><p>[Vor- und Nachname, Anschrift, E-Mail – wie im Impressum]</p>
<h4>Was wird gespeichert?</h4>
<p>Anmeldename, Anzeigename, PIN (nur als verschlüsselter Wert), deine Trainingseinträge (Datum, Übung, Sätze, Wiederholungen, Gewicht, Notizen), deine Plan-Einstellungen sowie – freiwillig – deine Angaben zu Zielen, Erfahrung und gesundheitlichen Hinweisen. Gesundheitsbezogene Angaben sind besonders sensibel; du machst sie ausschließlich freiwillig und kannst sie jederzeit löschen. Außerdem werden einfache Nutzungsdaten gespeichert (Login-Zeitpunkt, Gerätetyp Handy/Computer, besuchte Bereiche), damit dein Trainer sehen kann, ob du Unterstützung brauchst.</p>
<h4>Wer sieht das?</h4><p>Nur du und dein Trainer. Andere Teilnehmer:innen sehen deine Daten nicht.</p>
<h4>Wo liegen die Daten?</h4><p>Bei Supabase (Datenbank in Frankfurt, EU) und GitHub Pages (Auslieferung der Webseite). Übungsbilder werden teils von GitHub (raw.githubusercontent.com) geladen; dabei wird technisch deine IP-Adresse an GitHub übertragen. Die Bibliotheken der Seite werden über jsDelivr (CDN) geladen.</p>
<h4>Rechtsgrundlage</h4><p>Einwilligung (Art. 6 Abs. 1 lit. a DSGVO; für Gesundheitsangaben Art. 9 Abs. 2 lit. a DSGVO) sowie Durchführung des Trainings (Art. 6 Abs. 1 lit. b).</p>
<h4>Deine Rechte</h4><p>Auskunft und Datenübertragbarkeit: Profil → „Meine Daten herunterladen“. Löschung: Profil → „Konto löschen“ (sofort und endgültig). Widerruf der Einwilligung jederzeit durch Löschen des Kontos. Beschwerderecht bei der Datenschutzaufsichtsbehörde.</p>
<p class="muted">Hinweis: Dieser Text ist eine Vorlage und keine Rechtsberatung. Bitte ergänze die Platzhalter und lasse ihn bei Bedarf prüfen.</p>`
};
