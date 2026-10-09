/* Arranque de la plataforma */
'use strict';
(function boot() {
  UI.setTheme(store.get('theme', 'auto'));
  document.documentElement.style.setProperty('--fs', store.get('fs', 1));
  matchMedia('(prefers-color-scheme: light)').addEventListener?.('change', () => { if (store.get('theme', 'auto') === 'auto') UI.setTheme('auto'); });

  Game.load();
  App.buildShell();
  $$('[data-open-settings]').forEach(b => b.onclick = openSettings);
  $$('[data-theme-toggle]').forEach(b => b.onclick = () => UI.cycleTheme());
  $$('[data-rank-open]').forEach(b => b.onclick = () => App.go('inicio'));
  UI.refreshRank();
  Player.init();
  updateBadges();
  setInterval(updateBadges, 60e3);

  // compatibilidad con la v2: la última pestaña guardada se llamaba lastTab
  const legacy = { resumen: 'inicio', subnetting: 'subneteo', flashcards: 'fichas', videoteca: 'videos', bibliografia: 'biblioteca' };
  const lt = store.get('lastTab', null);
  if (lt && !store.get('lastView', null)) store.set('lastView', legacy[lt] || lt);

  // atajos globales: g + letra
  let gPressed = 0;
  document.addEventListener('keydown', e => {
    if (/input|textarea|select/i.test(e.target.tagName) || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'Escape') { UI.closeModal(); return; }
    if (e.key === 'g') { gPressed = Date.now(); return; }
    if (Date.now() - gPressed < 900) {
      const map = { i: 'inicio', p: 'programa', t: 'teoria', o: 'podcasts', v: 'videos', s: 'simulacro', a: 'arcade', l: 'algoritmos', f: 'fichas', m: 'memoria' };
      if (map[e.key]) { App.go(map[e.key]); gPressed = 0; }
    }
    if (e.key === 'k' && Player.ep && App.cur !== 'fichas') { e.preventDefault(); Player.toggle(); }
  });

  window.addEventListener('resize', () => { if ($('#player').classList.contains('on')) document.documentElement.style.setProperty('--player-h', window.innerWidth <= 960 ? '112px' : '72px'); });
  window.addEventListener('beforeunload', () => Player.save());
  App.route();

  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(() => { /* sin soporte offline */ });
  }
})();
