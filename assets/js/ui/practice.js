/* Vistas: Simulacro, Subneteo (clásico + VLSM), Normalización y Laboratorio SQL */
'use strict';

/* ============================== SIMULACRO ============================== */
const SIM_MODES = {
  prog: { t: 'Escrito de Programación', min: 90, pil: ['C', 'D'], casos: 'prog', ic: 'code', d: 'Algoritmos, lenguajes, web y bases de datos (pilares C y D).' },
  redes: { t: 'Escrito de Redes', min: 90, pil: ['A', 'B'], casos: 'redes', ic: 'net', d: 'Redes y Sistemas Operativos Windows (pilares A y B).' },
  integral: { t: 'Integral · Modelo 120′', min: 120, pil: ['A', 'B', 'C', 'D'], casos: 'any', ic: 'exam', d: 'Formato del Modelo de Examen: los cuatro pilares juntos.' },
  practico: { t: 'Práctico de Redes y Programación', min: 90, ic: 'terminal', d: 'Tres tareas aplicadas: VLSM, algoritmo y SQL.' },
};
const SIM = { cur: null, iv: null };

function pickBalanced(pool, pil, n) {
  const per = Math.floor(n / pil.length); let out = [];
  pil.forEach(p => { out = out.concat(pick(pool.filter(q => q.p === p), per)); });
  const rest = pool.filter(q => pil.includes(q.p) && !out.includes(q));
  return shuffle(out.concat(pick(rest, n - out.length)));
}
function newExam(mode, fromIds) {
  const M = SIM_MODES[mode] || SIM_MODES.integral;
  let items;
  if (fromIds?.length) items = shuffle(MCQ.filter(q => fromIds.includes(q.id))).slice(0, 10);
  else items = pickBalanced(MCQ, M.pil, 10);
  const pils = fromIds?.length ? [...new Set(items.map(q => q.p))] : M.pil;
  const fills = pick(FILL.filter(f => pils.includes(f.p)), 3);
  const casosPool = CASOS.filter(c => M.casos === 'any' || c.modo === M.casos || (fromIds && pils.some(p => (c.modo === 'redes') === ['A', 'B'].includes(p))));
  return {
    mode: fromIds ? 'falladas' : mode, title: fromIds ? 'Repaso de falladas' : M.t, min: M.min || 60,
    items: items.map(q => ({ q, ord: shuffle(q.o.map((_, i) => i)), sel: null })),
    fills: fills.map(f => ({ f, val: '' })), caso: pick(casosPool.length ? casosPool : CASOS, 1)[0], dev: '',
    t0: Date.now(), done: false, rub: null,
  };
}
function newPractico() {
  const al = pick(ALGOS.filter(a => a.nivel >= 2), 1)[0];
  const sq = pick(SQL_EX.filter(e => !e.dml), 1)[0];
  return { mode: 'practico', title: SIM_MODES.practico.t, min: 90, t0: Date.now(), done: false, vlsm: genVLSM(true), al, sq, ok: {} };
}

App.view('simulacro', {
  title: 'Simulacro', icon: 'exam',
  render(el, param) {
    this.el = el;
    if (param === 'nuevo') { SIM.cur = null; }
    if (!SIM.cur) return this.renderHub(el);
    if (SIM.cur.mode === 'practico') return this.renderPractico(el);
    this.renderExam(el);
  },
  leave() { clearInterval(SIM.iv); },
  renderHub(el) {
    const st = STATS();
    el.innerHTML = `
      <div class="page-head"><div><div class="eyebrow">Practicar</div><h1 class="title">Simulacros</h1>
        <p class="lead">Elegí el examen. Cada simulacro mezcla preguntas y opciones de un banco de ${MCQ.length} de opción múltiple, ${FILL.length} de completamiento y ${CASOS.length} casos de desarrollo.</p></div></div>
      <div class="grid g2">${Object.entries(SIM_MODES).map(([k, m]) => `
        <button class="game-card" data-mode="${k}" style="--gc:${{ prog: 'var(--pC)', redes: 'var(--pA)', integral: 'var(--accent)', practico: 'var(--amber)' }[k]}">
          <div class="row-between" style="width:100%"><div class="game-ico">${icon(m.ic)}</div><span class="tag">${m.min}′</span></div>
          <h3>${esc(m.t)}</h3><p>${esc(m.d)}</p>
          <span class="best">${k === 'practico' ? '3 tareas · autoevaluación' : '10 opción múltiple · 3 completamiento · 1 desarrollo'}</span></button>`).join('')}</div>
      ${(st.lastWrong || []).length ? `<div class="callout acc mt">${icon('refresh')}<div style="flex:1"><b>Tenés ${st.lastWrong.length} preguntas falladas en el último simulacro.</b> Repasalas en un simulacro corto.</div><button class="btn btn-sm btn-primary" id="retry">Repetir falladas</button></div>` : ''}
      <div class="callout info mt">${icon('info')}<div>El Modelo oficial indica los <b>tipos</b> de pregunta (opción múltiple, completamiento y desarrollo) y un puntaje de <b>10</b>, pero no la ponderación. La plataforma usa una distribución estimada: <b>4 + 3 + 3</b> puntos, y considera aprobado desde 6,00 como referencia.</div></div>`;
    $$('[data-mode]', el).forEach(b => b.onclick = () => { SIM.cur = b.dataset.mode === 'practico' ? newPractico() : newExam(b.dataset.mode); this.render(el); });
    $('#retry')?.addEventListener('click', () => { SIM.cur = newExam('integral', STATS().lastWrong); this.render(el); });
  },
  timerBar(ex) {
    return `<div class="card mb" style="position:sticky;top:${window.innerWidth <= 960 ? 104 : 12}px;z-index:50;padding:12px 16px">
      <div class="row-between"><div><b>${esc(ex.title)}</b> <span class="dim mono" style="font-size:.76rem" id="simProg"></span></div>
      <div class="row"><span class="timer-ring" id="simClock">--:--</span>
      ${ex.done ? `<button class="btn btn-sm" id="simNew">${icon('refresh')} Otro simulacro</button>` : `<button class="btn btn-sm btn-ghost" id="simQuit">Abandonar</button><button class="btn btn-sm btn-primary" id="simEnd">${icon('check')} Entregar</button>`}</div></div></div>`;
  },
  startClock(ex) {
    clearInterval(SIM.iv);
    const tick = () => {
      const c = $('#simClock'); if (!c) return clearInterval(SIM.iv);
      if (ex.done) { c.textContent = 'Entregado'; c.classList.remove('low'); return; }
      const left = ex.min * 60 - Math.floor((Date.now() - ex.t0) / 1000);
      c.textContent = left >= 0 ? fmtTime(left) : '−' + fmtTime(-left);
      c.classList.toggle('low', left < 600);
      if (left === 0) UI.toast('Se terminó el tiempo: entregá cuando quieras.', '', 'clock');
    };
    tick(); SIM.iv = setInterval(tick, 1000);
  },
  renderExam(el) {
    const ex = SIM.cur;
    const res = ex.done ? this.grade(ex) : null;
    el.innerHTML = this.timerBar(ex) + (res ? this.resultCard(ex, res) : '') + `
      <div class="card"><div class="card-head"><div class="card-title">Parte I · Opción múltiple</div><span class="tag">0,40 c/u</span></div>
      ${ex.items.map((it, i) => {
        const q = it.q, correctPos = it.ord.indexOf(q.a);
        return `<div class="q" data-i="${i}"><div class="q-meta">${pill(q.p, false)} <span class="tag">${esc(q.t)}</span><span class="dim" style="font-size:.74rem;margin-left:auto">${esc(q.ref)}</span></div>
          <div class="q-text"><span class="n">${i + 1}.</span>${esc(q.q)}</div>
          <div class="opts">${it.ord.map((oi, j) => {
            let cls = it.sel === j ? 'sel' : '';
            if (ex.done) cls = j === correctPos ? 'ok' : it.sel === j ? 'bad' : '';
            return `<button class="opt ${cls}" data-j="${j}" ${ex.done ? 'disabled' : ''}><span class="ol">${'ABCD'[j]}</span><span>${esc(q.o[oi])}</span></button>`;
          }).join('')}</div>
          ${ex.done ? `<div class="fb ${it.sel === correctPos ? 'ok' : 'bad'}"><b>${it.sel === correctPos ? 'Correcto (+0,40).' : it.sel == null ? 'Sin responder.' : 'Incorrecto.'}</b> <span class="ex">${esc(q.e)}</span></div>` : ''}</div>`;
      }).join('')}</div>
      <div class="card mt"><div class="card-head"><div class="card-title">Parte II · Completamiento</div><span class="tag">1,00 c/u</span></div>
      ${ex.fills.map((x, i) => {
        const ok = ex.done && this.fillOk(x);
        return `<div class="q"><div class="q-meta">${pill(x.f.p, false)} <span class="tag">${esc(x.f.t)}</span></div><div class="q-text"><span class="n">${i + 1}.</span>${esc(x.f.q)}</div>
          <input class="inp mono ${ex.done ? (ok ? 'ok' : 'bad') : ''}" data-fill="${i}" value="${esc(x.val)}" placeholder="Respuesta" autocomplete="off" ${ex.done ? 'disabled' : ''} style="max-width:340px">
          ${ex.done ? `<div class="fb ${ok ? 'ok' : 'bad'}"><b>${ok ? 'Correcto (+1,00).' : 'Esperado: ' + esc(x.f.a[0])}</b> <span class="ex">${esc(x.f.e)}</span></div>` : ''}</div>`;
      }).join('')}</div>
      <div class="card mt"><div class="card-head"><div><div class="card-title">Parte III · Desarrollo</div><div class="card-sub">${esc(ex.caso.t)} · ${esc(ex.caso.ref)}</div></div><span class="tag">3,00</span></div>
        <pre class="code" style="white-space:pre-wrap">${esc(ex.caso.q)}</pre>
        <textarea class="inp mt" id="dev" rows="9" placeholder="Desarrollá con estructura: definí, explicá, ejemplificá y concluí." ${ex.done ? 'disabled' : ''}>${esc(ex.dev)}</textarea>
        <div class="row-between mt"><span class="dim mono" style="font-size:.72rem" id="devCount">${ex.dev.length} caracteres</span>
          ${ex.done ? '' : `<button class="btn btn-sm btn-ghost" id="showRub">${icon('eye')} Ver criterios</button>`}</div>
        ${ex.done ? this.rubricHtml(ex) : `<div id="rubPeek" class="hidden mt">${this.rubricList(ex.caso)}</div>`}
      </div>
      ${ex.done ? '' : `<div class="row mt"><button class="btn btn-primary btn-block" id="simEnd2">${icon('check')} Entregar y corregir</button></div>`}`;
    this.bindExam(el);
    this.startClock(ex);
    this.updProg();
  },
  rubricList(c) { return `<div class="kb"><div class="kb-h">Criterios de corrección (1 punto c/u)</div><ul>${c.r.map(r => `<li>${esc(r.t)}</li>`).join('')}</ul></div>`; },
  rubricHtml(ex) {
    return `<div class="kb mt"><div class="kb-h">Autoevaluación con rúbrica · marcá lo que cubriste</div>
      ${ex.caso.r.map((r, i) => `<label class="check"><input type="checkbox" data-rub="${i}" ${ex.rub[i] ? 'checked' : ''}><span><b>${esc(r.t)}</b>${ex.rubAuto[i] ? ' <span class="tag tag-ok">detectado</span>' : ''}</span></label>`).join('')}
      <p class="dim" style="font-size:.76rem;margin-top:6px">La detección automática busca palabras clave; corregí con honestidad: en el examen real corrige una persona.</p></div>`;
  },
  fillOk(x) { const v = norm(x.val); return !!v && x.f.a.some(a => { const n = norm(a); return v === n || (n.length > 3 && v.includes(n)); }); },
  grade(ex) {
    let mcq = 0, fill = 0;
    ex.items.forEach(it => { if (it.sel === it.ord.indexOf(it.q.a)) mcq += 0.4; });
    ex.fills.forEach(x => { if (this.fillOk(x)) fill += 1; });
    const dev = ex.rub.filter(Boolean).length;
    const total = Math.round((mcq + fill + dev) * 100) / 100;
    return { mcq, fill, dev, total };
  },
  resultCard(ex, r) {
    const ok = r.total >= 6;
    return `<div class="card mb" style="border-color:${ok ? 'var(--ok)' : 'var(--bad)'}">
      <div class="row-between"><div><div class="eyebrow" style="color:${ok ? 'var(--ok)' : 'var(--bad)'}">${ok ? 'Aprobado' : 'No aprobado'}</div>
        <div class="kpi-val" style="font-size:2.4rem">${r.total.toFixed(2)}<span class="dim" style="font-size:1rem"> / 10</span></div></div>
        <div class="grid g3" style="min-width:300px;flex:1;max-width:520px">
          <div class="kpi"><div class="kpi-val" style="font-size:1.2rem">${r.mcq.toFixed(2)}</div><div class="kpi-lbl">Parte I / 4</div></div>
          <div class="kpi"><div class="kpi-val" style="font-size:1.2rem">${r.fill.toFixed(2)}</div><div class="kpi-lbl">Parte II / 3</div></div>
          <div class="kpi"><div class="kpi-val" style="font-size:1.2rem">${r.dev.toFixed(2)}</div><div class="kpi-lbl">Parte III / 3</div></div></div></div>
      ${ex.wrong?.length ? `<div class="row mt"><button class="btn btn-sm btn-soft" id="retryNow">${icon('refresh')} Repetir las ${ex.wrong.length} falladas</button><span class="dim" style="font-size:.8rem">Revisá las explicaciones de abajo.</span></div>` : ''}</div>`;
  },
  updProg() {
    const ex = SIM.cur; if (!ex || !$('#simProg')) return;
    const n = ex.items.filter(i => i.sel != null).length + ex.fills.filter(f => f.val.trim()).length + (ex.dev.trim().length > 30 ? 1 : 0);
    $('#simProg').textContent = `· ${n}/14 respondidas`;
  },
  bindExam(el) {
    const ex = SIM.cur;
    $$('.q[data-i]', el).forEach(qd => $$('.opt', qd).forEach(b => b.onclick = () => {
      if (ex.done) return;
      const it = ex.items[+qd.dataset.i]; it.sel = +b.dataset.j;
      $$('.opt', qd).forEach(x => x.classList.toggle('sel', x === b)); this.updProg();
    }));
    $$('[data-fill]', el).forEach(inp => inp.oninput = () => { ex.fills[+inp.dataset.fill].val = inp.value; this.updProg(); });
    const dev = $('#dev'); if (dev) dev.oninput = () => { ex.dev = dev.value; $('#devCount').textContent = dev.value.length + ' caracteres'; this.updProg(); };
    $('#showRub')?.addEventListener('click', () => $('#rubPeek').classList.toggle('hidden'));
    const finish = () => this.submit();
    $('#simEnd')?.addEventListener('click', finish); $('#simEnd2')?.addEventListener('click', finish);
    $('#simQuit')?.addEventListener('click', () => { if (confirm('¿Abandonar el simulacro? No se guarda.')) { SIM.cur = null; this.render(el); } });
    $('#simNew')?.addEventListener('click', () => { SIM.cur = null; this.render(el); });
    $('#retryNow')?.addEventListener('click', () => { SIM.cur = newExam('integral', ex.wrong); this.render(el); });
    $$('[data-rub]', el).forEach(c => c.onchange = () => {
      ex.rub[+c.dataset.rub] = c.checked;
      const r = this.grade(ex); const st = STATS();
      if (st.history?.[0]?.id === ex.t0) { st.history[0].n = r.total; if (st.best == null || r.total > st.best) st.best = r.total; store.set('stats', st); }
      this.renderExam(el);
    });
  },
  submit() {
    const ex = SIM.cur;
    const unanswered = ex.items.filter(i => i.sel == null).length;
    if (unanswered && !confirm(`Tenés ${unanswered} preguntas de opción múltiple sin responder. ¿Entregar igual?`)) return;
    ex.done = true;
    const D = norm(ex.dev);
    ex.rubAuto = ex.caso.r.map(r => r.kw.some(k => D.includes(norm(k))));
    ex.rub = [...ex.rubAuto];
    const r = this.grade(ex);
    const st = STATS();
    st.topics = st.topics || {};
    ex.wrong = [];
    ex.items.forEach(it => {
      const ok = it.sel === it.ord.indexOf(it.q.a);
      const tp = st.topics[it.q.t] = st.topics[it.q.t] || { ok: 0, n: 0 }; tp.n++; if (ok) tp.ok++;
      if (!ok) ex.wrong.push(it.q.id);
    });
    st.exams = (st.exams || 0) + 1;
    if (st.best == null || r.total > st.best) st.best = r.total;
    st.lastWrong = ex.wrong;
    st.history = [{ id: ex.t0, d: new Date().toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }), n: r.total, m: ex.title }, ...(st.history || [])].slice(0, 20);
    store.set('stats', st);
    Game.gain(20 + Math.round(r.total * 8), `${ex.title}: ${r.total.toFixed(2)}`, 'sim');
    Game.award('sim1');
    if (r.total >= 6) Game.award('aprobado');
    if (r.total >= 9) Game.award('sobresaliente');
    if (r.total >= 10) Game.award('diez');
    if (r.total >= 9) UI.confetti();
    this.renderExam(this.el);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
  renderPractico(el) {
    const ex = SIM.cur;
    const v = ex.vlsm;
    el.innerHTML = this.timerBar(ex) + `
      <div class="callout info mb">${icon('info')}<div>La Guía lista un <b>examen práctico de redes y programación de 90′</b>. Resolvé las tres tareas como si estuvieras en el examen; usá los laboratorios y marcá cada una cuando la tengas.</div></div>
      <div class="stack">
        <div class="card"><div class="card-head"><div class="card-title">${icon('net')} Tarea 1 · Direccionamiento VLSM</div><label class="check" style="padding:4px 8px"><input type="checkbox" data-ok="vlsm" ${ex.ok.vlsm ? 'checked' : ''}><span>Resuelta</span></label></div>
          <p>Con la red <b class="mono">${v.base}/${v.basePrefix}</b>, asigná subredes a: ${v.reqs.map(r => `<b>${esc(r.n)}</b> (${r.h} hosts)`).join(', ')}. Indicá red, máscara, primer y último host y broadcast de cada una.</p>
          <div class="row mt"><button class="btn btn-sm" id="pvSol">${icon('eye')} Ver solución</button></div><div id="pvBox" class="hidden mt">${vlsmSolutionTable(v)}</div></div>
        <div class="card"><div class="card-head"><div class="card-title">${icon('flow')} Tarea 2 · Algoritmo</div><label class="check" style="padding:4px 8px"><input type="checkbox" data-ok="al" ${ex.ok.al ? 'checked' : ''}><span>Resuelta</span></label></div>
          <p><b>${esc(ex.al.t)}.</b> ${esc(ex.al.enun)} Escribilo en pseudocódigo y dibujá su diagrama de flujo.</p>
          <div class="row mt"><a class="btn btn-sm btn-primary" href="#/algoritmos/editor">${icon('terminal')} Abrir el editor</a><button class="btn btn-sm" id="paSol">${icon('eye')} Ver una solución</button></div>
          <pre class="code hidden mt" id="paBox">${esc(ex.al.code)}</pre></div>
        <div class="card"><div class="card-head"><div class="card-title">${icon('sql')} Tarea 3 · Consulta SQL</div><label class="check" style="padding:4px 8px"><input type="checkbox" data-ok="sql" ${ex.ok.sql ? 'checked' : ''}><span>Resuelta</span></label></div>
          <p>${esc(ex.sq.t)}</p><div class="row mt"><a class="btn btn-sm btn-primary" href="#/sql/${ex.sq.id}">${icon('db')} Resolver en el laboratorio</a></div></div>
      </div>
      <div class="row mt"><button class="btn btn-primary" id="pFin">${icon('check')} Terminar práctico</button></div>`;
    $('#pvSol').onclick = () => $('#pvBox').classList.toggle('hidden');
    $('#paSol').onclick = () => $('#paBox').classList.toggle('hidden');
    $$('[data-ok]', el).forEach(c => c.onchange = () => { ex.ok[c.dataset.ok] = c.checked; });
    $('#simQuit')?.addEventListener('click', () => { SIM.cur = null; this.render(el); });
    $('#simEnd')?.addEventListener('click', () => $('#pFin').click());
    $('#simNew')?.addEventListener('click', () => { SIM.cur = null; this.render(el); });
    $('#pFin').onclick = () => {
      if (ex.done) return;
      const n = Object.values(ex.ok).filter(Boolean).length;
      ex.done = true;
      Game.gain(15 + n * 20, `Práctico: ${n}/3 tareas`, 'sim');
      if (n === 3) UI.confetti();
      this.renderPractico(el);
    };
    this.startClock(ex);
  },
});

/* ============================== SUBNETEO ============================== */
const ipToInt = a => ((a[0] << 24) | (a[1] << 16) | (a[2] << 8) | a[3]) >>> 0;
const intToIp = n => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
const maskOf = p => p === 0 ? 0 : (0xFFFFFFFF << (32 - p)) >>> 0;
function subnetOf(ipStr, p) {
  const ip = ipToInt(ipStr.split('.').map(Number)), m = maskOf(p), net = (ip & m) >>> 0, bc = (net | (~m >>> 0)) >>> 0;
  return { ip: ipStr, p, mask: intToIp(m), net: intToIp(net), bc: intToIp(bc), first: intToIp(net + 1), last: intToIp(bc - 1), hosts: Math.max(0, 2 ** (32 - p) - 2), netInt: net };
}
function genSubnet(diff) {
  let ip, p;
  if (diff === 'easy') { ip = [192, 168, rnd(0, 254), rnd(1, 254)]; p = rnd(24, 28); }
  else if (diff === 'hard') { ip = [rnd(1, 2) === 1 ? 10 : 172, rnd(16, 31), rnd(0, 255), rnd(1, 254)]; p = rnd(17, 30); }
  else { ip = Math.random() < .5 ? [172, rnd(16, 31), rnd(0, 255), rnd(1, 254)] : [10, rnd(0, 255), rnd(0, 255), rnd(1, 254)]; p = rnd(20, 29); }
  return subnetOf(ip.join('.'), p);
}
function genVLSM(hard) {
  const names = shuffle(['Comando', 'Logística', 'Sistemas', 'Personal', 'Operaciones', 'Sanidad', 'Inteligencia', 'Comunicaciones']);
  for (;;) {
    const k = hard ? 4 : 3;
    const hosts = [rnd(30, 110), rnd(12, 50), rnd(5, 26), ...(k > 3 ? [rnd(2, 12)] : [])];
    const reqs = hosts.map((h, i) => ({ n: names[i], h })).concat([{ n: 'Enlace WAN', h: 2 }]).sort((a, b) => b.h - a.h);
    let used = 0;
    reqs.forEach(r => { r.p = 32 - Math.ceil(Math.log2(r.h + 2)); r.size = 2 ** (32 - r.p); });
    used = reqs.reduce((a, r) => a + r.size, 0);
    if (used > 256) continue;
    const third = rnd(1, 254), base = `192.168.${third}.0`;
    let cur = ipToInt(base.split('.').map(Number));
    reqs.forEach(r => { r.sub = subnetOf(intToIp(cur), r.p); cur += r.size; });
    return { base, basePrefix: 24, reqs, free: 256 - used };
  }
}
function vlsmSolutionTable(v) {
  return `<div class="table-wrap"><table class="tbl compact"><thead><tr><th>Subred</th><th class="num">Hosts</th><th>Red</th><th>Máscara</th><th>Primer host</th><th>Último host</th><th>Broadcast</th></tr></thead><tbody>
    ${v.reqs.map(r => `<tr><td>${esc(r.n)}</td><td class="num">${r.h} → ${r.sub.hosts}</td><td class="mono">${r.sub.net}/${r.p}</td><td class="mono">${r.sub.mask}</td><td class="mono">${r.sub.first}</td><td class="mono">${r.sub.last}</td><td class="mono">${r.sub.bc}</td></tr>`).join('')}</tbody></table></div>
    <p class="dim mt" style="font-size:.78rem">Criterio: de la subred más grande a la más chica; prefijo = 32 − ⌈log₂(hosts + 2)⌉. Quedan libres ${v.free} direcciones.</p>`;
}
const bitsHtml = (ip, p) => `<div class="bits">${ip.split('.').map((o, oi) => `<span class="oct">${(+o).toString(2).padStart(8, '0').split('').map((b, bi) => `<span class="b ${oi * 8 + bi < p ? 'n' : 'h'}">${b}</span>`).join('')}</span>`).join('<span class="dim">.</span>')}</div>`;

App.view('subneteo', {
  title: 'Subneteo IPv4', icon: 'net',
  render(el, param) {
    const mode = param === 'vlsm' ? 'vlsm' : 'clasico';
    const st = STATS();
    el.innerHTML = `
      <div class="page-head"><div><div class="eyebrow">Practicar</div><h1 class="title">Entrenador de subneteo</h1>
        <p class="lead">Ejercicios infinitos con el método del octeto crítico. Cada ejercicio perfecto suma XP; la racha cuenta para medallas.</p></div>
        <div class="row"><span class="tag tag-acc">Racha ${st.subStreak || 0}</span><span class="tag">Mejor ${st.subBestStreak || 0}</span><span class="tag">${st.subOk || 0} resueltos</span></div></div>
      <div class="seg mb"><button class="${mode === 'clasico' ? 'on' : ''}" onclick="App.go('subneteo')">Clásico</button><button class="${mode === 'vlsm' ? 'on' : ''}" onclick="App.go('subneteo/vlsm')">VLSM</button></div>
      <div id="subBox"></div>
      <div class="section-lbl">Tabla de referencia</div>
      <div class="table-wrap"><table class="tbl compact"><thead><tr><th>Prefijo</th><th>Máscara</th><th class="num">Salto (4.º oct.)</th><th class="num">Hosts útiles</th></tr></thead><tbody>
        ${[24, 25, 26, 27, 28, 29, 30].map(p => `<tr><td class="mono">/${p}</td><td class="mono">${intToIp(maskOf(p))}</td><td class="num">${2 ** (32 - p)}</td><td class="num">${2 ** (32 - p) - 2}</td></tr>`).join('')}</tbody></table></div>`;
    mode === 'vlsm' ? this.vlsm($('#subBox')) : this.clasico($('#subBox'));
  },
  leave() { clearInterval(this._iv); },
  clasico(box) {
    const diff = store.get('subDiff', 'medium');
    const s = genSubnet(diff);
    const t0 = Date.now();
    const F = [['mask', 'Máscara', s.mask], ['net', 'Dirección de red', s.net], ['bc', 'Broadcast', s.bc], ['first', 'Primer host', s.first], ['last', 'Último host', s.last], ['hosts', 'Hosts útiles', String(s.hosts)]];
    box.innerHTML = `<div class="card">
      <div class="row-between"><div><div class="dim mono" style="font-size:.72rem">CALCULÁ PARA</div><div class="target-ip">${s.ip}<span>/${s.p}</span></div><div class="dim mono" style="font-size:.74rem" id="subClock">0 s</div></div>
        <div class="row"><select class="inp" id="diff">${[['easy', 'Fácil · /24 a /28'], ['medium', 'Medio · /20 a /29'], ['hard', 'Difícil · /17 a /30']].map(([k, l]) => `<option value="${k}" ${k === diff ? 'selected' : ''}>${l}</option>`).join('')}</select><button class="btn" id="subNew">${icon('refresh')} Nuevo</button></div></div>
      <div class="grid g3 mt">${F.map(([k, l]) => `<label class="field"><span>${l}</span><input class="inp mono" data-k="${k}" autocomplete="off" inputmode="decimal"></label>`).join('')}</div>
      <div class="row mt"><button class="btn btn-primary" id="subChk">${icon('check')} Validar</button><button class="btn btn-ghost" id="subSol">${icon('eye')} Ver desarrollo</button></div>
      <div id="subFb"></div></div>`;
    clearInterval(this._iv);
    this._iv = setInterval(() => { const c = $('#subClock'); if (c) c.textContent = Math.round((Date.now() - t0) / 1000) + ' s'; }, 1000);
    $('#diff').onchange = e => { store.set('subDiff', e.target.value); this.clasico(box); };
    $('#subNew').onclick = () => this.clasico(box);
    let checked = false;
    const develop = () => {
      const crit = Math.min(3, Math.floor(s.p / 8)), mv = +s.mask.split('.')[crit], salto = 256 - mv;
      return `<div class="kb mt"><div class="kb-h">Desarrollo · octeto crítico: ${['1.º', '2.º', '3.º', '4.º'][crit]}</div><ul>
        <li>/${s.p} → máscara <b>${s.mask}</b></li><li>Salto = 256 − ${mv} = <b>${salto}</b></li>
        <li>Red = <b>${s.net}</b> · Broadcast = <b>${s.bc}</b></li><li>Rango útil: <b>${s.first}</b> a <b>${s.last}</b></li><li>Hosts útiles = 2<sup>${32 - s.p}</sup> − 2 = <b>${s.hosts}</b></li></ul>
        <div class="mt">${bitsHtml(s.ip, s.p)}<div class="dim" style="font-size:.72rem;margin-top:4px">Verde: bits de red · Ámbar: bits de host</div></div></div>`;
    };
    $('#subChk').onclick = () => {
      clearInterval(this._iv);
      let ok = 0;
      F.forEach(([k, , v]) => { const inp = $(`[data-k="${k}"]`); const good = inp.value.trim().replace(/\s/g, '') === v; inp.classList.toggle('ok', good); inp.classList.toggle('bad', !good); if (good) ok++; });
      if (checked) return; checked = true;
      const st = STATS(); st.subTotal = (st.subTotal || 0) + 1;
      const secs = Math.round((Date.now() - t0) / 1000);
      if (ok === 6) {
        st.subOk = (st.subOk || 0) + 1; st.subStreak = (st.subStreak || 0) + 1; st.subBestStreak = Math.max(st.subBestStreak || 0, st.subStreak);
        store.set('stats', st);
        Game.gain(10 + (secs < 60 ? 5 : 0), `Subred perfecta en ${secs} s`, 'sub');
        if (st.subStreak >= 5) Game.award('subred5');
        if (st.subOk >= 50) Game.award('subred50');
        $('#subFb').innerHTML = `<div class="fb ok mt"><b>Perfecto: 6/6 en ${secs} s.</b> Racha: ${st.subStreak}.</div>`;
      } else {
        st.subStreak = 0; store.set('stats', st);
        $('#subFb').innerHTML = `<div class="fb bad mt"><b>${ok}/6 correctos.</b> Revisá los campos en rojo o mirá el desarrollo.</div>`;
      }
    };
    $('#subSol').onclick = () => { $('#subFb').innerHTML = develop(); F.forEach(([k, , v]) => { const i = $(`[data-k="${k}"]`); if (!i.value) i.placeholder = v; }); };
  },
  vlsm(box) {
    const v = genVLSM(store.get('vlsmHard', false));
    box.innerHTML = `<div class="card">
      <div class="row-between"><div><div class="dim mono" style="font-size:.72rem">RED DISPONIBLE</div><div class="target-ip">${v.base}<span>/24</span></div></div>
        <div class="row"><label class="row" style="gap:6px;font-size:.84rem"><input type="checkbox" id="vh" ${store.get('vlsmHard', false) ? 'checked' : ''} style="accent-color:var(--accent)"> 4 subredes + enlace</label><button class="btn" id="vNew">${icon('refresh')} Nuevo</button></div></div>
      <p class="muted mt">Asigná de mayor a menor y escribí cada subred como <span class="mono">red/prefijo</span> (por ejemplo, <span class="mono">${v.base.replace(/\.0$/, '.64')}/27</span>).</p>
      <div class="table-wrap mt"><table class="tbl"><thead><tr><th>Subred</th><th class="num">Hosts pedidos</th><th>Tu respuesta (red/prefijo)</th></tr></thead><tbody>
        ${v.reqs.map((r, i) => `<tr><td><b>${esc(r.n)}</b></td><td class="num">${r.h}</td><td><input class="inp mono" data-v="${i}" placeholder="x.x.x.x/nn" autocomplete="off"></td></tr>`).join('')}</tbody></table></div>
      <div class="row mt"><button class="btn btn-primary" id="vChk">${icon('check')} Validar</button><button class="btn btn-ghost" id="vSol">${icon('eye')} Solución</button></div><div id="vFb"></div></div>`;
    $('#vh').onchange = e => { store.set('vlsmHard', e.target.checked); this.vlsm(box); };
    $('#vNew').onclick = () => this.vlsm(box);
    let done = false;
    $('#vChk').onclick = () => {
      let ok = 0;
      v.reqs.forEach((r, i) => { const inp = $(`[data-v="${i}"]`); const good = inp.value.replace(/\s/g, '') === `${r.sub.net}/${r.p}`; inp.classList.toggle('ok', good); inp.classList.toggle('bad', !good); if (good) ok++; });
      if (ok === v.reqs.length) { $('#vFb').innerHTML = `<div class="fb ok mt"><b>VLSM perfecto.</b></div>` + vlsmSolutionTable(v); if (!done) { done = true; Game.gain(25, 'VLSM resuelto', 'sub', 2); } }
      else $('#vFb').innerHTML = `<div class="fb bad mt"><b>${ok}/${v.reqs.length} correctas.</b> Recordá: ordenar de mayor a menor y alinear cada red a su tamaño de bloque.</div>`;
    };
    $('#vSol').onclick = () => { $('#vFb').innerHTML = vlsmSolutionTable(v); };
  },
});

/* ============================== NORMALIZACIÓN ============================== */
const LAB_PASOS = [
  { h: 'Paso 1 · 1FN', t: 'El grupo repetitivo {Ítems} viola la atomicidad. Se lleva a una tabla aparte con la clave de la entrega.', c: 'ENTREGA(IdEntrega PK, Fecha, DNI, NombreOficial, CodUnidad, NomUnidad)\nITEM_ENTREGA(IdEntrega FK, CodItem, NombreItem, Cantidad)' },
  { h: 'Paso 2 · 2FN', t: 'La clave de ITEM_ENTREGA es compuesta (IdEntrega, CodItem). NombreItem depende solo de CodItem: dependencia parcial. Se extrae ITEM.', c: 'ITEM_ENTREGA(IdEntrega FK, CodItem FK, Cantidad)\nITEM(CodItem PK, NombreItem)' },
  { h: 'Paso 3 · 3FN', t: 'En ENTREGA: IdEntrega → DNI → NombreOficial y DNI → CodUnidad → NomUnidad son transitivas. Se extraen OFICIAL y UNIDAD.', c: 'OFICIAL(DNI PK, Nombre, CodUnidad FK)\nUNIDAD(CodUnidad PK, NomUnidad)\nENTREGA(IdEntrega PK, Fecha, DNI FK)' },
  { h: 'Resultado', t: 'Cada hecho se guarda una sola vez. Si hubiera atributos multivaluados independientes (cursos e idiomas del oficial) se aplica 4FN; con una regla cíclica ternaria, 5FN.', c: 'OFICIAL(DNI PK, Nombre, CodUnidad FK)\nUNIDAD(CodUnidad PK, NomUnidad)\nENTREGA(IdEntrega PK, Fecha, DNI FK)\nITEM(CodItem PK, NombreItem)\nITEM_ENTREGA(IdEntrega FK, CodItem FK, Cantidad)' },
];
const NF_QUIZ = [
  { q: 'PERSONAL(DNI, Nombre, Telefonos) donde Telefonos = "4751-8001, 4751-8002".', a: '1FN', e: 'Telefonos no es atómico: grupo repetitivo.' },
  { q: 'INSCRIPCION(DNI, CodCurso, NombreCurso, Nota) con clave (DNI, CodCurso).', a: '2FN', e: 'NombreCurso depende solo de CodCurso (dependencia parcial).' },
  { q: 'SOLDADO(DNI, Nombre, CodUnidad, NombreUnidad) con clave DNI.', a: '3FN', e: 'DNI → CodUnidad → NombreUnidad: dependencia transitiva.' },
  { q: 'OFICIAL_CURSO_IDIOMA(DNI, Curso, Idioma): cursos e idiomas independientes entre sí.', a: '4FN', e: 'Dos dependencias multivaluadas independientes.' },
  { q: 'ASIGNACION(Oficial, Vehiculo, Zona) con regla cíclica: si el oficial maneja el vehículo, el vehículo opera en la zona y el oficial está en la zona, entonces la terna vale.', a: '5FN', e: 'Dependencia de unión: se descompone en 3 proyecciones.' },
  { q: 'CLASE(Alumno, Materia, Profesor): cada profesor dicta una sola materia; clave (Alumno, Materia).', a: 'FNBC', e: 'Profesor → Materia, pero Profesor no es clave candidata.' },
];
App.view('normalizacion', {
  title: 'Normalización', icon: 'table',
  render(el) {
    let step = 0;
    el.innerHTML = `
      <div class="page-head"><div><div class="eyebrow">Practicar</div><h1 class="title">Normalización 1FN a 5FN</h1>
        <p class="lead">Cuadro resumen, laboratorio guiado y un quiz para reconocer qué forma normal se viola.</p></div></div>
      <div class="table-wrap"><table class="tbl"><thead><tr><th>Forma</th><th>Requisito previo</th><th>Elimina</th><th>Regla</th></tr></thead><tbody>
        <tr><td><span class="tag">1FN</span></td><td>—</td><td>Grupos repetitivos, valores no atómicos</td><td>Valores atómicos y clave primaria</td></tr>
        <tr><td><span class="tag">2FN</span></td><td>1FN</td><td>Dependencias parciales</td><td>Todo no clave depende de la clave completa</td></tr>
        <tr><td><span class="tag">3FN</span></td><td>2FN</td><td>Dependencias transitivas</td><td>Ningún no clave depende de otro no clave</td></tr>
        <tr><td><span class="tag">FNBC</span></td><td>3FN</td><td>Determinantes que no son clave candidata</td><td>Todo determinante es clave candidata</td></tr>
        <tr><td><span class="tag tag-warn">4FN</span></td><td>FNBC</td><td>Dependencias multivaluadas independientes</td><td>Separar en dos tablas binarias</td></tr>
        <tr><td><span class="tag tag-warn">5FN</span></td><td>4FN</td><td>Dependencias de unión</td><td>Tres proyecciones sin tuplas espurias</td></tr></tbody></table></div>
      <div class="grid g2 mt">
        <div class="card"><div class="card-head"><div class="card-title">${icon('steps')} Laboratorio guiado: de planilla a 3FN</div></div>
          <pre class="code">ENTREGAS(IdEntrega, Fecha, DNI, NombreOficial, CodUnidad, NomUnidad,
         { Ítems: (CodItem, NombreItem, Cantidad) })</pre>
          <div id="labSteps" class="stack-sm mt"></div>
          <div class="row mt"><button class="btn btn-primary" id="labNext">Revelar siguiente paso</button><button class="btn btn-ghost" id="labReset">Reiniciar</button></div></div>
        <div class="card"><div class="card-head"><div class="card-title">${icon('alert')} 4FN y 5FN con ejemplos</div></div>
          <pre class="code">-- 4FN: un oficial tiene N cursos y N idiomas independientes
OFICIAL_CURSO(DNI, CodCurso)
OFICIAL_IDIOMA(DNI, CodIdioma)

-- 5FN: regla cíclica ternaria (Oficial, Vehículo, Zona)
OFICIAL_VEHICULO(DNI, CodVehiculo)
VEHICULO_ZONA(CodVehiculo, CodZona)
OFICIAL_ZONA(DNI, CodZona)
-- la unión de las tres recompone la original sin tuplas espurias</pre>
          <button class="btn btn-sm mt" onclick="App.go('podcasts/d3')">${icon('headphones')} Escuchar el episodio D3</button></div>
      </div>
      <div class="section-lbl">Quiz · ¿qué forma normal se viola?</div>
      <div class="card" id="nfq"></div>`;
    const draw = () => {
      $('#labSteps').innerHTML = LAB_PASOS.slice(0, step).map(p => `<div class="kb" style="--pc:var(--pD)"><div class="kb-h">${esc(p.h)}</div><p style="font-size:.88rem" class="muted">${esc(p.t)}</p><pre class="code mt">${esc(p.c)}</pre></div>`).join('') || '<p class="muted">Presioná "Revelar siguiente paso". Antes, intentá hacerlo vos en papel.</p>';
      $('#labNext').disabled = step >= LAB_PASOS.length;
    };
    $('#labNext').onclick = () => { step++; draw(); if (step === LAB_PASOS.length) Game.gain(10, 'Laboratorio de normalización'); };
    $('#labReset').onclick = () => { step = 0; draw(); };
    draw();
    const opts = ['1FN', '2FN', '3FN', 'FNBC', '4FN', '5FN'];
    let score = 0, n = 0;
    $('#nfq').innerHTML = shuffle(NF_QUIZ).map((x, i) => `<div class="q" data-a="${x.a}"><div class="q-text"><span class="n">${i + 1}.</span>${esc(x.q)}</div><div class="chips">${opts.map(o => `<button class="chip" data-o="${o}">${o}</button>`).join('')}</div><div class="fbs"></div></div>`).join('');
    $$('#nfq .q').forEach(qd => $$('.chip', qd).forEach(b => b.onclick = () => {
      if (qd.dataset.done) return; qd.dataset.done = 1; n++;
      const ok = b.dataset.o === qd.dataset.a; if (ok) score++;
      $$('.chip', qd).forEach(c => { if (c.dataset.o === qd.dataset.a) c.classList.add('on'); });
      const item = NF_QUIZ.find(x => x.a === qd.dataset.a);
      $('.fbs', qd).innerHTML = `<div class="fb ${ok ? 'ok' : 'bad'}"><b>${ok ? 'Correcto.' : 'Es ' + qd.dataset.a + '.'}</b> <span class="ex">${esc(item.e)}</span></div>`;
      if (n === NF_QUIZ.length) Game.gain(score * 4, `Quiz de normalización ${score}/${n}`, 'game');
    }));
  },
});

/* ============================== LABORATORIO SQL ============================== */
const SQL_SCHEMA = `
CREATE TABLE UNIDAD (CodUnidad INTEGER PRIMARY KEY, Nombre TEXT NOT NULL, Guarnicion TEXT NOT NULL);
CREATE TABLE SOLDADO (DNI INTEGER PRIMARY KEY, Apellido TEXT NOT NULL, Nombre TEXT NOT NULL, Jerarquia TEXT NOT NULL, FechaIngreso TEXT, CodUnidad INTEGER REFERENCES UNIDAD(CodUnidad));
CREATE TABLE CURSO (CodCurso TEXT PRIMARY KEY, Nombre TEXT NOT NULL, Horas INTEGER);
CREATE TABLE SOLDADO_CURSO (DNI INTEGER REFERENCES SOLDADO(DNI), CodCurso TEXT REFERENCES CURSO(CodCurso), Nota REAL, PRIMARY KEY (DNI, CodCurso));
CREATE TABLE MATERIAL (CodMat INTEGER PRIMARY KEY, Descripcion TEXT NOT NULL, Tipo TEXT, Stock INTEGER, CodUnidad INTEGER REFERENCES UNIDAD(CodUnidad));
INSERT INTO UNIDAD VALUES (1,'Batallón de Comunicaciones 601','City Bell'),(2,'Compañía de Ingenieros 10','Pigüé'),(3,'Regimiento de Infantería 1','Palermo'),(4,'Agrupación de Comunicaciones 602','Campo de Mayo'),(5,'Centro de Ciberdefensa','Buenos Aires');
INSERT INTO SOLDADO VALUES
(30111222,'García','Lucía','Cabo','2019-03-01',1),(31222333,'Gómez','Martín','Soldado','2021-02-15',1),(32333444,'Fernández','Sofía','Cabo Primero','2018-07-10',1),(33444555,'López','Juan','Soldado','2022-01-20',1),(34555666,'Martínez','Ana','Sargento','2015-05-05',1),
(35666777,'Pérez','Diego','Soldado','2023-03-01',2),(36777888,'Rodríguez','Valentina','Cabo','2020-08-12',2),(37888999,'Sánchez','Tomás','Soldado','2022-11-30',2),
(38999000,'Romero','Camila','Sargento Primero','2012-04-18',3),(39000111,'Díaz','Nicolás','Cabo','2019-09-09',3),(40111222,'Álvarez','Julieta','Soldado','2023-06-01',3),(41222333,'Torres','Mateo','Soldado','2021-12-01',3),(42333444,'Ruiz','Paula','Cabo Primero','2017-02-14',3),(43444555,'Gutiérrez','Lucas','Soldado','2024-03-01',3),
(44555666,'Herrera','Agustina','Cabo','2020-01-10',4),(45666777,'Medina','Facundo','Sargento','2014-10-21',4),
(46777888,'Castro','Micaela','Cabo','2021-04-04',NULL),(47888999,'Vega','Joaquín','Soldado','2024-02-02',NULL);
INSERT INTO CURSO VALUES ('RED','Redes y Comunicaciones',60),('WIN','Administración de Windows Server',50),('SQL','Bases de Datos',40),('SEG','Seguridad Informática',45),('PRG','Programación',55);
INSERT INTO SOLDADO_CURSO VALUES
(30111222,'RED',8),(30111222,'SEG',9),(31222333,'RED',6),(32333444,'WIN',7),(32333444,'SQL',8.5),(33444555,'PRG',5),(34555666,'RED',9.5),(34555666,'WIN',8),
(35666777,'SQL',6.5),(36777888,'PRG',7),(36777888,'SEG',8),(37888999,'RED',4),(38999000,'WIN',9),(39000111,'SQL',7.5),(40111222,'PRG',6),(42333444,'SEG',9.5),
(44555666,'RED',7),(44555666,'SQL',6),(45666777,'SEG',8.5),(46777888,'PRG',9);
INSERT INTO MATERIAL VALUES (101,'Radio VHF portátil','Comunicaciones',35,1),(102,'Switch 24 puertos','Informática',8,1),(103,'Notebook de campaña','Informática',22,5),(104,'Generador 5 kVA','Energía',4,2),(105,'Antena repetidora','Comunicaciones',12,4),(106,'Cable UTP Cat 6 (caja)','Informática',60,4),(107,'Router de borde','Informática',6,5),(108,'Kit de fibra óptica','Comunicaciones',15,1),(109,'Carpa de comando','Logística',9,3),(110,'Teléfono de campaña','Comunicaciones',40,3);
`;
const SQL_EX = [
  { id: 's01', t: 'Listá apellido y nombre de todos los soldados, ordenados por apellido.', sol: 'SELECT Apellido, Nombre FROM SOLDADO ORDER BY Apellido;', ordered: true },
  { id: 's02', t: 'Mostrá DNI y apellido de los soldados con jerarquía "Cabo".', sol: "SELECT DNI, Apellido FROM SOLDADO WHERE Jerarquia = 'Cabo';" },
  { id: 's03', t: 'Contá cuántos soldados hay en cada unidad (CodUnidad y cantidad), sin contar los que no tienen unidad.', sol: 'SELECT CodUnidad, COUNT(*) FROM SOLDADO WHERE CodUnidad IS NOT NULL GROUP BY CodUnidad;' },
  { id: 's04', t: 'Mostrá las unidades (CodUnidad) con más de 4 soldados.', sol: 'SELECT CodUnidad FROM SOLDADO GROUP BY CodUnidad HAVING COUNT(*) > 4;' },
  { id: 's05', t: 'Mostrá el apellido de cada soldado junto al nombre de su unidad (solo los que tienen unidad).', sol: 'SELECT s.Apellido, u.Nombre FROM SOLDADO s INNER JOIN UNIDAD u ON s.CodUnidad = u.CodUnidad;' },
  { id: 's06', t: 'Listá los soldados que no tienen unidad asignada (DNI y apellido).', sol: 'SELECT DNI, Apellido FROM SOLDADO WHERE CodUnidad IS NULL;' },
  { id: 's07', t: 'Mostrá el nombre de las unidades que no tienen soldados (LEFT JOIN).', sol: 'SELECT u.Nombre FROM UNIDAD u LEFT JOIN SOLDADO s ON s.CodUnidad = u.CodUnidad WHERE s.DNI IS NULL;' },
  { id: 's08', t: 'Calculá el promedio de nota por curso (nombre del curso y promedio), del mayor al menor.', sol: 'SELECT c.Nombre, AVG(sc.Nota) FROM CURSO c JOIN SOLDADO_CURSO sc ON sc.CodCurso = c.CodCurso GROUP BY c.Nombre ORDER BY AVG(sc.Nota) DESC;', ordered: true },
  { id: 's09', t: 'Listá los soldados cuyo apellido empieza con "G" (DNI y apellido).', sol: "SELECT DNI, Apellido FROM SOLDADO WHERE Apellido LIKE 'G%';" },
  { id: 's10', t: 'Mostrá descripción y stock de los materiales con stock entre 10 y 40 inclusive.', sol: 'SELECT Descripcion, Stock FROM MATERIAL WHERE Stock BETWEEN 10 AND 40;' },
  { id: 's11', t: 'Mostrá los 3 materiales con más stock (descripción y stock). En T-SQL usarías TOP.', sol: 'SELECT TOP 3 Descripcion, Stock FROM MATERIAL ORDER BY Stock DESC;', ordered: true },
  { id: 's12', t: 'Mostrá apellido y nota de las inscripciones con nota mayor al promedio general (subconsulta).', sol: 'SELECT s.Apellido, sc.Nota FROM SOLDADO s JOIN SOLDADO_CURSO sc ON sc.DNI = s.DNI WHERE sc.Nota > (SELECT AVG(Nota) FROM SOLDADO_CURSO);' },
  { id: 's13', dml: true, t: 'Insertá el curso "CIB" llamado "Ciberdefensa" de 40 horas.', sol: "INSERT INTO CURSO (CodCurso, Nombre, Horas) VALUES ('CIB', 'Ciberdefensa', 40);", check: "SELECT * FROM CURSO WHERE CodCurso = 'CIB';" },
  { id: 's14', dml: true, t: 'Aumentá en 5 unidades el stock de todos los materiales de tipo "Comunicaciones".', sol: "UPDATE MATERIAL SET Stock = Stock + 5 WHERE Tipo = 'Comunicaciones';", check: 'SELECT CodMat, Stock FROM MATERIAL ORDER BY CodMat;' },
  { id: 's15', dml: true, t: 'Creá la vista vw_Cabos con DNI, Apellido y Nombre de los soldados con jerarquía "Cabo".', sol: "CREATE VIEW vw_Cabos AS SELECT DNI, Apellido, Nombre FROM SOLDADO WHERE Jerarquia = 'Cabo';", check: 'SELECT * FROM vw_Cabos;' },
  { id: 's16', dml: true, t: 'Creá un índice no agrupado llamado IX_Soldado_Apellido sobre SOLDADO(Apellido).', sol: 'CREATE NONCLUSTERED INDEX IX_Soldado_Apellido ON SOLDADO(Apellido);', check: "SELECT lower(name), lower(tbl_name) FROM sqlite_master WHERE type = 'index' AND lower(name) = 'ix_soldado_apellido';" },
  { id: 's17', dml: true, t: 'Eliminá las inscripciones con nota menor a 5.', sol: 'DELETE FROM SOLDADO_CURSO WHERE Nota < 5;', check: 'SELECT COUNT(*) FROM SOLDADO_CURSO;' },
  { id: 's18', dml: true, t: 'Creá la tabla ARMAMENTO con NroSerie (clave primaria, texto), Tipo (texto obligatorio) y CodUnidad (clave foránea a UNIDAD).', sol: 'CREATE TABLE ARMAMENTO (NroSerie VARCHAR(20) PRIMARY KEY, Tipo VARCHAR(40) NOT NULL, CodUnidad INT REFERENCES UNIDAD(CodUnidad));', check: "SELECT name FROM pragma_table_info('ARMAMENTO') ORDER BY cid;" },
];
function tsql2sqlite(sql) {
  return sql.split(/;\s*/).map(st => {
    let s = st.replace(/^\s*GO\s*$/gim, '');
    const top = s.match(/SELECT\s+TOP\s*\(?\s*(\d+)\s*\)?\s+/i);
    if (top) { s = s.replace(top[0], 'SELECT '); if (!/\bLIMIT\b/i.test(s)) s = s.trimEnd() + ' LIMIT ' + top[1]; }
    return s.replace(/\bNONCLUSTERED\b|\bCLUSTERED\b/gi, '').replace(/\bIDENTITY\s*\(\s*\d+\s*,\s*\d+\s*\)/gi, '')
      .replace(/\bGETDATE\s*\(\s*\)/gi, 'CURRENT_TIMESTAMP').replace(/\bFOREIGN\s+KEY\s+REFERENCES\b/gi, 'REFERENCES').replace(/\bISNULL\s*\(/gi, 'IFNULL(').replace(/\bLEN\s*\(/gi, 'LENGTH(')
      .replace(/\bNVARCHAR\b/gi, 'VARCHAR').replace(/\bBIT\b/gi, 'INTEGER');
  }).filter(s => s.trim()).join(';\n') + ';';
}
const SQLJS = { p: null };
function loadSqlJs() {
  if (SQLJS.p) return SQLJS.p;
  SQLJS.p = new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.js';
    s.onload = () => window.initSqlJs({ locateFile: f => 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/' + f }).then(res, rej);
    s.onerror = () => { SQLJS.p = null; rej(new Error('No se pudo descargar el motor SQL (requiere conexión).')); };
    document.head.appendChild(s);
  });
  return SQLJS.p;
}
function freshDb(SQL) { const db = new SQL.Database(); db.run(SQL_SCHEMA); return db; }
const rowsKey = (res, ordered) => {
  if (!res) return '∅';
  const rows = res.values.map(r => JSON.stringify(r.map(v => typeof v === 'number' ? Number(v.toFixed(1)) : v)));
  return res.columns.length + '|' + (ordered ? rows : [...rows].sort()).join('\n');
};
const resTable = res => !res ? '<p class="muted">La sentencia se ejecutó sin devolver filas.</p>' :
  `<div class="table-wrap"><table class="tbl compact"><thead><tr>${res.columns.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${res.values.slice(0, 200).map(r => `<tr>${r.map(v => `<td class="${typeof v === 'number' ? 'num' : ''}">${v === null ? '<span class="dim">NULL</span>' : esc(typeof v === 'number' ? Math.round(v * 100) / 100 : v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div><div class="dim mono mt" style="font-size:.72rem">${res.values.length} fila(s)</div>`;

App.view('sql', {
  title: 'Laboratorio SQL', icon: 'sql',
  render(el, param) {
    const solved = store.get('sqlSolved', {});
    const cur = SQL_EX.find(e => e.id === param) || SQL_EX.find(e => !solved[e.id]) || SQL_EX[0];
    el.innerHTML = `
      <div class="page-head"><div><div class="eyebrow">Practicar</div><h1 class="title">Laboratorio SQL</h1>
        <p class="lead">Escribí consultas reales sobre una base militar de ejemplo. Corre en tu navegador (SQLite): se aceptan TOP, CLUSTERED/NONCLUSTERED, IDENTITY y GETDATE() de T-SQL, que se traducen automáticamente.</p></div>
        <span class="tag tag-acc">${Object.keys(solved).length}/${SQL_EX.length} resueltos</span></div>
      <div class="grid" style="grid-template-columns:minmax(0,260px) minmax(0,1fr);align-items:start" id="sqlGrid">
        <div class="card" style="padding:10px"><div class="list">${SQL_EX.map((e, i) => `<a class="li" href="#/sql/${e.id}" style="text-decoration:none;color:inherit;${e.id === cur.id ? 'background:var(--accent-soft);border-radius:8px;padding-left:8px' : ''}"><span class="mono dim" style="width:26px">${i + 1}</span><div class="li-main"><div class="li-s" style="color:var(--text-2)">${esc(e.t.slice(0, 70))}${e.t.length > 70 ? '…' : ''}</div></div>${solved[e.id] ? `<span class="ep-done">${icon('check')}</span>` : e.dml ? '<span class="tag">DML/DDL</span>' : ''}</a>`).join('')}</div></div>
        <div class="stack">
          <div class="card"><div class="card-title mb">${icon('db')} Ejercicio ${SQL_EX.indexOf(cur) + 1}</div><p>${esc(cur.t)}</p>
            <textarea class="inp mono mt editor" id="sqlIn" rows="7" spellcheck="false" style="min-height:150px">${esc(store.get('sqlDraft_' + cur.id, ''))}</textarea>
            <div class="row mt"><button class="btn btn-primary" id="sqlRun">${icon('play')} Ejecutar y verificar</button><button class="btn btn-ghost" id="sqlSol">${icon('eye')} Solución</button><button class="btn btn-ghost" id="sqlSchema">${icon('table')} Esquema</button><span class="dim" style="font-size:.74rem">Ctrl + Enter ejecuta</span></div>
            <div id="sqlOut" class="mt"></div></div>
          <div class="card hidden" id="schemaBox"><div class="card-title mb">${icon('table')} Esquema de la base</div><pre class="code">${esc(SQL_SCHEMA.split('INSERT')[0].trim().replace(/;\s*/g, ';\n'))}</pre><div class="row mt"><button class="btn btn-sm" id="peek">Ver datos de una tabla</button><select class="inp" id="peekT">${['UNIDAD', 'SOLDADO', 'CURSO', 'SOLDADO_CURSO', 'MATERIAL'].map(t => `<option>${t}</option>`).join('')}</select></div><div id="peekOut" class="mt"></div></div>
        </div>
      </div>
      <div class="section-lbl">Referencia T-SQL</div>
      <div class="grid g2">
        <pre class="code"><span class="c">-- índices</span>
<span class="k">CREATE CLUSTERED INDEX</span> IX_DNI <span class="k">ON</span> PERSONAL(DNI);
<span class="k">CREATE NONCLUSTERED INDEX</span> IX_Unidad <span class="k">ON</span> PERSONAL(CodUnidad);

<span class="c">-- grupos</span>
<span class="k">SELECT</span> CodUnidad, <span class="f">COUNT</span>(*) <span class="k">FROM</span> PERSONAL
<span class="k">GROUP BY</span> CodUnidad <span class="k">HAVING</span> <span class="f">COUNT</span>(*) > <span class="n">10</span>;

<span class="c">-- transacción</span>
<span class="k">BEGIN TRY</span>
  <span class="k">BEGIN TRANSACTION</span>;
  <span class="k">UPDATE</span> MATERIAL <span class="k">SET</span> Stock = Stock - <span class="n">1</span> <span class="k">WHERE</span> CodMat = <span class="n">101</span>;
  <span class="k">COMMIT</span>;
<span class="k">END TRY BEGIN CATCH ROLLBACK</span>; <span class="k">END CATCH</span></pre>
        <pre class="code"><span class="c">-- tabla con restricciones</span>
<span class="k">CREATE TABLE</span> PERSONAL (
  DNI <span class="k">INT NOT NULL PRIMARY KEY</span>,
  Nombre <span class="k">NVARCHAR</span>(<span class="n">60</span>) <span class="k">NOT NULL</span>,
  Legajo <span class="k">INT IDENTITY</span>(<span class="n">1</span>,<span class="n">1</span>) <span class="k">UNIQUE</span>,
  CodUnidad <span class="k">SMALLINT REFERENCES</span> UNIDAD(CodUnidad),
  Alta <span class="k">DATE DEFAULT</span> <span class="f">GETDATE</span>(),
  <span class="k">CHECK</span> (Nombre <> <span class="s">''</span>)
);
<span class="c">-- vista</span>
<span class="k">CREATE VIEW</span> vw_Activos <span class="k">AS</span>
<span class="k">SELECT</span> DNI, Nombre <span class="k">FROM</span> PERSONAL <span class="k">WHERE</span> Baja = <span class="n">0</span>
<span class="k">WITH CHECK OPTION</span>;</pre>
      </div>`;
    if (window.innerWidth <= 960) $('#sqlGrid').style.gridTemplateColumns = '1fr';
    const out = $('#sqlOut'), inp = $('#sqlIn');
    inp.oninput = () => store.set('sqlDraft_' + cur.id, inp.value);
    inp.onkeydown = e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); $('#sqlRun').click(); } };
    $('#sqlSol').onclick = () => { out.innerHTML = `<pre class="code">${esc(cur.sol)}</pre>`; };
    $('#sqlSchema').onclick = () => $('#schemaBox').classList.toggle('hidden');
    $('#peek').onclick = async () => {
      try { const SQL = await loadSqlJs(); const db = freshDb(SQL); $('#peekOut').innerHTML = resTable(db.exec('SELECT * FROM ' + $('#peekT').value)[0]); db.close(); }
      catch (e) { $('#peekOut').innerHTML = `<div class="fb bad">${esc(e.message)}</div>`; }
    };
    $('#sqlRun').onclick = async () => {
      const code = inp.value.trim(); if (!code) { out.innerHTML = '<div class="fb bad">Escribí una sentencia.</div>'; return; }
      out.innerHTML = '<p class="muted">Cargando motor SQL…</p>';
      let SQL; try { SQL = await loadSqlJs(); } catch (e) { out.innerHTML = `<div class="fb bad">${esc(e.message)}</div>`; return; }
      const mine = freshDb(SQL), ref = freshDb(SQL);
      try {
        let res;
        if (cur.dml) { mine.exec(tsql2sqlite(code)); ref.exec(tsql2sqlite(cur.sol)); res = mine.exec(cur.check)[0]; const exp = ref.exec(cur.check)[0]; this.verdict(out, cur, rowsKey(res, true) === rowsKey(exp, true), res); }
        else { const r = mine.exec(tsql2sqlite(code)); res = r[r.length - 1]; const exp = ref.exec(tsql2sqlite(cur.sol))[0]; this.verdict(out, cur, rowsKey(res, cur.ordered) === rowsKey(exp, cur.ordered), res); }
      } catch (e) { out.innerHTML = `<div class="fb bad"><b>Error SQL:</b> ${esc(e.message)}</div>`; }
      finally { mine.close(); ref.close(); }
    };
  },
  verdict(out, cur, ok, res) {
    out.innerHTML = `<div class="fb ${ok ? 'ok' : 'bad'}"><b>${ok ? '¡Correcto!' : 'El resultado no coincide con el esperado.'}</b> ${ok ? '' : '<span class="ex">Compará columnas, filtros y uniones. Podés ver la solución.</span>'}</div><div class="mt">${resTable(res)}</div>`;
    if (ok) {
      const s = store.get('sqlSolved', {});
      if (!s[cur.id]) { s[cur.id] = todayKey(); store.set('sqlSolved', s); Game.gain(15, 'Ejercicio SQL resuelto', 'sql'); if (Object.keys(s).length >= 5) Game.award('sql5'); }
      const next = SQL_EX[SQL_EX.indexOf(cur) + 1];
      if (next) out.insertAdjacentHTML('beforeend', `<div class="row mt"><a class="btn btn-sm btn-soft" href="#/sql/${next.id}">Siguiente ejercicio ${icon('arrowR')}</a></div>`);
    }
  },
});
