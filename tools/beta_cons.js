
/* ================= BETA : bonus de la boutique (1 500 disques l'unité) ================= */
// On achète dans l'onglet « Bonus » de la boutique : chaque achat ajoute 1 au stock.
// Bouclier, Chaussette de départ, Chrono de poche, Gant collant, Billet de biome : on en équipe UN ; une unité est utilisée au départ de chaque partie.
// Cœur : pas besoin de l'équiper. S'il en reste, il s'affiche en haut à gauche ; à la chute, le jeu propose de ré-animer Stelly (un seul cœur par partie).
// Toute partie où un bonus a servi est « boostée » : elle ne compte pas pour le classement.
Object.assign(TEXTS, {
  "bn.tab":       { fr:"Bonus", en:"Boosts", es:"Bonus" },
  "bn.buy":       { fr:"Acheter · {p}", en:"Buy · {p}", es:"Comprar · {p}" },
  "bn.missing":   { fr:"Il manque {n} disques", en:"{n} discs short", es:"Faltan {n} discos" },
  "bn.stock":     { fr:"En stock : {n}", en:"In stock: {n}", es:"En reserva: {n}" },
  "bn.equip":     { fr:"Équiper", en:"Equip", es:"Equipar" },
  "bn.equipped":  { fr:"Équipé", en:"Equipped", es:"Equipado" },
  "bn.oneRun":    { fr:"1 par partie", en:"1 per run", es:"1 por partida" },
  "bn.noteEq":    { fr:"Prochaine partie : {name}", en:"Next run: {name}", es:"Próxima partida: {name}" },
  "bn.noteNone":  { fr:"Rien d’équipé", en:"Nothing equipped", es:"Nada equipado" },
  "bn.noteHeart": { fr:"Cœurs : {n}", en:"Hearts: {n}", es:"Corazones: {n}" },
  "cons.shield.n":{ fr:"Bouclier", en:"Shield", es:"Escudo" },
  "cons.shield.d":{ fr:"Absorbe un choc : obstacle, oiseau ou trou.", en:"Absorbs one hit: obstacle, bird or hole.", es:"Absorbe un golpe: obstáculo, pájaro o agujero." },
  "cons.sock.n":  { fr:"Chaussette de départ", en:"Head-start sock", es:"Calcetín de salida" },
  "cons.sock.d":  { fr:"7 s de super saut dès le départ.", en:"7 s of super jump from the start.", es:"7 s de supersalto desde la salida." },
  "cons.chrono.n":{ fr:"Chrono de poche", en:"Pocket stopwatch", es:"Cronómetro de bolsillo" },
  "cons.chrono.d":{ fr:"Un Fast Count à déclencher quand tu veux pendant la partie.", en:"A Fast Count to trigger whenever you want during the run.", es:"Un Fast Count para activar cuando quieras durante la partida." },
  "cons.glove.n": { fr:"Gant collant", en:"Sticky glove", es:"Guante pegajoso" },
  "cons.glove.d": { fr:"Un disque raté ne casse pas ta série.", en:"One missed disc won't break your streak.", es:"Un disco fallado no rompe tu racha." },
  "cons.ticket.n":{ fr:"Billet de biome", en:"Biome ticket", es:"Billete de bioma" },
  "cons.ticket.d":{ fr:"Commence la partie en {b}.", en:"Start the run in {b}.", es:"Empieza la partida en {b}." },
  "cons.heart.n": { fr:"Cœur", en:"Heart", es:"Corazón" },
  "cons.heart.d": { fr:"À la chute, ré-anime Stelly. Pas besoin de l’équiper. 1 par partie.", en:"Revives Stelly when she falls. No need to equip it. 1 per run.", es:"Reanima a Stelly cuando cae. No hace falta equiparlo. 1 por partida." },
  "cons.heart.q": { fr:"Voulez-vous utiliser un cœur pour ré-animer Stelly ?", en:"Use a heart to revive Stelly?", es:"¿Quieres usar un corazón para reanimar a Stelly?" },
  "cons.yes":     { fr:"Oui", en:"Yes", es:"Sí" },
  "cons.no":      { fr:"Non", en:"No", es:"No" },
  "cons.shieldUsed":{ fr:"Bouclier !", en:"Shield!", es:"¡Escudo!" },
  "cons.gloveUsed": { fr:"Gant collant !", en:"Sticky glove!", es:"¡Guante pegajoso!" },
  "cons.heartUsed": { fr:"Stelly repart !", en:"Stelly is back!", es:"¡Stelly vuelve!" },
  "cons.boosted": { fr:"Partie boostée : hors classement", en:"Boosted run: not ranked", es:"Partida potenciada: fuera de la clasificación" }
});
const CONS_PRICE = 1500;
const BIOME_ORDER = [0, 1, 2, 3, 6, 4, 5];   // stade, indoor, beach, neige, campagne, ville, forêt
let biomeOff = 0, consSkip = false;
const RUN_C = { used:null, shield:0, glove:0, chrono:0, heart:0, heartUsed:0, boosted:false };

// ---------- inventaire (stock + bonus équipé) ----------
const BN = (() => {
  const KEY = 'stellyrun_bonus';
  const d = { stock:{ shield:0, sock:0, chrono:0, glove:0, ticket:0, heart:0 }, eq:null, biome:1 };
  try { const j = JSON.parse(localStorage.getItem(KEY) || 'null'); if (j){ Object.assign(d.stock, j.stock || {}); d.eq = j.eq || null; d.biome = j.biome || 1; } } catch(e){}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch(e){} };
  return { d, save };
})();

// ---------- icônes ----------
const ICO_SHIELD = mk(11, 12, g => pm(g, ['ooooooooooo', 'owwwwbbbbbo', 'owwwwbbbbbo', 'owwwwbbbbbo', 'owwwwbbbbbo', 'obbbbbwwwwo', '.obbbbwwwo.',
  '.obbbbwwwo.', '..obbbwwo..', '..obbbwwo..', '...obbwo...', '....ooo....'], 0, 0, false, { o:C.plum, w:C.white, b:'#3FA3E0' }));
const ICO_GLOVE = mk(12, 12, g => pm(g, ['....oo......', '...oyyo.....', '...oyyo.....', '...oyyoooo..', '...oyyoyyoo.', '.ooyyyyyyyyo', 'oyyoyyyyyyyo',
  'oyyyyyyyyyyo', '.oyyyyyyyyyo', '..oyyyyyyyo.', '...oyyyyyo..', '...ooooooo..'], 0, 0, false, { o:C.plum, y:'#9BE07A' }));
const ICO_TICKET = mk(14, 8, g => pm(g, ['oooooooooooooo', 'oyyyy.yyyyyyyo', 'oyyyyoyOOOOyyo', '.oyyy.yyyyyyo.', '.oyyyoyOOOyyo.', 'oyyyy.yyyyyyyo',
  'oyyyyoyyyyyyyo', 'oooooooooooooo'], 0, 0, false, { o:C.plum, y:C.yellow, O:C.orange }));
const ICO_HEART = mk(11, 10, g => pm(g, ['.ooo...ooo.', 'orrro.orrro', 'orwrrorrrro', 'orwrrrrrrro', 'orrrrrrrrro', '.orrrrrrro.', '..orrrrro..',
  '...orrro...', '....oro....', '.....o.....'], 0, 0, false, { o:C.plum, r:'#E8384F', w:'#FFB3BE' }));
const CONS = [
  { id:'shield', icon: () => ICO_SHIELD }, { id:'sock', icon: () => SOCK[0] }, { id:'chrono', icon: () => CHRONO[0] },
  { id:'glove', icon: () => ICO_GLOVE }, { id:'ticket', icon: () => ICO_TICKET }, { id:'heart', icon: () => ICO_HEART }
];
const cvOf = img => { const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; c.getContext('2d').drawImage(img, 0, 0); return c; };
const coinCv = () => { const c = document.createElement('canvas'); c.width = 9; c.height = 5; c.getContext('2d').drawImage(COIN, 0, 0); return c; };
const biomeName = k => THEME_NAMES[BIOME_ORDER[k]];

// ---------- styles : la boutique de bonus a son propre habillage (vitrine bleu nuit, capsules lumineuses) ----------
{ const css = document.createElement('style');
  css.textContent = ''
    + '.shtab.bn{ background:#1B4A6B; color:#9FEBFF; box-shadow:inset 0 0 0 calc(var(--s)*1px) #5FD3F5; }'
    + '.shtab.bn.on{ background:#5FD3F5; color:#0B2236; box-shadow:0 0 calc(var(--s)*4px) rgba(95,211,245,.8); }'
    + '#shop.bonus{ background:radial-gradient(ellipse at 60% 40%, rgba(95,211,245,.18), transparent 60%),'
    + ' repeating-linear-gradient(0deg, rgba(255,255,255,.04) 0 calc(var(--s)*1px), transparent 0 calc(var(--s)*4px)), #0B2236; border-bottom-color:#5FD3F5; }'
    + '#shop.bonus .trhead h2{ color:#9FEBFF; text-shadow:0 0 calc(var(--s)*4px) rgba(95,211,245,.9); }'
    + '#shop.bonus .shprev{ display:none; }'
    + '#bnprev{ display:none; position:relative; width:calc(var(--s)*70px); height:calc(var(--s)*92px); border-radius:calc(var(--s)*3px); background:#12324A;'
    + ' box-shadow:inset 0 0 0 calc(var(--s)*1.5px) #5FD3F5, 0 0 calc(var(--s)*8px) rgba(95,211,245,.35); }'
    + '#shop.bonus #bnprev{ display:block; }'
    + '#bnprev canvas{ position:absolute; inset:calc(var(--s)*3px); width:calc(100% - var(--s)*6px); height:calc(100% - var(--s)*6px); image-rendering:pixelated; border-radius:calc(var(--s)*2px); }'
    + '#bnnote{ position:absolute; left:-4%; right:-4%; top:calc(100% + var(--s)*4px); text-align:center; font-weight:700; font-size:max(calc(var(--s)*4.6px),9px); color:#9FEBFF; line-height:1.25; }'
    + '#shgrid .bn{ position:relative; display:flex; align-items:center; justify-content:center; padding:0; cursor:pointer; border-radius:calc(var(--s)*8px);'
    + ' background:radial-gradient(circle at 35% 30%, #2C6E96, #16405E 70%); border:calc(var(--s)*1.5px) solid #5FD3F5; box-shadow:0 calc(var(--s)*2px) 0 rgba(0,0,0,.45), inset 0 calc(var(--s)*2px) 0 rgba(255,255,255,.18); }'
    + '#shgrid .bn canvas.ic{ width:calc(var(--s)*22px); height:calc(var(--s)*22px); object-fit:contain; image-rendering:pixelated; }'
    + '#shgrid .bn.eq{ border-color:var(--yellow); box-shadow:0 0 calc(var(--s)*5px) rgba(255,207,0,.8), inset 0 calc(var(--s)*2px) 0 rgba(255,255,255,.18); }'
    + '#shgrid .bn.sel{ transform:translateY(calc(var(--s)*-1.5px)); border-color:#FFFFFF; }'
    + '#shgrid .bn .stk{ position:absolute; top:calc(var(--s)*-4px); left:calc(var(--s)*-4px); min-width:calc(var(--s)*9px); height:calc(var(--s)*9px); padding:0 calc(var(--s)*1.5px); box-sizing:border-box;'
    + ' border-radius:calc(var(--s)*5px); background:#5FD3F5; border:calc(var(--s)*1px) solid #0B2236; color:#0B2236; font-family:var(--num); font-size:max(calc(var(--s)*3.8px),8px);'
    + ' display:flex; align-items:center; justify-content:center; }'
    + '#shgrid .bn .stk.zero{ background:#16405E; color:#7FA9C2; border-color:#5FD3F5; }'
    + '#shgrid .bn .price{ position:absolute; bottom:calc(var(--s)*-5px); left:50%; transform:translateX(-50%); display:flex; align-items:center; gap:calc(var(--s)*1px); white-space:nowrap;'
    + ' padding:calc(var(--s)*.6px) calc(var(--s)*2px); background:#0B2236; border:calc(var(--s)*.8px) solid #5FD3F5; border-radius:calc(var(--s)*2px); font-family:var(--num); font-size:max(calc(var(--s)*3.6px),7px); color:var(--yellow); }'
    + '#shgrid .bn .price.no{ color:#FF8A8A; }'
    + '#shgrid .bn .price canvas{ width:auto; height:calc(var(--s)*3.5px); image-rendering:pixelated; }'
    + '#shgrid .bn .eqk{ position:absolute; top:calc(var(--s)*-4px); right:calc(var(--s)*-4px); font-size:max(calc(var(--s)*3.6px),7px); font-weight:700; text-transform:uppercase; letter-spacing:.04em;'
    + ' background:var(--yellow); color:var(--plum); border:calc(var(--s)*1px) solid var(--plum); border-radius:calc(var(--s)*2px); padding:calc(var(--s)*.5px) calc(var(--s)*1.5px); }'
    + '#shop.bonus .shright{ display:grid; grid-template-columns:auto calc(var(--s)*104px); column-gap:calc(var(--s)*8px); row-gap:calc(var(--s)*5px); align-items:start; }'
    + '#shop.bonus .shtabs{ grid-column:1 / -1; }'
    + '#shop.bonus #shgrid{ grid-template-columns:repeat(3, calc(var(--s)*36px)); grid-template-rows:repeat(2, calc(var(--s)*36px)); gap:calc(var(--s)*8px) calc(var(--s)*6px); padding-top:calc(var(--s)*3px); }'
    + '#bnbub{ position:relative; min-height:calc(var(--s)*80px); padding:calc(var(--s)*4px) calc(var(--s)*5px); background:#F2FBFF; color:#0B2236; border:calc(var(--s)*1.5px) solid #5FD3F5;'
    + ' border-radius:calc(var(--s)*3px); box-shadow:0 calc(var(--s)*3px) 0 rgba(0,0,0,.4); display:flex; flex-direction:column; gap:calc(var(--s)*2px); }'
    + '#bnbub[hidden]{ display:none; }'
    + '#bnbub b{ font-size:max(calc(var(--s)*7px),12px); line-height:1.1; }'
    + '#bnbub p{ margin:0; font-weight:500; font-size:max(calc(var(--s)*5px),10px); line-height:1.25; }'
    + '#bnbub i{ font-style:normal; font-weight:700; font-size:max(calc(var(--s)*4.6px),9px); color:#2C6E96; }'
    + '#bnbub .row{ display:flex; gap:calc(var(--s)*3px); flex-wrap:wrap; }'
    + '#bnbub .btn{ font-size:max(calc(var(--s)*6px),11px); padding:calc(var(--s)*1.5px) calc(var(--s)*5px) calc(var(--s)*2px); animation:none; display:flex; align-items:center; gap:calc(var(--s)*1.5px); }'
    + '#bnbub .btn canvas{ height:calc(var(--s)*3.5px); width:auto; image-rendering:pixelated; }'
    + '#bnbub .btn:disabled{ filter:grayscale(1); opacity:.6; cursor:default; }'
    + '#bnbub .bios{ display:flex; flex-wrap:wrap; gap:calc(var(--s)*1.5px); }'
    + '#bnbub .bios[hidden]{ display:none; }'
    + '#bnbub .bios button{ font:inherit; font-weight:700; font-size:max(calc(var(--s)*4.2px),8px); padding:calc(var(--s)*.8px) calc(var(--s)*2px); border-radius:calc(var(--s)*2px);'
    + ' border:calc(var(--s)*1px) solid #5FD3F5; background:#fff; color:#0B2236; cursor:pointer; }'
    + '#bnbub .bios button.on{ background:#5FD3F5; }'
    + '#conshud{ position:absolute; top:calc(var(--s)*31px); left:calc(var(--s)*10px); display:flex; gap:calc(var(--s)*3px); pointer-events:none; }'
    + '#conshud > *{ display:flex; align-items:center; justify-content:center; gap:calc(var(--s)*1px); height:calc(var(--s)*12px); min-width:calc(var(--s)*12px); background:rgba(255,255,255,.85);'
    + ' border:calc(var(--s)*1px) solid var(--plum); border-radius:calc(var(--s)*2px); padding:0 calc(var(--s)*1.5px); font-family:var(--num); font-size:max(calc(var(--s)*4px),8px); color:var(--plum); }'
    + '#conshud canvas{ height:calc(var(--s)*9px); width:auto; image-rendering:pixelated; }'
    + '#conshud button{ pointer-events:auto; cursor:pointer; background:var(--yellow); animation:breathe 1.3s ease-in-out infinite; }'
    + '#revive{ position:absolute; inset:0; z-index:45; display:flex; align-items:center; justify-content:center; background:rgba(46,14,48,.45); }'
    + '#revive[hidden]{ display:none; }'
    + '#revive .rv{ display:flex; flex-direction:column; align-items:center; gap:calc(var(--s)*5px); max-width:calc(var(--s)*170px); padding:calc(var(--s)*7px) calc(var(--s)*10px); background:var(--plum);'
    + ' border:calc(var(--s)*2px) solid #E8384F; border-radius:calc(var(--s)*3px); color:var(--white); }'
    + '#revive .q{ display:flex; align-items:center; gap:calc(var(--s)*5px); font-weight:700; font-size:max(calc(var(--s)*7px),13px); line-height:1.2; }'
    + '#revive .q canvas{ flex:none; height:calc(var(--s)*16px); width:auto; image-rendering:pixelated; animation:breathe 1s ease-in-out infinite; }'
    + '#revive .row{ display:flex; gap:calc(var(--s)*5px); }'
    + '#revive .btn{ font-size:max(calc(var(--s)*7px),12px); padding:calc(var(--s)*2px) calc(var(--s)*8px); animation:none; }'
    + '#revive .bar{ width:100%; height:calc(var(--s)*2px); background:rgba(255,255,255,.2); border-radius:9px; overflow:hidden; }'
    + '#revive .bar i{ display:block; height:100%; background:#E8384F; transform-origin:left; }'
    + '#boosted{ margin:calc(var(--s)*1px) 0 0; font-size:max(calc(var(--s)*5px),10px); font-weight:700; color:var(--purple); }';
  document.head.appendChild(css); }

// ---------- onglet « Bonus » dans la boutique ----------
const bonusShop = (() => {
  const page = $('shop'), grid = $('shgrid'), tabs = page.querySelector('.shtabs');
  const tab = document.createElement('button'); tab.className = 'shtab bn'; tab.type = 'button'; tabs.appendChild(tab);
  const pv = document.createElement('div'); pv.id = 'bnprev'; const pc = document.createElement('canvas'); pc.width = 64; pc.height = 86; const note = document.createElement('div'); note.id = 'bnnote';
  pv.append(pc, note); page.querySelector('.shprev').after(pv);
  const bub = document.createElement('div'); bub.id = 'bnbub'; bub.hidden = true; page.querySelector('.shright').appendChild(bub);
  const g = pc.getContext('2d'); g.imageSmoothingEnabled = false;
  let on = false, sel = null, raf = 0;
  const S = BN.d;
  // ----- aperçu animé de l'effet -----
  const st = (spr, x, y, a) => { g.globalAlpha = a == null ? 1 : a; g.drawImage(spr, Math.round(x - CX), Math.round(y - FB - PAD)); g.globalAlpha = 1; };
  function ring(cx, cy, r, col){ g.fillStyle = col; let x = r, y = 0, e = 1 - r; while (x >= y){ for (const [a, b] of [[x,y],[y,x],[-y,x],[-x,y],[-x,-y],[-y,-x],[y,-x],[x,-y]]) g.fillRect(cx + a, cy + b, 1, 1); y++; if (e < 0) e += 2*y + 1; else { x--; e += 2*(y - x) + 1; } } }
  function draw(){
    const now = performance.now()/1000, f = RUN[Math.floor(now*16) % RUN_N], id = sel || S.eq || 'shield';
    g.clearRect(0, 0, 64, 86); g.fillStyle = '#16405E'; g.fillRect(0, 0, 64, 86); g.fillStyle = '#1F5578'; g.fillRect(0, 70, 64, 16); g.fillStyle = '#5FD3F5'; g.fillRect(0, 70, 64, 1);
    if (id === 'shield'){ st(f, 32, 80); ring(32, 54, 24 + Math.round(Math.sin(now*4)), '#7FE3FF'); g.globalAlpha = .15; g.fillStyle = '#7FE3FF'; g.beginPath(); g.arc(32, 54, 23, 0, 7); g.fill(); g.globalAlpha = 1; }
    else if (id === 'sock'){ const y = 80 - Math.abs(Math.sin(now*2.2))*34; st(Math.cos(now*2.2)*Math.sin(now*2.2) > 0 ? RISE : FALL, 32, y); g.drawImage(SOCK[Math.floor(now*8) % 2], 40, 4); }
    else if (id === 'chrono'){ g.fillStyle = 'rgba(122,87,160,.35)'; g.fillRect(0, 0, 64, 70); st(RUN[Math.floor(now*6) % RUN_N], 32, 80); g.drawImage(CHRONO[Math.floor(now*4) % 4], 24, 2);
      g.fillStyle = '#fff'; for (const [x, y, w] of [[2, 30, 10], [50, 40, 12], [4, 56, 8], [52, 20, 9]]) g.fillRect(Math.round(((x - now*12) % 64 + 64) % 64), y, w, 1); }
    else if (id === 'glove'){ st(f, 32, 80); for (let i = 0; i < 3; i++){ const x = ((i*24 - now*30) % 72 + 72) % 72 - 4; g.drawImage(DISC, Math.round(x - 14), 22); } g.drawImage(ICO_GLOVE, 46, 48); }
    else if (id === 'ticket'){ const k = S.biome || 1; g.fillStyle = ['#7FC8EE', '#6FA3EC', '#F2D48A', '#E8F2FA', '#8C9AB5', '#3E7F4A', '#9AD08A'][BIOME_ORDER[k]] || '#7FC8EE'; g.fillRect(3, 3, 58, 64);
      st(f, 32, 80); g.drawImage(ICO_TICKET, 25, 5); g.font = 'bold 8px "Pixelify Sans", monospace'; g.textAlign = 'center'; g.lineWidth = 3; g.strokeStyle = C.plum; g.strokeText(biomeName(k), 32, 22); g.fillStyle = '#fff'; g.fillText(biomeName(k), 32, 22); }
    else if (id === 'heart'){ const up = Math.max(0, Math.sin(now*1.6)); st(up > .05 ? RISE : DEAD, 32, 80 - up*20, .35 + up*.65); const s = 1 + Math.round(Math.sin(now*6)*.5 + .5), w = ICO_HEART.width*s;
      g.drawImage(ICO_HEART, Math.round(32 - w/2), 6, w, ICO_HEART.height*s); }
    raf = requestAnimationFrame(draw);
  }
  function noteText(){
    const eqs = S.eq && S.stock[S.eq] > 0 ? txt('bn.noteEq', { name: txt('cons.' + S.eq + '.n') + ' ×' + S.stock[S.eq] }) : txt('bn.noteNone');
    note.textContent = eqs + (S.stock.heart ? ' · ' + txt('bn.noteHeart', { n: S.stock.heart }) : '');
  }
  const tileOf = id => grid.querySelector('[data-id="' + id + '"]');
  function render(){
    tab.textContent = txt('bn.tab'); if (!on) return;
    tabs.querySelectorAll('.shtab').forEach(b => b.classList.toggle('on', b === tab));
    $('shcoins').querySelector('b').textContent = TR.d.coins;
    grid.textContent = '';
    for (const c of CONS){
      const n = S.stock[c.id], eq = S.eq === c.id && n > 0;
      const el = document.createElement('button'); el.type = 'button'; el.className = 'bn' + (eq ? ' eq' : '') + (sel === c.id ? ' sel' : ''); el.dataset.id = c.id;
      el.setAttribute('aria-label', txt('cons.' + c.id + '.n') + ', ' + txt('bn.stock', { n }));
      const ic = cvOf(c.icon()); ic.className = 'ic'; el.appendChild(ic);
      const sk = document.createElement('span'); sk.className = 'stk' + (n ? '' : ' zero'); sk.textContent = '×' + n; el.appendChild(sk);
      if (eq){ const k = document.createElement('span'); k.className = 'eqk'; k.textContent = txt('bn.equipped'); el.appendChild(k); }
      const p = document.createElement('span'); p.className = 'price' + (TR.d.coins < CONS_PRICE ? ' no' : ''); p.append(coinCv(), String(CONS_PRICE)); el.appendChild(p);
      el.addEventListener('click', e => { e.stopPropagation(); if (sel === c.id) return; sel = c.id; sfx.disc(1); render(); showBub(); });
      grid.appendChild(el);
    }
    noteText();
  }
  function showBub(){
    const id = sel, el = tileOf(id), miss = CONS_PRICE - TR.d.coins; if (!el) return;
    bub.innerHTML = '<b></b><p></p><i></i><div class="bios" hidden></div><div class="row"><button type="button" class="btn buy"></button><button type="button" class="btn alt eqb" hidden></button></div>';
    bub.querySelector('b').textContent = txt('cons.' + id + '.n');
    bub.querySelector('p').textContent = id === 'ticket' ? txt('cons.ticket.d', { b: biomeName(S.biome) }) : txt('cons.' + id + '.d');
    bub.querySelector('i').textContent = txt('bn.stock', { n: S.stock[id] }) + (id === 'heart' ? '' : ' · ' + txt('bn.oneRun'));
    const buy = bub.querySelector('.buy'); buy.append(miss > 0 ? txt('bn.missing', { n: fmtN(miss) }) : txt('bn.buy', { p: fmtN(CONS_PRICE) }), coinCv()); buy.disabled = miss > 0;
    buy.addEventListener('click', e => { e.stopPropagation(); if (TR.d.coins < CONS_PRICE) return;
      TR.d.coins -= CONS_PRICE; S.stock[id]++; if (id !== 'heart' && !(S.eq && S.stock[S.eq] > 0)) S.eq = id; BN.save(); TR.save(); sfx.sock(); render(); showBub(); });
    if (id !== 'heart' && S.stock[id] > 0){ const eb = bub.querySelector('.eqb'); eb.hidden = false; eb.textContent = S.eq === id ? '✓ ' + txt('bn.equipped') : txt('bn.equip');
      eb.addEventListener('click', e => { e.stopPropagation(); S.eq = S.eq === id ? null : id; BN.save(); sfx.jump(); render(); showBub(); }); }
    if (id === 'ticket'){ const bios = bub.querySelector('.bios'); bios.hidden = false;
      for (let k = 1; k < BIOME_ORDER.length; k++){ const b = document.createElement('button'); b.type = 'button'; b.textContent = biomeName(k); b.classList.toggle('on', S.biome === k);
        b.addEventListener('click', e => { e.stopPropagation(); S.biome = k; BN.save(); sfx.jump(); showBub(); }); bios.appendChild(b); } }
    bub.hidden = false;
  }
  function enter(){ on = true; sel = S.eq || 'shield'; page.classList.add('bonus'); $('shbub').hidden = true; render(); showBub(); cancelAnimationFrame(raf); draw(); }
  function leave(){ if (!on) return; on = false; sel = null; bub.hidden = true; page.classList.remove('bonus'); cancelAnimationFrame(raf); }
  tab.addEventListener('click', e => { e.stopPropagation(); sfx.jump(); enter(); });
  tabs.querySelectorAll('.shtab:not(.bn)').forEach(b => b.addEventListener('click', () => leave()));
  $('shclose').addEventListener('click', () => leave());
  $('shopbtn').addEventListener('click', () => render());   // libellé de l'onglet dans la langue courante
  render();
  return { enter, leave, isOn: () => on, render };
})();

// ---------- pendant la partie ----------
const hudC = document.createElement('div'); hudC.id = 'conshud'; ui.hud.appendChild(hudC);
function hudRefresh(){
  hudC.textContent = '';
  const chip = (img, n) => { const s = document.createElement('span'); s.appendChild(cvOf(img)); if (n != null) s.append('×' + n); hudC.appendChild(s); };
  if (RUN_C.heart && !RUN_C.heartUsed) chip(ICO_HEART, BN.d.stock.heart);
  if (RUN_C.shield) chip(ICO_SHIELD);
  if (RUN_C.glove) chip(ICO_GLOVE);
  if (RUN_C.chrono){ const b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', txt('cons.chrono.n')); b.appendChild(cvOf(CHRONO[0]));
    b.addEventListener('pointerdown', e => { e.stopPropagation(); e.preventDefault(); useChrono(); }); hudC.appendChild(b); }
}
function useChrono(){
  if (!RUN_C.chrono || state !== 'play') return; RUN_C.chrono = 0;
  TR.slow(); safeT = .5; slowMul = Math.max(.35, slowMul*.78); slowFx = 1.1; slowX = P.x; slowY = P.y - 30; sfx.slow(); toast(txt('toast.timeout'));
  hudRefresh();
}
// appelé au départ de chaque partie (startGame) : une unité du bonus équipé est utilisée ; le cœur reste en réserve
function consStart(){
  Object.assign(RUN_C, { used:null, shield:0, glove:0, chrono:0, heart:0, heartUsed:0, boosted:false }); biomeOff = 0; consSkip = false; reviveUI.hide(); bonusShop.leave();
  const S = BN.d, id = S.eq;
  if (id && S.stock[id] > 0){
    S.stock[id]--; RUN_C.used = id; RUN_C.boosted = true;
    if (id === 'shield') RUN_C.shield = 1;
    else if (id === 'glove') RUN_C.glove = 1;
    else if (id === 'chrono') RUN_C.chrono = 1;
    else if (id === 'sock'){ P.sockT = 7; sfx.sock(); toast(txt('toast.superJump')); }
    else if (id === 'ticket') biomeOff = S.biome || 1;
    BN.save();
  }
  RUN_C.heart = S.stock.heart > 0 ? 1 : 0;
  hudRefresh();
}
// un disque raté : le gant garde la série (une fois)
function consGlove(){ if (!RUN_C.glove) return false; RUN_C.glove = 0; toast(txt('cons.gloveUsed')); hudRefresh(); return true; }
// appelé au tout début de die() : true = la mort est évitée (bouclier) ou suspendue (cœur proposé)
function consHit(kind){
  if (consSkip){ consSkip = false; return false; }
  if (RUN_C.shield){ RUN_C.shield = 0; graceT = 1.5; safeT = .3; sfx.smash(); shake = Math.max(shake, .12); burst(P.x, P.y - 28, 14, [C.white, '#9AD8F5', C.purpleL], 90, 200);
    toast(txt('cons.shieldUsed')); hudRefresh(); return true; }
  if (RUN_C.heart && !RUN_C.heartUsed && BN.d.stock.heart > 0){ reviveUI.offer(kind); return true; }
  return false;
}
// ---------- le Cœur, proposé à la chute ----------
const reviveUI = (() => {
  const el = document.createElement('div'); el.id = 'revive'; el.hidden = true;
  el.innerHTML = '<div class="rv"><div class="q"><span></span></div><div class="row"><button type="button" class="btn yes"></button><button type="button" class="btn alt no"></button></div><div class="bar"><i></i></div></div>';
  el.querySelector('.q').insertBefore(cvOf(ICO_HEART), el.querySelector('.q span'));
  $('news').parentElement.appendChild(el);
  const yes = el.querySelector('.yes'), no = el.querySelector('.no'), bar = el.querySelector('.bar i');
  let kind = null, t0 = 0, raf = 0, armed = false;
  const DUR = 4000;
  function tick(now){ const k = Math.max(0, 1 - (now - t0)/DUR); bar.style.transform = 'scaleX(' + k.toFixed(3) + ')'; armed = now - t0 > 350; if (k <= 0) decline(); else raf = requestAnimationFrame(tick); }
  function hide(){ cancelAnimationFrame(raf); el.hidden = true; kind = null; }
  function offer(k){ kind = k; state = 'revive'; MUSIC.pause(); $('pausebtn').hidden = true;
    el.querySelector('.q span').textContent = txt('cons.heart.q'); yes.textContent = txt('cons.yes'); no.textContent = txt('cons.no');
    el.hidden = false; t0 = performance.now(); armed = false; raf = requestAnimationFrame(tick); }
  function accept(){ if (!kind || !armed) return; hide();
    BN.d.stock.heart--; BN.save(); RUN_C.heartUsed = 1; RUN_C.boosted = true;
    state = 'play'; MUSIC.resume(); last = 0; $('pausebtn').hidden = false;
    P.vy = -460; P.ground = false; P.buf = 0; P.sink = false; graceT = 2; safeT = .3; sfx.sock(); burst(P.x, P.y - 20, 18, ['#E8384F', '#FFB3BE', C.white], 90, 160);
    toast(txt('cons.heartUsed')); hudRefresh(); }
  function decline(){ if (!kind) return; const k = kind; hide(); RUN_C.heartUsed = 1; state = 'play'; consSkip = true; die(k); }
  yes.addEventListener('click', e => { e.stopPropagation(); accept(); });
  no.addEventListener('click', e => { e.stopPropagation(); if (armed) decline(); });
  el.addEventListener('pointerdown', e => e.stopPropagation());
  return { offer, hide };
})();
// ---------- écran de fin : partie boostée ----------
{ const p = document.createElement('p'); p.id = 'boosted'; p.hidden = true; $('bestline').after(p);
  setInterval(() => { const on = state === 'over' && RUN_C.boosted; if (p.hidden === on){ p.hidden = !on; p.textContent = txt('cons.boosted'); } }, 200); }
