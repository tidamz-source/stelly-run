
/* ================= BETA : consommables (1 500 disques, un seul par partie) ================= */
// Bouclier, Chaussette de départ, Chrono de poche, Gant collant, Billet de biome : choisis sur l'accueil, payés au départ de la partie
// Ressort : proposé au moment de la mort (1 500, puis 3 000 pour un 2e rebond), seulement si aucun autre consommable n'a servi
// toute partie avec un consommable est « boostée » : elle ne compte pas pour le classement
Object.assign(TEXTS, {
  "cons.title":   { fr:"1 consommable par partie", en:"1 power-up per run", es:"1 consumible por partida" },
  "cons.have":    { fr:"tu as {n}", en:"you have {n}", es:"tienes {n}" },
  "cons.need":    { fr:"Il te faut {p} disques (tu en as {n})", en:"You need {p} discs (you have {n})", es:"Necesitas {p} discos (tienes {n})" },
  "cons.shield.n":{ fr:"Bouclier", en:"Shield", es:"Escudo" },
  "cons.shield.d":{ fr:"absorbe un choc", en:"absorbs one hit", es:"absorbe un golpe" },
  "cons.sock.n":  { fr:"Chaussette de départ", en:"Head-start sock", es:"Calcetín de salida" },
  "cons.sock.d":  { fr:"7 s de super saut dès le départ", en:"7 s of super jump from the start", es:"7 s de supersalto desde la salida" },
  "cons.chrono.n":{ fr:"Chrono de poche", en:"Pocket stopwatch", es:"Cronómetro de bolsillo" },
  "cons.chrono.d":{ fr:"un Fast Count à déclencher quand tu veux", en:"a Fast Count to trigger whenever you want", es:"un Fast Count para activar cuando quieras" },
  "cons.glove.n": { fr:"Gant collant", en:"Sticky glove", es:"Guante pegajoso" },
  "cons.glove.d": { fr:"un disque raté ne casse pas la série", en:"one missed disc won't break your streak", es:"un disco fallado no rompe la racha" },
  "cons.ticket.n":{ fr:"Billet de biome", en:"Biome ticket", es:"Billete de bioma" },
  "cons.ticket.d":{ fr:"départ en {b} (touche encore pour changer)", en:"start in {b} (tap again to change)", es:"salida en {b} (toca otra vez para cambiar)" },
  "cons.spring.q":{ fr:"Rebondir ?", en:"Bounce back?", es:"¿Rebotar?" },
  "cons.spring.no":{ fr:"Non merci", en:"No thanks", es:"No, gracias" },
  "cons.shieldUsed":{ fr:"Bouclier !", en:"Shield!", es:"¡Escudo!" },
  "cons.gloveUsed": { fr:"Gant collant !", en:"Sticky glove!", es:"¡Guante pegajoso!" },
  "cons.springUsed":{ fr:"Rebond !", en:"Bounce!", es:"¡Rebote!" },
  "cons.boosted": { fr:"Partie boostée : hors classement", en:"Boosted run: not ranked", es:"Partida potenciada: fuera de la clasificación" }
});
const CONS_PRICE = 1500;
const BIOME_ORDER = [0, 1, 2, 3, 6, 4, 5];   // stade, indoor, beach, neige, campagne, ville, forêt
let biomeOff = 0, consSel = null, consTicket = 1, consSkip = false;
const RUN_C = { used:null, shield:0, glove:0, chrono:0, springs:0, boosted:false };
const coinsNow = () => TR.d.coins;
const fmtC = n => fmtN ? fmtN(n) : String(n);

// ---------- icônes ----------
const ICO_SHIELD = mk(11, 12, g => pm(g, ['ooooooooooo', 'owwwwbbbbbo', 'owwwwbbbbbo', 'owwwwbbbbbo', 'owwwwbbbbbo', 'obbbbbwwwwo', '.obbbbwwwo.',
  '.obbbbwwwo.', '..obbbwwo..', '..obbbwwo..', '...obbwo...', '....ooo....'], 0, 0, false, { o:C.plum, w:C.white, b:'#3FA3E0' }));
const ICO_GLOVE = mk(12, 12, g => pm(g, ['....oo......', '...oyyo.....', '...oyyo.....', '...oyyoooo..', '...oyyoyyoo.', '.ooyyyyyyyyo', 'oyyoyyyyyyyo',
  'oyyyyyyyyyyo', '.oyyyyyyyyyo', '..oyyyyyyyo.', '...oyyyyyo..', '...ooooooo..'], 0, 0, false, { o:C.plum, y:'#9BE07A' }));
const ICO_TICKET = mk(14, 8, g => pm(g, ['oooooooooooooo', 'oyyyy.yyyyyyyo', 'oyyyyoyOOOOyyo', '.oyyy.yyyyyyo.', '.oyyyoyOOOyyo.', 'oyyyy.yyyyyyyo',
  'oyyyyoyyyyyyyo', 'oooooooooooooo'], 0, 0, false, { o:C.plum, y:C.yellow, O:C.orange }));
const ICO_SPRING = mk(10, 12, g => pm(g, ['..oooooo..', '..oyyyyo..', '...oooo...', '.oggggggo.', '..o....o..', '.oggggggo.', '..o....o..', '.oggggggo.',
  '..o....o..', '.oggggggo.', '..oyyyyo..', '..oooooo..'], 0, 0, false, { o:C.plum, y:C.yellow, g:'#B9C2CE' }));
const CONS = [
  { id:'shield', icon: () => ICO_SHIELD }, { id:'sock', icon: () => SOCK[0] }, { id:'chrono', icon: () => CHRONO[0] },
  { id:'glove', icon: () => ICO_GLOVE }, { id:'ticket', icon: () => ICO_TICKET }
];
const cvOf = img => { const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; c.getContext('2d').drawImage(img, 0, 0); return c; };

// ---------- styles ----------
{ const css = document.createElement('style');
  css.textContent = '.legend .cbar{ display:flex; align-items:center; gap:calc(var(--s)*3px); }'
    + '.cbtn{ pointer-events:auto; display:flex; align-items:center; justify-content:center; height:calc(var(--s)*13px); min-width:calc(var(--s)*13px); padding:0 calc(var(--s)*1.5px);'
    + ' background:transparent; border:calc(var(--s)*1px) solid transparent; border-radius:calc(var(--s)*2px); cursor:pointer; }'
    + '.cbtn canvas{ height:calc(var(--s)*10px) !important; width:auto; image-rendering:pixelated; }'
    + '.cbtn.sel{ background:var(--yellow); border-color:var(--plum); }'
    + '.cbtn.off canvas{ opacity:.35; }'
    + '.cbtn:focus-visible{ outline:calc(var(--s)*1px) dashed var(--plum); outline-offset:1px; }'
    + '.legend .clab{ max-width:calc(var(--s)*120px); line-height:1.15; }'
    + '.legend .clab small{ display:block; font-weight:600; color:var(--purple); font-size:.85em; }'
    + '#conshud{ position:absolute; top:calc(var(--s)*24px); left:calc(var(--s)*10px); display:flex; gap:calc(var(--s)*3px); pointer-events:none; }'
    + '#conshud > *{ display:flex; align-items:center; justify-content:center; height:calc(var(--s)*12px); min-width:calc(var(--s)*12px); background:rgba(255,255,255,.85);'
    + ' border:calc(var(--s)*1px) solid var(--plum); border-radius:calc(var(--s)*2px); padding:0 calc(var(--s)*1px); }'
    + '#conshud canvas{ height:calc(var(--s)*9px); width:auto; image-rendering:pixelated; }'
    + '#conshud button{ pointer-events:auto; cursor:pointer; background:var(--yellow); animation:breathe 1.3s ease-in-out infinite; }'
    + '#spring{ position:absolute; inset:0; z-index:45; display:flex; align-items:center; justify-content:center; background:rgba(46,14,48,.45); }'
    + '#spring[hidden]{ display:none; }'
    + '#spring .sp{ display:flex; flex-direction:column; align-items:center; gap:calc(var(--s)*4px); padding:calc(var(--s)*6px) calc(var(--s)*10px); background:var(--plum);'
    + ' border:calc(var(--s)*2px) solid var(--yellow); border-radius:calc(var(--s)*3px); color:var(--white); font-weight:700; font-size:max(calc(var(--s)*8px),14px); }'
    + '#spring .sp canvas.ic{ height:calc(var(--s)*18px); width:auto; image-rendering:pixelated; }'
    + '#spring .row{ display:flex; gap:calc(var(--s)*5px); }'
    + '#spring .btn{ font-size:max(calc(var(--s)*7px),12px); padding:calc(var(--s)*2px) calc(var(--s)*6px); display:flex; align-items:center; gap:calc(var(--s)*2px); }'
    + '#spring .btn canvas{ height:calc(var(--s)*6px); width:auto; image-rendering:pixelated; }'
    + '#spring .bar{ width:100%; height:calc(var(--s)*2px); background:rgba(255,255,255,.2); border-radius:9px; overflow:hidden; }'
    + '#spring .bar i{ display:block; height:100%; background:var(--yellow); transform-origin:left; }'
    + '#boosted{ margin:calc(var(--s)*1px) 0 0; font-size:max(calc(var(--s)*5px),10px); font-weight:700; color:var(--purple); }';
  document.head.appendChild(css); }

// ---------- barre de choix sur l'accueil (remplace la légende) ----------
const cbar = (() => {
  const box = document.querySelector('#title .legend > div'), rec = $('trec');
  box.textContent = ''; const wrapEl = document.createElement('div'); wrapEl.className = 'cbar';
  const lab = document.createElement('span'); lab.className = 'clab';
  const btns = CONS.map(c => { const b = document.createElement('button'); b.type = 'button'; b.className = 'cbtn'; b.dataset.id = c.id; b.appendChild(cvOf(c.icon())); return b; });
  wrapEl.append(lab, ...btns); box.append(wrapEl, rec);
  let msg = null;
  function refresh(){
    const n = coinsNow();
    btns.forEach(b => { b.classList.toggle('sel', b.dataset.id === consSel); b.classList.toggle('off', n < CONS_PRICE && b.dataset.id !== consSel);
      b.setAttribute('aria-label', txt('cons.' + b.dataset.id + '.n')); b.setAttribute('aria-pressed', String(b.dataset.id === consSel)); });
    if (msg){ lab.innerHTML = ''; lab.textContent = msg; return; }
    if (consSel){ const d = consSel === 'ticket' ? txt('cons.ticket.d', { b: THEME_NAMES[BIOME_ORDER[consTicket]] }) : txt('cons.' + consSel + '.d');
      lab.innerHTML = '<b></b><small></small>'; lab.querySelector('b').textContent = txt('cons.' + consSel + '.n') + ' · ' + fmtC(CONS_PRICE); lab.querySelector('small').textContent = d; }
    else { lab.innerHTML = '<b></b><small></small>'; lab.querySelector('b').textContent = txt('cons.title') + ' · ' + fmtC(CONS_PRICE); lab.querySelector('small').textContent = txt('cons.have', { n: fmtC(n) }); }
  }
  let msgT = 0;
  wrapEl.addEventListener('click', e => { const b = e.target.closest('.cbtn'); if (!b) return; e.stopPropagation(); ensureAudio();
    const id = b.dataset.id;
    if (consSel !== id && coinsNow() < CONS_PRICE){ msg = txt('cons.need', { p: fmtC(CONS_PRICE), n: fmtC(coinsNow()) }); clearTimeout(msgT); msgT = setTimeout(() => { msg = null; refresh(); }, 2200); refresh(); return; }
    if (id === 'ticket' && consSel === 'ticket'){ consTicket++; if (consTicket >= BIOME_ORDER.length){ consTicket = 1; consSel = null; } }
    else consSel = consSel === id ? null : id;
    msg = null; sfx.start(); refresh(); });
  wrapEl.addEventListener('pointerdown', e => { if (e.target.closest('.cbtn')) e.stopPropagation(); });
  setInterval(() => { if (state === 'title') refresh(); }, 1000);
  refresh(); return { refresh };
})();

// ---------- pendant la partie ----------
const hudC = document.createElement('div'); hudC.id = 'conshud'; ui.hud.appendChild(hudC);
function hudRefresh(){
  hudC.textContent = '';
  if (RUN_C.shield) hudC.appendChild(Object.assign(document.createElement('span'), { title: txt('cons.shield.n') })).appendChild(cvOf(ICO_SHIELD));
  if (RUN_C.glove) hudC.appendChild(Object.assign(document.createElement('span'), { title: txt('cons.glove.n') })).appendChild(cvOf(ICO_GLOVE));
  if (RUN_C.chrono){ const b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', txt('cons.chrono.n')); b.appendChild(cvOf(CHRONO[0]));
    b.addEventListener('pointerdown', e => { e.stopPropagation(); e.preventDefault(); useChrono(); }); hudC.appendChild(b); }
}
function useChrono(){
  if (!RUN_C.chrono || state !== 'play') return; RUN_C.chrono = 0;
  TR.slow(); safeT = .5; slowMul = Math.max(.35, slowMul*.78); slowFx = 1.1; slowX = P.x; slowY = P.y - 30; sfx.slow(); toast(txt('toast.timeout'));
  hudRefresh();
}
// appelé au départ de chaque partie (startGame)
function consStart(){
  Object.assign(RUN_C, { used:null, shield:0, glove:0, chrono:0, springs:0, boosted:false }); biomeOff = 0; consSkip = false; springUI.hide();
  if (consSel && coinsNow() >= CONS_PRICE){
    TR.d.coins -= CONS_PRICE; TR.save(); RUN_C.used = consSel; RUN_C.boosted = true;
    if (consSel === 'shield') RUN_C.shield = 1;
    else if (consSel === 'glove') RUN_C.glove = 1;
    else if (consSel === 'chrono') RUN_C.chrono = 1;
    else if (consSel === 'sock'){ P.sockT = 7; sfx.sock(); toast(txt('toast.superJump')); }
    else if (consSel === 'ticket') biomeOff = consTicket;
  }
  consSel = null; hudRefresh(); cbar.refresh();
}
// un disque raté : le gant garde la série (une fois)
function consGlove(){ if (!RUN_C.glove) return false; RUN_C.glove = 0; toast(txt('cons.gloveUsed')); hudRefresh(); return true; }
// appelé au tout début de die() : true = la mort est évitée (bouclier) ou suspendue (ressort proposé)
function consHit(kind){
  if (consSkip){ consSkip = false; return false; }
  if (RUN_C.shield){ RUN_C.shield = 0; graceT = 1.5; safeT = .3; sfx.smash(); shake = Math.max(shake, .12); burst(P.x, P.y - 28, 14, [C.white, '#9AD8F5', C.purpleL], 90, 200);
    toast(txt('cons.shieldUsed')); hudRefresh(); return true; }
  if ((RUN_C.used === null || RUN_C.used === 'spring') && RUN_C.springs < 2){
    const price = CONS_PRICE*(RUN_C.springs + 1);
    if (coinsNow() >= price){ springUI.offer(kind, price); return true; }
  }
  return false;
}
// ---------- le Ressort, proposé à la mort ----------
const springUI = (() => {
  const el = document.createElement('div'); el.id = 'spring'; el.hidden = true;
  el.innerHTML = '<div class="sp"><span class="q"></span><div class="row"><button type="button" class="btn yes"></button><button type="button" class="btn alt no"></button></div><div class="bar"><i></i></div></div>';
  const sp = el.querySelector('.sp'); sp.insertBefore(Object.assign(cvOf(ICO_SPRING), { className:'ic' }), sp.firstChild);
  $('news').parentElement.appendChild(el);
  const yes = el.querySelector('.yes'), no = el.querySelector('.no'), bar = el.querySelector('.bar i');
  let kind = null, price = 0, t0 = 0, raf = 0, armed = false;
  const DUR = 3000;
  function tick(now){ const k = Math.max(0, 1 - (now - t0)/DUR); bar.style.transform = 'scaleX(' + k.toFixed(3) + ')'; armed = now - t0 > 350; if (k <= 0) decline(); else raf = requestAnimationFrame(tick); }
  function hide(){ cancelAnimationFrame(raf); el.hidden = true; kind = null; }
  function offer(k, p){ kind = k; price = p; state = 'revive'; MUSIC.pause(); $('pausebtn').hidden = true;
    el.querySelector('.q').textContent = txt('cons.spring.q');
    yes.innerHTML = ''; yes.append(document.createTextNode(fmtC(p) + ' '), cvOf(DISC)); no.textContent = txt('cons.spring.no');
    el.hidden = false; t0 = performance.now(); armed = false; raf = requestAnimationFrame(tick); }
  function accept(){ if (!kind || !armed) return; const p = price; hide();
    TR.d.coins -= p; TR.save(); RUN_C.springs++; RUN_C.used = 'spring'; RUN_C.boosted = true;
    state = 'play'; MUSIC.resume(); last = 0; $('pausebtn').hidden = false;
    P.vy = -460; P.ground = false; P.buf = 0; P.sink = false; graceT = 2; safeT = .3; sfx.sock(); burst(P.x, P.y - 10, 16, [C.yellow, C.white, '#B9C2CE'], 90, 160); toast(txt('cons.springUsed')); }
  function decline(){ if (!kind) return; const k = kind; hide(); state = 'play'; consSkip = true; die(k); }
  yes.addEventListener('click', e => { e.stopPropagation(); accept(); });
  no.addEventListener('click', e => { e.stopPropagation(); if (armed) decline(); });
  el.addEventListener('pointerdown', e => e.stopPropagation());
  return { offer, hide };
})();
// ---------- écran de fin : partie boostée ----------
{ const p = document.createElement('p'); p.id = 'boosted'; p.hidden = true; $('bestline').after(p);
  setInterval(() => { const on = state === 'over' && RUN_C.boosted; if (p.hidden === on){ p.hidden = !on; p.textContent = txt('cons.boosted'); } }, 200); }
