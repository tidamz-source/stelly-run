
/* ================= BETA b4 : traînée d'invincibilité qui suit les mouvements de Stelly ================= */
// chaque silhouette de la traînée reprend la hauteur et la pose qu'avait Stelly un court instant plus tôt
// (décalée de la distance parcourue par le décor pendant ce temps) : la traînée dessine l'arc du saut
const TRAIL = [];
function trailGhosts(spr, px, py){
  const now = clock; TRAIL.push({ t: now, y: py, spr });
  while (TRAIL.length > 2 && now - TRAIL[1].t > .2) TRAIL.shift();
  const sp = Math.max(60, spEff);
  for (const [dx, a] of [[27, .15], [18, .25], [9, .42]]){   // de la plus ancienne à la plus récente
    const age = dx / sp; let s = TRAIL[0];
    for (const e of TRAIL){ if (now - e.t >= age) s = e; else break; }
    ctx.globalAlpha = a; ctx.drawImage(tinted(s.spr, 'rgba(128,88,162,.85)'), px - dx, s.y);
  }
}
