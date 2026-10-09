/* Frecuencia CMN: reproductor persistente + vista de episodios */
'use strict';

const COVER = (p = 'I', size = 150) => `<svg viewBox="0 0 150 150" width="${size}" height="${size}" aria-hidden="true">
  <defs><linearGradient id="cg${p}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1d2a1f"/><stop offset="1" stop-color="#0b0f0d"/></linearGradient></defs>
  <rect width="150" height="150" fill="url(#cg${p})"/>
  <g fill="none" style="stroke:var(--p${p})" stroke-width="3" stroke-linecap="round" opacity=".9">
    <path d="M52 92a32 32 0 0 1 46 0"/><path d="M40 80a50 50 0 0 1 70 0" opacity=".7"/><path d="M28 68a68 68 0 0 1 94 0" opacity=".45"/></g>
  <circle cx="75" cy="104" r="7" fill="#f0b54a"/>
  <text x="75" y="34" text-anchor="middle" font-family="Space Grotesk, sans-serif" font-weight="700" font-size="15" fill="#e9eee9" letter-spacing="1.5">FRECUENCIA</text>
  <text x="75" y="134" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="700" font-size="13" fill="#a8c56f" letter-spacing="3">CMN · ${p === 'I' ? 'SCD' : p}</text></svg>`;

const Player = {
  audio: null, ep: null, list: [], speeds: [0.8, 1, 1.25, 1.5, 1.75, 2], tts: null,
  init() {
    this.audio = $('#audio');
    const a = this.audio;
    a.playbackRate = store.get('podSpeed', 1);
    a.addEventListener('timeupdate', () => this.onTime());
    a.addEventListener('play', () => this.paint());
    a.addEventListener('pause', () => { this.save(); this.paint(); });
    a.addEventListener('loadedmetadata', () => this.paint());
    a.addEventListener('ended', () => { this.complete(); this.next(); });
    a.addEventListener('error', () => {
      if (!this.ep) return;
      UI.toast('No se pudo cargar el audio. Podés escucharlo con la voz del navegador desde el episodio.', '', 'alert');
    });
    $('#plPlay').onclick = () => this.toggle();
    $('#plBack').onclick = () => this.skip(-15);
    $('#plFwd').onclick = () => this.skip(15);
    $('#plNext').onclick = () => this.next();
    $('#plSpeed').onclick = () => this.cycleSpeed();
    $('#plClose').onclick = () => this.close();
    $('#plInfo').onclick = () => this.ep && App.go('podcasts/' + this.ep.id);
    $('#plSeek').oninput = e => { if (a.duration) a.currentTime = e.target.value / 1000 * a.duration; };
    if ('mediaSession' in navigator) {
      const ms = navigator.mediaSession;
      ms.setActionHandler('play', () => a.play());
      ms.setActionHandler('pause', () => a.pause());
      ms.setActionHandler('seekbackward', () => this.skip(-15));
      ms.setActionHandler('seekforward', () => this.skip(15));
      ms.setActionHandler('nexttrack', () => this.next());
    }
    const last = store.get('podLast', null);
    if (last && epById(last)) this.load(last, false);
  },
  load(id, autoplay = true) {
    const ep = epById(id); if (!ep) return;
    this.stopTTS();
    if (this.ep && this.ep.id === id) { if (autoplay) this.audio.play().catch(() => {}); return; }
    this.save();
    this.ep = ep;
    store.set('podLast', id);
    this.audio.src = ep.file;
    const pos = podState()[id]?.pos || 0;
    this.audio.addEventListener('loadedmetadata', () => { if (pos && pos < (this.audio.duration || 1e9) - 5) this.audio.currentTime = pos; }, { once: true });
    this.audio.playbackRate = store.get('podSpeed', 1);
    $('#player').classList.add('on');
    document.documentElement.style.setProperty('--player-h', window.innerWidth <= 960 ? '112px' : '72px');
    $('#plArt').innerHTML = COVER(ep.pilar, 44);
    $('#plTitle').textContent = ep.titulo;
    $('#plSub').textContent = `${ep.id.toUpperCase()} · ${pilarName(ep.pilar)} · Lu y Tomi`;
    if ('mediaSession' in navigator) navigator.mediaSession.metadata = new MediaMetadata({ title: ep.titulo, artist: 'Frecuencia CMN · Lu y Tomi', album: 'Ingreso CMN · ' + pilarName(ep.pilar) });
    if (autoplay) this.audio.play().catch(() => UI.toast('Tocá play para empezar.', '', 'play'));
    this.paint();
    if (App.cur === 'podcasts') VIEWS.podcasts.refresh?.();
  },
  playList(ids) { if (!ids.length) return; this.list = ids; this.load(ids[0], true); UI.toast(`Reproduciendo ${ids.length} episodios seguidos`, '', 'headphones'); },
  toggle() { if (!this.ep) return; this.audio.paused ? this.audio.play().catch(() => {}) : this.audio.pause(); },
  skip(s) { if (this.audio.duration) this.audio.currentTime = clamp(this.audio.currentTime + s, 0, this.audio.duration - 0.5); },
  cycleSpeed() {
    const cur = this.audio.playbackRate; const i = this.speeds.indexOf(cur);
    const n = this.speeds[(i + 1) % this.speeds.length];
    this.audio.playbackRate = n; store.set('podSpeed', n); this.paint();
  },
  next() {
    const eps = window.PODCASTS || [];
    let ids = this.list.length ? this.list : eps.map(e => e.id);
    const i = ids.indexOf(this.ep?.id);
    if (i >= 0 && i < ids.length - 1) this.load(ids[i + 1], true);
    else { this.list = []; this.paint(); }
  },
  close() { this.save(); this.audio.pause(); this.stopTTS(); $('#player').classList.remove('on'); document.documentElement.style.setProperty('--player-h', '0px'); },
  save() {
    if (!this.ep || !this.audio.duration) return;
    const st = podState(); const s = st[this.ep.id] = st[this.ep.id] || {};
    s.pos = this.audio.currentTime >= this.audio.duration - 3 ? 0 : this.audio.currentTime;
    s.max = Math.max(s.max || 0, this.audio.currentTime / this.audio.duration);
    store.set('pod', st);
  },
  complete() {
    if (!this.ep) return;
    const st = podState(); const s = st[this.ep.id] = st[this.ep.id] || {};
    if (!s.done) {
      s.done = todayKey(); s.max = 1; s.pos = 0; store.set('pod', st);
      Game.gain(25, 'Episodio completo', 'pod');
      Game.award('pod1');
      if ((window.PODCASTS || []).every(e => st[e.id]?.done)) Game.award('pod_all');
    }
  },
  onTime() {
    const a = this.audio; if (!this.ep || !a.duration) return;
    const p = a.currentTime / a.duration;
    const seek = $('#plSeek'); seek.value = Math.round(p * 1000); seek.style.setProperty('--p', (p * 100).toFixed(1) + '%');
    $('#plCur').textContent = fmtTime(a.currentTime); $('#plDur').textContent = fmtTime(a.duration);
    if (p > 0.92) this.complete();
    if (Math.floor(a.currentTime) % 10 === 0) this.save();
    this.highlight(a.currentTime);
  },
  lineAt(t) { const L = this.ep.lines; let i = 0; for (let k = 0; k < L.length; k++) if (L[k].at != null && L[k].at <= t + 0.05) i = k; return i; },
  highlight(t) {
    const box = $('#transcript'); if (!box || box.dataset.ep !== this.ep.id) return;
    const i = this.lineAt(t);
    if (box.dataset.cur === String(i)) return;
    box.dataset.cur = i;
    $$('.tl', box).forEach((l, k) => l.classList.toggle('on', k === i));
    const el = box.children[i];
    if (el && !box.matches(':hover')) box.scrollTo({ top: el.offsetTop - box.offsetTop - 60, behavior: 'smooth' });
  },
  paint() {
    const playing = this.ep && !this.audio.paused;
    $('#plPlay').innerHTML = icon(playing ? 'pause' : 'play');
    $('#plPlay').setAttribute('aria-label', playing ? 'Pausar' : 'Reproducir');
    $('#plSpeed').textContent = this.audio.playbackRate + '×';
    $$('[data-ep-play]').forEach(b => { const me = this.ep && b.dataset.epPlay === this.ep.id; b.innerHTML = icon(me && playing ? 'pause' : 'play') + (b.dataset.label ? ' ' + (me && playing ? 'Pausar' : b.dataset.label) : ''); });
    $$('.ep').forEach(e => e.classList.toggle('playing', !!this.ep && e.dataset.id === this.ep.id));
  },
  /* respaldo: lectura con la voz del navegador */
  speak(ep, from = 0) {
    if (!('speechSynthesis' in window)) { UI.toast('Este navegador no tiene síntesis de voz.', '', 'alert'); return; }
    this.audio.pause(); this.stopTTS();
    const voices = speechSynthesis.getVoices().filter(v => /^es/i.test(v.lang));
    const pref = l => voices.find(v => v.lang.toLowerCase() === l);
    const vL = pref('es-ar') || pref('es-us') || pref('es-mx') || voices[0];
    const vT = voices.find(v => v !== vL && /es-ar|es-us|es-mx/i.test(v.lang)) || vL;
    let i = from;
    this.tts = { ep: ep.id };
    const sayNext = () => {
      if (!this.tts || i >= ep.lines.length) { this.tts = null; return; }
      const ln = ep.lines[i];
      const u = new SpeechSynthesisUtterance(ln.t);
      u.lang = 'es-AR'; u.voice = ln.s === 'L' ? vL : vT; u.rate = store.get('podSpeed', 1); u.pitch = ln.s === 'L' ? 1.1 : 0.95;
      const box = $('#transcript'); if (box) { $$('.tl', box).forEach((l, k) => l.classList.toggle('on', k === i)); }
      u.onend = () => { i++; sayNext(); };
      speechSynthesis.speak(u);
    };
    sayNext();
    UI.toast('Leyendo con la voz del navegador', '', 'mic');
  },
  stopTTS() { if (this.tts && 'speechSynthesis' in window) speechSynthesis.cancel(); this.tts = null; },
};

App.view('podcasts', {
  title: 'Podcasts', icon: 'headphones', keepScroll: true,
  render(el, param) {
    this.el = el; this.param = param;
    if (param && epById(param)) return this.renderEp(el, epById(param));
    const eps = window.PODCASTS || [];
    const st = podState();
    const filt = store.get('podFilt', 'ALL');
    const heard = eps.filter(e => st[e.id]?.done).length;
    const total = eps.reduce((a, e) => a + (e.dur || 0), 0);
    const nextEp = eps.find(e => !st[e.id]?.done) || eps[0];
    el.innerHTML = `
      <section class="pod-hero">
        <div class="pod-cover">${COVER('I')}</div>
        <div>
          <div class="eyebrow">Podcast · ${eps.length} episodios · ${fmtDur(total)}</div>
          <h1 class="title">Frecuencia CMN</h1>
          <p class="lead">Lu y Tomi recorren cada punto del Programa y del Modelo de Examen en charlas de 4 a 7 minutos, con analogías, trampas de examen y mnemotecnias. Cada episodio trae su transcripción y 3 preguntas para fijar.</p>
          <div class="row mt">
            <button class="btn btn-primary" id="podGo">${icon('play')} ${heard ? 'Continuar' : 'Empezar'}: ${esc(nextEp?.id.toUpperCase() || '')}</button>
            <button class="btn" id="podAll">${icon('list')} Reproducir ${filt === 'ALL' ? 'todo' : 'el pilar ' + filt}</button>
            <span class="tag tag-acc">${heard}/${eps.length} escuchados</span>
          </div>
        </div>
      </section>
      <div class="chips mt mb" id="podf">${['ALL', 'I', 'A', 'B', 'C', 'D'].map(p => `<button class="chip ${filt === p ? 'on' : ''}" data-p="${p}">${p === 'ALL' ? 'Todos' : p + ' · ' + pilarName(p)} <span class="n">${p === 'ALL' ? eps.length : eps.filter(e => e.pilar === p).length}</span></button>`).join('')}</div>
      <div class="ep-list">${eps.filter(e => filt === 'ALL' || e.pilar === filt).map(e => {
        const s = st[e.id] || {};
        return `<div class="ep" data-id="${e.id}" style="--pc:var(--p${e.pilar});--ps:var(--p${e.pilar}-soft)">
          <div class="ep-num">${s.done ? icon('check') : e.id.toUpperCase()}</div>
          <div><div class="ep-t">${esc(e.titulo)}</div><div class="ep-s"><span>${fmtDur(e.dur)}</span>${e.puntos && e.puntos !== '—' ? `<span>· Puntos ${esc(e.puntos)}</span>` : ''}${s.max && !s.done ? `<span>· ${Math.round(s.max * 100)}% escuchado</span>` : ''}${s.done ? '<span class="ep-done">· escuchado</span>' : ''}</div></div>
          <div class="ep-r"><button class="btn btn-icon btn-soft" data-ep-play="${e.id}" aria-label="Reproducir">${icon('play')}</button></div></div>`;
      }).join('')}</div>
      <p class="dim mt" style="font-size:.76rem">Audio sintetizado con voces neuronales (es-AR) a partir de guiones propios basados en el Programa, el Modelo de Examen y la bibliografía citada. Si el audio no carga, cada episodio tiene la opción de leerse con la voz del navegador.</p>`;
    $$('#podf .chip', el).forEach(c => c.onclick = () => { store.set('podFilt', c.dataset.p); this.render(el); });
    $('#podGo').onclick = () => { Player.load(nextEp.id, true); };
    $('#podAll').onclick = () => Player.playList(eps.filter(e => filt === 'ALL' || e.pilar === filt).map(e => e.id));
    $$('.ep', el).forEach(r => r.onclick = e => { if (e.target.closest('[data-ep-play]')) return; App.go('podcasts/' + r.dataset.id); });
    $$('[data-ep-play]', el).forEach(b => b.onclick = e => { e.stopPropagation(); const id = b.dataset.epPlay; if (Player.ep?.id === id) Player.toggle(); else Player.load(id, true); });
    Player.paint();
  },
  refresh() { if (this.el && App.cur === 'podcasts') { const y = window.scrollY; this.render(this.el, this.param); window.scrollTo(0, y); } },
  renderEp(el, ep) {
    const eps = window.PODCASTS || [];
    const i = eps.indexOf(ep), prev = eps[i - 1], next = eps[i + 1];
    const s = podState()[ep.id] || {};
    const H = window.PODCAST_HOSTS || { L: 'Lu', T: 'Tomi' };
    const items = allItems().filter(x => x.ep === ep.id);
    const vids = VIDEOS.filter(v => items.some(it => v.pts.split(' ').includes(it.id))).slice(0, 4);
    const quizDone = store.get('podQuiz', {});
    el.innerHTML = `
      <div class="row mb"><a class="btn btn-sm btn-ghost" href="#/podcasts">${icon('arrowL')} Episodios</a>
        ${prev ? `<a class="btn btn-sm btn-ghost" href="#/podcasts/${prev.id}">‹ ${prev.id.toUpperCase()}</a>` : ''}${next ? `<a class="btn btn-sm btn-ghost" href="#/podcasts/${next.id}">${next.id.toUpperCase()} ›</a>` : ''}</div>
      <section class="pod-hero">
        <div class="pod-cover">${COVER(ep.pilar)}</div>
        <div><div class="eyebrow">${ep.id.toUpperCase()} · ${esc(pilarName(ep.pilar))} · ${fmtDur(ep.dur)}</div>
          <h1 class="title">${esc(ep.titulo)}</h1><p class="lead">${esc(ep.resumen)}</p>
          <div class="row mt"><button class="btn btn-primary" data-ep-play="${ep.id}" data-label="${s.pos ? 'Continuar' : 'Reproducir'}">${icon('play')} ${s.pos ? 'Continuar' : 'Reproducir'}</button>
            <button class="btn" id="ttsBtn">${icon('mic')} Voz del navegador</button>
            <a class="btn btn-ghost" href="${ep.file}" download="Frecuencia-CMN-${ep.id}.mp3">${icon('download')} MP3</a>
            ${s.done ? `<span class="tag tag-ok">${icon('check')} escuchado</span>` : ''}</div>
          ${items.length ? `<div class="row mt" style="gap:6px">${items.map(it => `<a class="tag pil pil-${ep.pilar}" href="#/programa/${ep.pilar}" title="${esc(it.txt)}">${it.id}</a>`).join('')}</div>` : ''}
        </div>
      </section>
      <div class="grid g2 mt" style="grid-template-columns:minmax(0,1.4fr) minmax(0,1fr)">
        <div class="card"><div class="card-head"><div class="card-title">${icon('list')} Transcripción</div><span class="card-sub">Tocá una línea para saltar ahí</span></div>
          <div class="transcript" id="transcript" data-ep="${ep.id}">${ep.lines.map((l, k) => `<div class="tl" data-k="${k}"><span class="who ${l.s}">${esc(H[l.s])}</span><span class="tx">${esc(l.t)}</span></div>`).join('')}</div></div>
        <div class="stack">
          <div class="card"><div class="card-head"><div class="card-title">${icon('chat')} Tres preguntas al aire</div>${quizDone[ep.id] ? '<span class="tag tag-ok">hecho</span>' : '<span class="tag">+5 XP c/u</span>'}</div><div id="epQuiz"></div></div>
          ${vids.length ? `<div class="card"><div class="card-title mb">${icon('video')} Para ver después</div><div class="list">${vids.map(v => `<a class="li" href="#/videos/${v.pts.split(' ')[0]}" style="text-decoration:none;color:inherit"><img src="https://i.ytimg.com/vi/${v.y}/default.jpg" alt="" style="width:64px;border-radius:6px" loading="lazy"><div class="li-main"><div class="li-t" style="font-size:.84rem">${esc(v.t)}</div><div class="li-s">${esc(v.ch)} · ${fmtTime(v.s)}</div></div></a>`).join('')}</div></div>` : ''}
        </div>
      </div>`;
    $$('[data-ep-play]', el).forEach(b => b.onclick = () => { if (Player.ep?.id === ep.id) Player.toggle(); else Player.load(ep.id, true); });
    $('#ttsBtn').onclick = () => { if (Player.tts) { Player.stopTTS(); UI.toast('Lectura detenida'); } else Player.speak(ep, Player.ep?.id === ep.id ? Player.lineAt(Player.audio.currentTime) : 0); };
    $$('.tl', el).forEach(l => l.onclick = () => {
      const k = +l.dataset.k, at = ep.lines[k].at;
      if (Player.ep?.id !== ep.id) Player.load(ep.id, true);
      const go = () => { if (at != null) Player.audio.currentTime = at; Player.audio.play().catch(() => {}); };
      if (Player.audio.readyState >= 1) go(); else Player.audio.addEventListener('loadedmetadata', go, { once: true });
    });
    // quiz
    const qbox = $('#epQuiz');
    qbox.innerHTML = ep.quiz.map((q, qi) => {
      const ord = shuffle([0, 1, 2]);
      return `<div class="q" data-qi="${qi}"><div class="q-text" style="font-size:.92rem">${esc(q.q)}</div><div class="opts">${ord.map((oi, j) => `<button class="opt" data-oi="${oi}"><span class="ol">${'ABC'[j]}</span><span>${esc(q.o[oi])}</span></button>`).join('')}</div><div class="fb-slot"></div></div>`;
    }).join('');
    let right = 0, answered = 0;
    $$('.q', qbox).forEach(qd => {
      const q = ep.quiz[+qd.dataset.qi];
      $$('.opt', qd).forEach(b => b.onclick = () => {
        if (qd.dataset.done) return; qd.dataset.done = 1; answered++;
        const ok = b.dataset.oi === '0';
        $$('.opt', qd).forEach(x => { x.disabled = true; if (x.dataset.oi === '0') x.classList.add('ok'); });
        if (!ok) b.classList.add('bad'); else right++;
        $('.fb-slot', qd).innerHTML = `<div class="fb ${ok ? 'ok' : 'bad'}"><b>${ok ? 'Correcto.' : 'Incorrecto.'}</b> <span class="ex">${esc(q.e)}</span></div>`;
        if (answered === ep.quiz.length) {
          const qd2 = store.get('podQuiz', {});
          if (!qd2[ep.id]) { qd2[ep.id] = right; store.set('podQuiz', qd2); if (right) Game.gain(right * 5, `Quiz ${ep.id.toUpperCase()}: ${right}/${ep.quiz.length}`, 'quiz', ep.quiz.length); }
          else Game.gain(0, '', 'quiz', ep.quiz.length);
        }
      });
    });
    Player.paint();
    if (Player.ep?.id === ep.id) { $('#transcript').dataset.cur = ''; Player.highlight(Player.audio.currentTime); }
  },
});
