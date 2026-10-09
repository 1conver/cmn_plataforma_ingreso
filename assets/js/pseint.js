/* =========================================================================
   Mini intérprete de pseudocódigo (estilo PSeInt) + generador de diagramas de flujo.
   Soporta: Algoritmo/Proceso, Definir, Leer, Escribir, <-, Si/SiNo, Segun,
   Mientras, Repetir…Hasta Que, Para…Con Paso, funciones trunc, redon, abs, raiz, azar, longitud.
   ========================================================================= */
'use strict';

const PSeInt = (() => {
  const norm = s => String(s ?? '').trim().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ');
  class PErr extends Error { constructor(msg, line) { super(line ? `Línea ${line}: ${msg}` : msg); this.line = line; } }

  /* ---------------- expresiones: tokenizador + parser Pratt ---------------- */
  const KW_OPS = { Y: '&&', O: '||', NO: '!', MOD: '%' };
  function tokenize(src, line) {
    const t = []; let i = 0;
    while (i < src.length) {
      const c = src[i];
      if (/\s/.test(c)) { i++; continue; }
      if (c === '"' || c === "'" || c === '“' || c === '”') {
        const close = c === '“' ? '”' : c; let j = i + 1; let s = '';
        while (j < src.length && src[j] !== close && !(close === '"' && src[j] === '”')) s += src[j++];
        if (j >= src.length) throw new PErr('cadena sin cerrar', line);
        t.push({ k: 'str', v: s }); i = j + 1; continue;
      }
      if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(src[i + 1] || ''))) {
        let j = i; while (j < src.length && /[0-9.]/.test(src[j])) j++;
        t.push({ k: 'num', v: parseFloat(src.slice(i, j).replace(',', '.')) }); i = j; continue;
      }
      if (/[A-Za-zÁÉÍÓÚáéíóúÑñ_]/.test(c)) {
        let j = i; while (j < src.length && /[A-Za-z0-9ÁÉÍÓÚáéíóúÑñ_]/.test(src[j])) j++;
        const w = src.slice(i, j), up = norm(w);
        if (KW_OPS[up]) t.push({ k: 'op', v: KW_OPS[up] });
        else if (up === 'VERDADERO') t.push({ k: 'bool', v: true });
        else if (up === 'FALSO') t.push({ k: 'bool', v: false });
        else t.push({ k: 'id', v: w });
        i = j; continue;
      }
      const two = src.slice(i, i + 2);
      if (['<=', '>=', '<>', '!=', '==', '&&', '||'].includes(two)) { t.push({ k: 'op', v: two === '<>' ? '!=' : two === '==' ? '=' : two }); i += 2; continue; }
      if ('+-*/^%<>=(),&|~'.includes(c)) {
        const map = { '&': '&&', '|': '||', '~': '!' };
        t.push({ k: c === '(' || c === ')' || c === ',' ? c : 'op', v: map[c] || c }); i++; continue;
      }
      throw new PErr(`símbolo inesperado «${c}»`, line);
    }
    return t;
  }
  const BP = { '||': 1, '&&': 2, '=': 3, '!=': 3, '<': 4, '>': 4, '<=': 4, '>=': 4, '+': 5, '-': 5, '*': 6, '/': 6, '%': 6, '^': 8 };
  function parseExpr(src, line) {
    const t = tokenize(src, line); let p = 0;
    const peek = () => t[p], next = () => t[p++];
    function nud(tok) {
      if (!tok) throw new PErr('expresión incompleta', line);
      if (tok.k === 'num' || tok.k === 'str' || tok.k === 'bool') return { k: 'lit', v: tok.v };
      if (tok.k === 'id') {
        if (peek() && peek().k === '(') {
          next(); const args = [];
          if (peek() && peek().k !== ')') { do { args.push(expr(0)); } while (peek() && peek().k === ',' && next()); }
          if (!peek() || peek().k !== ')') throw new PErr('falta «)»', line);
          next(); return { k: 'call', f: tok.v, args };
        }
        return { k: 'var', n: tok.v };
      }
      if (tok.k === '(') { const e = expr(0); if (!peek() || peek().k !== ')') throw new PErr('falta «)»', line); next(); return e; }
      if (tok.k === 'op' && (tok.v === '-' || tok.v === '+')) return { k: 'un', op: tok.v, e: expr(7) };
      if (tok.k === 'op' && tok.v === '!') return { k: 'un', op: '!', e: expr(2.5) };
      if (tok.k === 'op' && (tok.v === '&&' || tok.v === '||' || tok.v === '%')) throw new PErr('«Y», «O» y «MOD» son operadores: no pueden usarse como nombres de variable', line);
      throw new PErr(`expresión inválida cerca de «${tok.v ?? tok.k}»`, line);
    }
    function expr(rbp) {
      let left = nud(next());
      while (peek() && peek().k === 'op' && (BP[peek().v] || 0) > rbp) {
        const op = next().v;
        left = { k: 'bin', op, l: left, r: expr(op === '^' ? BP[op] - 1 : BP[op]) };
      }
      return left;
    }
    const e = expr(0);
    if (p < t.length) throw new PErr(`sobra «${t[p].v ?? t[p].k}» en la expresión`, line);
    return e;
  }
  const FN = {
    TRUNC: x => Math.trunc(x), REDON: x => Math.round(x), ABS: x => Math.abs(x), RAIZ: x => Math.sqrt(x), RC: x => Math.sqrt(x),
    AZAR: x => Math.floor(Math.random() * x), LONGITUD: s => String(s).length, MAYUSCULAS: s => String(s).toUpperCase(),
    MINUSCULAS: s => String(s).toLowerCase(), SUBCADENA: (s, a, b) => String(s).substring(a, b + 1), CONVERTIRATEXTO: x => String(x),
    CONVERTIRANUMERO: s => parseFloat(s), SEN: Math.sin, COS: Math.cos, LN: Math.log, EXP: Math.exp,
  };
  function evalE(e, env, line) {
    switch (e.k) {
      case 'lit': return e.v;
      case 'var': {
        const k = norm(e.n);
        if (!(k in env.vars)) throw new PErr(`la variable «${e.n}» no tiene valor`, line);
        return env.vars[k];
      }
      case 'call': {
        const f = FN[norm(e.f)]; if (!f) throw new PErr(`función desconocida «${e.f}»`, line);
        return f(...e.args.map(a => evalE(a, env, line)));
      }
      case 'un': { const v = evalE(e.e, env, line); return e.op === '-' ? -v : e.op === '!' ? !v : +v; }
      case 'bin': {
        const a = evalE(e.l, env, line), b = evalE(e.r, env, line);
        switch (e.op) {
          case '+': return (typeof a === 'string' || typeof b === 'string') ? String(a) + String(b) : a + b;
          case '-': return a - b; case '*': return a * b;
          case '/': if (b === 0) throw new PErr('división por cero', line); return a / b;
          case '%': if (b === 0) throw new PErr('MOD por cero', line); return ((a % b) + b) % b;
          case '^': return Math.pow(a, b);
          case '=': return a === b; case '!=': return a !== b;
          case '<': return a < b; case '>': return a > b; case '<=': return a <= b; case '>=': return a >= b;
          case '&&': return !!a && !!b; case '||': return !!a || !!b;
        }
      }
    }
    throw new PErr('expresión no evaluable', line);
  }
  const fmt = v => typeof v === 'number' ? (Number.isInteger(v) ? String(v) : String(+v.toFixed(4)).replace('.', ',')) : typeof v === 'boolean' ? (v ? 'VERDADERO' : 'FALSO') : String(v);

  /* ---------------- parser de sentencias ---------------- */
  function splitArgs(s) { // separa por comas fuera de comillas y paréntesis
    const out = []; let cur = '', d = 0, q = null;
    for (const c of s) {
      if (q) { cur += c; if (c === q) q = null; continue; }
      if (c === '"' || c === "'") { q = c; cur += c; continue; }
      if (c === '(') d++; if (c === ')') d--;
      if (c === ',' && d === 0) { out.push(cur.trim()); cur = ''; continue; }
      cur += c;
    }
    if (cur.trim()) out.push(cur.trim());
    return out;
  }
  function parse(code) {
    const raw = code.replace(/\r/g, '').split('\n');
    const L = [];
    raw.forEach((txt, i) => {
      let s = txt.replace(/\/\/.*$/, '');
      // los ';' separan sentencias en la misma línea
      s.split(';').forEach(part => { const p = part.trim(); if (p) L.push({ s: p, n: i + 1 }); });
    });
    let i = 0;
    const startRx = /^(ALGORITMO|PROCESO)\b/i, endRx = /^(FINALGORITMO|FINPROCESO|FIN ALGORITMO|FIN PROCESO)\b/i;
    let name = 'sin_nombre';
    if (L.length && startRx.test(L[0].s)) { name = L[0].s.split(/\s+/)[1] || name; i = 1; }
    function block(stops) {
      const out = [];
      while (i < L.length) {
        const { s, n } = L[i];
        const up = norm(s);
        if (stops.some(rx => rx.test(up))) return out;
        if (endRx.test(up)) { i = L.length; return out; }
        i++;
        let m;
        if (/^DEFINIR\b/.test(up)) { out.push({ k: 'def', n, src: s }); continue; }
        if (/^DIMENSION\b/.test(up)) { out.push({ k: 'def', n, src: s }); continue; }
        if ((m = s.match(/^leer\s+(.+)$/i))) { out.push({ k: 'read', n, vars: splitArgs(m[1]), src: s }); continue; }
        if ((m = s.match(/^(escribir|imprimir|mostrar)(\s+sin\s+saltar)?\s+(.*)$/i))) { out.push({ k: 'write', n, exprs: splitArgs(m[3]).map(x => parseExpr(x, n)), src: s, raw: m[3] }); continue; }
        if ((m = s.match(/^si\s+(.+?)\s+entonces$/i)) || (m = s.match(/^si\s+(.+)$/i))) {
          const cond = parseExpr(m[1].replace(/\s+entonces$/i, ''), n);
          const yes = block([/^SINO\b/, /^FINSI\b/, /^FIN SI\b/]);
          let no = [];
          if (i < L.length && /^SINO\b/.test(norm(L[i].s))) { i++; no = block([/^FINSI\b/, /^FIN SI\b/]); }
          if (i >= L.length) throw new PErr('falta FinSi', n);
          i++;
          out.push({ k: 'if', n, cond, condSrc: m[1].replace(/\s+entonces$/i, ''), yes, no });
          continue;
        }
        if ((m = s.match(/^mientras\s+(.+?)\s+hacer$/i)) || (m = s.match(/^mientras\s+(.+)$/i))) {
          const body = block([/^FINMIENTRAS\b/, /^FIN MIENTRAS\b/]);
          if (i >= L.length) throw new PErr('falta FinMientras', n);
          i++;
          const cs = m[1].replace(/\s+hacer$/i, '');
          out.push({ k: 'while', n, cond: parseExpr(cs, n), condSrc: cs, body });
          continue;
        }
        if (/^REPETIR$/.test(up) || /^HACER$/.test(up)) {
          const body = block([/^HASTA QUE\b/, /^MIENTRAS QUE\b/]);
          if (i >= L.length) throw new PErr('falta Hasta Que', n);
          const endL = L[i]; i++;
          const mm = endL.s.match(/^(hasta\s+que|mientras\s+que)\s+(.+)$/i);
          out.push({ k: 'repeat', n, nEnd: endL.n, until: /^hasta/i.test(mm[1]), cond: parseExpr(mm[2], endL.n), condSrc: mm[2], body });
          continue;
        }
        if ((m = s.match(/^para\s+([A-Za-z_ÁÉÍÓÚáéíóúñÑ][\wÁÉÍÓÚáéíóúñÑ]*)\s*(<-|=|:=)\s*(.+?)\s+hasta\s+(.+?)(\s+con\s+paso\s+(.+?))?\s+hacer$/i))) {
          const body = block([/^FINPARA\b/, /^FIN PARA\b/]);
          if (i >= L.length) throw new PErr('falta FinPara', n);
          i++;
          out.push({ k: 'for', n, v: m[1], from: parseExpr(m[3], n), to: parseExpr(m[4], n), step: m[6] ? parseExpr(m[6], n) : null, fromSrc: m[3], toSrc: m[4], stepSrc: m[6] || '1', body });
          continue;
        }
        if ((m = s.match(/^segun\s+(.+?)\s+hacer$/i)) || (m = s.match(/^según\s+(.+?)\s+hacer$/i))) {
          const cases = []; let def = null;
          while (i < L.length && !/^FINSEGUN\b|^FIN SEGUN\b/.test(norm(L[i].s))) {
            const hl = L[i]; const hu = norm(hl.s);
            const dm = hu.match(/^DE OTRO MODO\s*:?\s*(.*)$/);
            if (dm) {
              i++;
              def = { n: hl.n, body: [] };
              if (dm[1]) { L.splice(i, 0, { s: hl.s.replace(/^de otro modo\s*:?\s*/i, ''), n: hl.n }); }
              def.body = block([/^FINSEGUN\b/, /^FIN SEGUN\b/]);
              continue;
            }
            const cm = hl.s.match(/^([^:]+):\s*(.*)$/);
            if (!cm) throw new PErr('se esperaba «valor:» dentro de Segun', hl.n);
            i++;
            if (cm[2]) L.splice(i, 0, { s: cm[2], n: hl.n });
            const body = block([/^[^:"']+:\s*/, /^DE OTRO MODO/, /^FINSEGUN\b/, /^FIN SEGUN\b/].map(rx => rx));
            cases.push({ n: hl.n, vals: splitArgs(cm[1]).map(v => parseExpr(v, hl.n)), valSrc: cm[1].trim(), body });
          }
          if (i >= L.length) throw new PErr('falta FinSegun', n);
          i++;
          out.push({ k: 'switch', n, e: parseExpr(m[1], n), eSrc: m[1], cases, def });
          continue;
        }
        if ((m = s.match(/^([A-Za-z_ÁÉÍÓÚáéíóúñÑ][\wÁÉÍÓÚáéíóúñÑ]*)\s*(<-|:=|=|←)\s*(.+)$/))) {
          if (KW_OPS[norm(m[1])] || ['VERDADERO', 'FALSO'].includes(norm(m[1]))) throw new PErr(`«${m[1]}» es una palabra reservada`, n);
          out.push({ k: 'assign', n, v: m[1], e: parseExpr(m[3], n), src: `${m[1]} ← ${m[3]}` });
          continue;
        }
        throw new PErr(`no entiendo «${s}»`, n);
      }
      return out;
    }
    const body = block([]);
    return { name, body };
  }

  /* ---------------- ejecución con traza ---------------- */
  function run(code, inputs = [], { maxSteps = 20000, askInput } = {}) {
    const prog = parse(code);
    const env = { vars: {}, names: {} };
    const out = [], trace = [];
    const queue = [...inputs];
    let steps = 0;
    const snap = () => { const o = {}; Object.keys(env.names).forEach(k => { o[env.names[k]] = env.vars[k]; }); return o; };
    const step = (n, note) => {
      if (++steps > maxSteps) throw new PErr(`se superaron ${maxSteps} pasos (¿bucle infinito?)`, n);
      if (trace.length < 400) trace.push({ n, vars: snap(), out: out.length, note });
    };
    const setVar = (name, v) => { const k = norm(name); env.vars[k] = v; if (!env.names[k]) env.names[k] = name; };
    function exec(stmts) {
      for (const s of stmts) {
        switch (s.k) {
          case 'def': break;
          case 'read':
            for (const v of s.vars) {
              let val = queue.length ? queue.shift() : (askInput ? askInput(v) : undefined);
              if (val === undefined || val === null) throw new PErr(`faltan datos de entrada para «${v}»`, s.n);
              const num = typeof val === 'number' ? val : (String(val).trim() !== '' && !isNaN(String(val).replace(',', '.')) ? parseFloat(String(val).replace(',', '.')) : val);
              setVar(v, num);
              out.push({ t: `> ${fmt(num)}`, in: true });
            }
            step(s.n, 'Leer');
            break;
          case 'write':
            out.push({ t: s.exprs.map(e => fmt(evalE(e, env, s.n))).join('') });
            step(s.n, 'Escribir');
            break;
          case 'assign':
            setVar(s.v, evalE(s.e, env, s.n));
            step(s.n);
            break;
          case 'if': {
            const c = !!evalE(s.cond, env, s.n);
            step(s.n, `${s.condSrc} → ${c ? 'V' : 'F'}`);
            exec(c ? s.yes : s.no);
            break;
          }
          case 'while':
            for (;;) {
              const c = !!evalE(s.cond, env, s.n);
              step(s.n, `${s.condSrc} → ${c ? 'V' : 'F'}`);
              if (!c) break;
              exec(s.body);
            }
            break;
          case 'repeat':
            for (;;) {
              exec(s.body);
              const c = !!evalE(s.cond, env, s.nEnd);
              step(s.nEnd, `${s.condSrc} → ${c ? 'V' : 'F'}`);
              if (s.until ? c : !c) break;
            }
            break;
          case 'for': {
            const a = evalE(s.from, env, s.n), b = evalE(s.to, env, s.n);
            const st = s.step ? evalE(s.step, env, s.n) : (a <= b ? 1 : -1);
            if (st === 0) throw new PErr('el paso del Para no puede ser 0', s.n);
            setVar(s.v, a);
            for (;;) {
              const i = env.vars[norm(s.v)];
              const c = st > 0 ? i <= b : i >= b;
              step(s.n, `${s.v} ${st > 0 ? '≤' : '≥'} ${fmt(b)} → ${c ? 'V' : 'F'}`);
              if (!c) break;
              exec(s.body);
              setVar(s.v, env.vars[norm(s.v)] + st);
            }
            break;
          }
          case 'switch': {
            const v = evalE(s.e, env, s.n);
            step(s.n, `${s.eSrc} = ${fmt(v)}`);
            const hit = s.cases.find(c => c.vals.some(x => evalE(x, env, c.n) === v));
            if (hit) exec(hit.body); else if (s.def) exec(s.def.body);
            break;
          }
        }
      }
    }
    exec(prog.body);
    return { out, trace, vars: snap(), steps, name: prog.name, prog };
  }

  /* ---------------- diagrama de flujo (SVG) ---------------- */
  const CW = 7.3, FS = 12;
  const clip = (s, n = 34) => { s = String(s).replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1) + '…' : s; };
  const tw = s => Math.max(40, s.length * CW);
  const pretty = s => String(s).replace(/<-/g, '←').replace(/<=/g, '≤').replace(/>=/g, '≥').replace(/<>/g, '≠');
  const X = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const GAP = 24;

  function node(kind, text, line) {
    text = clip(pretty(text));
    const t = tw(text);
    let w, h;
    if (kind === 'dec') { w = Math.max(120, t + 56); h = 64; } else if (kind === 'term') { w = t + 34; h = 34; } else { w = t + (kind === 'io' ? 38 : 26); h = 36; }
    return {
      w, h, cx: w / 2, kind, line,
      draw(x, y) {
        const cx = x + w / 2; let shape;
        if (kind === 'term') shape = `<rect class="fl-node fl-term" x="${x}" y="${y}" width="${w}" height="${h}" rx="17"/>`;
        else if (kind === 'proc') shape = `<rect class="fl-node fl-proc" x="${x}" y="${y}" width="${w}" height="${h}" rx="3"/>`;
        else if (kind === 'io') { const k = 11; shape = `<path class="fl-node fl-io" d="M${x + k} ${y}H${x + w}L${x + w - k} ${y + h}H${x}Z"/>`; }
        else shape = `<path class="fl-node fl-dec" d="M${cx} ${y}L${x + w} ${y + h / 2}L${cx} ${y + h}L${x} ${y + h / 2}Z"/>`;
        return `<g data-line="${line ?? ''}">${shape}<text class="fl-txt" x="${cx}" y="${y + h / 2 + 4}" text-anchor="middle">${X(text)}</text></g>`;
      },
    };
  }
  const arrow = (x1, y1, x2, y2) => `<path class="fl-edge" d="M${x1} ${y1}L${x2} ${y2}"/>` + head(x2, y2, x1 === x2 ? (y2 > y1 ? 'd' : 'u') : (x2 > x1 ? 'r' : 'l'));
  const head = (x, y, dir) => {
    const s = 5;
    const pts = { d: [[x, y], [x - s, y - 8], [x + s, y - 8]], u: [[x, y], [x - s, y + 8], [x + s, y + 8]], r: [[x, y], [x - 8, y - s], [x - 8, y + s]], l: [[x, y], [x + 8, y - s], [x + 8, y + s]] }[dir];
    return `<path class="fl-arrow" d="M${pts.map(p => p.join(' ')).join('L')}Z"/>`;
  };
  const line = d => `<path class="fl-edge" d="${d}"/>`;
  const lbl = (x, y, t, anchor = 'middle') => `<text class="fl-lbl" x="${x}" y="${y}" text-anchor="${anchor}">${t}</text>`;

  function seq(items) {
    items = items.filter(b => !b.skip);
    if (!items.length) return { w: 20, h: 0, cx: 10, draw: () => '', empty: true };
    const cx = Math.max(...items.map(b => b.cx));
    const right = Math.max(...items.map(b => b.w - b.cx));
    const w = cx + right;
    const h = items.reduce((a, b) => a + b.h, 0) + GAP * (items.length - 1);
    return {
      w, h, cx,
      draw(x, y) {
        let s = '', yy = y;
        items.forEach((b, i) => {
          s += b.draw(x + cx - b.cx, yy);
          yy += b.h;
          if (i < items.length - 1) { s += arrow(x + cx, yy, x + cx, yy + GAP); yy += GAP; }
        });
        return s;
      },
    };
  }
  function ifBlock(st) {
    const d = node('dec', st.condSrc + ' ?', st.n);
    const Y = seq(st.yes.map(lay)), N = seq(st.no.map(lay));
    const offL = Math.max(d.w / 2 + 16, (N.empty ? 0 : N.w - N.cx) + 16);
    const offR = Math.max(d.w / 2 + 16, (Y.empty ? 0 : Y.cx) + 16);
    const leftExt = offL + (N.empty ? 0 : N.cx), rightExt = offR + (Y.empty ? 0 : Y.w - Y.cx);
    const cx = leftExt + 4, w = leftExt + rightExt + 8;
    const nAxis = cx - offL, yAxis = cx + offR;
    const bh = Math.max(Y.h, N.h);
    const H = d.h / 2 + 18 + bh + 30;
    return {
      w, h: H, cx,
      draw(x, y) {
        let s = d.draw(x + cx - d.w / 2, y);
        const my = y + d.h / 2, top = my + 18, bot = top + bh + 14;
        s += line(`M${x + cx + d.w / 2} ${my}H${x + yAxis}V${top}`) + head(x + yAxis, top, 'd') + lbl(x + cx + d.w / 2 + 6, my - 6, 'V', 'start');
        s += line(`M${x + cx - d.w / 2} ${my}H${x + nAxis}V${top}`) + head(x + nAxis, top, 'd') + lbl(x + cx - d.w / 2 - 6, my - 6, 'F', 'end');
        s += Y.draw(x + yAxis - Y.cx, top) + N.draw(x + nAxis - N.cx, top);
        s += line(`M${x + yAxis} ${top + Y.h}V${bot}H${x + cx}`) + line(`M${x + nAxis} ${top + N.h}V${bot}H${x + cx}`);
        s += `<circle class="fl-dot" cx="${x + cx}" cy="${bot}" r="3.5"/>`;
        s += line(`M${x + cx} ${bot}V${y + H}`);
        return s;
      },
    };
  }
  function loopBlock(d, body, { bottomCond = false, inc = null, init = null } = {}) {
    // while/for: [init] → dec → (V) body [inc] → vuelve a dec; (F) sale por derecha
    // repeat: body → dec → (F/V) vuelve arriba; (otra) sale abajo
    const B = seq([...body.map(lay), ...(inc ? [inc] : [])]);
    const m = 34;
    const cx = Math.max(B.cx, d.w / 2) + m;
    const w = cx + Math.max(B.w - B.cx, d.w / 2) + m + 10;
    const initH = init ? init.h + GAP : 0;
    if (!bottomCond) {
      const h = initH + d.h + GAP + (B.empty ? 0 : B.h) + 30;
      return {
        w, h, cx,
        draw(x, y) {
          let s = '', yy = y;
          if (init) { s += init.draw(x + cx - init.w / 2, yy); yy += init.h; s += arrow(x + cx, yy, x + cx, yy + GAP); yy += GAP; }
          const dy = yy;
          s += d.draw(x + cx - d.w / 2, dy);
          const by = dy + d.h + GAP;
          s += arrow(x + cx, dy + d.h, x + cx, by) + lbl(x + cx + 6, dy + d.h + 13, 'V', 'start');
          s += B.draw(x + cx - B.cx, by);
          const be = by + (B.empty ? 0 : B.h);
          // vuelta: baja, va a la izquierda, sube y entra al rombo por arriba
          const lx = x + 8, ty = dy - 12;
          s += line(`M${x + cx} ${be}V${be + 12}H${lx}V${ty}H${x + cx}`) + head(x + cx, dy, 'd') + line(`M${x + cx} ${ty}V${dy}`);
          // salida F por la derecha
          const rx = x + w - 6;
          s += line(`M${x + cx + d.w / 2} ${dy + d.h / 2}H${rx}V${be + 24}H${x + cx}`) + lbl(x + cx + d.w / 2 + 8, dy + d.h / 2 - 6, 'F', 'start');
          s += line(`M${x + cx} ${be + 24}V${y + h}`);
          return s;
        },
      };
    }
    const h = (B.empty ? 0 : B.h) + GAP + d.h + 24;
    return {
      w, h, cx,
      draw(x, y) {
        let s = '';
        const ty = y;
        s += B.draw(x + cx - B.cx, ty + 12);
        const dy = ty + 12 + (B.empty ? 0 : B.h) + GAP;
        s += arrow(x + cx, dy - GAP, x + cx, dy);
        s += d.draw(x + cx - d.w / 2, dy);
        // vuelve arriba si no se cumple la salida
        const lx = x + 8;
        s += line(`M${x + cx - d.w / 2} ${dy + d.h / 2}H${lx}V${ty}H${x + cx}`) + line(`M${x + cx} ${ty}V${ty + 12}`) + head(x + cx, ty + 12, 'd');
        s += lbl(x + cx - d.w / 2 - 8, dy + d.h / 2 - 6, d.backLbl, 'end');
        s += line(`M${x + cx} ${dy + d.h}V${y + h}`) + lbl(x + cx + 6, dy + d.h + 13, d.outLbl, 'start');
        return s;
      },
    };
  }
  function lay(st) {
    switch (st.k) {
      case 'def': return { w: 0, h: 0, cx: 0, draw: () => '', skip: true };
      case 'read': return node('io', 'Leer ' + st.vars.join(', '), st.n);
      case 'write': return node('io', 'Escribir ' + st.raw, st.n);
      case 'assign': return node('proc', st.src, st.n);
      case 'if': return ifBlock(st);
      case 'while': return loopBlock(node('dec', st.condSrc + ' ?', st.n), st.body);
      case 'for': {
        const stp = st.stepSrc.trim();
        const neg = /^-/.test(stp);
        return loopBlock(node('dec', `${st.v} ${neg ? '≥' : '≤'} ${st.toSrc} ?`, st.n), st.body,
          { init: node('proc', `${st.v} ← ${st.fromSrc}`, st.n), inc: node('proc', `${st.v} ← ${st.v} ${neg ? '-' : '+'} ${stp.replace(/^-/, '')}`, st.n) });
      }
      case 'repeat': {
        const d = node('dec', st.condSrc + ' ?', st.nEnd);
        d.backLbl = st.until ? 'F' : 'V'; d.outLbl = st.until ? 'V' : 'F';
        return loopBlock(d, st.body, { bottomCond: true });
      }
      case 'switch': {
        // se dibuja como decisiones encadenadas
        const chain = (k) => {
          if (k >= st.cases.length) return st.def ? st.def.body : [];
          const c = st.cases[k];
          return [{ k: 'if', n: c.n, condSrc: `${st.eSrc} = ${c.valSrc}`, yes: c.body, no: chain(k + 1) }];
        };
        return seq(chain(0).map(lay));
      }
    }
    return node('proc', '?', st.n);
  }
  function flowchart(code) {
    const prog = parse(code);
    const items = [node('term', 'Inicio'), ...prog.body.map(lay).filter(b => !b.skip), node('term', 'Fin')];
    const S = seq(items);
    const pad = 16;
    const W = Math.ceil(S.w + pad * 2), H = Math.ceil(S.h + pad * 2);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Diagrama de flujo">${S.draw(pad, pad)}</svg>`;
  }

  return { parse, run, flowchart, fmt, PErr };
})();
