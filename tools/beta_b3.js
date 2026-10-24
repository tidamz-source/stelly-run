
/* ================= BETA b3 : prise en main, accueil allégé, fin de partie (audit CrazyGames) ================= */
// 1. premier lancement : la course démarre toute seule ; arrêt + « Espace / touche pour sauter » devant le premier obstacle ;
//    petites bulles la première fois qu'apparaissent une chaussette, une gourde, un chrono, un oiseau ; tutoriel en diaporama retiré
// 2. accueil : plus de légende, de version, de stats ni de news (dans Réglages ; point rouge sur la roue dentée s'il y a des news)
// 3. fin de partie : nom pour le classement sur demande (bouton) si aucun nom n'a encore été donné ; chiffres plus gros ; objectifs
// 4. Échap ne met plus en pause (P seulement ; la pause automatique quand on quitte la fenêtre reste)
const esc = v => String(v).replace(/[&<>]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' })[c]);
Object.assign(TEXTS, {
  'onb.jump':   { fr:'pour sauter', en:'to jump', es:'para saltar' },
  'onb.tap':    { fr:'Touche l’écran', en:'Tap', es:'Toca la pantalla' },
  'onb.hold':   { fr:'Maintiens pour sauter plus haut', en:'Hold to jump higher', es:'Mantén para saltar más alto' },
  'onb.skip':   { fr:'Passer le tutoriel', en:'Skip tutorial', es:'Saltar tutorial' },
  'onb.disc':   { fr:'Attrape les frisbees : des points !', en:'Catch frisbees for points!', es:'¡Atrapa frisbees para sumar puntos!' },
  'onb.sock':   { fr:'Chaussette : super saut !', en:'Sock: super jump!', es:'Calcetín: ¡supersalto!' },
  'onb.fire':   { fr:'Gourde : invincible !', en:'Water bottle: invincible!', es:'Cantimplora: ¡invencible!' },
  'onb.slow':   { fr:'Chrono : le jeu ralentit !', en:'Stopwatch: slows the game down!', es:'Cronómetro: ¡el juego va más lento!' },
  'onb.bird':   { fr:'Saute sur les oiseaux pour les assommer !', en:'Land on birds to knock them out!', es:'¡Cae sobre los pájaros para noquearlos!' },
  'set.more':   { fr:'Plus', en:'More', es:'Más' },
  'set.news':   { fr:'Nouvelles', en:'News', es:'Noticias' },
  'set.stats':  { fr:'Statistiques', en:'Statistics', es:'Estadísticas' },
  'lb.ask':     { fr:'Mettre mon nom au classement', en:'Add my name to the leaderboard', es:'Poner mi nombre en la clasificación' },
  'goal.buy':   { fr:'Tu peux acheter {name} à la boutique !', en:'You can buy {name} in the shop!', es:'¡Puedes comprar {name} en la tienda!' },
  'goal.save':  { fr:'Encore {n} frisbees pour {name}', en:'{n} more frisbees for {name}', es:'{n} frisbees más para {name}' },
  });
{ const css = document.createElement('style');
  css.textContent =
    // accueil allégé
    '#title .legend, #statsbtn, #newsbtn, #wrap .ver{ display:none !important; }'
    + '#setbtn{ position:absolute; } #setbtn .dot{ position:absolute; top:calc(var(--s)*-2.5px); right:calc(var(--s)*-2.5px); width:calc(var(--s)*5px); height:calc(var(--s)*5px); border-radius:50%; background:#E0413A; border:calc(var(--s)*.8px) solid var(--plum); }'
    + '#setbtn .dot[hidden]{ display:none; }'
    // Réglages : nouvelles, stats, version
    + '#setmore{ display:flex; gap:calc(var(--s)*5px); justify-content:center; flex-wrap:wrap; margin:calc(var(--s)*4px) 0 calc(var(--s)*2px); }'
    + '#setmore .btn{ position:relative; display:flex; align-items:center; gap:calc(var(--s)*2.5px); font-size:max(calc(var(--s)*5.5px),12px); padding:calc(var(--s)*2px) calc(var(--s)*6px); animation:none; }'
    + '#setmore canvas{ height:calc(var(--s)*8px); width:auto; image-rendering:pixelated; }'
    + '#setmore .dot{ position:absolute; top:calc(var(--s)*-2px); right:calc(var(--s)*-2px); width:calc(var(--s)*5px); height:calc(var(--s)*5px); border-radius:50%; background:#E0413A; border:calc(var(--s)*.8px) solid var(--plum); }'
    + '#setmore .dot[hidden]{ display:none; }'
    + '#setver{ text-align:center; font-family:var(--num); font-size:max(calc(var(--s)*4px),10px); color:var(--purple-l); margin:calc(var(--s)*3px) 0 0; }'
    // prise en main
    + '#onb{ position:absolute; left:50%; top:30%; transform:translateX(-50%); z-index:30; display:flex; flex-direction:column; align-items:center; gap:calc(var(--s)*3px); pointer-events:none; }'
    + '#onb[hidden]{ display:none; }'
    + '#onb .k{ display:flex; align-items:center; gap:calc(var(--s)*4px); padding:calc(var(--s)*3px) calc(var(--s)*7px); background:rgba(46,14,48,.88); border:calc(var(--s)*1.5px) solid var(--yellow); border-radius:calc(var(--s)*3px);'
    + ' font-weight:700; font-size:max(calc(var(--s)*7px),14px); color:#fff; white-space:nowrap; animation:onbp .8s ease-in-out infinite alternate; }'
    + '#onb .key{ font-family:var(--num); color:var(--plum); background:#FFF4D6; border:calc(var(--s)*1px) solid var(--plum); border-bottom-width:calc(var(--s)*3px); border-radius:calc(var(--s)*2px); padding:0 calc(var(--s)*5px); }'
    + '#onb .h{ font-size:max(calc(var(--s)*5px),12px); font-weight:700; color:#fff; background:rgba(46,14,48,.8); padding:calc(var(--s)*1px) calc(var(--s)*4px); border-radius:calc(var(--s)*2px); }'
    + '#onbskip{ position:absolute; left:50%; bottom:calc(var(--s)*8px); transform:translateX(-50%); z-index:31; font-size:max(calc(var(--s)*4.5px),11px); padding:calc(var(--s)*1.5px) calc(var(--s)*5px); animation:none; }'
    + '#onbskip[hidden]{ display:none; }'
    + '@keyframes onbp{ from{ transform:scale(1); } to{ transform:scale(1.07); } }'
    // fin de partie : plus lisible, objectifs, nom sur demande
    + '.ostat b{ font-size:max(calc(var(--s)*8px),15px); } .ostat span{ font-size:max(calc(var(--s)*4.6px),10px); }'
    + '.otro .lab, .otro .nm{ font-size:max(calc(var(--s)*5px),11px); }'
    + '#ogoal{ display:flex; flex-direction:column; align-items:center; gap:calc(var(--s)*1.5px); margin:0 0 calc(var(--s)*3px); }'
    + '#ogoal[hidden]{ display:none; }'
    + '#ogoal p{ margin:0; display:flex; align-items:center; gap:calc(var(--s)*2.5px); font-size:max(calc(var(--s)*5px),11px); font-weight:700; color:#fff; }'
    + '#ogoal p b{ color:var(--yellow); } #ogoal canvas{ width:calc(var(--s)*10px); height:calc(var(--s)*10px); image-rendering:pixelated; background:#FFF4D6; border-radius:calc(var(--s)*1.5px); }'
    + '#over .panel:has(#lbentry:not([hidden]):not(.ask)) #ogoal{ display:none; }'
    + '#lbentry.ask .lbt, #lbentry.ask .lbslots, #lbentry.ask #lbsend{ display:none; } #lbask{ display:none; } #lbentry.ask #lbask{ display:block; font-size:max(calc(var(--s)*5px),11px); padding:calc(var(--s)*2px) calc(var(--s)*6px); animation:none; }';
  document.head.appendChild(css); }

const ONB = (() => {
  const KEY = 'stellyrun_onb1', SEEN = 'stellyrun_onbseen';
  const get = k => { try { return localStorage.getItem(k); } catch(e){ return null; } };
  const set = (k, v) => { try { localStorage.setItem(k, v); } catch(e){} };
  let seen = {}; try { seen = JSON.parse(get(SEEN) || '{}') || {}; } catch(e){ seen = {}; }
  const touch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
  const box = document.createElement('div'); box.id = 'onb'; box.hidden = true;
  const skip = document.createElement('button'); skip.id = 'onbskip'; skip.className = 'btn alt'; skip.hidden = true;
  $('wrap').append(box, skip);
  let active = false, scale = 1, wait = false, last = null, jumps = 0, phase = 'obs', bird = null, helped = false;
  var ONB_D = 52, ONB_B = 70;   // distances (px) où le jeu s'arrête : devant un obstacle, devant l'oiseau
  const need = () => get(KEY) !== '1';
  function done(){ if (phase !== 'obs' && nextObs > 330) nextObs = 320; active = false; wait = false; scale = 1; box.hidden = true; skip.hidden = true; set(KEY, '1'); }
  function prompt(kind){
    const key = touch ? '👆 ' + esc(txt('onb.tap')) : '<span class="key">SPACE</span>';
    box.innerHTML = kind === 'bird'
      ? '<div class="k">' + key + ' <span>' + esc(txt('onb.jump')) + '</span></div><div class="h">' + esc(txt('onb.bird')) + '</div>'
      : '<div class="k">' + key + ' <span>' + esc(txt('onb.jump')) + '</span></div><div class="h">' + esc(txt('onb.hold')) + '</div>';
    skip.textContent = txt('onb.skip'); box.hidden = false; skip.hidden = false;
  }
  skip.addEventListener('pointerdown', e => e.stopPropagation());
  skip.addEventListener('click', e => { e.stopPropagation(); skip.blur(); done(); });
  // une bulle la première fois que quelque chose apparaît (même hors tutoriel)
  function once(id, k){ if (seen[id]) return; seen[id] = 1; set(SEEN, JSON.stringify(seen)); toast(txt(k)); }
  function tick(){
    if (state !== 'play') return;
    if (active){
      if (phase === 'obs' || phase === 'clear'){   // chaque obstacle jusqu'à l'oiseau : le jeu s'arrête devant
        flyIn = Math.max(flyIn, 5); birdWait = false;   // pas d'oiseau avant l'étape de l'oiseau
        const o = obs.find(o => !o.smashed && o.x + o.w > P.x && o.x - P.x < ONB_D);
        if (o && o !== last && P.ground && !wait){ wait = true; last = o; scale = 0; prompt('jump'); }
        if (wait && !P.ground){ wait = false; scale = 1; box.hidden = true; if (++jumps >= 2 && phase === 'obs') phase = 'clear'; }
      }
      if (phase === 'clear'){   // deux obstacles passés : plus d'obstacles, on attend que la piste soit libre, puis un oiseau en bas
        nextObs = Math.max(nextObs, 400); flyIn = Math.max(flyIn, 5); birdWait = false;
        if (!wait && P.ground && !obs.some(o => o.x + o.w > P.x - 10) && FLY_BY_THEME[theme]){
          bird = { sp: FLY_BY_THEME[theme], tier: 0, x: W + 30, y0: GY - FLY_ALT[0][0], k: 1, t: 0, ph: 0, fs: 2, amp: 1.5, drift: .8, flap: 12 };
          flyers.push(bird); phase = 'bird'; }
      }
      if (phase === 'bird'){
        nextObs = Math.max(nextObs, 400); flyIn = Math.max(flyIn, 5);
        if (!wait && P.ground && !bird.ko && bird.x - P.x < ONB_B && bird.x > P.x){ wait = true; scale = 0; prompt('bird'); }
        if (wait && !P.ground){ wait = false; scale = 1; box.hidden = true; helped = true; }
        // saut guidé : l'oiseau attend devant Stelly pendant la montée, puis se place sous elle à la descente (atterrissage réussi à coup sûr)
        if (helped && !P.ground && !bird.ko){ const hw = FLY_SPECS[bird.sp].hw; bird.x = P.vy > 40 ? P.x + 1 : Math.max(bird.x, P.x + hw + 9); }
        if (bird.ko || bird.x < P.x - 30 || !flyers.includes(bird)){ nextObs = 320; done(); }
      }
    }
    if (discCount > 0) once('disc', 'onb.disc');
    for (const it of items) if (!it.got && it.x < W - 30 && ['sock', 'fire', 'slow'].includes(it.k)) once(it.k, 'onb.' + it.k);
    if (flyers.some(f => !f.ko && f.x < W - 30)) once('bird', 'onb.bird');
  }
  { const u0 = update; update = function(dt){ if (wait && P.buf > 0) scale = 1;   // appui pendant l'arrêt : le jeu repart avec le saut
    u0(dt * (state === 'play' ? scale : 1)); tick(); }; }
  return { need, start(){ if (!need()) return; active = true; scale = 1; wait = false; last = null; jumps = 0; phase = 'obs'; bird = null; helped = false; seen.bird = 1; set(SEEN, JSON.stringify(seen)); },
    stop(){ if (wait){ wait = false; scale = 1; } box.hidden = true; skip.hidden = true; active = false; },
    reset(){ set(KEY, '0'); seen = {}; set(SEEN, '{}'); } };
})();
// le tutoriel en diaporama ne s'ouvre plus : la première course sert de tutoriel
tutoUI.need = () => false;
{ const s0 = startGame; startGame = function(){ s0.apply(this, arguments); if (state === 'play') ONB.start(); }; }
new MutationObserver(() => { if (!ui.over.hidden) ONB.stop(); }).observe(ui.over, { attributes:true, attributeFilter:['hidden'] });

// Réglages : nouvelles, statistiques, version ; point rouge sur la roue dentée s'il y a des nouvelles
{ const set = $('settings'), more = document.createElement('div'); more.id = 'setmore';
  const mkb = (id, ico, key, fn) => { const b = document.createElement('button'); b.className = 'btn alt'; b.id = id;
    const c = document.createElement('canvas'), src = $(ico); c.width = src.width; c.height = src.height; c.getContext('2d').drawImage(src, 0, 0);
    const s = document.createElement('span'); s.dataset.k = key; b.append(c, s);
    b.addEventListener('click', e => { e.stopPropagation(); setUI.close(); setTimeout(fn, 60); }); return b; };
  const bn = mkb('setnews', 'icoNews', 'set.news', () => $('newsbtn').click()), bs = mkb('setstats', 'icoStats', 'set.stats', () => $('statsbtn').click());
  const dot = document.createElement('i'); dot.className = 'dot'; bn.appendChild(dot);
  const gdot = document.createElement('i'); gdot.className = 'dot'; $('setbtn').appendChild(gdot);
  const ver = document.createElement('p'); ver.id = 'setver';
  more.append(bn, bs); set.append(more, ver);
  const src = $('newsbtn').querySelector('.dot');
  const sync = () => { const on = !src.hidden; dot.hidden = !on; gdot.hidden = !on;
    bn.querySelector('span').textContent = txt('set.news'); bs.querySelector('span').textContent = txt('set.stats'); ver.textContent = 'v' + APP_VERSION + ' · beta b3'; };
  new MutationObserver(sync).observe(src, { attributes:true, attributeFilter:['hidden'] });
  new MutationObserver(sync).observe(set, { attributes:true, attributeFilter:['hidden'] });
  sync(); }

// fin de partie : objectif (prochain article à acheter)
{ const g = document.createElement('div'); g.id = 'ogoal'; g.hidden = true; $('lbentry').before(g);
  function fill(){
    const coins = TR.d.coins, list = SHOP.filter(it => it.img && it.ico && !it.trophy && !TR.d.own[it.id]).sort((a, b) => a.price - b.price);
    const lines = [];
    const can = list.filter(x => x.price <= coins), it = can.length ? can[can.length - 1] : list[0];   // le plus beau qu'on peut s'offrir, sinon le moins cher
    if (it){ const c = mk(32, 32, x => x.drawImage(it.ico, 0, 0)); const p = document.createElement('p'); p.appendChild(c);
      const s = document.createElement('span'); s.innerHTML = it.price <= coins ? esc(txt('goal.buy', { name: '\u0001' })).replace('\u0001', '<b>' + esc(it.name) + '</b>')
        : esc(txt('goal.save', { n: '\u0002', name: '\u0001' })).replace('\u0002', '<b>' + fmtN(it.price - coins) + '</b>').replace('\u0001', '<b>' + esc(it.name) + '</b>');
      p.appendChild(s); lines.push(p); }
    g.replaceChildren(...lines); g.hidden = !lines.length;
  }
  new MutationObserver(() => { if (!ui.over.hidden) fill(); }).observe(ui.over, { attributes:true, attributeFilter:['hidden'] }); }

// classement : tant qu'aucun nom n'a été donné, la saisie s'ouvre sur demande (rien n'est envoyé sans nom)
{ const box = $('lbentry'), ask = document.createElement('button'); ask.id = 'lbask'; ask.className = 'btn alt'; box.prepend(ask);
  const named = () => { try { return !!localStorage.getItem('stellyrun_name'); } catch(e){ return true; } };
  const s0 = lbEntry.show, a0 = lbEntry.isActive, sub0 = lbEntry.submit;
  lbEntry.show = function(){ s0.apply(this, arguments); ask.textContent = txt('lb.ask'); box.classList.toggle('ask', !named()); };
  lbEntry.isActive = () => a0() && !box.classList.contains('ask');
  lbEntry.submit = function(){ if (box.classList.contains('ask')){ box.classList.remove('ask'); lbEntry.hide(); return; } return sub0.apply(this, arguments); };
  ask.addEventListener('click', e => { e.stopPropagation(); box.classList.remove('ask'); sfx.disc(1); }); }

// premier lancement : la course démarre directement
if (ONB.need()) setTimeout(() => { if (state === 'title') startGame(); }, 900);
