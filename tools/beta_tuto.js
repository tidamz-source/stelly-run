
/* ================= BETA : tutoriel (avant la toute première partie) ================= */
// textes à reporter dans langues.js lors du passage dans le vrai jeu
Object.assign(TEXTS, {
  "tuto.next":   { fr:"Suivant", en:"Next", es:"Siguiente" },
  "tuto.go":     { fr:"C'est parti !", en:"Let's go!", es:"¡Vamos!" },
  "tuto.skip":   { fr:"Passer", en:"Skip", es:"Saltar" },
  "tuto.p1":     { fr:"Les 3 bonus", en:"The 3 power-ups", es:"Los 3 potenciadores" },
  "tuto.sock.t": { fr:"Chaussette ailée", en:"Winged sock", es:"Calcetín alado" },
  "tuto.sock.d": { fr:"Super saut pendant 7 s : tu sautes bien plus haut et tu attrapes les disques tout en haut.", en:"Super jump for 7 s: you jump much higher and reach the discs at the very top.", es:"Supersalto durante 7 s: saltas mucho más alto y alcanzas los discos de arriba del todo." },
  "tuto.fire.t": { fr:"Gourde", en:"Water bottle", es:"Cantimplora" },
  "tuto.fire.d": { fr:"Invincible pendant 7 s : tu fonces, tu renverses les obstacles et les disques viennent à toi.", en:"Invincible for 7 s: you speed up, smash through obstacles and the discs come to you.", es:"Invencible durante 7 s: aceleras, derribas los obstáculos y los discos vienen a ti." },
  "tuto.slow.t": { fr:"Fast Count", en:"Fast Count", es:"Fast Count" },
  "tuto.slow.d": { fr:"Le jeu ralentit jusqu'à la fin de la partie. Plusieurs chronos se cumulent.", en:"The game slows down until the end of the run. Several stopwatches add up.", es:"El juego va más lento hasta el final de la partida. Varios cronómetros se acumulan." },
  "tuto.p2":     { fr:"Combos et séries", en:"Combos and streaks", es:"Combos y rachas" },
  "tuto.mult.t": { fr:"Coup sur coup", en:"Back to back", es:"Uno tras otro" },
  "tuto.mult.d": { fr:"Attrape des disques coup sur coup : chacun rapporte plus, jusqu'à x5. Plus un disque est haut, plus il vaut.", en:"Catch discs back to back: each one is worth more, up to x5. The higher a disc, the more it's worth.", es:"Atrapa discos seguidos: cada uno vale más, hasta x5. Cuanto más alto está un disco, más vale." },
  "tuto.combo.t":{ fr:"Combo", en:"Combo", es:"Combo" },
  "tuto.combo.d":{ fr:"Attrape tous les disques d'un même groupe : Combo ! et +500.", en:"Catch every disc in a group: Combo! and +500.", es:"Atrapa todos los discos de un grupo: ¡Combo! y +500." },
  "tuto.streak.t":{ fr:"Série", en:"Streak", es:"Racha" },
  "tuto.streak.d":{ fr:"Enchaîne les disques sans en rater un seul : Super Combo à 10, Méga Combo à 50, Giga Combo à chaque centaine. Un disque raté remet la série à zéro.", en:"Chain discs without missing a single one: Super Combo at 10, Mega Combo at 50, Giga Combo every hundred. One missed disc resets the streak.", es:"Encadena discos sin fallar ninguno: Super Combo a los 10, Mega Combo a los 50, Giga Combo cada cien. Un disco fallado pone la racha a cero." },
  "tuto.p3":     { fr:"Attention !", en:"Watch out!", es:"¡Cuidado!" },
  "tuto.obs.t":  { fr:"Obstacles", en:"Obstacles", es:"Obstáculos" },
  "tuto.obs.d":  { fr:"Un obstacle touché, c'est la fin de la partie. Saute par-dessus !", en:"Hit an obstacle and the run is over. Jump over it!", es:"Si tocas un obstáculo, se acaba la partida. ¡Sáltalo!" },
  "tuto.bird.t": { fr:"Oiseaux", en:"Birds", es:"Pájaros" },
  "tuto.bird.d": { fr:"Retombe sur la tête d'un oiseau pour l'assommer : tu rebondis et tu gagnes des points. Mais si tu le percutes, c'est perdu.", en:"Land on a bird's head to knock it out: you bounce and score points. But if you crash into it, you lose.", es:"Cae sobre la cabeza de un pájaro para noquearlo: rebotas y ganas puntos. Pero si chocas con él, pierdes." }
});
const tutoUI = (() => {
  const KEY = 'stellyrun_tuto';
  const css = document.createElement('style');
  css.textContent = '#tuto{ position:absolute; inset:0; z-index:40; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:calc(var(--s)*5px);'
    + ' background:repeating-linear-gradient(135deg, rgba(255,255,255,.035) 0 calc(var(--s)*6px), transparent 0 calc(var(--s)*12px)), var(--plum); }'
    + '#tuto[hidden]{ display:none; }'
    + '#tuto h2{ margin:0; font-weight:700; line-height:1; font-size:calc(var(--s)*13px); color:var(--yellow); }'
    + '#tutolist{ display:flex; flex-direction:column; gap:calc(var(--s)*4px); width:calc(var(--s)*230px); }'
    + '#tutolist .nart p{ margin:calc(var(--s)*1px) 0 0; font-size:max(calc(var(--s)*5px),10px); line-height:1.25; }'
    + '#tutolist .nart b{ font-size:max(calc(var(--s)*6px),11px); }'
    + '#tutodots{ display:flex; gap:calc(var(--s)*3px); }'
    + '#tutodots i{ width:calc(var(--s)*3.5px); height:calc(var(--s)*3.5px); border-radius:50%; background:rgba(255,255,255,.3); }'
    + '#tutodots i.on{ background:var(--yellow); }'
    + '#tutoskip{ position:absolute; top:calc(var(--s)*7px); right:calc(var(--s)*9px); font-size:max(calc(var(--s)*7px),12px); padding:calc(var(--s)*1.5px) calc(var(--s)*5px) calc(var(--s)*2px); }'
    + '#tutonext{ font-size:max(calc(var(--s)*8px),14px); }';
  document.head.appendChild(css);
  const page = document.createElement('div'); page.id = 'tuto'; page.hidden = true; page.setAttribute('role', 'dialog'); page.setAttribute('aria-modal', 'true');
  page.innerHTML = '<button id="tutoskip" class="btn alt"></button><h2></h2><div id="tutolist"></div><div id="tutodots"><i></i><i></i><i></i></div><button id="tutonext" class="btn"></button>';
  $('news').parentElement.appendChild(page);
  const PAGES = [
    ['tuto.p1', [['sock', () => SOCK[0]], ['fire', () => BOTTLE], ['slow', () => CHRONO[0]]]],
    ['tuto.p2', [['mult', () => DISC], ['combo', () => discArt(3)], ['streak', () => discArt(5)]]],
    ['tuto.p3', [['obs', () => CONES[0]], ['bird', () => (FLY_FR.pigeon && FLY_FR.pigeon[0]) || DISC]]]
  ];
  // 3 disques en arc (groupe) ou 5 disques en rangée (série)
  function discArt(n){ const arc = n === 3, c = document.createElement('canvas'); c.width = arc ? 58 : 76; c.height = arc ? 24 : 13; const g = c.getContext('2d');
    for (let i=0;i<n;i++) g.drawImage(DISC, arc ? i*15 : i*12, arc ? (i === 1 ? 0 : 11) : 0); return c; }
  let pg = 0, isOpen = false;
  function render(){
    const [title, items] = PAGES[pg];
    page.querySelector('h2').textContent = txt(title);
    $('tutoskip').textContent = txt('tuto.skip'); $('tutoskip').hidden = pg === PAGES.length - 1;
    $('tutonext').textContent = txt(pg === PAGES.length - 1 ? 'tuto.go' : 'tuto.next');
    page.querySelectorAll('#tutodots i').forEach((d, i) => d.classList.toggle('on', i === pg));
    const list = $('tutolist'); list.textContent = '';
    for (const [k, img] of items){
      const el = document.createElement('article'); el.className = 'nart';
      const src = img(), c = document.createElement('canvas'); c.width = src.width; c.height = src.height; c.getContext('2d').drawImage(src, 0, 0);
      c.style.width = 'calc(var(--s)*' + Math.min(src.width * 1.2, src.width > 40 ? 30 : 24) + 'px)';
      const box = document.createElement('div'); box.className = 'nico'; box.appendChild(c); el.appendChild(box);
      const tx = document.createElement('div'); tx.innerHTML = '<b></b><p></p>';
      tx.querySelector('b').textContent = txt('tuto.' + k + '.t'); tx.querySelector('p').textContent = txt('tuto.' + k + '.d');
      el.appendChild(tx); list.appendChild(el);
    }
  }
  const seen = () => { try { return !!localStorage.getItem(KEY); } catch(e){ return true; } };
  const dbg = () => document.getElementById('dbg');
  function finish(){ try { localStorage.setItem(KEY, '1'); } catch(e){} isOpen = false; page.hidden = true; if (dbg()) dbg().hidden = false; startGame(); }
  function next(){ sfx.start(); if (pg < PAGES.length - 1){ pg++; render(); } else finish(); }
  // appelé par startGame : 1re fois ouvre le tutoriel, ensuite (tap, espace) passe à la page suivante
  function open(){ if (isOpen){ next(); return; } pg = 0; render(); isOpen = true; page.hidden = false; if (dbg()) dbg().hidden = true; $('soundmenu').hidden = true; }
  $('tutonext').addEventListener('click', e => { e.stopPropagation(); next(); });
  $('tutoskip').addEventListener('click', e => { e.stopPropagation(); finish(); });
  return { need: () => !seen(), open, isOpen: () => isOpen };
})();
