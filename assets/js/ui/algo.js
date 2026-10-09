/* Laboratorio de algoritmos: diagramas de flujo, pseudocódigo y prueba de escritorio */
'use strict';

const SYMBOLS = [
  ['Terminal', 'Inicio y fin del algoritmo', '<rect x="10" y="14" width="100" height="30" rx="15" class="fl-node fl-term"/>'],
  ['Proceso', 'Cálculo o asignación', '<rect x="12" y="12" width="96" height="34" rx="2" class="fl-node fl-proc"/>'],
  ['Entrada / Salida', 'Leer o mostrar datos', '<path d="M24 12H110L96 46H10Z" class="fl-node fl-io"/>'],
  ['Decisión', 'Condición con dos salidas (V/F)', '<path d="M60 4L112 29L60 54L8 29Z" class="fl-node fl-dec"/>'],
  ['Conector', 'Une partes en la misma página', '<circle cx="60" cy="29" r="16" class="fl-node fl-proc"/><text x="60" y="34" text-anchor="middle" class="fl-txt">A</text>'],
  ['Conector de página', 'Continúa en otra hoja', '<path d="M42 8H78V36L60 52L42 36Z" class="fl-node fl-proc"/>'],
  ['Subproceso', 'Módulo definido aparte', '<rect x="12" y="12" width="96" height="34" class="fl-node fl-proc"/><path d="M22 12V46M98 12V46" class="fl-edge"/>'],
  ['Documento', 'Salida impresa', '<path d="M14 10H106V42C86 34 76 56 60 46C44 36 30 50 14 44Z" class="fl-node fl-io"/>'],
  ['Pantalla', 'Salida por monitor (apuntes argentinos)', '<path d="M30 10H96C108 18 108 40 96 48H30L14 29Z" class="fl-node fl-io"/>'],
  ['Líneas de flujo', 'Indican el orden de ejecución', '<path d="M20 29H96" class="fl-edge"/><path d="M104 29L94 24V34Z" class="fl-arrow"/>'],
];
const PSEINT_REF = [
  ['Algoritmo nombre … FinAlgoritmo', 'Inicio y fin del programa'],
  ['Definir x Como Entero / Real / Caracter / Logico', 'Declaración de variables'],
  ['x <- expresión', 'Asignación (se lee «x toma el valor de»)'],
  ['Leer a, b', 'Entrada por teclado'],
  ['Escribir "texto", x', 'Salida (las partes se concatenan)'],
  ['+  -  *  /  ^  MOD', 'Aritméticos (MOD = resto)'],
  ['=  <>  <  >  <=  >=', 'Relacionales'],
  ['Y   O   NO', 'Lógicos'],
  ['Si c Entonces … SiNo … FinSi', 'Selección simple / doble'],
  ['Segun x Hacer  1: …  De Otro Modo: …  FinSegun', 'Selección múltiple'],
  ['Mientras c Hacer … FinMientras', 'Repetición con pregunta al inicio'],
  ['Repetir … Hasta Que c', 'Repetición con pregunta al final (corta con V)'],
  ['Para i <- 1 Hasta n Con Paso 1 Hacer … FinPara', 'Repetición con contador'],
  ['trunc(x)  redon(x)  abs(x)  raiz(x)  azar(n)', 'Funciones'],
];
const ALGO_TEMPLATE = `Algoritmo MiAlgoritmo
    Definir n, i, suma Como Entero
    Leer n
    suma <- 0
    Para i <- 1 Hasta n Hacer
        suma <- suma + i
    FinPara
    Escribir "La suma de 1 a ", n, " es ", suma
FinAlgoritmo`;

const codeLines = code => `<div class="codelines">${code.replace(/\r/g, '').split('\n').map((l, i) => `<div class="cl" data-n="${i + 1}"><span class="ln">${i + 1}</span>${esc(l) || ' '}</div>`).join('')}</div>`;
const parseInputs = s => s.split(/[,;\n]/).map(x => x.trim()).filter(x => x !== '').map(x => isNaN(x.replace(',', '.')) ? x : parseFloat(x.replace(',', '.')));

function traceTable(res, cur) {
  const names = [...new Set(res.trace.flatMap(t => Object.keys(t.vars)))];
  if (!names.length) return '<p class="muted">Sin variables.</p>';
  return `<div class="table-wrap" style="max-height:300px;overflow:auto"><table class="tbl trace"><thead><tr><th>Paso</th><th>Línea</th>${names.map(n => `<th>${esc(n)}</th>`).join('')}<th>Nota</th></tr></thead><tbody>
    ${res.trace.map((t, k) => `<tr data-k="${k}" class="${k === cur ? 'cur' : ''}"><td class="num">${k + 1}</td><td class="num">${t.n}</td>${names.map(n => `<td>${n in t.vars ? esc(PSeInt.fmt(t.vars[n])) : '<span class="dim">·</span>'}</td>`).join('')}<td class="dim">${esc(t.note || '')}</td></tr>`).join('')}</tbody></table></div>
    ${res.steps > res.trace.length ? `<p class="dim mt" style="font-size:.74rem">Se muestran los primeros ${res.trace.length} pasos de ${res.steps}.</p>` : ''}`;
}
const consoleHtml = (out, upto = out.length) => out.slice(0, upto).map(o => `<div class="${o.in ? 'in' : ''}">${esc(o.t)}</div>`).join('') || '<span class="dim">(sin salida)</span>';

App.view('algoritmos', {
  title: 'Algoritmos', icon: 'flow',
  render(el, param) {
    const tab = param === 'editor' ? 'editor' : param === 'simbolos' ? 'simbolos' : 'ej';
    el.innerHTML = `
      <div class="page-head"><div><div class="eyebrow">Practicar · Modelo de Examen</div><h1 class="title">Laboratorio de algoritmos</h1>
        <p class="lead">Diagramas de flujo, pseudocódigo (estilo PSeInt) y prueba de escritorio: el primer punto del Modelo de Examen. Escribís el pseudocódigo y el diagrama se dibuja solo; la ejecución paso a paso muestra la tabla de variables.</p></div>
        <span class="tag tag-acc">${Object.keys(store.get('algoSolved', {})).length} desafíos resueltos</span></div>
      <div class="seg mb"><button class="${tab === 'ej' ? 'on' : ''}" onclick="App.go('algoritmos')">Ejercicios</button><button class="${tab === 'editor' ? 'on' : ''}" onclick="App.go('algoritmos/editor')">Editor libre</button><button class="${tab === 'simbolos' ? 'on' : ''}" onclick="App.go('algoritmos/simbolos')">Símbolos y sintaxis</button></div>
      <div id="algoBox"></div>`;
    const box = $('#algoBox');
    if (tab === 'editor') this.editor(box);
    else if (tab === 'simbolos') this.simbolos(box);
    else this.ejercicio(box, ALGOS.find(a => a.id === param) || ALGOS.find(a => a.id === store.get('algoLast')) || ALGOS[0]);
  },
  leave() { clearInterval(this._play); },
  ejercicio(box, A) {
    store.set('algoLast', A.id);
    const solved = store.get('algoSolved', {});
    let ins = genInputs(A.gen), res = null, k = -1;
    box.innerHTML = `
      <div class="card mb"><div class="row-between">
        <div class="row"><select class="inp" id="alSel" aria-label="Elegir ejercicio">${ALGOS.map((a, i) => `<option value="${a.id}" ${a.id === A.id ? 'selected' : ''}>${i + 1}. ${esc(a.t)}${solved[a.id] ? ' ✓' : ''}</option>`).join('')}</select>
          <span class="tag">${esc(A.tema)}</span><span class="tag">${'★'.repeat(A.nivel)}${'☆'.repeat(3 - A.nivel)}</span></div>
        <div class="row"><button class="btn btn-sm btn-ghost" id="alPrev">${icon('arrowL')}</button><button class="btn btn-sm btn-ghost" id="alNext">${icon('arrowR')}</button></div></div>
        <p class="mt"><b>Enunciado:</b> ${esc(A.enun)}</p></div>
      <div class="algo-layout">
        <div class="stack">
          <div class="card"><div class="card-head"><div class="card-title">${icon('code')} Pseudocódigo</div><button class="btn btn-sm btn-ghost" id="toEditor">${icon('terminal')} Editar</button></div>
            <div id="codeView">${codeLines(A.code)}</div>
            <div class="row mt"><label class="field" style="flex:1"><span>Entradas (separadas por coma)</span><input class="inp mono" id="alIn" value="${esc(ins.join(', '))}"></label><button class="btn btn-sm btn-ghost" id="alRnd" title="Otras entradas" style="margin-top:18px">${icon('shuffle')}</button></div>
            <div class="row mt"><button class="btn btn-primary" id="alRun">${icon('play')} Ejecutar</button><button class="btn" id="alStepB" title="Paso anterior">‹</button><button class="btn" id="alStep">${icon('steps')} Paso a paso</button><button class="btn" id="alAuto" title="Reproducir">${icon('play')}</button><span class="mono dim" id="alStepLbl" style="font-size:.74rem"></span></div>
            <div class="console mt" id="alOut"><span class="dim">Ejecutá o recorré paso a paso.</span></div></div>
          <div class="card"><div class="card-head"><div class="card-title">${icon('target')} Desafío</div>${solved[A.id] ? '<span class="tag tag-ok">resuelto</span>' : '<span class="tag">+20 XP</span>'}</div>
            <p class="muted" style="font-size:.88rem">Hacé la prueba de escritorio en papel con estas entradas y elegí qué muestra:</p><div id="chal" class="mt"></div></div>
        </div>
        <div class="stack">
          <div class="card"><div class="card-head"><div class="card-title">${icon('flow')} Diagrama de flujo</div><button class="btn btn-sm btn-ghost" id="dlSvg">${icon('download')} SVG</button></div><div class="flow-wrap" id="flow"></div></div>
          <div class="card"><div class="card-head"><div class="card-title">${icon('table')} Prueba de escritorio</div></div><div id="trace"><p class="muted">Ejecutá para ver la tabla de variables paso a paso.</p></div></div>
        </div>
      </div>`;
    const flowSvg = PSeInt.flowchart(A.code);
    $('#flow').innerHTML = flowSvg;
    const goto = id => App.go('algoritmos/' + id);
    $('#alSel').onchange = e => goto(e.target.value);
    const i = ALGOS.indexOf(A);
    $('#alPrev').onclick = () => goto(ALGOS[(i - 1 + ALGOS.length) % ALGOS.length].id);
    $('#alNext').onclick = () => goto(ALGOS[(i + 1) % ALGOS.length].id);
    $('#toEditor').onclick = () => { store.set('algoDraft', A.code); store.set('algoDraftIn', $('#alIn').value); App.go('algoritmos/editor'); };
    $('#dlSvg').onclick = () => { const b = new Blob([flowSvg.replace('<svg ', '<svg style="background:#fff" ')], { type: 'image/svg+xml' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = A.id + '-diagrama.svg'; a.click(); };
    const run = () => {
      try { res = PSeInt.run(A.code, parseInputs($('#alIn').value)); return true; }
      catch (e) { $('#alOut').innerHTML = `<div class="err">${esc(e.message)}</div>`; res = null; return false; }
    };
    const paint = () => {
      $$('.cl', box).forEach(l => l.classList.remove('cur'));
      $$('#flow g[data-line]').forEach(g => g.classList.remove('fl-hl'));
      if (!res) return;
      if (k >= 0 && res.trace[k]) {
        const t = res.trace[k];
        $(`.cl[data-n="${t.n}"]`, box)?.classList.add('cur');
        $$(`#flow g[data-line="${t.n}"]`).forEach(g => g.classList.add('fl-hl'));
        $('#alOut').innerHTML = consoleHtml(res.out, t.out);
        $('#alStepLbl').textContent = `paso ${k + 1}/${res.trace.length}`;
      } else { $('#alOut').innerHTML = consoleHtml(res.out); $('#alStepLbl').textContent = `${res.steps} pasos`; }
      $('#trace').innerHTML = traceTable(res, k);
      const row = $(`#trace tr[data-k="${k}"]`); if (row) row.scrollIntoView({ block: 'nearest' });
      $$('#trace tr[data-k]').forEach(r => r.onclick = () => { k = +r.dataset.k; paint(); });
    };
    $('#alRun').onclick = () => { clearInterval(this._play); if (run()) { k = -1; paint(); } };
    $('#alStep').onclick = () => { if (!res && !run()) return; k = Math.min(res.trace.length - 1, k + 1); paint(); };
    $('#alStepB').onclick = () => { if (!res) return; k = Math.max(0, k - 1); paint(); };
    $('#alAuto').onclick = () => {
      clearInterval(this._play);
      if (!run()) return; k = -1;
      this._play = setInterval(() => { if (!res || k >= res.trace.length - 1) return clearInterval(this._play); k++; paint(); }, 650);
    };
    $('#alIn').oninput = () => { res = null; k = -1; };
    $('#alRnd').onclick = () => { ins = genInputs(A.gen); $('#alIn').value = ins.join(', '); res = null; k = -1; this.challenge(A, ins); };
    this.challenge(A, ins);
  },
  challenge(A, ins) {
    const outStr = r => r.out.filter(o => !o.in).map(o => o.t).join(' ⏎ ');
    let right; try { right = outStr(PSeInt.run(A.code, ins)); } catch (e) { $('#chal').innerHTML = `<div class="fb bad">${esc(e.message)}</div>`; return; }
    const set = new Set([right]); let tries = 0;
    while (set.size < 4 && tries++ < 40) { try { set.add(outStr(PSeInt.run(A.code, genInputs(A.gen)))); } catch (e) { /* */ } }
    while (set.size < 4) set.add(right.replace(/\d+/, m => String(+m + set.size)));
    $('#chal').innerHTML = `<div class="dim mono mb" style="font-size:.74rem">Entradas: ${esc(ins.join(', '))}</div><div class="stack-sm">${shuffle([...set]).map(o => `<button class="opt" data-o="${esc(o)}"><span class="mono" style="font-size:.84rem">${esc(o)}</span></button>`).join('')}</div>`;
    $$('#chal .opt').forEach(b => b.onclick = () => {
      const ok = b.dataset.o === right;
      $$('#chal .opt').forEach(x => { x.disabled = true; if (x.dataset.o === right) x.classList.add('ok'); });
      if (!ok) { b.classList.add('bad'); $('#chal').insertAdjacentHTML('beforeend', '<div class="fb bad mt">Revisá la prueba de escritorio con «Paso a paso».</div>'); return; }
      const s = store.get('algoSolved', {});
      if (!s[A.id]) { s[A.id] = todayKey(); store.set('algoSolved', s); Game.gain(20, 'Desafío de algoritmo', 'algo'); if (Object.keys(s).length >= 5) Game.award('algo5'); }
      else Game.gain(4, 'Desafío repetido', 'algo');
      $('#chal').insertAdjacentHTML('beforeend', '<div class="fb ok mt"><b>¡Correcto!</b> Probá con otras entradas o pasá al siguiente.</div>');
    });
  },
  editor(box) {
    const code = store.get('algoDraft', ALGO_TEMPLATE);
    box.innerHTML = `<div class="algo-layout">
      <div class="stack"><div class="card"><div class="card-head"><div class="card-title">${icon('terminal')} Editor de pseudocódigo</div><div class="row"><button class="btn btn-sm btn-ghost" id="edReset">Plantilla</button></div></div>
        <textarea class="inp editor" id="edCode" spellcheck="false" rows="18">${esc(code)}</textarea>
        <div class="dim mono mt" id="edStatus" style="font-size:.74rem"></div>
        <div class="row mt"><label class="field" style="flex:1"><span>Entradas (separadas por coma)</span><input class="inp mono" id="edIn" value="${esc(store.get('algoDraftIn', '5'))}"></label></div>
        <div class="row mt"><button class="btn btn-primary" id="edRun">${icon('play')} Ejecutar</button><span class="dim" style="font-size:.74rem">Ctrl + Enter ejecuta · Tab inserta sangría</span></div>
        <div class="console mt" id="edOut"><span class="dim">La salida aparece acá.</span></div></div></div>
      <div class="stack"><div class="card"><div class="card-title mb">${icon('flow')} Diagrama generado</div><div class="flow-wrap" id="edFlow"></div></div>
        <div class="card"><div class="card-title mb">${icon('table')} Prueba de escritorio</div><div id="edTrace"><p class="muted">Ejecutá para ver la tabla.</p></div></div></div></div>`;
    const ta = $('#edCode');
    let deb;
    const redraw = () => {
      store.set('algoDraft', ta.value);
      try { $('#edFlow').innerHTML = PSeInt.flowchart(ta.value); $('#edStatus').innerHTML = '<span style="color:var(--ok)">✓ sintaxis válida</span>'; }
      catch (e) { $('#edStatus').innerHTML = `<span style="color:var(--bad)">${esc(e.message)}</span>`; }
    };
    ta.oninput = () => { clearTimeout(deb); deb = setTimeout(redraw, 350); };
    ta.onkeydown = e => {
      if (e.key === 'Tab') { e.preventDefault(); const s = ta.selectionStart; ta.setRangeText('    ', s, ta.selectionEnd, 'end'); }
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); $('#edRun').click(); }
    };
    $('#edIn').oninput = e => store.set('algoDraftIn', e.target.value);
    $('#edReset').onclick = () => { ta.value = ALGO_TEMPLATE; redraw(); };
    $('#edRun').onclick = () => {
      try {
        const r = PSeInt.run(ta.value, parseInputs($('#edIn').value), { askInput: v => { const x = prompt(`Leer ${v}:`); return x === null ? undefined : x; } });
        $('#edOut').innerHTML = consoleHtml(r.out); $('#edTrace').innerHTML = traceTable(r, -1);
      } catch (e) { $('#edOut').innerHTML = `<div class="err">${esc(e.message)}</div>`; }
    };
    redraw();
  },
  simbolos(box) {
    box.innerHTML = `
      <div class="card"><div class="card-title mb">${icon('flow')} Símbolos normalizados (ANSI / ISO 5807)</div>
        <div class="sym-grid">${SYMBOLS.map(([t, d, s]) => `<div class="sym"><svg viewBox="0 0 120 58">${s}</svg><b>${esc(t)}</b><span>${esc(d)}</span></div>`).join('')}</div></div>
      <div class="grid g2 mt">
        <div class="kb" style="--pc:var(--pC)"><div class="kb-h">Reglas de construcción</div><ul>
          <li>Un único <b>inicio</b> y un único <b>fin</b>.</li><li>Flujo de <b>arriba hacia abajo</b> y de <b>izquierda a derecha</b>.</li>
          <li>Las líneas <b>no se cruzan</b>: si hace falta, se usan conectores.</li><li>La <b>decisión</b> tiene exactamente dos salidas (V/F o Sí/No).</li>
          <li>Todo símbolo, salvo el fin, tiene al menos una flecha de salida.</li><li>El texto dentro de cada símbolo es breve e independiente del lenguaje.</li></ul></div>
        <div class="kb" style="--pc:var(--pC)"><div class="kb-h">Estructuras de control (Böhm-Jacopini)</div><ul>
          <li><b>Secuencia:</b> una acción después de otra.</li><li><b>Selección:</b> Si / SiNo y Segun.</li>
          <li><b>Iteración:</b> Mientras (0 o más vueltas), Repetir…Hasta Que (1 o más), Para (cantidad conocida).</li>
          <li><b>Contador</b> c ← c + 1 · <b>acumulador</b> s ← s + x · <b>bandera</b> lógica.</li></ul></div>
      </div>
      <div class="section-lbl">Sintaxis de pseudocódigo (estilo PSeInt)</div>
      <div class="table-wrap"><table class="tbl"><thead><tr><th>Sintaxis</th><th>Significado</th></tr></thead><tbody>${PSEINT_REF.map(([a, b]) => `<tr><td class="mono" style="white-space:nowrap">${esc(a)}</td><td>${esc(b)}</td></tr>`).join('')}</tbody></table></div>
      <div class="row mt"><a class="btn btn-primary" href="#/algoritmos/editor">${icon('terminal')} Probar en el editor</a><button class="btn" onclick="Player.load('c1', true)">${icon('headphones')} Episodio C1</button><a class="btn" href="#/videos/C11">${icon('video')} Videos</a></div>`;
  },
});
