
/* ================= BETA : tutoriel en 4 images (avant la toute première partie) ================= */
// 1 sauter (tap) · 2 attraper les disques · 3 un obstacle touché = perdu · 4 retomber sur un oiseau = l'assommer
// aucun texte : on tape n'importe où pour passer à l'image suivante, la dernière lance la partie
const tutoUI = (() => {
  const KEY = 'stellyrun_tuto2';
  const TW = 240, TH = 135, GYT = 104;
  const css = document.createElement('style');
  css.textContent = '#tuto{ position:absolute; inset:0; z-index:40; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:calc(var(--s)*6px);'
    + ' background:repeating-linear-gradient(135deg, rgba(255,255,255,.035) 0 calc(var(--s)*6px), transparent 0 calc(var(--s)*12px)), var(--plum); cursor:pointer; }'
    + '#tuto[hidden]{ display:none; }'
    + '#tuto canvas{ height:calc(var(--s)*' + Math.round(TH*.9) + 'px); max-height:78%; width:auto; aspect-ratio:' + TW + '/' + TH + '; image-rendering:pixelated;'
    + ' border:calc(var(--s)*2px) solid var(--yellow); border-radius:calc(var(--s)*3px); box-shadow:0 calc(var(--s)*3px) 0 rgba(0,0,0,.4); }'
    + '#tutodots{ display:flex; gap:calc(var(--s)*4px); }'
    + '#tutodots i{ width:calc(var(--s)*4px); height:calc(var(--s)*4px); border-radius:50%; background:rgba(255,255,255,.3); }'
    + '#tutodots i.on{ background:var(--yellow); }';
  document.head.appendChild(css);
  const page = document.createElement('div'); page.id = 'tuto'; page.hidden = true; page.setAttribute('role', 'dialog'); page.setAttribute('aria-modal', 'true');
  const cv = document.createElement('canvas'); cv.width = TW; cv.height = TH;
  const dots = document.createElement('div'); dots.id = 'tutodots'; dots.innerHTML = '<i></i><i></i><i></i><i></i>';
  page.append(cv, dots); $('news').parentElement.appendChild(page);
  const g = cv.getContext('2d'); g.imageSmoothingEnabled = false;

  // ---------- petits outils de dessin ----------
  const stelly = (spr, x, y, a) => { g.globalAlpha = a == null ? 1 : a; g.drawImage(spr, Math.round(x - CX), Math.round(y - FB - PAD)); g.globalAlpha = 1; };
  const at = (img, x, y, a) => { g.globalAlpha = a == null ? 1 : a; g.drawImage(img, Math.round(x - img.width/2), Math.round(y - img.height/2)); g.globalAlpha = 1; };
  const onGround = (img, x) => g.drawImage(img, Math.round(x - img.width/2), GYT - img.height);
  function ring(cx, cy, r, col){ g.fillStyle = col; let x = r, y = 0, e = 1 - r;
    while (x >= y){ for (const [a, b] of [[x,y],[y,x],[-y,x],[-x,y],[-x,-y],[-y,-x],[y,-x],[x,-y]]) g.fillRect(cx + a, cy + b, 1, 1);
      y++; if (e < 0) e += 2*y + 1; else { x--; e += 2*(y - x) + 1; } } }
  function dotted(pts, col){ g.fillStyle = col; for (const [x, y] of pts) g.fillRect(Math.round(x), Math.round(y), 2, 2); }
  // trajectoire d'un saut : de x0 à x1 au sol, sommet à h px au-dessus du sol
  const arcY = (x, x0, x1, h) => { const u = (x - x0)/(x1 - x0); return GYT - 4*h*u*(1 - u); };
  function arcDots(x0, x1, h, from, to){ const p = []; for (let x = x0 + 6; x < x1 - 2; x += 7){ const u = (x - x0)/(x1 - x0); if (u >= (from || 0) && u <= (to == null ? 1 : to)) p.push([x, arcY(x, x0, x1, h) - 24]); } dotted(p, 'rgba(255,255,255,.85)'); }
  function txt8(s, x, y){ g.font = 'bold 9px "Pixelify Sans", monospace'; g.textAlign = 'center'; g.lineWidth = 3; g.strokeStyle = C.plum; g.strokeText(s, x, y); g.fillStyle = C.white; g.fillText(s, x, y); }
  const HAND = mk(12, 13, h => pm(h, ['....oo......', '...owwo.....', '...owwo.....', '...owwoooo..', '...owwowwoo.', '.oowwwwwwwwo', 'owwowwwwwwwo',
    'owwwwwwwwwwo', '.owwwwwwwwwo', '..owwwwwwwo.', '...owwwwwo..', '...ooooooo..', '............'], 0, 0, false, { o:C.plum, w:C.white }));
  const STAR = mk(7, 7, h => pm(h, ['...o...', '..oyo..', 'ooyyyoo', '.oyyyo.', '..oyo..', '.oo.oo.', '.......'], 0, 0, false, { o:C.plum, y:C.yellow }));
  const CROSS = mk(11, 11, h => pm(h, ['oo.......oo', 'orro...orro', '.orro.orro.', '..orrorro..', '...orrro...', '...orrro...', '..orrorro..', '.orro.orro.', 'orro...orro', 'oo.......oo', '...........'],
    0, 0, false, { o:C.plum, r:C.red }));

  // ---------- décor commun : ciel, tribunes au loin, pelouse du stade ----------
  function scene(){
    g.fillStyle = '#7FC8EE'; g.fillRect(0, 0, TW, TH); g.fillStyle = '#9AD6F3'; g.fillRect(0, 34, TW, 40);
    g.fillStyle = '#C9EBFA'; for (const [x, y, w] of [[22, 16, 26], [150, 10, 34], [96, 28, 18], [204, 30, 22]]){ g.fillRect(x, y, w, 4); g.fillRect(x + 4, y - 3, w - 10, 3); }
    g.fillStyle = '#5E6A8A'; g.fillRect(0, 74, TW, 20); g.fillStyle = '#4C5675'; for (let x = 0; x < TW; x += 6) g.fillRect(x, 78 + (x % 12 ? 0 : 3), 4, 2);
    g.fillStyle = C.g1; g.fillRect(0, 94, TW, TH - 94); g.fillStyle = C.g2; for (let x = 0; x < TW; x += 24) g.fillRect(x, 94, 12, TH - 94);
    g.fillStyle = C.line; g.fillRect(0, GYT, TW, 1); g.fillStyle = C.g3; g.fillRect(0, GYT + 1, TW, 1);
  }

  // 1. un tap = un saut par-dessus le plot
  function img1(){ scene(); const x0 = 70, x1 = 190, h = 52;
    onGround(CONES[0], 130); arcDots(x0, x1, h);
    stelly(RUN[0], 46, GYT, .35); stelly(RISE, 88, arcY(88, x0, x1, h), .5); stelly(APEX, 130, arcY(130, x0, x1, h)); stelly(FALL, 172, arcY(172, x0, x1, h), .5);
    // doigt qui tape, avec deux ondes
    const hx = 30, hy = 112; ring(hx + 4, hy + 1, 5, C.white); ring(hx + 4, hy + 1, 9, 'rgba(255,255,255,.55)'); g.drawImage(HAND, hx, hy);
  }
  // 2. les disques se ramassent en sautant dedans
  function img2(){ scene(); const x0 = 40, x1 = 200, h = 60;
    arcDots(x0, x1, h, 0, .3);
    for (const x of [140, 162, 184]) at(DISC, x, arcY(x, x0, x1, h) - 30);
    txt8('+10', 62, arcY(62, x0, x1, h) - 34); txt8('+20', 84, arcY(84, x0, x1, h) - 40);
    stelly(RUN[2], 34, GYT, .35); stelly(APEX, 114, arcY(114, x0, x1, h));
  }
  // 3. un obstacle touché : c'est perdu
  function img3(){ scene();
    onGround(CONES[0], 132); stelly(RUN[1], 70, GYT, .35); stelly(DEAD, 122, GYT - 6);
    for (const [x, y] of [[112, 46], [134, 40], [150, 54]]) at(STAR, x, y);
    at(CROSS, 192, 40);
  }
  // 4. retomber sur un oiseau : il est assommé, Stelly rebondit
  function img4(){ scene(); const x0 = 50, x1 = 176, h = 82;
    arcDots(x0, x1, h, 0, .62);
    const bx = 140, by = 58, bird = FLY_FR.pigeon[1];
    g.save(); g.translate(bx, by); g.rotate(Math.PI); g.drawImage(bird, -bird.width/2, -bird.height/2); g.restore();
    for (const [x, y] of [[126, 46], [154, 48]]) at(STAR, x, y);
    stelly(FALL, bx, by - 5); txt8('+100', bx + 30, by - 30);
    stelly(RUN[0], 46, GYT, .35);
    // flèche vers le bas au-dessus de l'oiseau
    g.fillStyle = C.white; g.strokeStyle = C.plum; const ax = bx - 30, ay = 18; g.fillRect(ax - 1, ay, 3, 12); g.beginPath(); g.moveTo(ax - 5, ay + 11); g.lineTo(ax + 6, ay + 11); g.lineTo(ax + .5, ay + 18); g.closePath(); g.fill();
  }
  const IMGS = [img1, img2, img3, img4];
  let pg = 0, isOpen = false;
  function render(){ g.clearRect(0, 0, TW, TH); IMGS[pg](); dots.querySelectorAll('i').forEach((d, i) => d.classList.toggle('on', i === pg)); }
  const seen = () => { try { return !!localStorage.getItem(KEY); } catch(e){ return true; } };
  const dbg = () => document.getElementById('dbg');
  function finish(){ try { localStorage.setItem(KEY, '1'); } catch(e){} isOpen = false; page.hidden = true; if (dbg()) dbg().hidden = false; startGame(); }
  function next(){ sfx.start(); if (pg < IMGS.length - 1){ pg++; render(); } else finish(); }
  // appelé par startGame : la 1re fois ouvre le tutoriel ; ensuite (tap, espace) passe à l'image suivante
  function open(){ if (isOpen){ next(); return; } pg = 0; render(); isOpen = true; page.hidden = false; $('soundmenu').hidden = true; if (dbg()) dbg().hidden = true; }
  page.addEventListener('pointerdown', e => { e.stopPropagation(); e.preventDefault(); next(); });
  // rejouer le tutoriel depuis le panneau debug
  return { need: () => !seen(), open, isOpen: () => isOpen, reset(){ try { localStorage.removeItem(KEY); } catch(e){} } };
})();
