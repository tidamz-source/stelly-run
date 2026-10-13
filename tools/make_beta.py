#!/usr/bin/env python3
"""Génère beta.html à partir de index.html (sans jamais modifier index.html).

Usage : python3 tools/make_beta.py   (depuis la racine du dépôt)

Conventions BETA :
  - sauvegarde séparée (préfixe stellyrun_test_)
  - aucun appel au backend (classement, stats, synchro, transfert) : fetch vers script.google.com rejeté
  - pas d'enregistrement du service worker
  - titre [BETA]
  - panneau debug #dbg + bouton « donner une chaussette »
  - zone BETA : les modifs de gameplay à tester sont appliquées par PATCHES ci-dessous
"""
import pathlib, re, sys

# Numéro de la beta : à incrémenter à chaque nouvelle beta (affiché « v<version du jeu>-b<numéro> »)
BETA_REV = 5

ROOT = pathlib.Path(__file__).resolve().parent.parent
src = (ROOT / 'index.html').read_text(encoding='utf-8')
out = src

def sub_once(old, new, label):
    global out
    n = out.count(old)
    if n != 1:
        sys.exit(f'[make_beta] « {label} » : {n} occurrence(s) au lieu de 1, génération annulée')
    out = out.replace(old, new)

# 1. Titre
sub_once('<title>Stelly Run</title>', '<title>[BETA] Stelly Run</title>', 'titre')

# 2. Sauvegarde séparée
out = out.replace("'stellyrun_", "'stellyrun_test_")
if re.search(r"""["`]stellyrun_(?!test_)""", out):
    sys.exit('[make_beta] clé stellyrun_ non préfixée trouvée (guillemets doubles ou gabarit), à traiter')

# 3. Réseau : coupe tout appel au backend Apps Script, dès le premier script
GUARD = ("<script>/* BETA : backend coupé */(() => { const f = window.fetch.bind(window);"
         " window.fetch = (u, o) => /script\\.google\\.com/.test(String(u && u.url || u))"
         " ? Promise.reject(new Error('BETA : backend désactivé')) : f(u, o); })();</script>\n")
i = out.index('<script')
out = out[:i] + GUARD + out[i:]

# 4. Pas de service worker
sub_once("navigator.serviceWorker.register('sw.js')", "Promise.resolve()", 'service worker')

# 5. PATCHES de gameplay BETA (vides pour l'instant)
PATCHES = [
    # Fast Count : puissance 22 % (au lieu de 20 %)
    ("slowMul = Math.max(.35, slowMul*.8);", "slowMul = Math.max(.35, slowMul*.78);", 'Fast Count puissance'),
    # Fast Count : un chrono toutes les 25 à 30 s (au lieu de 30 à 45 s) ; premier chrono inchangé
    ("slowIn = 30 + Math.random()*15;", "slowIn = 25 + Math.random()*5;", 'Fast Count fréquence'),
    # Oiseaux : jamais au milieu des disques (oiseaux et disques avancent à la même vitesse, l'écart reste fixe).
    # L'oiseau attend qu'aucun disque ne soit à moins de 80 px de son point d'apparition.
    ("else if (!obs.some(o => o.x + o.w > P.x - 6)){ birdWait = false; spawnFlyer(); }",
     "else if (!obs.some(o => o.x + o.w > P.x - 6) && !discs.some(d => !d.got && d.x > W - 50)){ birdWait = false; spawnFlyer(); }", 'oiseau hors des disques'),
    # Disque arc-en-ciel : pas à côté d'un oiseau
    ("if (state === 'play' && rbAt > 0 && t >= rbAt && !discs.some(d => d.x > W - 50)){",
     "if (state === 'play' && rbAt > 0 && t >= rbAt && !discs.some(d => d.x > W - 50) && !flyers.some(f => !f.ko && f.x > W - 50)){", 'arc-en-ciel hors des oiseaux'),
    # Pas de longues séquences sans disques : si plus aucun disque n'attend devant Stelly,
    # le nouvel obstacle porte forcément des disques (l'arc, sinon une figure entre les obstacles)
    # lastDiscT : dernier instant où un disque attendait encore devant Stelly
    ("let birdWait = false;", "let birdWait = false, lastDiscT = 0, forcedN = 0;", 'disques forcés : variables'),
    ("    discs = discs.filter(o => o.x > -30 && !o.got); items = items.filter(o => o.x > -30 && !o.got);",
     "    if (discs.some(d => !d.got && !d.missed && d.x > P.x)) lastDiscT = t;\n    discs = discs.filter(o => o.x > -30 && !o.got); items = items.filter(o => o.x > -30 && !o.got);", 'disques forcés : suivi'),
    # vrai trou seulement : aucun disque devant ET le trou prévu (temps déjà passé sans disque + trajet jusqu'à Stelly) dépasse 2,5 s
    ("  if (Math.random() < (sockOn || fireOn ? .75 : .42) && !items.some(it => Math.abs(it.x - cx) < 110)){",
     "  const dry = !discs.some(dd => !dd.got && !dd.missed && dd.x > P.x) && (lastDiscT > t || (t - lastDiscT) + (cx - P.x)/Math.max(spEff, 60) > 2.5);\n  const pArc = Math.random() < (sockOn || fireOn ? .75 : .42), forcedArc = dry && !pArc;\n  if ((dry || pArc) && !items.some(it => Math.abs(it.x - cx) < 110)){", 'disques forcés : arc'),
    # arc forcé : 3 disques, et un arc de 5 une fois sur trois (si la vitesse le permet)
    ("sp = Math.max(28, speed*(arcSock ? .1 : .07)), half = sp >= 36 ? 2 : 1;",
     "sp = Math.max(28, speed*(arcSock ? .1 : .07)), half = (forcedArc && (forcedN++ % 3 !== 2)) ? 1 : (sp >= 36 ? 2 : 1);", 'disques forcés : grappes de 3 et de 5'),
    ("  if ((roomy || sockOn) && Math.random() < (sockOn || fireOn ? .8 : .45)){",
     "  if ((roomy || sockOn || (dry && arcEnd === -Infinity)) && ((dry && arcEnd === -Infinity) || Math.random() < (sockOn || fireOn ? .8 : .45))){", 'disques forcés : figure'),
    # Biomes : un nouveau biome tous les 10 000 points, ordre fixe en boucle
    # STADE (0) > INDOOR (1) > BEACH (2) > NEIGE (3) > CAMPAGNE (6) > VILLE (4) > FORÊT (5)
    ("    if (zoneT <= 0){ zoneT = 12 + Math.random()*6; do { nt = Math.floor(Math.random()*THEME_NAMES.length); } while (nt === theme); }",
     "    nt = [0, 1, 2, 3, 6, 4, 5][Math.floor(score/10000) % 7];", 'biomes tous les 10 000 points'),
    # Oiseaux : plus d'ondulation, le dessin vole droit à la hauteur exacte de sa hitbox (les ailes battent toujours)
    ("function flyerY(f){ return f.y0 + Math.sin(f.t*f.fs + f.ph)*f.amp + Math.sin(f.t*.8 + f.ph*2)*f.drift; }",
     "function flyerY(f){ return f.y0; }", 'oiseaux sans ondulation'),
    # Oiseaux : hitbox « C hybride ». La zone pour assommer reste la hitbox actuelle ;
    # la zone qui tue est réduite à 50 % de la largeur et 60 % de la hauteur de l'oiseau (pigeon : 8 x 6 px au lieu de 16 x 10)
    ("if (!P.ground && P.vy > (mid ? -60 : 40) && P.y < fy + (mid ? 9 : 3)){ stomp(f, fy); continue; }",
     "if (!P.ground && P.vy > (mid ? -60 : 40) && P.y < fy + (mid ? 9 : 3)){ stomp(f, fy); continue; }\n        if (!(Math.abs(f.x - P.x) < S.hw*.5 + 7 && fy + S.hh*.6 > P.y - 46 && fy - S.hh*.6 < P.y - 2)) continue;   // frôlé sans être touché", 'oiseaux : hitbox C hybride'),
    # Texte de changement de biome : en haut, centré, même taille
    ("#zone{ position:absolute; right:calc(var(--s)*10px); bottom:calc(var(--s)*8px);",
     "#zone{ position:absolute; left:0; right:0; top:calc(var(--s)*8px); text-align:center;", 'biome en haut centré'),
    ("transform-origin:right bottom; }", "transform-origin:center top; }", 'biome : origine de l\'animation'),
    # Tutoriel : avant la toute première partie (clé stellyrun_tuto absente)
    ("function startGame(){\n  AC.reset();", "function startGame(){\n  if (tutoUI.need()){ tutoUI.open(); return; }\n  AC.reset();", 'tutoriel avant la partie'),
]
for old, new, label in PATCHES:
    sub_once(old, new, label)

# 6. Panneau debug (injecté dans l'IIFE du jeu)
DBG = r"""
/* ================= BETA : panneau debug ================= */
{ const d = document.createElement('div'); d.id = 'dbg';
  d.style.cssText = 'position:fixed;right:6px;top:58px;z-index:99;opacity:.8;font:9px/1.3 monospace;color:#fff;background:rgba(46,14,48,.82);padding:6px 8px;border-radius:6px;white-space:pre;text-align:center';
  const info = document.createElement('div'); info.style.pointerEvents = 'none';
  const b = document.createElement('button'); b.type = 'button'; b.tabIndex = -1; b.textContent = '🧦 donner une chaussette';
  b.style.cssText = 'margin-top:3px;font:10px monospace;padding:3px 8px;border-radius:5px;border:1px solid #fff;background:#7B4FA0;color:#fff';
  b.addEventListener('click', e => { e.stopPropagation(); b.blur(); if (state !== 'play') return; P.sockT = 7; sfx.sock(); toast(txt('toast.superJump')); });
  d.append(info, b); document.body.appendChild(d);
  setInterval(() => { info.textContent = 'BETA v' + APP_VERSION + '-b""" + str(BETA_REV) + r"""' + ' · chaussette\n' + (state === 'play'
    ? 'vitesse ' + Math.round(spEff) + ' (x' + slowMul.toFixed(2) + ')\nchaussette ' + (P.sockT > 0 ? 'ACTIVE ' + P.sockT.toFixed(1) + ' s' : 'dans ' + Math.max(0, sockIn).toFixed(1) + ' s') + '\nFast Count x' + slowMul.toFixed(2) + ' · ' + (t > 25 ? 'chrono dans ' + Math.max(0, slowIn).toFixed(1) + ' s' : 'pas de chrono avant 25 s')
    : 'lance une partie'); }, 200); }
"""
TUTO = open(ROOT / 'tools' / 'beta_tuto.js', encoding='utf-8').read().replace("'stellyrun_", "'stellyrun_test_")
sub_once('\nrequestAnimationFrame(frame);\n', '\nrequestAnimationFrame(frame);\n' + DBG + TUTO, 'injection debug et tutoriel')

(ROOT / 'beta.html').write_text(out, encoding='utf-8')
print('[make_beta] beta.html v' + re.search(r"APP_VERSION = '([^']+)'", src).group(1) + '-b' + str(BETA_REV) + ' généré depuis index.html')
