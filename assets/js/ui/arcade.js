/* Arcade: juegos de repaso */
'use strict';

const GAMES = [
  { id: 'orden', t: 'Ordená la secuencia', d: 'Capas OSI, DORA, orden del SELECT, formas normales, fases del compilador… tocá los elementos en el orden correcto.', ic: 'list', c: 'var(--pA)' },
  { id: 'match', t: 'Emparejá', d: 'Roles FSMO, puertos, registros DNS, símbolos de flujo, notación UML: uní cada concepto con su definición.', ic: 'link', c: 'var(--pB)' },
  { id: 'vf', t: 'V/F relámpago', d: '60 segundos de verdadero o falso. Las rachas multiplican el puntaje. Teclas ← y →.', ic: 'bolt', c: 'var(--amber)' },
  { id: 'quien', t: '¿Quién soy?', d: 'Pistas cada vez más fáciles: cuanto antes adivines, más puntos.', ic: 'chat', c: 'var(--pC)' },
  { id: 'subred', t: 'Subneteo exprés', d: '60 segundos: red, broadcast, máscara o hosts. Elegí rápido.', ic: 'net', c: 'var(--pD)' },
  { id: 'rastreo', t: 'Rastreá el algoritmo', d: 'Prueba de escritorio en modo juego: ¿qué muestra este pseudocódigo con estas entradas?', ic: 'flow', c: 'var(--accent)' },
];

const Arcade = {
  key: null,
  finish(g, score, extra = '') {
    score = Math.max(0, Math.round(score));
    const rec = Game.setBest(g.id, score);
    const xp = Math.round(score / 8);
    Game.gain(xp, `${g.t}: ${score} pts`, 'game');
    if (rec && score > 0) UI.confetti();
    return `<div class="card" style="text-align:center;padding:30px 20px">
      <div class="eyebrow" style="justify-content:center">${rec && score > 0 ? '¡Nuevo récord!' : 'Fin de la partida'}</div>
      <div class="kpi-val" style="font-size:3rem">${score}<span class="dim" style="font-size:1rem"> pts</span></div>
      <p class="muted">Récord: ${Game.st.best[g.id] || 0} · +${xp} XP</p>${extra}
      <div class="row mt" style="justify-content:center"><button class="btn btn-primary" id="again">${icon('refresh')} Jugar otra vez</button><a class="btn" href="#/arcade">${icon('gamepad')} Otros juegos</a></div></div>`;
  },
  head(g, stats = '') {
    return `<div class="gbar"><div class="row"><a class="btn btn-sm btn-ghost" href="#/arcade">${icon('arrowL')}</a><h2 class="h2">${esc(g.t)}</h2></div><div class="gstat" id="gstat">${stats}</div></div>`;
  },
};

App.view('arcade', {
  title: 'Arcade', icon: 'gamepad',
  render(el, param) {
    this.leave();
    const [gid, sub] = (param || '').split('/');
    const g = GAMES.find(x => x.id === gid);
    if (!g) return this.hub(el);
    this['g_' + g.id](el, g, sub);
  },
  leave() { clearInterval(this._iv); if (Arcade.key) { document.removeEventListener('keydown', Arcade.key); Arcade.key = null; } },
  hub(el) {
    el.innerHTML = `
      <div class="page-head"><div><div class="eyebrow">Practicar</div><h1 class="title">Arcade</h1>
        <p class="lead">Repaso en modo juego. Cada partida suma XP y cuenta para las misiones del día. Ideal para 5 minutos entre bloques de estudio.</p></div></div>
      <div class="grid g3">${GAMES.map(g => `<a class="game-card" href="#/arcade/${g.id}" style="--gc:${g.c};text-decoration:none"><div class="game-ico">${icon(g.ic)}</div><h3>${esc(g.t)}</h3><p>${esc(g.d)}</p><span class="best">${Game.st.best[g.id] ? `Récord: ${Game.st.best[g.id]} pts` : 'Sin partidas todavía'}</span></a>`).join('')}</div>`;
  },

  /* ---------- Ordená ---------- */
  g_orden(el, g, deckId) {
    const deck = ORDER_DECKS.find(d => d.id === deckId) || pick(ORDER_DECKS, 1)[0];
    let next = 0, miss = 0; const t0 = Date.now();
    el.innerHTML = Arcade.head(g, `<span>Errores <b id="miss">0</b></span><span><b id="secs">0</b> s</span>`) + `
      <div class="chips mb">${ORDER_DECKS.map(d => `<a class="chip ${d.id === deck.id ? 'on' : ''}" href="#/arcade/orden/${d.id}">${esc(d.t)}</a>`).join('')}</div>
      <div class="card" id="gBody"><div class="row-between mb"><h3 class="h3">${pill(deck.p, false)} ${esc(deck.t)}</h3><span class="dim" style="font-size:.8rem">Tocá en orden</span></div>
        <div class="order-slots" id="slots"></div><div class="tiles" id="tiles">${shuffle(deck.items.map((t, i) => ({ t, i }))).map(x => `<button class="tile" data-i="${x.i}">${esc(x.t)}</button>`).join('')}</div></div>`;
    this._iv = setInterval(() => { const s = $('#secs'); if (s) s.textContent = Math.round((Date.now() - t0) / 1000); }, 500);
    $$('.tile', el).forEach(b => b.onclick = () => {
      if (+b.dataset.i === next) {
        b.classList.add('gone'); next++;
        $('#slots').insertAdjacentHTML('beforeend', `<span class="slot"><i>${next}</i>${esc(deck.items[next - 1])}</span>`);
        if (next === deck.items.length) {
          clearInterval(this._iv);
          const s = (Date.now() - t0) / 1000, n = deck.items.length;
          const score = Math.max(10, 100 - miss * 12 - Math.max(0, s - n * 2.5));
          if (deck.id === 'osi' && miss === 0 && s <= 15) Game.award('osi');
          $('#gBody').innerHTML = Arcade.finish(g, score, `<p class="dim">${n} elementos · ${miss} errores · ${s.toFixed(1)} s</p>`);
          $('#again').onclick = () => this.g_orden(el, g, deck.id);
        }
      } else { miss++; $('#miss').textContent = miss; b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); }
    });
  },

  /* ---------- Emparejá ---------- */
  g_match(el, g, deckId) {
    const deck = MATCH_DECKS.find(d => d.id === deckId) || pick(MATCH_DECKS, 1)[0];
    const pairs = pick(deck.pairs, Math.min(6, deck.pairs.length));
    let sel = null, done = 0, miss = 0; const t0 = Date.now();
    el.innerHTML = Arcade.head(g, `<span>Errores <b id="miss">0</b></span><span><b id="secs">0</b> s</span>`) + `
      <div class="chips mb">${MATCH_DECKS.map(d => `<a class="chip ${d.id === deck.id ? 'on' : ''}" href="#/arcade/match/${d.id}">${esc(d.t)}</a>`).join('')}</div>
      <div class="card" id="gBody"><div class="row-between mb"><h3 class="h3">${pill(deck.p, false)} ${esc(deck.t)}</h3><span class="dim" style="font-size:.8rem">Elegí uno de cada columna</span></div>
        <div class="match-cols"><div class="stack-sm">${shuffle(pairs.map((p, i) => ({ t: p[0], i }))).map(x => `<button class="tile" data-side="L" data-i="${x.i}">${esc(x.t)}</button>`).join('')}</div>
        <div class="stack-sm">${shuffle(pairs.map((p, i) => ({ t: p[1], i }))).map(x => `<button class="tile" data-side="R" data-i="${x.i}">${esc(x.t)}</button>`).join('')}</div></div></div>`;
    this._iv = setInterval(() => { const s = $('#secs'); if (s) s.textContent = Math.round((Date.now() - t0) / 1000); }, 500);
    $$('.tile', el).forEach(b => b.onclick = () => {
      if (b.classList.contains('done')) return;
      if (!sel || sel.dataset.side === b.dataset.side) { if (sel) sel.classList.remove('sel'); sel = b; b.classList.add('sel'); return; }
      if (sel.dataset.i === b.dataset.i) {
        sel.classList.remove('sel'); sel.classList.add('done'); b.classList.add('done'); done++;
        if (done === pairs.length) {
          clearInterval(this._iv);
          const s = (Date.now() - t0) / 1000;
          const score = Math.max(10, 100 - miss * 10 - Math.max(0, s - pairs.length * 4));
          $('#gBody').innerHTML = Arcade.finish(g, score, `<p class="dim">${pairs.length} pares · ${miss} errores · ${s.toFixed(1)} s</p>`);
          $('#again').onclick = () => this.g_match(el, g, deck.id);
        }
      } else {
        miss++; $('#miss').textContent = miss;
        [sel, b].forEach(x => { x.classList.remove('shake', 'sel'); void x.offsetWidth; x.classList.add('shake'); });
      }
      sel = null;
    });
  },

  /* ---------- V/F relámpago ---------- */
  g_vf(el, g) {
    const deck = shuffle(BLITZ); let i = 0, score = 0, streak = 0, left = 60; const errs = [];
    el.innerHTML = Arcade.head(g, `<span>Puntos <b id="pts">0</b></span><span>Racha <b id="stk">0</b></span><span class="timer-ring" id="clk">60</span>`) + `
      <div class="card" id="gBody" style="max-width:720px;margin:0 auto"><div class="blitz-card" id="bc"></div>
        <div class="grid g2 mt"><button class="btn btn-block" id="bF" style="min-height:58px;font-size:1rem;border-color:var(--bad);color:var(--bad)">${icon('x')} Falso</button><button class="btn btn-block" id="bV" style="min-height:58px;font-size:1rem;border-color:var(--ok);color:var(--ok)">${icon('check')} Verdadero</button></div>
        <p class="dim mt" style="text-align:center;font-size:.78rem">Teclado: <kbd>←</kbd> Falso · <kbd>→</kbd> Verdadero</p></div>`;
    const show = () => { $('#bc').textContent = deck[i % deck.length][0]; };
    const answer = v => {
      if (left <= 0) return;
      const [txt, truth, ex] = deck[i % deck.length];
      const bc = $('#bc'); bc.classList.remove('flash-ok', 'flash-bad'); void bc.offsetWidth;
      if (v === truth) { streak++; score += 10 * Math.min(4, 1 + Math.floor(streak / 3)); bc.classList.add('flash-ok'); }
      else { streak = 0; errs.push([txt, truth, ex]); bc.classList.add('flash-bad'); }
      $('#pts').textContent = score; $('#stk').textContent = streak; i++; show();
    };
    $('#bV').onclick = () => answer(true); $('#bF').onclick = () => answer(false);
    Arcade.key = e => { if (e.key === 'ArrowRight') answer(true); if (e.key === 'ArrowLeft') answer(false); };
    document.addEventListener('keydown', Arcade.key);
    show();
    this._iv = setInterval(() => {
      left--; const c = $('#clk'); if (!c) return clearInterval(this._iv);
      c.textContent = left; c.classList.toggle('low', left <= 10);
      if (left <= 0) {
        clearInterval(this._iv); document.removeEventListener('keydown', Arcade.key); Arcade.key = null;
        $('#gBody').innerHTML = Arcade.finish(g, score, `<p class="dim">${i} respuestas · ${i - errs.length} correctas</p>${errs.length ? `<div class="kb mt" style="text-align:left"><div class="kb-h">Para repasar</div><ul>${errs.map(([t, v, x]) => `<li><b>${v ? 'Verdadero' : 'Falso'}:</b> ${esc(t)} <span class="dim">— ${esc(x)}</span></li>`).join('')}</ul></div>` : ''}`);
        $('#again').onclick = () => this.g_vf(el, g);
      }
    }, 1000);
  },

  /* ---------- ¿Quién soy? ---------- */
  g_quien(el, g) {
    const rounds = pick(RIDDLES, 8); let r = 0, score = 0;
    el.innerHTML = Arcade.head(g, `<span>Ronda <b id="rnd">1</b>/8</span><span>Puntos <b id="pts">0</b></span>`) + `<div class="card" id="gBody" style="max-width:760px;margin:0 auto"></div>`;
    const round = () => {
      const R = rounds[r]; let shown = 1;
      const others = RIDDLES.filter(x => x !== R);
      const same = shuffle(others.filter(x => x.p === R.p)), diff = shuffle(others.filter(x => x.p !== R.p));
      const opts = shuffle([R.a, ...same.concat(diff).slice(0, 3).map(x => x.a)]);
      const draw = () => {
        $('#gBody').innerHTML = `<div class="row-between mb">${pill(R.p)}<span class="tag">vale ${5 - shown} pts</span></div>
          <div class="clues">${R.c.slice(0, shown).map((c, k) => `<div class="clue"><b>Pista ${k + 1}</b>${esc(c)}</div>`).join('')}</div>
          <div class="tiles mt">${opts.map(o => `<button class="tile" data-o="${esc(o)}">${esc(o)}</button>`).join('')}</div>
          <div class="row mt"><button class="btn btn-sm" id="more" ${shown >= 4 ? 'disabled' : ''}>${icon('bulb')} Otra pista</button></div>`;
        $('#more').onclick = () => { shown++; draw(); };
        $$('.tile', $('#gBody')).forEach(b => b.onclick = () => {
          const ok = b.dataset.o === R.a; const pts = ok ? 5 - shown : 0; score += pts;
          $$('.tile', $('#gBody')).forEach(x => { x.disabled = true; if (x.dataset.o === R.a) x.classList.add('done'); });
          if (!ok) b.classList.add('shake');
          $('#pts').textContent = score;
          $('#gBody').insertAdjacentHTML('beforeend', `<div class="fb ${ok ? 'ok' : 'bad'} mt"><b>${ok ? `¡Sí! +${pts}` : 'Era: ' + esc(R.a)}</b></div><div class="row mt"><button class="btn btn-primary" id="nx">${r < 7 ? 'Siguiente' : 'Ver resultado'} ${icon('arrowR')}</button></div>`);
          $('#nx').onclick = () => { r++; if (r < 8) { $('#rnd').textContent = r + 1; round(); } else { $('#gBody').innerHTML = Arcade.finish(g, score * 3, `<p class="dim">${score} de 32 pistas-puntos</p>`); $('#again').onclick = () => this.g_quien(el, g); } };
        });
      };
      draw();
    };
    round();
  },

  /* ---------- Subneteo exprés ---------- */
  g_subred(el, g) {
    let score = 0, left = 60, n = 0, ok = 0;
    el.innerHTML = Arcade.head(g, `<span>Puntos <b id="pts">0</b></span><span class="timer-ring" id="clk">60</span>`) + `<div class="card" id="gBody" style="max-width:720px;margin:0 auto"></div>`;
    const Q = { net: 'dirección de red', bc: 'broadcast', mask: 'máscara', hosts: 'cantidad de hosts útiles', first: 'primer host' };
    const ask = () => {
      const s = genSubnet('medium'); const k = pick(Object.keys(Q), 1)[0];
      const block = 2 ** (32 - s.p);
      let opts;
      if (k === 'hosts') opts = [s.hosts, 2 ** (32 - s.p), 2 ** (33 - s.p) - 2, Math.max(2, 2 ** (31 - s.p) - 2)].map(String);
      else if (k === 'mask') opts = [s.mask, intToIp(maskOf(Math.min(30, s.p + 1))), intToIp(maskOf(s.p - 1)), intToIp(maskOf(Math.min(30, s.p + 2)))];
      else { const base = ipToInt(s[k].split('.').map(Number)); opts = [s[k], intToIp(base + block), intToIp(base - block >>> 0), intToIp(k === 'bc' ? base - 1 : base + 1)]; }
      opts = shuffle([...new Set(opts)]);
      $('#gBody').innerHTML = `<div class="dim mono" style="font-size:.72rem">¿CUÁL ES LA ${Q[k].toUpperCase()}?</div><div class="target-ip mb">${s.ip}<span>/${s.p}</span></div>
        <div class="tiles">${opts.map(o => `<button class="tile mono" data-o="${o}">${o}</button>`).join('')}</div>`;
      $$('.tile', $('#gBody')).forEach(b => b.onclick = () => {
        if (left <= 0) return; n++;
        if (b.dataset.o === String(s[k])) { ok++; score += 10; b.classList.add('done'); }
        else { b.classList.add('shake'); }
        $('#pts').textContent = score; setTimeout(ask, 260);
      });
    };
    ask();
    this._iv = setInterval(() => {
      left--; const c = $('#clk'); if (!c) return clearInterval(this._iv);
      c.textContent = left; c.classList.toggle('low', left <= 10);
      if (left <= 0) { clearInterval(this._iv); $('#gBody').innerHTML = Arcade.finish(g, score, `<p class="dim">${ok}/${n} correctas</p>`); $('#again').onclick = () => this.g_subred(el, g); }
    }, 1000);
  },

  /* ---------- Rastreá el algoritmo ---------- */
  g_rastreo(el, g) {
    const rounds = pick(ALGOS, 5); let r = 0, score = 0;
    el.innerHTML = Arcade.head(g, `<span>Ronda <b id="rnd">1</b>/5</span><span>Puntos <b id="pts">0</b></span>`) + `<div class="card" id="gBody"></div>`;
    const outStr = res => res.out.filter(o => !o.in).map(o => o.t).join(' ⏎ ');
    const round = () => {
      const A = rounds[r]; const ins = genInputs(A.gen);
      let right; try { right = outStr(PSeInt.run(A.code, ins)); } catch (e) { r++; return r < 5 ? round() : null; }
      const set = new Set([right]); let tries = 0;
      while (set.size < 4 && tries++ < 40) { try { set.add(outStr(PSeInt.run(A.code, genInputs(A.gen)))); } catch (e) { /* ignorar */ } }
      while (set.size < 4) set.add(right.replace(/\d+/, m => String(+m + set.size)));
      const opts = shuffle([...set]);
      $('#gBody').innerHTML = `<div class="row-between mb"><h3 class="h3">${esc(A.t)}</h3><span class="tag">${esc(A.tema)}</span></div>
        <div class="grid g2"><pre class="code">${esc(A.code)}</pre><div><div class="field"><span>Entradas (en orden de lectura)</span><div class="code" style="white-space:normal">${ins.map(x => `<span class="tag" style="margin:2px">${x}</span>`).join(' ')}</div></div>
          <div class="dim mt" style="font-size:.8rem">¿Qué muestra en pantalla?</div><div class="stack-sm mt">${opts.map(o => `<button class="opt" data-o="${esc(o)}"><span class="mono" style="font-size:.84rem">${esc(o)}</span></button>`).join('')}</div></div></div>`;
      $$('.opt', $('#gBody')).forEach(b => b.onclick = () => {
        const ok = b.dataset.o === right;
        $$('.opt', $('#gBody')).forEach(x => { x.disabled = true; if (x.dataset.o === right) x.classList.add('ok'); });
        if (!ok) b.classList.add('bad'); else { score += 20; Game.gain(0, '', 'algo'); }
        $('#pts').textContent = score;
        $('#gBody').insertAdjacentHTML('beforeend', `<div class="row mt"><a class="btn btn-sm btn-ghost" href="#/algoritmos/${A.id}">${icon('flow')} Ver la prueba de escritorio</a><button class="btn btn-primary" id="nx">${r < 4 ? 'Siguiente' : 'Ver resultado'} ${icon('arrowR')}</button></div>`);
        $('#nx').onclick = () => { r++; if (r < 5) { $('#rnd').textContent = r + 1; round(); } else { $('#gBody').innerHTML = Arcade.finish(g, score); $('#again').onclick = () => this.g_rastreo(el, g); } };
      });
    };
    round();
  },
});
