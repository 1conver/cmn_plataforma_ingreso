/* Vistas: Inicio, Programa, Teoría, Videos, Biblioteca e Ingreso */
'use strict';

const pill = (p, long = true) => `<span class="tag pil pil-${p}">${p}${long ? ' · ' + esc(pilarName(p)) : ''}</span>`;
const origenTag = o => o === 'M' ? '<span class="tag tag-warn" title="Solo figura en el Modelo de Examen">Modelo</span>' : o === 'P' ? '<span class="tag" title="Solo figura en el Programa 2015">Programa</span>' : '';
const STATS = () => Object.assign({ exams: 0, best: null, history: [], lastWrong: [], topics: {}, subOk: 0, subTotal: 0, subStreak: 0, subBestStreak: 0 }, store.get('stats', {}));
const allItems = () => PROGRAMA.flatMap(p => p.items.map(i => ({ ...i, p: p.id })));
const temas = () => store.get('temas', {});
const epById = id => (window.PODCASTS || []).find(e => e.id === id);
const podState = () => store.get('pod', {});

function progressPilar(id) {
  const t = temas(), p = PROGRAMA.find(x => x.id === id);
  const done = p.items.filter(i => t[i.id]).length;
  return { done, total: p.items.length, pct: done / p.items.length };
}
function progressTotal() {
  const t = temas(), it = allItems();
  return { done: it.filter(i => t[i.id]).length, total: it.length };
}

/* ============================== INICIO ============================== */
App.view('inicio', {
  title: 'Inicio', icon: 'home',
  render(el) {
    const st = STATS(), pt = progressTotal(), r = Game.rank(), ps = podState();
    const eps = window.PODCASTS || [];
    const heard = eps.filter(e => ps[e.id]?.done).length;
    const known = Object.keys(store.get('cardsKnown', {})).length;
    const lastPod = store.get('podLast', null);
    const contEp = (lastPod && epById(lastPod)) || eps.find(e => !ps[e.id]?.done) || eps[0];
    const now = new Date();
    const inscOpen = now < new Date(EXAMEN.inscripcionCierre + 'T23:59:59-03:00');
    const weak = Object.entries(st.topics || {}).filter(([, v]) => v.n >= 2).map(([t, v]) => [t, v.ok / v.n, v.n]).sort((a, b) => a[1] - b[1]).slice(0, 5);
    const today = todayKey();
    el.innerHTML = `
      <section class="hero">
        <div>
          <div class="eyebrow">Ingreso 2027 · Oficial del Cuerpo Profesional</div>
          <h1>Sistema de <em>Computación de Datos</em>: preparación integral</h1>
          <p>Programa oficial + Modelo de Examen, con podcast, simulacros, laboratorios y juegos. Todo tu progreso se guarda en este dispositivo.</p>
          <div class="row mt">
            ${contEp ? `<button class="btn btn-primary" id="btnCont">${icon('headphones')} ${ps[contEp.id]?.pos ? 'Seguir escuchando' : 'Escuchar'}: ${esc(contEp.titulo.split(':')[0])}</button>` : ''}
            <a class="btn" href="#/simulacro">${icon('exam')} Rendir simulacro</a>
            <a class="btn btn-ghost" href="#/arcade">${icon('gamepad')} Jugar</a>
          </div>
        </div>
        <div>
          <div class="countdown" id="cd">${['días', 'horas', 'min', 'seg'].map(l => `<div class="cd-cell"><div class="cd-num">--</div><div class="cd-lbl">${l}</div></div>`).join('')}</div>
          <div class="cd-note">Exámenes de ingreso: 16 al 20 de noviembre de 2026 · El Palomar<br>${inscOpen ? `<span style="color:var(--amber)">La inscripción cierra el 2 de noviembre</span>` : 'Inscripción cerrada'}</div>
        </div>
      </section>

      <div class="grid g4 mt">
        <div class="kpi" style="--kc:var(--accent)"><div class="kpi-val" style="font-size:1.15rem">${esc(r.name)}</div><div class="kpi-lbl">${Game.st.xp.toLocaleString('es-AR')} XP</div><div class="bar thin xp mt" style="margin-top:8px"><i style="width:${(r.pct * 100).toFixed(0)}%"></i></div><div class="kpi-sub">${r.next ? `${r.toNext} XP para ${esc(r.next)}` : 'Rango máximo'}</div></div>
        <div class="kpi" style="--kc:var(--amber)"><div class="kpi-val">${Game.streak()} <span style="font-size:.9rem;color:var(--text-3)">días</span></div><div class="kpi-lbl">Racha de estudio</div><div class="kpi-sub">Hoy: ${Game.st.days[today] || 0} XP</div></div>
        <div class="kpi" style="--kc:var(--pD)"><div class="kpi-val">${Math.round(pt.done / pt.total * 100)}%</div><div class="kpi-lbl">Temario dominado</div><div class="kpi-sub">${pt.done}/${pt.total} puntos</div></div>
        <div class="kpi" style="--kc:var(--pB)"><div class="kpi-val">${st.best != null ? Number(st.best).toFixed(2) : '—'}</div><div class="kpi-lbl">Mejor simulacro</div><div class="kpi-sub">${st.exams || 0} rendidos · ${heard}/${eps.length} episodios · ${known} fichas</div></div>
      </div>

      <div class="grid g2 mt">
        <div class="card">
          <div class="card-head"><div class="card-title">${icon('target')} Misiones de hoy</div><span class="tag">+40 XP c/u · +60 bonus</span></div>
          <div class="stack-sm">${Game.missions().map(m => `
            <div class="mission ${m.done ? 'done' : ''}"><div class="mi">${icon(m.done ? 'check' : m.ic)}</div>
              <div style="flex:1"><div class="mt-t">${esc(m.t)}</div><div class="mt-s">${m.have}/${m.n}</div><div class="bar thin" style="margin-top:5px"><i style="width:${m.have / m.n * 100}%"></i></div></div></div>`).join('')}</div>
        </div>
        <div class="card">
          <div class="card-head"><div class="card-title">${icon('checklist')} Avance del temario</div><a class="btn btn-sm btn-ghost" href="#/programa">Ver programa ${icon('arrowR')}</a></div>
          <div class="stack">${PROGRAMA.map(p => { const g = progressPilar(p.id); return `
            <a href="#/programa/${p.id}" style="text-decoration:none;color:inherit"><div class="pbar-row">${pill(p.id, false)}<div><div class="lbl"><span>${esc(p.name)}</span><span class="dim mono">${g.done}/${g.total}</span></div><div class="bar" style="--bc:var(--p${p.id})"><i style="width:${g.pct * 100}%"></i></div></div><span class="mono dim" style="text-align:right">${Math.round(g.pct * 100)}%</span></div></a>`; }).join('')}</div>
        </div>
      </div>

      <div class="section-lbl">Plan de estudio hasta el examen</div>
      <div class="plan">${PLAN.map(w => {
        const d0 = new Date(w.desde + 'T00:00:00-03:00'), d1 = new Date(w.hasta + 'T23:59:59-03:00');
        const cls = now > d1 ? 'past' : now >= d0 ? 'now' : '';
        const f = d => d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
        return `<div class="plan-w ${cls}"><div class="pw-d">${f(d0)} – ${f(d1)}${cls === 'now' ? ' · <b style="color:var(--accent)">ESTA SEMANA</b>' : ''}</div><div class="pw-t">${esc(w.t)}</div><ul>${w.items.map(i => `<li>${esc(i)}</li>`).join('')}</ul></div>`;
      }).join('')}</div>

      <div class="grid g2 mt-lg">
        <div class="card">
          <div class="card-head"><div class="card-title">${icon('exam')} Últimos simulacros</div><a class="btn btn-sm btn-ghost" href="#/simulacro">Rendir</a></div>
          ${(st.history || []).length ? `<div class="list">${st.history.slice(0, 6).map(h => `<div class="li"><div class="li-main"><div class="li-t">${esc(h.m || 'Simulacro')}</div><div class="li-s">${esc(h.d)}</div></div><span class="tag ${h.n >= 6 ? 'tag-ok' : 'tag-bad'}">${Number(h.n).toFixed(2)}</span></div>`).join('')}</div>` : `<p class="muted">Todavía no rendiste simulacros. Empezá por el de tu pilar más flojo.</p>`}
        </div>
        <div class="card">
          <div class="card-head"><div class="card-title">${icon('alert')} Temas a reforzar</div><span class="card-sub">según tus simulacros</span></div>
          ${weak.length ? `<div class="list">${weak.map(([t, f, n]) => `<div class="li"><div class="li-main"><div class="li-t">${esc(t)}</div><div class="bar thin" style="--bc:${f < .5 ? 'var(--bad)' : f < .75 ? 'var(--warn)' : 'var(--ok)'};margin-top:6px"><i style="width:${f * 100}%"></i></div></div><span class="mono dim">${Math.round(f * 100)}% · ${n}</span></div>`).join('')}</div>` : `<p class="muted">Cuando rindas simulacros, acá aparecen los temas con menor porcentaje de acierto.</p>`}
        </div>
      </div>

      <div class="section-lbl">Medallas</div>
      <div class="medals">${MEDALS.map(m => `<div class="medal ${Game.st.medals[m.id] ? 'on' : ''}" title="${esc(m.d)}">${icon(m.ic)}<b>${esc(m.t)}</b><span>${esc(m.d)}</span></div>`).join('')}</div>

      <div class="section-lbl">Trampas frecuentes de examen</div>
      <div class="trap-grid">${TRAPS.map(([h, t]) => `<div class="trap">${icon('alert')}<span><b>${h}.</b> ${t}</span></div>`).join('')}</div>`;

    $('#btnCont')?.addEventListener('click', () => { Player.load(contEp.id, true); App.go('podcasts/' + contEp.id); });
    const target = new Date(EXAMEN.examenInicio).getTime();
    const tick = () => {
      const cells = $$('#cd .cd-num'); if (!cells.length) return;
      let s = Math.max(0, Math.floor((target - Date.now()) / 1000));
      const v = [Math.floor(s / 86400), Math.floor(s % 86400 / 3600), Math.floor(s % 3600 / 60), s % 60];
      cells.forEach((c, i) => c.textContent = String(v[i]).padStart(i ? 2 : 1, '0'));
    };
    tick();
    this._iv = setInterval(tick, 1000);
  },
  leave() { clearInterval(this._iv); },
});

/* ============================== PROGRAMA ============================== */
App.view('programa', {
  title: 'Programa oficial', icon: 'checklist',
  render(el, param) {
    const filt = store.get('progFilt', 'all');
    const draw = () => {
      const t = temas(), pt = progressTotal();
      el.innerHTML = `
        <div class="page-head"><div><div class="eyebrow">Estudiar</div><h1 class="title">Programa + Modelo de Examen</h1>
          <p class="lead">Los ${pt.total} puntos que se evalúan: los del Programa Intelectual de Ingreso (2015) más los que agrega el Modelo de Examen. Marcá cada uno solo cuando puedas explicarlo sin apuntes.</p></div>
          ${UI.ring(pt.done / pt.total)}</div>
        <div class="callout warn mb">${icon('info')}<div><b>Lo que el Modelo agrega y el Programa no menciona:</b> diagramas de flujo, pseudocódigo, resolución de problemas graficada, programación orientada a objetos, ejemplos de lenguajes y nuevas tendencias web. Están marcados como <span class="tag tag-warn">Modelo</span>.</div></div>
        <div class="row-between mb"><div class="chips" id="pf">${[['all', 'Todos'], ['todo', 'Pendientes'], ['M', 'Solo del Modelo']].map(([k, l]) => `<button class="chip ${filt === k ? 'on' : ''}" data-f="${k}">${l}</button>`).join('')}</div>
          <div class="row"><button class="btn btn-sm btn-ghost" id="markAll">Marcar todo</button><button class="btn btn-sm btn-danger" id="unmarkAll">Desmarcar todo</button></div></div>
        <div class="stack">${PROGRAMA.map(p => {
          const g = progressPilar(p.id);
          const items = p.items.filter(i => filt === 'all' || (filt === 'todo' && !t[i.id]) || (filt === 'M' && i.o === 'M'));
          if (!items.length) return '';
          return `<div class="card" id="pil-${p.id}" style="border-top:3px solid var(--p${p.id})">
            <div class="card-head"><div class="card-title">${pill(p.id, false)} ${esc(p.name)}</div><div class="row"><span class="mono dim">${g.done}/${g.total}</span><div class="bar" style="width:110px;--bc:var(--p${p.id})"><i style="width:${g.pct * 100}%"></i></div></div></div>
            <div>${items.map(i => {
              const ep = epById(i.ep), nv = VIDEOS.filter(v => v.pts.split(' ').includes(i.id)).length;
              return `<label class="check ${t[i.id] ? 'done' : ''}"><input type="checkbox" data-id="${i.id}" ${t[i.id] ? 'checked' : ''}>
                <div style="flex:1"><div class="check-txt"><span class="mono dim" style="font-size:.74rem;margin-right:6px">${i.id}</span>${esc(i.txt)} ${origenTag(i.o)}</div>
                <div class="row" style="gap:6px;margin-top:5px">
                  ${ep ? `<a class="tag tag-acc" href="#/podcasts/${ep.id}" onclick="event.stopPropagation()">${icon('headphones')} Episodio ${ep.id.toUpperCase()}</a>` : ''}
                  ${nv ? `<a class="tag" href="#/videos/${i.id}" onclick="event.stopPropagation()">${icon('video')} ${nv} video${nv > 1 ? 's' : ''}</a>` : ''}
                  <a class="tag" href="#/teoria/${p.id}" onclick="event.stopPropagation()">${icon('bulb')} Teoría</a>
                  <span class="dim" style="font-size:.72rem">${esc(i.src)}</span></div></div></label>`;
            }).join('')}</div></div>`;
        }).join('')}</div>`;
      $$('#pf .chip', el).forEach(b => b.onclick = () => { store.set("progFilt", b.dataset.f); this.render(el, param); });
      $$('input[type=checkbox]', el).forEach(c => c.onchange = () => {
        const tt = temas(); const id = c.dataset.id;
        if (c.checked) tt[id] = true; else delete tt[id];
        store.set('temas', tt);
        const xpd = store.get('temasXP', {});
        if (c.checked && !xpd[id]) { xpd[id] = 1; store.set('temasXP', xpd); Game.gain(10, 'Tema dominado'); }
        const p2 = progressTotal();
        if (p2.done / p2.total >= .5) Game.award('temario50');
        if (p2.done === p2.total) Game.award('temario100');
        draw();
      });
      $('#markAll').onclick = () => { if (!confirm('¿Marcar todo el temario como dominado?')) return; const tt = {}; allItems().forEach(i => tt[i.id] = true); store.set('temas', tt); draw(); };
      $('#unmarkAll').onclick = () => { if (!confirm('¿Desmarcar todo el temario?')) return; store.set('temas', {}); draw(); };
      if (param) { const tgt = $('#pil-' + param); if (tgt) setTimeout(() => tgt.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60); }
    };
    draw();
  },
});

/* ============================== TEORÍA ============================== */
App.view('teoria', {
  title: 'Teoría', icon: 'bulb',
  render(el, param) {
    const sel = param && TEORIA.find(t => t.p === param) ? param : store.get('teoriaP', 'A');
    const T = TEORIA.find(t => t.p === sel);
    store.set('teoriaP', sel);
    const comps = COMPENDIOS.filter(c => c.p === sel || (sel === 'C' && c.p === 'E'));
    el.innerHTML = `
      <div class="page-head"><div><div class="eyebrow">Estudiar</div><h1 class="title">Teoría por pilar</h1>
        <p class="lead">Síntesis de estudio que cubre el 100% del Programa y del Modelo. Leela después del episodio y antes de practicar.</p></div></div>
      <div class="chips mb">${TEORIA.map(t => `<a class="chip ${t.p === sel ? 'on' : ''}" href="#/teoria/${t.p}">${t.p} · ${esc(t.t.split(' ')[0] === 'Sistemas' ? 'Windows' : t.t.split(' ')[0])}</a>`).join('')}</div>
      <div class="card" style="border-top:3px solid var(--p${sel})">
        <div class="card-head"><div><div class="card-title">${pill(sel, false)} ${esc(T.t)}</div><div class="card-sub">Fuentes: ${esc(T.fuentes)}</div></div>
          <div class="row">
            <button class="btn btn-sm btn-soft" id="playPil">${icon('headphones')} Escuchar el pilar</button>
            <a class="btn btn-sm" href="#/videos/${sel}">${icon('video')} Videos</a>
            ${comps.map((c, i) => `<button class="btn btn-sm" data-comp="${i}">${icon('pdf')} Compendio ${c.p}</button>`).join('')}
          </div></div>
        <div class="grid g2" style="--pc:var(--p${sel})">${T.blocks.map(b => `<div class="kb" style="--pc:var(--p${sel})"><div class="kb-h">${esc(b.h)}</div><ul>${b.items.map(i => `<li>${i}</li>`).join('')}</ul></div>`).join('')}</div>
      </div>
      <div class="row mt">
        <a class="btn btn-sm" href="#/fichas/${{ A: 'redes', B: 'ad', C: 'prog', D: 'bd' }[sel]}">${icon('cards')} Fichas del pilar</a>
        <a class="btn btn-sm" href="#/simulacro">${icon('exam')} Simulacro</a>
        ${sel === 'A' ? `<a class="btn btn-sm" href="#/subneteo">${icon('net')} Practicar subneteo</a>` : ''}
        ${sel === 'C' ? `<a class="btn btn-sm" href="#/algoritmos">${icon('flow')} Laboratorio de algoritmos</a>` : ''}
        ${sel === 'D' ? `<a class="btn btn-sm" href="#/sql">${icon('sql')} Laboratorio SQL</a><a class="btn btn-sm" href="#/normalizacion">${icon('table')} Normalización</a>` : ''}
      </div>`;
    $('#playPil').onclick = () => { Player.playList((window.PODCASTS || []).filter(e => e.pilar === sel).map(e => e.id)); };
    $$('[data-comp]', el).forEach(b => b.onclick = () => { const c = comps[+b.dataset.comp]; UI.pdf(c.src, c.t + ' (síntesis propia)'); });
  },
});

/* ============================== VIDEOS ============================== */
App.view('videos', {
  title: 'Videoteca', icon: 'video', keepScroll: true,
  render(el, param) {
    const seen = () => store.get('vSeen', {});
    let fp = /^[ABCD]$/.test(param || '') ? param : 'ALL';
    let fpt = /^[ABCD]\d+$/.test(param || '') ? param : null;
    let q = '', onlyNew = false;
    const totalS = VIDEOS.reduce((a, v) => a + v.s, 0);
    el.innerHTML = `
      <div class="page-head"><div><div class="eyebrow">Estudiar</div><h1 class="title">Videoteca</h1>
        <p class="lead">${VIDEOS.length} clases en español, una o más por punto del temario. Verificadas el 09/10/2026: existen, se pueden reproducir embebidas y la duración es la real.</p></div>
        <div class="kpi" style="min-width:160px"><div class="kpi-val">${Math.round(totalS / 3600)} h</div><div class="kpi-lbl">de clases</div></div></div>
      <div class="card mb"><div class="row-between">
        <div class="chips" id="vf">${['ALL', 'A', 'B', 'C', 'D'].map(p => `<button class="chip" data-p="${p}">${p === 'ALL' ? 'Todos' : p + ' · ' + pilarName(p)}</button>`).join('')}</div>
        <div class="row" style="flex:1;min-width:220px;max-width:420px"><input class="inp" id="vq" placeholder="Buscar: FSMO, VLSM, pseudocódigo…" aria-label="Buscar videos"><label class="row nowrap" style="font-size:.8rem;gap:6px"><input type="checkbox" id="vnew" style="accent-color:var(--accent)"> No vistos</label></div>
      </div><div class="dim mt" id="vcount" style="font-size:.8rem"></div></div>
      <div class="grid gauto" id="vgrid"></div>`;
    const draw = () => {
      const sn = seen();
      $$('#vf .chip', el).forEach(c => c.classList.toggle('on', c.dataset.p === fp && !fpt));
      const qq = norm(q);
      const list = VIDEOS.filter(v => (fp === 'ALL' || v.p === fp) && (!fpt || v.pts.split(' ').includes(fpt)) && (!onlyNew || !sn[v.y]) &&
        (!qq || norm(v.t + ' ' + v.ch + ' ' + v.pts).includes(qq)));
      $('#vcount').innerHTML = `${list.length} videos${fpt ? ` del punto <b>${fpt}</b> · <a href="#/videos">ver todos</a>` : ''} · vistos ${Object.keys(sn).length}/${VIDEOS.length}`;
      $('#vgrid').innerHTML = list.map(v => `
        <div class="vcard">
          <div class="vthumb" data-y="${v.y}"><img loading="lazy" src="https://i.ytimg.com/vi/${v.y}/mqdefault.jpg" alt="">
            <span class="dur">${fmtTime(v.s)}</span><div class="play"><span>${icon('play')}</span></div>
            ${sn[v.y] ? `<span class="seen tag tag-ok">${icon('check')} visto</span>` : ''}</div>
          <div class="vbody"><div class="row" style="gap:5px">${pill(v.p, false)}${v.pts.split(' ').map(x => `<span class="tag">${x}</span>`).join('')}</div>
            <div class="vtitle">${esc(v.t)}</div><div class="vch">${esc(v.ch)}</div>
            <div class="vfoot"><button class="btn btn-sm btn-soft" data-play="${v.y}">${icon('play')} Ver</button>
              <a class="btn btn-sm btn-ghost" href="https://www.youtube.com/watch?v=${v.y}" target="_blank" rel="noopener">${icon('external')} YouTube</a>
              ${sn[v.y] ? '' : `<button class="btn btn-sm btn-ghost" data-seen="${v.y}">${icon('check')} Marcar visto</button>`}</div></div>
        </div>`).join('') || '<p class="muted">Sin resultados.</p>';
      $$('[data-play], .vthumb', el).forEach(b => b.onclick = () => openVideo(b.dataset.play || b.dataset.y));
      $$('[data-seen]', el).forEach(b => b.onclick = () => markSeen(b.dataset.seen));
    };
    const markSeen = y => { const s = seen(); if (!s[y]) { s[y] = todayKey(); store.set('vSeen', s); Game.gain(10, 'Video visto'); } draw(); };
    const openVideo = y => {
      const v = VIDEOS.find(x => x.y === y); if (!v) return;
      if (Player.audio && !Player.audio.paused) Player.audio.pause();
      UI.modal(v.t, `<div class="frame16"><iframe src="https://www.youtube-nocookie.com/embed/${v.y}?autoplay=1&rel=0" title="${esc(v.t)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>
        <div class="row-between mt"><div><b>${esc(v.ch)}</b> · ${fmtTime(v.s)} · Puntos ${esc(v.pts)}</div>
        <div class="row"><a class="btn btn-sm" href="https://www.youtube.com/watch?v=${v.y}" target="_blank" rel="noopener">${icon('external')} Abrir en YouTube</a><button class="btn btn-sm btn-primary" id="mSeen">${icon('check')} Lo vi</button></div></div>
        <p class="dim mt" style="font-size:.78rem">Si el reproductor no carga (bloqueadores o modo incógnito), abrilo directamente en YouTube.</p>`);
      $('#mSeen').onclick = () => { markSeen(y); UI.closeModal(); };
    };
    $$('#vf .chip', el).forEach(c => c.onclick = () => { fp = c.dataset.p; fpt = null; draw(); });
    $('#vq').oninput = e => { q = e.target.value; draw(); };
    $('#vnew').onchange = e => { onlyNew = e.target.checked; draw(); };
    draw();
  },
});

/* ============================== BIBLIOTECA ============================== */
App.view('biblioteca', {
  title: 'Biblioteca', icon: 'library',
  render(el) {
    const st = s => s === 'free' ? '<span class="st st-free">GRATUITO OFICIAL</span>' : s === 'loan' ? '<span class="st st-loan">PRÉSTAMO / VISTA PREVIA</span>' : '<span class="st st-nopdf">SIN PDF LEGAL</span>';
    el.innerHTML = `
      <div class="page-head"><div><div class="eyebrow">Estudiar</div><h1 class="title">Biblioteca y documentos</h1>
        <p class="lead">Documentos oficiales del CMN, compendios propios y acceso legítimo a cada libro que cita el Programa.</p></div></div>
      <div class="callout warn mb">${icon('info')}<div>Los <b>únicos PDF oficiales</b> de esta plataforma son el Programa y el Modelo de Examen (idénticos byte a byte a los que publica hoy colegiomilitar.mil.ar). Los cinco compendios son <b>síntesis de elaboración propia</b>. Los 14 libros del Programa son obras comerciales: ninguno tiene PDF original legal y gratuito; abajo está el acceso legítimo de cada uno.</div></div>
      <div class="section-lbl">Documentos oficiales</div>
      <div class="grid g2">${DOCS_OFICIALES.map((d, i) => `<div class="doc"><div class="doc-ico">PDF</div><div class="doc-main"><div class="doc-t">${esc(d.t)}</div><div class="doc-s">${esc(d.s)}</div></div>
        ${d.src ? `<button class="btn btn-sm btn-primary" data-doc="${i}">${icon('eye')} Ver</button>` : `<a class="btn btn-sm" href="${d.url}" target="_blank" rel="noopener">${icon('external')} Abrir</a>`}</div>`).join('')}</div>
      <div class="section-lbl">Compendios de estudio propios</div>
      <div class="grid g2">${COMPENDIOS.map((d, i) => `<div class="doc"><div class="doc-ico own">PDF</div><div class="doc-main"><div class="doc-t">${esc(d.t)}</div><div class="doc-s">${esc(d.s)}</div></div><button class="btn btn-sm" data-comp="${i}">${icon('eye')} Ver</button></div>`).join('')}</div>
      <div class="section-lbl">Los 14 títulos del Programa · acceso legítimo</div>
      <div class="table-wrap"><table class="tbl"><thead><tr><th>Obra</th><th>Editorial</th><th>Estado</th><th>Acceso</th></tr></thead><tbody>
        ${BIBLIO.map(b => `<tr><td><b>${esc(b.t)}</b><div class="dim" style="font-size:.78rem">${esc(b.au)}</div></td><td class="dim" style="font-size:.8rem">${esc(b.ed)}</td><td>${st(b.st)}</td>
          <td style="font-size:.8rem">${b.l.map(([t, u]) => `<a href="${u}" target="_blank" rel="noopener">${esc(t)}</a>`).join('<br>')}</td></tr>`).join('')}</tbody></table></div>
      <div class="section-lbl">Fuentes oficiales gratuitas equivalentes</div>
      <div class="grid g2">${['A', 'B', 'C', 'D'].map(p => `<div class="card flat"><div class="card-title mb">${pill(p)}</div><div class="stack-sm">${FUENTES_LIBRES.filter(f => f[2] === p).map(f => `<a href="${f[1]}" target="_blank" rel="noopener" class="row" style="gap:6px;text-decoration:none">${icon('external')}<span>${esc(f[0])}</span></a>`).join('')}</div></div>`).join('')}</div>`;
    $$('[data-doc]', el).forEach(b => b.onclick = () => { const d = DOCS_OFICIALES[b.dataset.doc]; UI.pdf(d.src, d.t + ' (oficial CMN)'); });
    $$('[data-comp]', el).forEach(b => b.onclick = () => { const d = COMPENDIOS[b.dataset.comp]; UI.pdf(d.src, d.t + ' (síntesis propia)'); });
  },
});

/* ============================== INGRESO ============================== */
const TABLA_FISICA = {
  M: { pts: [100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 25, 20, 15, 10, 5],
    brazos: [34, 32, 30, 28, 26, 24, 22, 20, 18, 16, 14, 12, 10, 9, 8, 7, 6, 5, 4, 3],
    tronco: [52, 50, 48, 46, 44, 42, 40, 38, 36, 34, 32, 30, 28, 27, 26, 25, 24, 23, 22, 21],
    t2000: ['8:00', '8:20', '8:40', '9:00', '9:20', '9:40', '10:00', '10:20', '10:40', '11:00', '11:20', '11:40', '12:00', '12:20', '12:40', '13:00', '13:20', '13:40', '14:00', '14:20'] },
  F: { pts: [100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 25, 20, 15, 10, 5],
    brazos: [24, 22, 20, 18, 16, 14, 12, 10, 9, 8, 7, 6, 5, null, 4, null, 3, null, 2, null],
    tronco: [42, 40, 38, 36, 34, 32, 30, 28, 26, 24, 22, 20, 18, 17, 16, 15, 14, 13, 12, 11],
    t2000: ['9:00', '9:20', '9:40', '10:00', '10:20', '10:40', '11:00', '11:20', '11:40', '12:00', '12:20', '12:40', '13:00', '13:20', '13:40', '14:00', '14:20', '14:40', '15:00', '15:20'] },
};
const toSec = s => { const m = String(s).trim().match(/^(\d{1,2})[:'.,\s]?(\d{1,2})?$/); return m ? (+m[1]) * 60 + (+(m[2] || 0)) : NaN; };
function puntajeFisico(sexo, brazos, tronco, t2000) {
  const T = TABLA_FISICA[sexo];
  const repPts = (arr, v) => { if (isNaN(v)) return null; for (let i = 0; i < arr.length; i++) if (arr[i] != null && v >= arr[i]) return T.pts[i]; return 0; };
  const timePts = s => { if (isNaN(s)) return null; for (let i = 0; i < T.t2000.length; i++) if (s <= toSec(T.t2000[i])) return T.pts[i]; return 0; };
  const a = repPts(T.brazos, brazos), b = repPts(T.tronco, tronco), c = timePts(t2000);
  const parts = [a, b, c].filter(x => x !== null);
  return { a, b, c, prom: parts.length === 3 ? Math.round((a + b + c) / 3 * 10) / 10 : null };
}
const CHK_INGRESO = [
  ['Inscripción', ['Preinscripción online con cuenta Gmail y documentación cargada', 'Documentación aprobada por el Departamento Incorporación', 'Pago del arancel administrativo ($ 38.000, por eRecauda)', 'Comprobante de pago subido a la plataforma SIU', 'Mail de INSCRIPCIÓN APROBADA']],
  ['Estudios médicos (carpeta con folios numerados, en sobre con tus datos)', ['Electrocardiograma con informe', 'Ecocardiograma doppler con informe', 'Audiometría con informe', 'Rx columna lumbosacra frente y perfil, Rx tórax frente y espinograma (con informe)', 'Laboratorio completo (validez 60 días)', 'Espirometría con informe', 'Electroencefalograma con informe']],
  ['Documentación en papel (si ingresás)', ['Certificado de Reincidencia (RNR) de menos de 6 meses', 'Dos copias del DUPIE', 'Tres copias del DNI y dos de la constancia de CUIL', 'Dos copias legalizadas del acta de nacimiento', 'Dos copias del título o constancia de título en trámite']],
];
App.view('ingreso', {
  title: 'Ingreso', icon: 'flag',
  render(el) {
    const chk = store.get('ingresoChk', {});
    const fis = store.get('fisico', { sexo: 'M', hist: [] });
    const examD = new Date(EXAMEN.examenInicio);
    const labDesde = new Date(examD.getTime() - 60 * 864e5);
    const f = d => d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' });
    el.innerHTML = `
      <div class="page-head"><div><div class="eyebrow">Ingreso 2027</div><h1 class="title">Todo lo que no es teoría</h1>
        <p class="lead">Fechas, estructura de los exámenes, calculadora de aptitud física con la tabla oficial y checklists. Fuente: Guía de Ingreso Profesionales y página oficial (consultadas el 09/10/2026).</p></div></div>
      <div class="grid g4">
        <div class="kpi" style="--kc:var(--amber)"><div class="kpi-val" style="font-size:1.2rem">2 nov</div><div class="kpi-lbl">Cierre de inscripción</div></div>
        <div class="kpi" style="--kc:var(--bad)"><div class="kpi-val" style="font-size:1.2rem">16–20 nov</div><div class="kpi-lbl">Exámenes (presencial, El Palomar)</div></div>
        <div class="kpi" style="--kc:var(--pB)"><div class="kpi-val" style="font-size:1.2rem">Feb 2027</div><div class="kpi-lbl">Inicio del curso (4 meses, internado)</div></div>
        <div class="kpi" style="--kc:var(--accent)"><div class="kpi-val" style="font-size:1.05rem">Subteniente SCD</div><div class="kpi-lbl">Oficial Informático EC · jun 2027</div></div>
      </div>
      <div class="section-lbl">Exámenes intelectuales (según la Guía de Ingreso vigente)</div>
      <div class="grid g3">${EXAMEN.intelectuales.map(x => `<div class="card"><div class="card-title">${icon(x.ic)} ${esc(x.t)}</div><div class="kpi-val mt" style="font-size:1.4rem">${x.min}′</div><p class="muted" style="font-size:.86rem;margin-top:6px">${esc(x.d)}</p></div>`).join('')}</div>
      <div class="callout info mt">${icon('info')}<div>El <b>Programa (2015)</b> y el <b>Modelo de Examen</b> describen "tres momentos: escrito, oral y práctico" y un escrito de <b>120 minutos</b>. La <b>Guía vigente</b> lista dos escritos de 90′ y un práctico de 90′. Por eso la plataforma ofrece simulacros de 90′ por área, un integral de 120′ y práctica de mesa oral. Además: examen psicotécnico, circuito médico y entrevista personal. El ingreso es por <b>orden de mérito</b>.</div></div>

      <div class="section-lbl">Calculadora de aptitud física · tabla oficial</div>
      <div class="grid g2">
        <div class="card">
          <div class="card-head"><div class="card-title">${icon('run')} Registrá una marca</div><div class="seg" id="sx"><button data-s="M">Masculino</button><button data-s="F">Femenino</button></div></div>
          <div class="grid g3">
            <label class="field"><span>Flexo-extensión de brazos (1′30″)</span><input class="inp mono" id="fb" type="number" min="0" inputmode="numeric" placeholder="reps"></label>
            <label class="field"><span>Flexión de tronco (1′30″)</span><input class="inp mono" id="ft" type="number" min="0" inputmode="numeric" placeholder="reps"></label>
            <label class="field"><span>Carrera 2000 m (min:seg)</span><input class="inp mono" id="fc" placeholder="10:30"></label>
          </div>
          <div class="grid g4 mt" id="fres"></div>
          <div class="row mt"><button class="btn btn-primary" id="fsave">${icon('check')} Guardar marca</button><span class="dim" style="font-size:.78rem">La nota final es el promedio de las 3 pruebas (0 a 100).</span></div>
          <p class="dim mt" style="font-size:.76rem">La Guía no publica un mínimo para Analistas; para Educación Física exige 40 puntos por prueba. Tomalo como referencia y apuntá alto: el ingreso es por orden de mérito.</p>
        </div>
        <div class="card">
          <div class="card-head"><div class="card-title">${icon('steps')} Tu evolución</div></div>
          <div id="fhist"></div>
        </div>
      </div>

      <div class="section-lbl">Checklists</div>
      <div class="callout warn mb">${icon('clock')}<div>El laboratorio vale <b>60 días</b>: para la semana de exámenes tiene que estar hecho <b>después del ${f(labDesde)}</b>. El resto de los estudios vale un año. Sin estudios completos no podés rendir los exámenes físicos.</div></div>
      <div class="grid g3">${CHK_INGRESO.map(([h, items], gi) => `<div class="card"><div class="card-title mb">${esc(h)}</div>${items.map((t, i) => { const k = gi + '_' + i; return `<label class="check ${chk[k] ? 'done' : ''}"><input type="checkbox" data-k="${k}" ${chk[k] ? 'checked' : ''}><span class="check-txt">${esc(t)}</span></label>`; }).join('')}</div>`).join('')}</div>

      <div class="section-lbl">Requisitos y aptitud</div>
      <div class="grid g2">
        <div class="kb"><div class="kb-h">Requisitos para Analistas de Sistemas</div><ul>
          <li><b>Edad máxima:</b> 27 años.</li><li><b>Título habilitante</b> (terciario o superior). Se admite inscripción condicional cursando el último semestre, con título o constancia en trámite al inicio del curso.</li>
          <li>Argentino/a nativo/a o por opción; soltero/a, casado/a o divorciado/a.</li><li><b>Estatura mínima:</b> 1,60 m (varones) · 1,55 m (mujeres).</li></ul></div>
        <div class="kb"><div class="kb-h">Circuito médico: lo que más se mira</div><ul>
          <li><b>IMC</b> entre 18 y 30 (calculalo en el laboratorio de algoritmos, ejercicio al15).</li><li><b>Agudeza visual</b> ≥ 7/10 con o sin corrección; discromatopsia y estrabismo son no aptos.</li>
          <li>Pérdida auditiva mayor al 10%, escoliosis con Cobb mayor a 10°, tatuajes en zonas visibles: revisalos con tiempo.</li><li>Clasificación: Apto, Apto condicional o No apto para el ingreso.</li></ul></div>
      </div>
      <div class="row mt">
        <a class="btn" href="https://www.colegiomilitar.mil.ar/esp/oferta-academica_oficial-cuerpo-profesional.php" target="_blank" rel="noopener">${icon('external')} Página oficial</a>
        <a class="btn" href="https://preinscripcion.colegiomilitar.mil.ar" target="_blank" rel="noopener">${icon('external')} Preinscripción</a>
        <a class="btn btn-ghost" href="https://www.colegiomilitar.mil.ar/guia/CMN-Guia-de-ingreso_Profesionales.pdf" target="_blank" rel="noopener">${icon('pdf')} Guía de ingreso</a>
      </div>`;

    const sx = () => fis.sexo;
    const drawSx = () => $$('#sx button').forEach(b => b.classList.toggle('on', b.dataset.s === sx()));
    const calc = () => {
      const r = puntajeFisico(sx(), parseInt($('#fb').value, 10), parseInt($('#ft').value, 10), toSec($('#fc').value));
      const cell = (v, l) => `<div class="kpi" style="--kc:${v == null ? 'var(--border-2)' : v >= 70 ? 'var(--ok)' : v >= 40 ? 'var(--warn)' : 'var(--bad)'}"><div class="kpi-val" style="font-size:1.3rem">${v ?? '—'}</div><div class="kpi-lbl">${l}</div></div>`;
      $('#fres').innerHTML = cell(r.a, 'Brazos') + cell(r.b, 'Tronco') + cell(r.c, '2000 m') + cell(r.prom, 'Promedio');
      return r;
    };
    const drawHist = () => {
      const h = fis.hist || [];
      if (!h.length) { $('#fhist').innerHTML = '<p class="muted">Guardá tu primera marca para ver la evolución. Entrená con anticipación: la Guía lo recomienda por razones médicas.</p>'; return; }
      const W = 420, H = 120, max = 100;
      const pts = h.slice(-12).map((x, i, a) => [a.length === 1 ? W / 2 : 20 + i * (W - 40) / (a.length - 1), H - 12 - x.prom / max * (H - 24)]);
      $('#fhist').innerHTML = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto"><path d="M20 ${H - 12 - 40 / max * (H - 24)}H${W - 20}" stroke="var(--warn)" stroke-dasharray="4 4" opacity=".6"/><text x="${W - 20}" y="${H - 16 - 40 / max * (H - 24)}" text-anchor="end" font-size="10" fill="var(--text-3)" font-family="JetBrains Mono">40</text>
        <polyline fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linejoin="round" points="${pts.map(p => p.join(',')).join(' ')}"/>${pts.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="var(--accent)"/>`).join('')}</svg>
        <div class="list mt">${h.slice(-5).reverse().map(x => `<div class="li"><div class="li-main"><div class="li-t">${x.prom} pts</div><div class="li-s">${esc(x.d)} · brazos ${x.b} · tronco ${x.t} · 2000 m ${esc(x.c)}</div></div></div>`).join('')}</div>`;
    };
    $$('#sx button').forEach(b => b.onclick = () => { fis.sexo = b.dataset.s; store.set('fisico', fis); drawSx(); calc(); });
    ['#fb', '#ft', '#fc'].forEach(s => $(s).oninput = calc);
    $('#fsave').onclick = () => {
      const r = calc();
      if (r.prom == null) { UI.toast('Completá las tres pruebas (2000 m como 10:30).', '', 'alert'); return; }
      fis.hist = fis.hist || [];
      fis.hist.push({ d: new Date().toLocaleDateString('es-AR'), b: $('#fb').value, t: $('#ft').value, c: $('#fc').value, prom: r.prom });
      store.set('fisico', fis);
      Game.gain(15, 'Marca física registrada');
      drawHist();
    };
    $$('[data-k]', el).forEach(c => c.onchange = () => { const k = c.dataset.k; if (c.checked) chk[k] = 1; else delete chk[k]; store.set('ingresoChk', chk); c.closest('.check').classList.toggle('done', c.checked); });
    drawSx(); calc(); drawHist();
  },
});
