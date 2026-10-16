
/* ================= BETA : tout remettre à zéro (Réglages) ================= */
// Efface sur CET appareil : trophées (et les compteurs qui les débloquent), disques, record local.
// Conserve : record du classement mondial (lbBest), nom et identifiant du classement, accessoires achetés.
// L'appareil est délié avant d'effacer (sinon la synchro ramènerait trophées et disques des autres appareils).
// Les stats déjà envoyées restent comptées dans les stats mondiales : elles sont mises de côté dans d.arch et ajoutées à l'envoi.
Object.assign(TEXTS, {
  "rst.btn":    { fr:"Tout remettre à zéro", en:"Reset everything", es:"Reiniciar todo" },
  "rst.q":      { fr:"Effacer tous tes trophées, tes disques et ton record sur cet appareil ? Ton record au classement mondial est conservé.", en:"Erase all your trophies, discs and record on this device? Your world ranking record is kept.", es:"¿Borrar todos tus trofeos, discos y récord en este dispositivo? Tu récord en la clasificación mundial se conserva." },
  "rst.linked": { fr:" Cet appareil sera aussi délié de tes autres appareils.", en:" This device will also be unlinked from your other devices.", es:" Este dispositivo también se desvinculará de tus otros dispositivos." },
  "rst.yes":    { fr:"Tout effacer", en:"Erase everything", es:"Borrar todo" },
  "rst.no":     { fr:"Annuler", en:"Cancel", es:"Cancelar" },
  "rst.done":   { fr:"C’est reparti de zéro !", en:"Fresh start!", es:"¡Desde cero!" }
});
// stats envoyées au classement mondial : on y ajoute ce qui a été mis de côté lors d'une remise à zéro
function statsArchive(p){
  const A = TR.d.arch; if (!A) return p;
  for (const k in A){
    if (k === 'deathBy' || k === 'deathTh'){ const m = Object.assign({}, p[k] || {}); for (const i in A[k]) m[i] = (m[i] || 0) + A[k][i]; p[k] = m; }
    else if (k === 'streak') p[k] = Math.max(p[k] || 0, A[k]);
    else if (typeof A[k] === 'number') p[k] = (p[k] || 0) + A[k];
  }
  return p;
}
function resetAll(){
  if (SYNC.linked()) SYNC.unlink();
  const d = TR.d, st = d.st, A = d.arch || {};
  const add = (k, v) => { A[k] = (A[k] || 0) + (+v || 0); };
  for (const k of ['games', 'discs', 'rb', 'spent', 'sharks']) add(k, d[k]);
  for (const k of ['ko', 'doe', 'stag', 'dist', 'missed', 'fires', 'socks', 'slows', 'time', 'combo', 'superC', 'mega', 'giga']) add(k, st[k]);
  A.streak = Math.max(A.streak || 0, st.streak || 0);
  for (const m of ['deathBy', 'deathTh']){ A[m] = A[m] || {}; for (const k in st[m] || {}) A[m][k] = (A[m][k] || 0) + (+st[m][k] || 0); }
  d.arch = A;
  Object.assign(d, { u:{}, s:{}, games:0, discs:0, sharks:0, th:0, birds:0, rbMiss:0, rb:0, deer:0, deaths:0, spent:0, tried:{}, helmet:0, coins:0 });
  d.st = { combo:0, superC:0, mega:0, giga:0, ko:0, doe:0, stag:0, dist:0, streak:0, missed:0, fires:0, socks:0, slows:0, time:0, deathBy:{}, deathTh:{} };
  TR.save();
  best = 0; sealedSave('stellyrun_best', '0');
  refreshTrophyBadge(); showTitleRecord(); setUI.refresh();
  try { LB.sendStats(); } catch(e){}
}
{ const css = document.createElement('style');
  css.textContent = '#rstbtn{ font-family:inherit; font-weight:700; font-size:max(calc(var(--s)*4.2px),9px); color:#FF8A7A; background:none; border:0; text-decoration:underline; cursor:pointer; padding:calc(var(--s)*1px); }'
    + '#rstbox{ display:flex; flex-direction:column; align-items:center; gap:calc(var(--s)*3px); max-width:calc(var(--s)*200px); padding:calc(var(--s)*4px) calc(var(--s)*6px); border:calc(var(--s)*1px) solid #FF8A7A; border-radius:calc(var(--s)*3px); background:rgba(255,138,122,.12); }'
    + '#rstbox[hidden]{ display:none; }'
    + '#rstbox p{ margin:0; text-align:center; font-weight:600; font-size:max(calc(var(--s)*4.8px),10px); color:#FFD9D3; line-height:1.3; }'
    + '#rstbox .row{ display:flex; gap:calc(var(--s)*4px); }'
    + '#rstbox .btn{ font-size:max(calc(var(--s)*6px),11px); padding:calc(var(--s)*1.5px) calc(var(--s)*5px) calc(var(--s)*2px); animation:none; }'
    + '#rstbox .btn.danger{ background:#E0413A; color:#fff; box-shadow:inset 0 calc(var(--s)*-2px) 0 #A82A2A, 0 calc(var(--s)*2px) 0 var(--plum); }';
  document.head.appendChild(css);
  const b = document.createElement('button'); b.id = 'rstbtn'; b.type = 'button';
  const box = document.createElement('div'); box.id = 'rstbox'; box.hidden = true;
  box.innerHTML = '<p></p><div class="row"><button type="button" class="btn danger yes"></button><button type="button" class="btn alt no"></button></div>';
  $('xunlink').after(b, box);
  const label = () => { b.textContent = txt('rst.btn'); };
  b.addEventListener('click', e => { e.stopPropagation(); box.querySelector('p').textContent = txt('rst.q') + (SYNC.linked() ? txt('rst.linked') : '');
    box.querySelector('.yes').textContent = txt('rst.yes'); box.querySelector('.no').textContent = txt('rst.no'); box.hidden = false; b.hidden = true; });
  box.querySelector('.no').addEventListener('click', e => { e.stopPropagation(); box.hidden = true; b.hidden = false; });
  box.querySelector('.yes').addEventListener('click', e => { e.stopPropagation(); resetAll(); box.hidden = true; b.hidden = false; sfx.world(); toast(txt('rst.done'), true); });
  $('setbtn').addEventListener('click', () => { box.hidden = true; b.hidden = false; label(); });
  label(); }
