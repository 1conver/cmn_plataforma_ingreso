/* Vistas: Fichas, Memoria rápida y Mesa oral */
'use strict';

/* ============================== FICHAS ============================== */
const FC_CATS = [['all', 'Todas'], ['redes', 'Redes'], ['ad', 'Windows / AD'], ['algo', 'Algoritmia'], ['prog', 'Desarrollo y web'], ['bd', 'Bases de datos']];
App.view('fichas', {
  title: 'Fichas', icon: 'cards',
  render(el, param) {
    const cat = FC_CATS.some(c => c[0] === param) ? param : store.get('fcCat', 'all');
    store.set('fcCat', cat);
    const flt = store.get('fcFlt', 'all');
    const known = store.get('cardsKnown', {});
    let list = FICHAS.filter(f => cat === 'all' || f.c === cat);
    if (flt === 'todo') list = list.filter(f => !known[f.id]);
    if (flt === 'ok') list = list.filter(f => known[f.id]);
    if (!list.length) list = FICHAS.filter(f => cat === 'all' || f.c === cat);
    if (store.get('fcShuffle', false)) list = shuffle(list);
    let idx = 0;
    const tot = FICHAS.filter(f => cat === 'all' || f.c === cat), kn = tot.filter(f => known[f.id]).length;
    el.innerHTML = `
      <div class="page-head"><div><div class="eyebrow">Repasar</div><h1 class="title">Fichas</h1>
        <p class="lead">Intentá responder en voz alta antes de girar. Marcá "La sé" solo si la respuesta te salió completa.</p></div>
        <div style="min-width:200px"><div class="row-between mono dim" style="font-size:.74rem"><span>Dominadas</span><span>${kn}/${tot.length}</span></div><div class="bar mt" style="margin-top:6px"><i style="width:${kn / tot.length * 100}%"></i></div></div></div>
      <div class="row-between mb"><div class="chips">${FC_CATS.map(([k, l]) => `<a class="chip ${k === cat ? 'on' : ''}" href="#/fichas/${k}">${l}</a>`).join('')}</div>
        <div class="row"><select class="inp" id="fcF">${[['all', 'Todas'], ['todo', 'A repasar'], ['ok', 'Dominadas']].map(([k, l]) => `<option value="${k}" ${k === flt ? 'selected' : ''}>${l}</option>`).join('')}</select>
          <button class="btn btn-sm ${store.get('fcShuffle', false) ? 'btn-soft' : ''}" id="fcSh">${icon('shuffle')} Mezclar</button></div></div>
      <div class="fc" id="fc"><div class="fc-in">
        <div class="fc-face fc-front"><div class="fc-top"><span class="tag" id="fcCat"></span><span class="tag" id="fcRef"></span></div><div class="fc-q" id="fcQ"></div><div class="fc-hint">Tocá o <kbd>Espacio</kbd> para girar</div></div>
        <div class="fc-face fc-back"><div class="fc-a" id="fcA"></div></div></div></div>
      <div class="row mt" style="justify-content:center"><button class="btn" id="fcPrev">${icon('arrowL')}</button>
        <button class="btn btn-danger" id="fcNo">Repasar</button><span class="mono dim" id="fcN" style="min-width:70px;text-align:center"></span><button class="btn btn-primary" id="fcYes">${icon('check')} La sé</button>
        <button class="btn" id="fcNext">${icon('arrowR')}</button></div>
      <p class="dim mt" style="text-align:center;font-size:.76rem">Teclado: <kbd>←</kbd> <kbd>→</kbd> navegar · <kbd>Espacio</kbd> girar · <kbd>S</kbd> la sé · <kbd>R</kbd> repasar</p>`;
    const fc = $('#fc');
    const catName = c => (FC_CATS.find(x => x[0] === c) || [, c])[1];
    const draw = () => {
      const f = list[idx]; fc.classList.remove('flip');
      $('#fcCat').textContent = catName(f.c); $('#fcRef').textContent = f.ref;
      $('#fcQ').textContent = f.q; $('#fcA').textContent = f.a;
      $('#fcN').textContent = `${idx + 1}/${list.length}`;
      $('#fcYes').classList.toggle('btn-soft', !!store.get('cardsKnown', {})[f.id]);
    };
    const move = d => { idx = (idx + d + list.length) % list.length; draw(); };
    const mark = ok => {
      const f = list[idx], k = store.get('cardsKnown', {});
      const first = ok && !k[f.id];
      if (ok) k[f.id] = todayKey(); else delete k[f.id];
      store.set('cardsKnown', k);
      Game.gain(first ? 3 : 0, first ? 'Ficha dominada' : '', 'fc');
      move(1);
    };
    fc.onclick = () => fc.classList.toggle('flip');
    $('#fcPrev').onclick = () => move(-1); $('#fcNext').onclick = () => move(1);
    $('#fcYes').onclick = () => mark(true); $('#fcNo').onclick = () => mark(false);
    $('#fcF').onchange = e => { store.set('fcFlt', e.target.value); this.render(el, cat); };
    $('#fcSh').onclick = () => { store.set('fcShuffle', !store.get('fcShuffle', false)); this.render(el, cat); };
    this._key = e => {
      if (/input|textarea|select/i.test(e.target.tagName)) return;
      if (e.key === 'ArrowRight') move(1); else if (e.key === 'ArrowLeft') move(-1);
      else if (e.key === ' ') { e.preventDefault(); fc.classList.toggle('flip'); }
      else if (e.key.toLowerCase() === 's') mark(true); else if (e.key.toLowerCase() === 'r') mark(false);
    };
    document.addEventListener('keydown', this._key);
    draw();
  },
  leave() { if (this._key) document.removeEventListener('keydown', this._key); this._key = null; },
});

/* ============================== MEMORIA RÁPIDA ============================== */
const MEM_INT = [0, 1, 2, 4, 8, 16, 30];
const memId = m => 'q' + hashStr(m[1]).toString(36);
const OLD_MEM = ['Las 7 capas OSI, de la 1 a la 7', 'PDU por capa (de abajo hacia arriba)', '¿Qué dispositivo opera en cada capa?', 'Distancias administrativas Cisco', 'Saludo de TCP', 'Rangos privados RFC 1918', 'Máscaras por bits encendidos', 'Secuencia DHCP', 'Los 5 roles FSMO', 'Estrategia AGDLP', 'Compartido + NTFS', 'Primeros lenguajes', 'Application vs Session (ASP)', 'Orden lógico de un SELECT', 'Qué garantiza cada forma normal', 'Propiedades ACID'];
function memState() {
  const st = store.get('mem', {});
  if (Object.keys(st).some(k => /^m\d+$/.test(k))) {   // migración desde v2
    OLD_MEM.forEach((q, i) => { if (st['m' + i]) { st['q' + hashStr(q).toString(36)] = st['m' + i]; } delete st['m' + i]; });
    store.set('mem', st);
  }
  return st;
}
const OSI_MAP = [['7', 'Aplicación', 'Datos · HTTP, DNS, DHCP, SMTP', 'pD'], ['6', 'Presentación', 'Datos · formato, cifrado, compresión', 'pD'], ['5', 'Sesión', 'Datos · abre y cierra el diálogo', 'pD'], ['4', 'Transporte', 'Segmento · TCP, UDP, puertos', 'pB'], ['3', 'Red', 'Paquete · IP · router', 'pA'], ['2', 'Enlace', 'Trama · MAC, FCS · switch, bridge', 'pA'], ['1', 'Física', 'Bit · cables y señales · hub, repetidor', 'pA']];
App.view('memoria', {
  title: 'Memoria rápida', icon: 'brain', badge: true,
  render(el) {
    const st = memState();
    const due = MEMORIA.filter(m => (st[memId(m)]?.d || 0) <= Date.now());
    const mast = MEMORIA.filter(m => (st[memId(m)]?.b || 0) >= 4).length;
    const cur = due.length ? due[Math.floor(Math.random() * due.length)] : null;
    el.innerHTML = `
      <div class="page-head"><div><div class="eyebrow">Repasar</div><h1 class="title">Memoria rápida</h1>
        <p class="lead">Recuperación activa + repaso espaciado: cada dato vuelve justo cuando estás por olvidarlo (1, 2, 4, 8, 16 y 30 días). Cinco minutos por día rinden más que una hora corrida.</p></div></div>
      <div class="grid g3 mb">
        <div class="kpi" style="--kc:var(--amber)"><div class="kpi-val">${due.length}</div><div class="kpi-lbl">Pendientes hoy</div></div>
        <div class="kpi" style="--kc:var(--ok)"><div class="kpi-val">${mast}</div><div class="kpi-lbl">Consolidadas</div></div>
        <div class="kpi"><div class="kpi-val">${MEMORIA.length}</div><div class="kpi-lbl">Ítems totales</div></div></div>
      <div class="card pad-lg">${cur ? `
        <div class="row-between mb">${pill(cur[0])}<span class="dim mono" style="font-size:.72rem">caja ${st[memId(cur)]?.b || 0}/6</span></div>
        <div class="fc-q" style="text-align:left">${esc(cur[1])}</div>
        <div id="memA" class="hidden mt"><div class="callout acc">${icon('bulb')}<div><b>${esc(cur[2])}</b><div class="muted mt" style="font-size:.88rem">${esc(cur[3])}</div></div></div></div>
        <div class="row mt" id="memBtns"><button class="btn btn-primary" id="memShow">${icon('eye')} Mostrar respuesta</button><span class="dim" style="font-size:.8rem">Respondé en voz alta antes de mirar.</span></div>` :
        `<div class="callout ok">${icon('check')}<div><b>Listo por hoy.</b> Todo lo demás está programado para cuando lo necesites. ¿Querés más? Andá a <a href="#/fichas">Fichas</a> o al <a href="#/arcade">Arcade</a>.</div></div>`}</div>
      <div class="grid g2 mt">
        <div class="card"><div class="card-title mb">${icon('layers')} Mapa visual del modelo OSI</div>
          <div class="stack-sm">${OSI_MAP.map(([n, t, d, c]) => `<div class="row" style="gap:12px;padding:9px 12px;border-radius:10px;border:1px solid var(--border);border-left:4px solid var(--${c});background:var(--surface-2)"><b class="mono" style="color:var(--${c});width:16px">${n}</b><div><div style="font-weight:700;font-size:.9rem">${t}</div><div class="dim" style="font-size:.78rem">${d}</div></div></div>`).join('')}</div></div>
        <div class="card"><div class="card-title mb">${icon('bulb')} Cómo estudiar para que quede</div>
          <div class="stack-sm">${[['Recuperá, no releas', 'Intentar responder antes de mirar fija mucho más que volver a leer.'], ['Palacio de la memoria', 'Recorré tu casa: 7 habitaciones = 7 capas OSI, con un objeto exagerado en cada una.'], ['Espaciado', 'Repasá a 1, 2, 4, 8 y 16 días: esta sección lo hace por vos.'], ['Mezclá temas', 'Alternar redes, Windows y SQL en una sesión cuesta más, pero se retiene mejor.'], ['Dibujá de memoria', 'Un diagrama de flujo, un bosque de AD o un E-R en hoja en blanco; después compará.'], ['Dormí', 'El sueño consolida: 10 minutos de repaso antes de dormir y otra vez a la mañana.']].map(([h, t]) => `<div class="trap">${icon('check')}<span><b>${h}.</b> ${t}</span></div>`).join('')}</div></div></div>
      <div class="section-lbl">Banco de mnemotecnias</div>
      <div class="grid g2">${MEMORIA.map(m => `<div class="kb" style="--pc:var(--p${m[0]})"><div class="kb-h">${esc(m[1])}</div><div style="font-size:.88rem"><b>${esc(m[2])}</b></div><div class="dim mt" style="font-size:.82rem">${esc(m[3])}</div></div>`).join('')}</div>`;
    if (!cur) return;
    $('#memShow').onclick = () => {
      $('#memA').classList.remove('hidden');
      $('#memBtns').innerHTML = `<button class="btn btn-danger" data-r="0">No me salió</button><button class="btn" data-r="1">Con dudas</button><button class="btn btn-primary" data-r="2">Lo sabía</button>`;
      $$('[data-r]').forEach(b => b.onclick = () => {
        const r = +b.dataset.r, s = memState(), id = memId(cur), bx = s[id]?.b || 0;
        const nb = r === 0 ? 0 : r === 1 ? Math.max(1, bx) : Math.min(MEM_INT.length - 1, bx + 1);
        s[id] = { b: nb, d: r === 0 ? Date.now() + 10 * 60e3 : Date.now() + MEM_INT[nb] * 864e5 };
        store.set('mem', s);
        Game.gain(2, '', 'mem');
        this.render(el); updateBadges();
      });
    };
  },
});

/* ============================== MESA ORAL ============================== */
const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
App.view('oral', {
  title: 'Mesa oral', icon: 'mic',
  render(el) {
    const fp = store.get('oralP', 'ALL');
    const pool = ORAL.filter(o => fp === 'ALL' || o.p === fp);
    let cur = pick(pool, 1)[0];
    el.innerHTML = `
      <div class="page-head"><div><div class="eyebrow">Repasar</div><h1 class="title">Mesa oral</h1>
        <p class="lead">Preguntas de mesa con respuesta modelo en lenguaje técnico. Respondé en voz alta con el reloj corriendo${Rec ? '; si grabás, la plataforma marca qué conceptos clave mencionaste' : ''}.</p></div></div>
      <div class="chips mb">${['ALL', 'A', 'B', 'C', 'D'].map(p => `<button class="chip ${fp === p ? 'on' : ''}" data-p="${p}">${p === 'ALL' ? 'Todas' : p + ' · ' + pilarName(p)}</button>`).join('')}</div>
      <div class="card pad-lg" id="oralCard"></div>
      <div class="section-lbl">Todas las preguntas (${pool.length})</div>
      <div>${pool.map(o => `<details class="acc"><summary><span class="pillar-bar" style="--pc:var(--p${o.p})"></span><span style="flex:1">${esc(o.q)}</span><span class="tag">${esc(o.t)}</span></summary><div class="acc-body"><p class="muted" style="font-size:.9rem;line-height:1.7;margin-top:10px">${o.a}</p><div class="dim mt" style="font-size:.74rem">Fuente: ${esc(o.ref)}</div></div></details>`).join('')}</div>`;
    $$('.chip[data-p]', el).forEach(c => c.onclick = () => { store.set('oralP', c.dataset.p); this.render(el); });
    const card = $('#oralCard');
    const keyTerms = a => [...new Set([...a.matchAll(/<b>(.*?)<\/b>/g)].map(m => m[1].replace(/<[^>]+>/g, '').trim()).filter(Boolean))];
    const draw = () => {
      clearInterval(this._iv); this.stopRec();
      let left = 90, said = '';
      card.innerHTML = `<div class="row-between mb">${pill(cur.p)}<span class="tag">${esc(cur.t)}</span></div>
        <div class="fc-q" style="text-align:left">${esc(cur.q)}</div>
        <div class="row mt"><span class="timer-ring" id="oClk">1:30</span><button class="btn btn-sm" id="oStart">${icon('clock')} Empezar a responder</button>
          ${Rec ? `<button class="btn btn-sm" id="oRec">${icon('mic')} Grabar respuesta</button>` : ''}<button class="btn btn-sm btn-ghost" id="oNext">${icon('shuffle')} Otra pregunta</button></div>
        <div id="oSaid" class="mt"></div>
        <div class="row mt"><button class="btn btn-primary" id="oShow">${icon('eye')} Ver respuesta modelo</button></div>
        <div id="oAns" class="hidden mt"></div>`;
      $('#oNext').onclick = () => { cur = pick(pool.filter(o => o !== cur), 1)[0] || cur; draw(); };
      $('#oStart').onclick = () => {
        clearInterval(this._iv);
        this._iv = setInterval(() => { left--; const c = $('#oClk'); if (!c) return clearInterval(this._iv); c.textContent = fmtTime(Math.max(0, left)); c.classList.toggle('low', left <= 15); if (left <= 0) { clearInterval(this._iv); UI.toast('Tiempo. Cerrá con una conclusión.', '', 'clock'); } }, 1000);
      };
      $('#oRec')?.addEventListener('click', () => {
        if (this.rec) { this.stopRec(); return; }
        const r = new Rec(); r.lang = 'es-AR'; r.continuous = true; r.interimResults = true;
        r.onresult = ev => { said = [...ev.results].map(x => x[0].transcript).join(' '); $('#oSaid').innerHTML = `<div class="kb"><div class="kb-h">Lo que dijiste</div><p style="font-size:.9rem">${esc(said)}</p></div>`; };
        r.onerror = ev => { UI.toast('No se pudo usar el micrófono: ' + esc(ev.error), '', 'alert'); this.stopRec(); };
        r.onend = () => { this.rec = null; const b = $('#oRec'); if (b) b.innerHTML = icon('mic') + ' Grabar respuesta'; };
        try { r.start(); this.rec = r; $('#oRec').innerHTML = icon('pause') + ' Detener'; if (!this._iv) $('#oStart').click(); } catch (e) { UI.toast('El reconocimiento de voz no está disponible.', '', 'alert'); }
      });
      $('#oShow').onclick = () => {
        this.stopRec(); clearInterval(this._iv);
        const terms = keyTerms(cur.a), S = norm(said);
        const hit = terms.filter(t => { const k = norm(t).replace(/[^A-Z0-9 ]/g, ' ').trim().split(/\s+/)[0]; return S && k && S.includes(k); });
        $('#oAns').classList.remove('hidden');
        $('#oAns').innerHTML = `<div class="callout acc">${icon('bulb')}<div style="line-height:1.7">${cur.a}<div class="dim mt" style="font-size:.74rem">Fuente: ${esc(cur.ref)}</div></div></div>
          ${said ? `<div class="kb mt"><div class="kb-h">Conceptos clave mencionados: ${hit.length}/${terms.length}</div><div class="chips">${terms.map(t => `<span class="tag ${hit.includes(t) ? 'tag-ok' : ''}">${esc(t)}</span>`).join('')}</div></div>` : ''}
          <div class="row mt"><span class="dim" style="font-size:.84rem">¿Cómo te salió?</span><button class="btn btn-sm btn-danger" data-o="2">A repasar</button><button class="btn btn-sm" data-o="4">Regular</button><button class="btn btn-sm btn-primary" data-o="8">Bien</button></div>`;
        $$('[data-o]', card).forEach(b => b.onclick = () => { Game.gain(+b.dataset.o, 'Mesa oral', 'oral'); cur = pick(pool.filter(o => o !== cur), 1)[0] || cur; draw(); });
      };
    };
    draw();
  },
  stopRec() { if (this.rec) { try { this.rec.stop(); } catch (e) { /* */ } this.rec = null; } },
  leave() { clearInterval(this._iv); this.stopRec(); },
});

function updateBadges() {
  const st = memState();
  const due = MEMORIA.filter(m => (st[memId(m)]?.d || 0) <= Date.now()).length;
  $$('[data-badge="memoria"]').forEach(b => { b.textContent = due || ''; b.style.display = due ? '' : 'none'; });
}
