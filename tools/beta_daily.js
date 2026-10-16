
/* ================= BETA : défis quotidiens (3 par jour, plan de 91 jours en boucle) ================= */
// le plan (tools/beta_defis.json) est injecté par make_beta.py dans DQ_DATA
Object.assign(TEXTS, {
  "dq.title":  { fr:"Défis du jour", en:"Daily challenges", es:"Retos del día" },
  "dq.done":   { fr:"Défi réussi !", en:"Challenge complete!", es:"¡Reto superado!" },
  "dq.trio":   { fr:"Trio complet !", en:"All three done!", es:"¡Trío completo!" },
  "dq.trioLine": { fr:"Les 3 réussis : +{n}", en:"All 3 done: +{n}", es:"Los 3 superados: +{n}" },
  "dq.next":   { fr:"Nouveaux défis dans {h} h {m}", en:"New challenges in {h}h {m}", es:"Nuevos retos en {h} h {m}" },
  "dq.lv.F":   { fr:"Facile", en:"Easy", es:"Fácil" },
  "dq.lv.M":   { fr:"Moyen", en:"Medium", es:"Medio" },
  "dq.lv.D":   { fr:"Difficile", en:"Hard", es:"Difícil" }
});
const DQ_REW = { F:60, M:150, D:300 }, DQ_TRIO = 190;
const DQ_BOOL = { stompSock:1, stompEarly:1, stompHigh:1, stompShuttle:1, stompGull:1, heros:1, biome:1 };
const DQ_DAY = { gamesDay:1, timeDay:1, discsDay:1, scoreDay:1, stompsDay:1, socksDay:1, firesDay:1, distDay:1, comboDay:1 };
const dqUI = (() => {
  const KEY = 'stellyrun_daily';
  const D0 = (() => { const [y, m, d] = DQ_DATA.start.split('-').map(Number); return Date.UTC(y, m - 1, d); })();
  let shift = 0;   // décalage de jours (bouton debug)
  const today = () => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate() + shift); };
  const iso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const dayIdx = () => { const d = today(), n = Math.round((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - D0)/864e5), L = DQ_DATA.plan.length; return ((n % L) + L) % L; };
  const fresh = () => ({ date: iso(today()), done:[0, 0, 0], trio:0, D:{ games:0, time:0, discs:0, score:0, stomps:0, socks:0, fires:0, dist:0, combos:0 }, B:{ biome:0 } });
  let S = fresh();
  try { const j = JSON.parse(localStorage.getItem(KEY) || 'null'); if (j && j.date === S.date) S = Object.assign(fresh(), j); } catch(e){}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch(e){} };
  const roll = () => { if (S.date !== iso(today())){ S = fresh(); save(); } };
  const chal = () => DQ_DATA.plan[dayIdx()].map(([slot, metric, target, fr, en, es]) => ({ slot, metric, target, fr, en, es }));

  // ---------- suivi de la partie en cours ----------
  const R = { active:false };
  function start(){ roll(); Object.assign(R, { active:true, c0: TR.d.st.combo, s0: TR.d.st.superC, combos:0, superC:0, high:0, stomps:0, stompSock:0, stompEarly:0, stompHigh:0, sp:{},
    socks:0, fires:0, slows:0, heros:0, smash:0, miss:0, noMiss:0, noFire:0, noSock:0, quick:0, th:0 }); }
  const wrap = (name, fn) => { const f = TR[name]; TR[name] = function(...a){ if (R.active) fn(...a); return f.apply(this, a); }; };
  wrap('stomp', (sp, tier) => { R.stomps++; if (P.sockT > 0) R.stompSock = 1; if (t < 15) R.stompEarly = 1; if (tier === 2) R.stompHigh = 1; R.sp[sp] = 1; });
  wrap('sock', () => R.socks++); wrap('fire', () => R.fires++); wrap('slow', () => R.slows++); wrap('miss', () => R.miss++);
  wrap('smash', n => { R.smash += n || 1; });
  { const f = TR.tick; TR.tick = function(){ if (R.active && state === 'play'){
      R.combos = TR.d.st.combo - R.c0; R.superC = TR.d.st.superC - R.s0;
      if (fireT > 0 && P.sockT > 0) R.heros = 1;
      if (R.miss === 0) R.noMiss = score; if (R.fires === 0) R.noFire = score; if (R.socks === 0) R.noSock = score; if (t < 30) R.quick = score;
      if (!biomeOff) R.th |= 1 << theme; }
    return f.apply(this, arguments); }; }
  const runVal = m => ({ score, discs: discCount, streak: bestStreak, combo5: R.combos, superC: R.superC, highRow: R.high, stomps: R.stomps,
    stompSock: R.stompSock, stompEarly: R.stompEarly, stompHigh: R.stompHigh, stompShuttle: R.sp.shuttle ? 1 : 0, stompGull: R.sp.gull ? 1 : 0,
    socks: R.socks, fires: R.fires, slows: R.slows, heros: R.heros, smash: R.smash, dist: Math.floor(dist/30), time: Math.floor(t),
    noMiss: R.noMiss, noFire: R.noFire, noSock: R.noSock, quick: R.quick })[m] || 0;
  function value(c){
    const live = R.active, D = S.D;
    if (c.metric === 'biome'){ const i = THEME_NAMES.indexOf(c.target); return ((S.B.biome | (live ? R.th : 0)) >> i) & 1; }
    if (DQ_DAY[c.metric]) return ({ gamesDay: D.games, timeDay: Math.floor((D.time + (live ? t : 0))/60), discsDay: D.discs + (live ? discCount : 0),
      scoreDay: D.score + (live ? score : 0), stompsDay: D.stomps + (live ? R.stomps : 0), socksDay: D.socks + (live ? R.socks : 0), firesDay: D.fires + (live ? R.fires : 0),
      distDay: Math.floor((D.dist + (live ? dist : 0))/3000)/10, comboDay: D.combos + (live ? R.combos : 0) })[c.metric];
    return Math.max(S.B[c.metric] || 0, live ? runVal(c.metric) : 0);
  }
  const goal = c => (DQ_BOOL[c.metric] ? 1 : c.target);
  function countHigh(){ let n = 0; for (const k in groups){ const G = groups[k]; if (G.hi && G.got === G.n) n++; } R.high = n; }
  function check(){
    roll(); if (R.active) countHigh();
    const cs = chal(); let changed = false;
    cs.forEach((c, i) => { if (S.done[i] || value(c) < goal(c)) return;
      S.done[i] = 1; changed = true; TR.d.coins += DQ_REW[c.slot]; TR.save();
      toast(txt('dq.done') + ' +' + DQ_REW[c.slot], true); sfx.mile(); });
    if (!S.trio && S.done.every(Boolean)){ S.trio = 1; changed = true; TR.d.coins += DQ_TRIO; TR.save();
      setTimeout(() => { toast(txt('dq.trio') + ' +' + DQ_TRIO, true); sfx.world(); }, 1600); }
    if (changed){ save(); badge(); if (isOpen) render(); }
  }
  function end(){
    if (!R.active) return; countHigh();
    const D = S.D; D.games++; D.time += t; D.discs += discCount; D.score += score; D.stomps += R.stomps; D.socks += R.socks; D.fires += R.fires; D.dist += dist; D.combos += R.combos;
    for (const m of ['score', 'discs', 'streak', 'combo5', 'superC', 'highRow', 'stomps', 'stompSock', 'stompEarly', 'stompHigh', 'stompShuttle', 'stompGull',
      'socks', 'fires', 'slows', 'heros', 'smash', 'dist', 'time', 'noMiss', 'noFire', 'noSock', 'quick']) S.B[m] = Math.max(S.B[m] || 0, runVal(m));
    S.B.biome |= R.th; R.active = false; save(); check();
  }
  wrap('die', () => end()); wrap('end', () => end());
  setInterval(() => { if (R.active && state === 'play') check(); }, 250);

  // ---------- bouton sur l'accueil et panneau ----------
  const css = document.createElement('style');
  css.textContent = '#dqbtn{ position:relative; height:100%; aspect-ratio:1; padding:0; display:flex; align-items:center; justify-content:center; }'
    + '#dqbtn canvas{ height:calc(var(--s)*11px); width:auto; image-rendering:pixelated; display:block; }'
    + '#dqbtn b{ position:absolute; right:calc(var(--s)*-3px); top:calc(var(--s)*-3px); font-family:var(--num); font-weight:400; font-size:max(calc(var(--s)*4px),9px); line-height:1;'
    + ' background:var(--red,#E0413A); color:#fff; border:calc(var(--s)*.8px) solid var(--plum); border-radius:calc(var(--s)*2px); padding:calc(var(--s)*.8px) calc(var(--s)*1.2px); }'
    + '#dqbtn b.ok{ background:#3FB75A; }'
    + '#daily{ position:absolute; inset:0; z-index:30; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:calc(var(--s)*4px);'
    + ' background:repeating-linear-gradient(135deg, rgba(255,255,255,.035) 0 calc(var(--s)*6px), transparent 0 calc(var(--s)*12px)), var(--plum);'
    + ' border-bottom:calc(var(--s)*2px) solid var(--yellow); transform:translateY(calc(-100% - var(--s)*6px)); transition:transform .45s cubic-bezier(.6,0,.4,1); }'
    + '#daily.open{ transform:none; transition:transform .55s cubic-bezier(.25,1.25,.45,1); }'
    + '#daily[hidden]{ display:none; }'
    + '#daily h2{ margin:0; font-weight:700; line-height:1; font-size:calc(var(--s)*12px); color:var(--yellow); }'
    + '#dqclose{ position:absolute; top:calc(var(--s)*7px); right:calc(var(--s)*9px); font-size:max(calc(var(--s)*7px),12px); padding:calc(var(--s)*1.5px) calc(var(--s)*5px) calc(var(--s)*2px); }'
    + '#dqlist{ display:flex; flex-direction:column; gap:calc(var(--s)*3px); width:calc(var(--s)*230px); }'
    + '#dqlist .nart{ align-items:center; padding:calc(var(--s)*3px) calc(var(--s)*5px); }'
    + '#dqlist .lv{ flex:none; width:calc(var(--s)*30px); font-size:max(calc(var(--s)*4.6px),9px); font-weight:700; text-transform:uppercase; text-align:center; color:#fff; border-radius:calc(var(--s)*1.5px); padding:calc(var(--s)*1px) 0; }'
    + '#dqlist .lv.F{ background:#2E8B57 } #dqlist .lv.M{ background:#C9690E } #dqlist .lv.D{ background:#B5304A }'
    + '#dqlist .mid{ flex:1; min-width:0; display:flex; flex-direction:column; gap:calc(var(--s)*1.5px); font-size:max(calc(var(--s)*5.5px),11px); font-weight:700; line-height:1.15; }'
    + '#dqlist .pb{ height:calc(var(--s)*2.5px); background:#EBD8A6; border-radius:9px; overflow:hidden; }'
    + '#dqlist .pb i{ display:block; height:100%; background:var(--purple); }'
    + '#dqlist .done .pb i{ background:#3FB75A; }'
    + '#dqlist .pv{ font-family:var(--num); font-weight:400; font-size:max(calc(var(--s)*4px),9px); color:#8E7C93; }'
    + '#dqlist .rw{ flex:none; display:flex; align-items:center; gap:calc(var(--s)*1.5px); font-family:var(--num); font-size:max(calc(var(--s)*5px),10px); }'
    + '#dqlist .rw canvas{ height:calc(var(--s)*5px); width:auto; image-rendering:pixelated; }'
    + '#dqlist .done .rw{ color:#3FB75A; }'
    + '#dqfoot{ display:flex; gap:calc(var(--s)*8px); color:var(--white); font-size:max(calc(var(--s)*5px),10px); font-weight:700; }'
    + '#dqfoot .dqtr.ok{ color:#9BE07A; }';
  document.head.appendChild(css);
  const TARGET = mk(12, 12, g => pm(g, ['...oooooo...', '.oorrrrrroo.', '.orrwwwwrro.', 'orrwwrrwwrro', 'orwwrrrrwwro', 'orwrrwwrrwro', 'orwrrwwrrwro',
    'orwwrrrrwwro', 'orrwwrrwwrro', '.orrwwwwrro.', '.oorrrrrroo.', '...oooooo...'], 0, 0, false, { o:C.plum, r:C.red, w:C.white }));
  const btn = document.createElement('button'); btn.id = 'dqbtn'; btn.className = 'btn alt'; btn.type = 'button';
  btn.appendChild(cvOf(TARGET)); const bdg = document.createElement('b'); btn.appendChild(bdg);
  $('lbbtn').after(btn);
  const page = document.createElement('div'); page.id = 'daily'; page.hidden = true; page.setAttribute('role', 'dialog'); page.setAttribute('aria-modal', 'true');
  page.innerHTML = '<div class="trhead"><h2></h2></div><button id="dqclose" class="btn alt"></button><div id="dqlist"></div><div id="dqfoot"><span class="dqtr"></span><span class="dqnx"></span></div>';
  $('news').parentElement.appendChild(page);
  let isOpen = false, hideT = 0;
  function badge(){ const n = S.done.filter(Boolean).length; bdg.textContent = n + '/3'; bdg.classList.toggle('ok', n === 3); btn.setAttribute('aria-label', txt('dq.title') + ' ' + n + '/3'); }
  const fmtV = (c, v) => c.metric === 'distDay' ? String(v).replace('.', LANG === 'en' ? '.' : ',') : fmtN(v);
  function render(){
    roll(); page.querySelector('h2').textContent = txt('dq.title'); $('dqclose').textContent = txt('ui.close');
    const list = $('dqlist'); list.textContent = '';
    chal().forEach((c, i) => { const v = value(c), gl = goal(c), done = !!S.done[i], k = Math.min(1, v/gl);
      const el = document.createElement('article'); el.className = 'nart' + (done ? ' done' : '');
      el.innerHTML = '<span class="lv ' + c.slot + '"></span><div class="mid"><span class="tx"></span><div class="pb"><i></i></div><span class="pv"></span></div><span class="rw"></span>';
      el.querySelector('.lv').textContent = txt('dq.lv.' + c.slot);
      el.querySelector('.tx').textContent = c[LANG] || c.fr;
      el.querySelector('.pb i').style.width = (done ? 100 : Math.round(k*100)) + '%';
      el.querySelector('.pv').textContent = DQ_BOOL[c.metric] ? (done || v >= 1 ? '1 / 1' : '0 / 1') : fmtV(c, Math.min(v, gl)) + ' / ' + fmtV(c, gl);
      const rw = el.querySelector('.rw'); rw.textContent = (done ? '✓ ' : '+') + DQ_REW[c.slot]; rw.appendChild(cvOf(DISC));
      list.appendChild(el); });
    const ft = page.querySelector('.dqtr'); ft.textContent = txt('dq.trioLine', { n: DQ_TRIO }); ft.classList.toggle('ok', !!S.trio);
    const n = new Date(), mid = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1), left = Math.max(0, mid - n);
    page.querySelector('.dqnx').textContent = txt('dq.next', { h: Math.floor(left/36e5), m: String(Math.floor(left/6e4) % 60).padStart(2, '0') });
    badge();
  }
  function open(){ if (isOpen || state !== 'title') return; render(); clearTimeout(hideT); page.hidden = false; void page.offsetWidth; page.classList.add('open'); isOpen = true; $('soundmenu').hidden = true; sfx.start(); }
  function close(){ if (!isOpen) return; isOpen = false; page.classList.remove('open'); clearTimeout(hideT); hideT = setTimeout(() => { if (!isOpen) page.hidden = true; }, 500); if (document.activeElement) document.activeElement.blur(); }
  btn.addEventListener('click', e => { e.stopPropagation(); ensureAudio(); open(); });
  $('dqclose').addEventListener('click', e => { e.stopPropagation(); close(); });
  page.addEventListener('pointerdown', e => e.stopPropagation());
  setInterval(() => { if (state === 'title'){ roll(); badge(); } }, 2000);
  badge();
  return { start, isOpen: () => isOpen, close, shiftDay(){ shift++; S = fresh(); save(); badge(); if (isOpen) render(); return iso(today()); }, state: () => S, challenges: chal, value };
})();
const dqStart = () => dqUI.start();
