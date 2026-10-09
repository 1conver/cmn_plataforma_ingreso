/* =========================================================================
   CMN · núcleo: almacenamiento, utilidades, gamificación, router y UI base
   ========================================================================= */
'use strict';

/* ---------- almacenamiento (claves compatibles con v2: prefijo cmn_) ---------- */
const store = {
  get(k, def) {
    try { const v = localStorage.getItem('cmn_' + k); return v === null ? def : JSON.parse(v); }
    catch (e) { return def; }
  },
  set(k, v) { try { localStorage.setItem('cmn_' + k, JSON.stringify(v)); } catch (e) { /* modo privado */ } },
  keys() {
    const out = [];
    try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith('cmn_')) out.push(k); } } catch (e) {}
    return out;
  }
};

/* ---------- utilidades ---------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const norm = s => String(s ?? '').trim().toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ');
const shuffle = a => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
const pick = (a, n) => shuffle(a).slice(0, n);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const todayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const fmtTime = s => { s = Math.max(0, Math.round(s || 0)); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return h ? `${h}:${String(m).padStart(2, '0')}:${String(x).padStart(2, '0')}` : `${m}:${String(x).padStart(2, '0')}`; };
const fmtDur = s => { s = Math.round(s || 0); if (s < 60) return `${s} s`; const h = Math.floor(s / 3600), m = Math.round(s % 3600 / 60); return h ? `${h} h ${m} min` : `${m} min`; };
const hashStr = s => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const seeded = seed => () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const pilarName = p => ({ A: 'Redes', B: 'Windows Server', C: 'Desarrollo', D: 'Bases de Datos', I: 'Ingreso' }[p] || p);

/* ---------- íconos (trazos 24x24) ---------- */
const ICONS = {
  home: 'M3 11.5 12 4l9 7.5|M5.5 10v10h5v-6h3v6h5V10',
  book: 'M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z|M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5',
  target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z|M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z|M12 12h.01',
  layers: 'M12 3 2 8l10 5 10-5z|M2 13l10 5 10-5|M2 18l10 5 10-5',
  flag: 'M5 21V4|M5 4h11l-2 4 2 4H5',
  checklist: 'M10 6h10M10 12h10M10 18h10|M3.5 6l1.5 1.5L8 4.5M3.5 12l1.5 1.5L8 10.5M3.5 18l1.5 1.5L8 16.5',
  bulb: 'M9 18h6M10 21h4|M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.3 1 2.2h5.2c0-.9.4-1.7 1-2.2A6 6 0 0 0 12 3z',
  mic: 'M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z|M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8',
  headphones: 'M3 18v-6a9 9 0 0 1 18 0v6|M21 19a2 2 0 0 1-2 2h-1v-6h3zM3 19a2 2 0 0 0 2 2h1v-6H3z',
  video: 'M15 10l5-3v10l-5-3|M3 7h12v10H3z',
  library: 'M4 4h4v16H4zM10 4h4v16h-4z|M16.5 4.5l3.8 1 -4 15-3.8-1z',
  exam: 'M9 4h6v3H9z|M7 5H5v16h14V5h-2|M9 13l2 2 4-4',
  gamepad: 'M6 12h4M8 10v4|M15 11h.01M18 13h.01|M17.3 5H6.7a4 4 0 0 0-3.9 3.1L1.5 14a3 3 0 0 0 5.2 2.7L8.5 15h7l1.8 1.7A3 3 0 0 0 22.5 14l-1.3-5.9A4 4 0 0 0 17.3 5z',
  flow: 'M9 3h6v4H9z|M12 7v3|M12 10l5 4-5 4-5-4z|M12 18v3',
  net: 'M10 3h4v4h-4zM3 17h4v4H3zM17 17h4v4h-4z|M12 7v5M5 17v-5h14v5',
  db: 'M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3z|M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6|M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
  table: 'M3 5h18v14H3z|M3 10h18M9 5v14',
  cards: 'M7 4h12a1 1 0 0 1 1 1v12|M4 7h12a1 1 0 0 1 1 1v12H4z',
  brain: 'M9.5 3A2.5 2.5 0 0 0 7 5.5v.3A3 3 0 0 0 4.5 9a3 3 0 0 0 .7 1.9A3.5 3.5 0 0 0 6 17a3 3 0 0 0 3.5 4 2.5 2.5 0 0 0 2.5-2.5V5.5A2.5 2.5 0 0 0 9.5 3z|M14.5 3A2.5 2.5 0 0 1 17 5.5v.3A3 3 0 0 1 19.5 9a3 3 0 0 1-.7 1.9A3.5 3.5 0 0 1 18 17a3 3 0 0 1-3.5 4 2.5 2.5 0 0 1-2.5-2.5',
  chat: 'M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.6A8 8 0 1 1 21 12z',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z|M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
  sun: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z|M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
  moon: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z',
  play: 'M7 4.5v15l12-7.5z',
  pause: 'M7 4h3.5v16H7zM13.5 4H17v16h-3.5z',
  back15: 'M3 12a9 9 0 1 0 3-6.7L3 8|M3 3v5h5|M10 9.5v5M13 9.5h2.5l-2 2.5c1.3-.2 2.5.5 2.5 1.6 0 1-1 1.6-2 1.6',
  fwd15: 'M21 12a9 9 0 1 1-3-6.7L21 8|M21 3v5h-5|M8.5 9.5v5M11.5 9.5H14l-2 2.5c1.3-.2 2.5.5 2.5 1.6 0 1-1 1.6-2 1.6',
  skip: 'M5 4.5v15l10-7.5zM17 4h2.5v16H17z',
  close: 'M6 6l12 12M18 6 6 18',
  check: 'M4 12.5 9 17.5 20 6.5',
  x: 'M6 6l12 12M18 6 6 18',
  alert: 'M12 3 2 20h20z|M12 10v4.5M12 17.5h.01',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z|M12 11v5M12 7.5h.01',
  star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',
  flame: 'M12 22c4 0 7-2.7 7-6.8 0-4.4-3.6-6.4-4.4-10.2C12 7 10.6 9.4 11 12c-1.4-.7-2.2-2-2.4-3.4C6.6 10.5 5 12.8 5 15.2 5 19.3 8 22 12 22z',
  bolt: 'M13 2 3 14h8l-1 8 10-12h-8z',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z|M12 7v5l3.5 2',
  trophy: 'M8 21h8M12 17v4|M7 4h10v5a5 5 0 0 1-10 0z|M17 6h3a3 3 0 0 1-3 4M7 6H4a3 3 0 0 0 3 4',
  medal: 'M8 3h8l-2.5 6h-3z|M12 22a6 6 0 1 0 0-12 6 6 0 0 0 0 12z|M12 13.5l1 2 2.2.3-1.6 1.6.4 2.2-2-1.1-2 1.1.4-2.2-1.6-1.6 2.2-.3z',
  shuffle: 'M16 3h5v5|M4 20 21 3|M21 16v5h-5|M15 15l6 6|M4 4l5 5',
  refresh: 'M21 12a9 9 0 0 1-15.4 6.4L3 16|M3 12A9 9 0 0 1 18.4 5.6L21 8|M21 3v5h-5M3 21v-5h5',
  external: 'M14 4h6v6|M20 4l-9 9|M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
  download: 'M12 4v11|M7 10l5 5 5-5|M5 20h14',
  upload: 'M12 20V9|M7 14l5-5 5 5|M5 4h14',
  eye: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z|M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  arrowR: 'M5 12h14|M13 6l6 6-6 6',
  arrowL: 'M19 12H5|M11 6l-6 6 6 6',
  list: 'M8 6h13M8 12h13M8 18h13|M3.5 6h.01M3.5 12h.01M3.5 18h.01',
  run: 'M13 4a2 2 0 1 0 0-.01|M7 21l3-6 3 2v5|M6 12l3-4 4 1 3 4 3 1|M10 15l-2-3',
  heart: 'M12 21s-8-4.9-8-11a4.5 4.5 0 0 1 8-2.9A4.5 4.5 0 0 1 20 10c0 6.1-8 11-8 11z',
  pdf: 'M6 2h9l5 5v15H6z|M15 2v5h5',
  terminal: 'M4 5h16v14H4z|M7 9l3 3-3 3M12 15h5',
  steps: 'M4 20h4v-4h4v-4h4V8h4',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1|M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  shield: 'M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z',
  cpu: 'M6 6h12v12H6z|M9 9h6v6H9z|M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4',
  windows: 'M3 5.5 10.5 4.5v7H3zM12.5 4.2 21 3v8.5h-8.5zM3 12.5h7.5v7L3 18.5zM12.5 12.5H21V21l-8.5-1.2z',
  code: 'M8 7l-5 5 5 5M16 7l5 5-5 5|M14 4l-4 16',
  calendar: 'M4 5h16v16H4z|M4 10h16M9 3v4M15 3v4',
  sparkle: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z|M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z|M4 21a8 8 0 0 1 16 0',
  dumbbell: 'M6 6v12M18 6v12|M3 9v6M21 9v6|M6 12h12',
  sql: 'M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3z|M4 6v6M20 6v6|M7 15h3a1.5 1.5 0 0 1 0 3H8.5a1.5 1.5 0 0 0 0 3H11|M14 15v6h3',
  key: 'M15 7a4 4 0 1 1-3.5 6L5 19.5V22H2v-3l6.5-6.5A4 4 0 0 1 15 7z|M16.5 9.5h.01',
  route: 'M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4z|M8 17h7a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h7',
};
const icon = (k, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${(ICONS[k] || ICONS.info).split('|').map(d => `<path d="${d}"/>`).join('')}</svg>`;

/* Insignias de rango (SVG propio, estilo galón) */
function rankInsignia(level) {
  const stars = level >= 9 ? Math.min(3, level - 8) : 0;
  const suns = level >= 2 && level <= 8 ? Math.min(3, ((level - 2) % 3) + 1) : 0;
  const bars = level >= 5 && level <= 8 ? 1 : 0;
  let g = '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round">';
  g += '<path d="M20 3 6 8.5v10C6 27.4 12 33.6 20 37c8-3.4 14-9.6 14-18.5v-10z" fill="currentColor" fill-opacity=".12"/>';
  if (level === 0) g += '<path d="M14 21l6-5 6 5" stroke-width="2.2"/>';
  if (level === 1) g += '<path d="M13 18l7-5 7 5M13 24l7-5 7 5" stroke-width="2.2"/>';
  for (let i = 0; i < suns; i++) { const x = suns === 1 ? 20 : suns === 2 ? 15 + i * 10 : 12 + i * 8; g += `<circle cx="${x}" cy="${bars ? 17 : 20}" r="2.6" fill="currentColor"/>`; }
  if (bars) g += '<path d="M12 26h16" stroke-width="2.4"/>';
  for (let i = 0; i < stars; i++) { const x = stars === 1 ? 20 : stars === 2 ? 15 + i * 10 : 12 + i * 8; g += `<path d="M${x} ${15.5}l1.5 3 3.3.5-2.4 2.3.6 3.2-3-1.6-3 1.6.6-3.2-2.4-2.3 3.3-.5z" fill="currentColor"/>`; }
  return g + '</svg>';
}

/* ---------- gamificación ---------- */
const RANKS = [
  { n: 'Postulante', xp: 0 }, { n: 'Cadete', xp: 200 }, { n: 'Subteniente', xp: 600 }, { n: 'Teniente', xp: 1200 },
  { n: 'Teniente Primero', xp: 2000 }, { n: 'Capitán', xp: 3000 }, { n: 'Mayor', xp: 4500 }, { n: 'Teniente Coronel', xp: 6500 },
  { n: 'Coronel', xp: 9000 }, { n: 'General de Brigada', xp: 12000 }, { n: 'General de División', xp: 16000 }, { n: 'Teniente General', xp: 21000 },
];
const MISSION_POOL = [
  { id: 'pod', t: 'Escuchá 1 episodio de Frecuencia CMN', n: 1, ic: 'headphones' },
  { id: 'sub', t: 'Resolvé 3 subredes sin errores', n: 3, ic: 'net' },
  { id: 'fc', t: 'Repasá 12 fichas', n: 12, ic: 'cards' },
  { id: 'game', t: 'Jugá 2 partidas del Arcade', n: 2, ic: 'gamepad' },
  { id: 'mem', t: 'Hacé 6 repasos de Memoria Rápida', n: 6, ic: 'brain' },
  { id: 'sim', t: 'Rendí un simulacro completo', n: 1, ic: 'exam' },
  { id: 'algo', t: 'Resolvé 2 desafíos de algoritmos', n: 2, ic: 'flow' },
  { id: 'sql', t: 'Resolvé 2 ejercicios del laboratorio SQL', n: 2, ic: 'sql' },
  { id: 'oral', t: 'Practicá 3 preguntas de la mesa oral', n: 3, ic: 'mic' },
  { id: 'quiz', t: 'Respondé 5 preguntas de quiz de podcast', n: 5, ic: 'chat' },
];
const MEDALS = [
  { id: 'primer_paso', t: 'Primer paso', d: 'Ganaste tus primeros XP', ic: 'star' },
  { id: 'sim1', t: 'Bautismo de fuego', d: 'Primer simulacro rendido', ic: 'exam' },
  { id: 'aprobado', t: 'Aprobado', d: 'Simulacro ≥ 6,00', ic: 'check' },
  { id: 'sobresaliente', t: 'Sobresaliente', d: 'Simulacro ≥ 9,00', ic: 'trophy' },
  { id: 'diez', t: 'Diez redondo', d: 'Simulacro 10,00', ic: 'sparkle' },
  { id: 'subred5', t: 'Calculadora humana', d: 'Racha de 5 subredes', ic: 'net' },
  { id: 'subred50', t: 'Maestro del octeto', d: '50 subredes resueltas', ic: 'cpu' },
  { id: 'pod1', t: 'En frecuencia', d: 'Primer episodio completo', ic: 'headphones' },
  { id: 'pod_all', t: 'Oyente de élite', d: 'Todos los episodios', ic: 'mic' },
  { id: 'temario50', t: 'Medio camino', d: '50% del temario', ic: 'checklist' },
  { id: 'temario100', t: 'Temario completo', d: '100% del programa', ic: 'flag' },
  { id: 'racha3', t: 'Constancia', d: '3 días seguidos', ic: 'flame' },
  { id: 'racha7', t: 'Disciplina', d: '7 días seguidos', ic: 'flame' },
  { id: 'osi', t: 'Siete pisos', d: 'Capas OSI perfectas', ic: 'layers' },
  { id: 'algo5', t: 'Prueba de escritorio', d: '5 desafíos de algoritmos', ic: 'flow' },
  { id: 'sql5', t: 'SELECT * FROM éxito', d: '5 ejercicios SQL', ic: 'db' },
  { id: 'mision', t: 'Misión cumplida', d: 'Las 3 misiones de un día', ic: 'target' },
  { id: 'subteniente', t: 'Subteniente', d: 'Alcanzaste el rango objetivo', ic: 'shield' },
];

const Game = {
  st: null,
  load() {
    this.st = Object.assign({ xp: 0, days: {}, medals: {}, counts: {}, best: {}, day: null, missionsDone: {} }, store.get('game', {}));
    this._rollDay();
  },
  save() { store.set('game', this.st); },
  _rollDay() {
    const k = todayKey();
    if (!this.st.day || this.st.day.date !== k) this.st.day = { date: k, c: {}, done: [] };
  },
  missions() {
    const r = seeded(hashStr(todayKey()));
    const pool = [...MISSION_POOL];
    const out = [];
    while (out.length < 3 && pool.length) out.push(pool.splice(Math.floor(r() * pool.length), 1)[0]);
    return out.map(m => ({ ...m, have: Math.min(m.n, this.st.day.c[m.id] || 0), done: this.st.day.done.includes(m.id) }));
  },
  level(xp = this.st.xp) { let l = 0; RANKS.forEach((r, i) => { if (xp >= r.xp) l = i; }); return l; },
  rank() {
    const l = this.level(), cur = RANKS[l], nxt = RANKS[l + 1];
    return { l, name: cur.n, next: nxt ? nxt.n : null, pct: nxt ? (this.st.xp - cur.xp) / (nxt.xp - cur.xp) : 1, toNext: nxt ? nxt.xp - this.st.xp : 0 };
  },
  streak() {
    let n = 0; const d = new Date();
    if (!this.st.days[todayKey(d)]) d.setDate(d.getDate() - 1);
    while (this.st.days[todayKey(d)]) { n++; d.setDate(d.getDate() - 1); }
    return n;
  },
  /** suma XP; kind alimenta misiones y contadores (pod, sub, fc, game, mem, sim, algo, sql, oral, quiz) */
  gain(xp, reason, kind, qty = 1) {
    this._rollDay();
    const before = this.level();
    xp = Math.round(xp);
    if (xp > 0) {
      this.st.xp += xp;
      const k = todayKey();
      this.st.days[k] = (this.st.days[k] || 0) + xp;
      UI.toast(`<b>+${xp} XP</b> ${esc(reason || '')}`, 'xp', 'bolt');
      this.award('primer_paso');
    }
    if (kind) {
      this.st.counts[kind] = (this.st.counts[kind] || 0) + qty;
      this.st.day.c[kind] = (this.st.day.c[kind] || 0) + qty;
      const ms = this.missions();
      ms.forEach(m => {
        if (!m.done && (this.st.day.c[m.id] || 0) >= m.n) {
          this.st.day.done.push(m.id);
          this.st.xp += 40; this.st.days[todayKey()] = (this.st.days[todayKey()] || 0) + 40;
          UI.toast(`Misión cumplida: ${esc(m.t)} <b>+40 XP</b>`, 'xp', 'target');
          if (this.st.day.done.length === 3) { this.st.xp += 60; UI.toast('Las 3 misiones del día: <b>+60 XP</b>', 'xp', 'trophy'); this.award('mision'); UI.confetti(); }
        }
      });
    }
    const s = this.streak();
    if (s >= 3) this.award('racha3');
    if (s >= 7) this.award('racha7');
    const after = this.level();
    if (after > before) {
      UI.toast(`Ascenso: <b>${RANKS[after].n}</b>`, 'medal', 'shield');
      UI.confetti();
      if (after >= 2) this.award('subteniente');
    }
    this.save();
    UI.refreshRank();
  },
  award(id) {
    if (this.st.medals[id]) return false;
    const m = MEDALS.find(x => x.id === id); if (!m) return false;
    this.st.medals[id] = todayKey();
    this.save();
    if (id !== 'primer_paso') { UI.toast(`Medalla: <b>${esc(m.t)}</b><br><span class="dim">${esc(m.d)}</span>`, 'medal', 'medal'); UI.confetti(); }
    return true;
  },
  setBest(game, score) {
    const prev = this.st.best[game] || 0;
    if (score > prev) { this.st.best[game] = score; this.save(); return true; }
    return false;
  },
};

/* ---------- UI base ---------- */
const UI = {
  toast(html, kind = '', ic = 'check') {
    const box = $('#toasts'); if (!box) return;
    const el = document.createElement('div');
    el.className = 'toast ' + kind;
    el.innerHTML = icon(ic) + `<div>${html}</div>`;
    box.appendChild(el);
    while (box.children.length > 4) box.firstChild.remove();
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 320); }, kind === 'medal' ? 4200 : 2600);
  },
  confetti() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const c = document.createElement('div'); c.className = 'confetti';
    const cols = ['#a8c56f', '#f0b54a', '#4fc3e8', '#9aa5ff', '#5fd3a8', '#f2a35a'];
    for (let i = 0; i < 70; i++) {
      const p = document.createElement('i');
      p.style.left = Math.random() * 100 + 'vw';
      p.style.background = cols[i % cols.length];
      p.style.animationDuration = (1.6 + Math.random() * 1.6) + 's';
      p.style.animationDelay = (Math.random() * .4) + 's';
      p.style.transform = `rotate(${Math.random() * 360}deg)`;
      c.appendChild(p);
    }
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 3800);
  },
  modal(title, bodyHtml, { size = '', onClose } = {}) {
    const m = $('#modal');
    m.innerHTML = `<div class="modal-box ${size}" role="dialog" aria-modal="true" aria-label="${esc(title)}">
      <div class="modal-head"><b>${esc(title)}</b><div class="row" id="modalActions"></div>
      <button class="btn btn-ghost btn-icon btn-sm" data-close aria-label="Cerrar">${icon('close')}</button></div>
      <div class="modal-body">${bodyHtml}</div></div>`;
    m.classList.add('open');
    document.body.style.overflow = 'hidden';
    UI._onClose = onClose;
    $('[data-close]', m).onclick = () => UI.closeModal();
    m.onclick = e => { if (e.target === m) UI.closeModal(); };
    return m;
  },
  closeModal() {
    const m = $('#modal'); if (!m.classList.contains('open')) return;
    m.classList.remove('open'); m.innerHTML = '';
    document.body.style.overflow = '';
    if (UI._onClose) { const f = UI._onClose; UI._onClose = null; f(); }
  },
  pdf(src, title) {
    UI.modal(title, `<div class="framepdf"><iframe src="${esc(src)}" title="${esc(title)}"></iframe></div>
      <div class="row mt"><a class="btn btn-sm" href="${esc(src)}" target="_blank" rel="noopener">${icon('external')} Abrir en pestaña</a>
      <a class="btn btn-sm btn-ghost" href="${esc(src)}" download>${icon('download')} Descargar</a>
      <span class="dim" style="font-size:.76rem">Si el visor no carga en tu navegador, usá "Abrir en pestaña".</span></div>`);
  },
  ring(pct, label, color) {
    const r = 18, c = 2 * Math.PI * r, off = c * (1 - clamp(pct, 0, 1));
    return `<svg class="ring" viewBox="0 0 46 46" style="--rc:${color || 'var(--accent)'}"><circle class="bg" cx="23" cy="23" r="${r}"/><circle class="fg" cx="23" cy="23" r="${r}" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}"/><text x="23" y="27" text-anchor="middle">${label ?? Math.round(pct * 100) + '%'}</text></svg>`;
  },
  refreshRank() {
    const r = Game.rank(), s = Game.streak();
    $$('[data-rank-name]').forEach(e => e.textContent = r.name);
    $$('[data-rank-ins]').forEach(e => e.innerHTML = rankInsignia(r.l));
    $$('[data-rank-xp]').forEach(e => e.textContent = `${Game.st.xp.toLocaleString('es-AR')} XP`);
    $$('[data-rank-next]').forEach(e => e.textContent = r.next ? `${r.toNext} XP para ${r.next}` : 'Rango máximo');
    $$('[data-rank-bar]').forEach(e => e.style.width = (r.pct * 100).toFixed(1) + '%');
    $$('[data-streak]').forEach(e => e.textContent = s);
  },
  setTheme(t) {
    const real = t === 'auto' ? (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark') : t;
    document.documentElement.dataset.theme = real;
    $('meta[name=theme-color]')?.setAttribute('content', real === 'light' ? '#f3f1e9' : '#0b0f0d');
    store.set('theme', t);
  },
  cycleTheme() {
    const cur = store.get('theme', 'auto');
    const next = cur === 'auto' ? (document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark') : cur === 'dark' ? 'light' : 'dark';
    UI.setTheme(next);
    UI.toast(next === 'light' ? 'Tema claro: papel de campaña' : 'Tema oscuro: táctico nocturno', '', next === 'light' ? 'sun' : 'moon');
  },
  textSize(d) {
    const v = clamp(store.get('fs', 1) + d * 0.06, 0.85, 1.3);
    document.documentElement.style.setProperty('--fs', v.toFixed(2));
    store.set('fs', v);
  },
};

/* ---------- router por hash: #/vista/param ---------- */
const NAV = [
  { id: 'inicio', label: 'Inicio', icon: 'home', views: ['inicio'] },
  { id: 'estudiar', label: 'Estudiar', icon: 'book', views: ['programa', 'teoria', 'podcasts', 'videos', 'biblioteca'] },
  { id: 'practicar', label: 'Practicar', icon: 'target', views: ['simulacro', 'arcade', 'algoritmos', 'subneteo', 'sql', 'normalizacion'] },
  { id: 'repasar', label: 'Repasar', icon: 'layers', views: ['fichas', 'memoria', 'oral'] },
  { id: 'ingreso', label: 'Ingreso', icon: 'flag', views: ['ingreso'] },
];
const VIEWS = {};
const App = {
  cur: null,
  view(id, def) { VIEWS[id] = def; },
  go(path) { location.hash = '#/' + path; },
  sectionOf(v) { return NAV.find(s => s.views.includes(v)) || NAV[0]; },
  route() {
    const parts = (location.hash.replace(/^#\/?/, '') || store.get('lastView', 'inicio')).split('/');
    let id = parts[0];
    if (!VIEWS[id]) id = 'inicio';
    const param = parts.slice(1).join('/') || null;
    if (App.cur && VIEWS[App.cur]?.leave) VIEWS[App.cur].leave();
    App.cur = id;
    store.set('lastView', id);
    const def = VIEWS[id];
    const sec = App.sectionOf(id);
    $$('.nav-item').forEach(a => a.classList.toggle('active', a.dataset.v === id));
    $$('.bn').forEach(b => b.classList.toggle('active', b.dataset.s === sec.id));
    const sub = $('#subnav');
    sub.innerHTML = sec.views.length > 1 ? sec.views.map(v => `<a class="chip ${v === id ? 'on' : ''}" href="#/${v}">${esc(VIEWS[v]?.title || v)}</a>`).join('') : '';
    sub.style.display = sec.views.length > 1 ? '' : 'none';
    const el = $('#view');
    el.className = 'view-enter';
    void el.offsetWidth;
    el.innerHTML = '';
    document.title = `${def.title} · CMN Computación de Datos`;
    try { def.render(el, param); } catch (e) { console.error(e); el.innerHTML = `<div class="callout warn">${icon('alert')}<div><b>Error al cargar la vista.</b> ${esc(e.message)}</div></div>`; }
    if (!param || !def.keepScroll) window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  },
  buildShell() {
    const navHtml = NAV.map(s => `<div><div class="nav-group-lbl">${esc(s.label)}</div>${s.views.map(v =>
      `<a class="nav-item" data-v="${v}" href="#/${v}">${icon(VIEWS[v]?.icon || 'info')}<span>${esc(VIEWS[v]?.title || v)}</span>${VIEWS[v]?.badge ? `<span class="badge" data-badge="${v}"></span>` : ''}</a>`).join('')}</div>`).join('');
    $('#nav').innerHTML = navHtml;
    $('#bottomnav').innerHTML = NAV.map(s => `<button class="bn" data-s="${s.id}">${icon(s.icon)}<span>${esc(s.label)}</span></button>`).join('');
    $$('.bn').forEach(b => b.onclick = () => {
      const sec = NAV.find(s => s.id === b.dataset.s);
      const last = store.get('lastIn_' + sec.id, sec.views[0]);
      App.go(sec.views.includes(last) ? last : sec.views[0]);
    });
    window.addEventListener('hashchange', () => {
      const v = (location.hash.replace(/^#\/?/, '').split('/')[0]);
      const sec = App.sectionOf(v); store.set('lastIn_' + sec.id, v);
      App.route();
    });
  },
};

/* ---------- ajustes, exportar / importar progreso ---------- */
function openSettings() {
  const theme = store.get('theme', 'auto');
  UI.modal('Ajustes y progreso', `
    <div class="stack">
      <div class="field"><span>Tema</span>
        <div class="seg" id="segTheme">${['auto', 'dark', 'light'].map(t => `<button data-t="${t}" class="${t === theme ? 'on' : ''}">${{ auto: 'Automático', dark: 'Táctico nocturno', light: 'Papel de campaña' }[t]}</button>`).join('')}</div></div>
      <div class="field"><span>Tamaño de texto</span>
        <div class="row"><button class="btn btn-sm" id="fsMinus">A−</button><button class="btn btn-sm" id="fsPlus">A+</button><button class="btn btn-sm btn-ghost" id="fsReset">Restablecer</button></div></div>
      <div class="callout info">${icon('info')}<div>Tu progreso se guarda <b>solo en este navegador</b>. Para pasarlo al celular u otra PC, exportalo y luego importalo allá.</div></div>
      <div class="row"><button class="btn" id="btnExport">${icon('download')} Exportar progreso</button>
        <label class="btn">${icon('upload')} Importar<input type="file" accept="application/json" id="fileImport" hidden></label>
        <button class="btn btn-danger" id="btnReset">Borrar todo</button></div>
      <div class="dim" style="font-size:.76rem">Atajos: <kbd>G</kbd> luego <kbd>I</kbd> inicio · <kbd>/</kbd> buscar video · en fichas <kbd>←</kbd> <kbd>→</kbd> <kbd>Espacio</kbd></div>
    </div>`, { size: 'sm' });
  $$('#segTheme button').forEach(b => b.onclick = () => { UI.setTheme(b.dataset.t); $$('#segTheme button').forEach(x => x.classList.toggle('on', x === b)); });
  $('#fsMinus').onclick = () => UI.textSize(-1);
  $('#fsPlus').onclick = () => UI.textSize(1);
  $('#fsReset').onclick = () => { store.set('fs', 1); document.documentElement.style.setProperty('--fs', 1); };
  $('#btnExport').onclick = () => {
    const data = {}; store.keys().forEach(k => { data[k] = localStorage.getItem(k); });
    const blob = new Blob([JSON.stringify({ app: 'cmn-scd', v: 3, fecha: new Date().toISOString(), data }, null, 1)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `cmn-progreso-${todayKey()}.json`; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };
  $('#fileImport').onchange = e => {
    const f = e.target.files[0]; if (!f) return;
    f.text().then(t => {
      const j = JSON.parse(t);
      if (j.app !== 'cmn-scd' || !j.data) throw new Error('archivo no reconocido');
      Object.entries(j.data).forEach(([k, v]) => { if (k.startsWith('cmn_')) localStorage.setItem(k, v); });
      UI.toast('Progreso importado. Recargando…'); setTimeout(() => location.reload(), 900);
    }).catch(err => UI.toast('No se pudo importar: ' + esc(err.message), '', 'alert'));
  };
  $('#btnReset').onclick = () => {
    if (!confirm('¿Borrar TODO el progreso guardado en este navegador? No se puede deshacer.')) return;
    store.keys().forEach(k => localStorage.removeItem(k));
    location.reload();
  };
}
