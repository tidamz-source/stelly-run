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
BETA_REV = 4

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
# Modifs de gameplay à tester dans la beta (old, new, libellé).
# b2 (squash & stretch) basculé dans le vrai jeu en v7.13.
# b3 (prise en main dans la course, accueil allégé, fin de partie) basculé dans le vrai jeu en v7.18.
# b4 (traînée d'invincibilité qui suit les mouvements) basculé dans le vrai jeu en v7.21.
PATCHES = []
for old, new, label in PATCHES:
    sub_once(old, new, label)

# 6. Panneau debug (injecté dans l'IIFE du jeu)
DBG = r"""
/* ================= BETA : panneau debug (replié par défaut) + compteur de performances ================= */
{ const PERF = { frames:0, worst:0, last:0, upd:0, drw:0, fps:0, w:0, u:0, dr:0 };
  { const u0 = update, d0 = draw;
    update = function(dt){ const a = performance.now(); u0(dt); PERF.upd += performance.now() - a; };
    draw = function(){ const a = performance.now(); d0(); PERF.drw += performance.now() - a; };
    const tick = now => { if (PERF.last){ const g = now - PERF.last; if (g > PERF.worst) PERF.worst = g; } PERF.last = now; PERF.frames++; requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
    setInterval(() => { const n = Math.max(1, PERF.frames); PERF.fps = PERF.frames; PERF.w = Math.round(PERF.worst); PERF.u = PERF.upd/n; PERF.dr = PERF.drw/n;
      PERF.frames = 0; PERF.worst = 0; PERF.upd = 0; PERF.drw = 0; }, 1000); }
  const d = document.createElement('div'); d.id = 'dbg';
  d.style.cssText = 'position:fixed;right:6px;top:58px;z-index:99;font:9px/1.3 monospace;color:#fff;background:rgba(46,14,48,.9);padding:4px 7px;border-radius:6px;white-space:pre;text-align:center;cursor:pointer';
  const info = document.createElement('div');
  const box = document.createElement('div'); box.hidden = true;
  const b = document.createElement('button'); b.type = 'button'; b.tabIndex = -1; b.textContent = '🧦 donner une chaussette';
  b.style.cssText = 'margin-top:3px;font:10px monospace;padding:3px 8px;border-radius:5px;border:1px solid #fff;background:#7B4FA0;color:#fff';
  b.addEventListener('click', e => { e.stopPropagation(); b.blur(); if (state !== 'play') return; P.sockT = 7; sfx.sock(); toast(txt('toast.superJump')); });
  const mkb = (label, fn) => { const x = document.createElement('button'); x.type = 'button'; x.tabIndex = -1; x.textContent = label; x.style.cssText = b.style.cssText + ';display:block;margin:3px auto 0';
    x.addEventListener('click', e => { e.stopPropagation(); x.blur(); fn(x); }); return x; };
  const bCoins = mkb('+5 000 disques', () => { TR.d.coins += 5000; TR.save(); toast('+5000'); });
  const bTuto = mkb('revoir le tuto', () => { ONB.reset(); toast('tuto au prochain départ'); });
  const bDay = mkb('défis : jour suivant', x => { x.textContent = 'défis : ' + dqUI.shiftDay(); });
  const det = document.createElement('div');
  box.append(det, b, bCoins, bTuto, bDay); d.append(info, box); document.body.appendChild(d);
  let open = false; try { open = localStorage.getItem('stellyrun_test_dbgopen') === '1'; } catch(e){}
  const setOpen = v => { open = v; box.hidden = !v; try { localStorage.setItem('stellyrun_test_dbgopen', v ? '1' : '0'); } catch(e){} paint(); };
  d.addEventListener('pointerdown', e => e.stopPropagation());
  d.addEventListener('click', e => { if (e.target.closest('button')) return; e.stopPropagation(); setOpen(!open); });
  function paint(){
    info.textContent = 'BETA v' + APP_VERSION + '-b""" + str(BETA_REV) + r"""' + ' · ' + PERF.fps + ' i/s · pire ' + PERF.w + ' ms ' + (open ? '▾' : '▸');
    if (!open) return;
    det.textContent = 'jeu ' + PERF.u.toFixed(1) + ' ms + dessin ' + PERF.dr.toFixed(1) + ' ms par image\n' + (state === 'play'
      ? 'vitesse ' + Math.round(spEff) + ' (x' + slowMul.toFixed(2) + ')\nchaussette ' + (P.sockT > 0 ? 'ACTIVE ' + P.sockT.toFixed(1) + ' s' : 'dans ' + Math.max(0, sockIn).toFixed(1) + ' s') + '\nFast Count x' + slowMul.toFixed(2) + ' · ' + (t > 25 ? 'chrono dans ' + Math.max(0, slowIn).toFixed(1) + ' s' : 'pas de chrono avant 25 s')
      : 'lance une partie') + '\ndisques en poche ' + TR.d.coins;
  }
  setOpen(open); setInterval(paint, 1000); }
"""
beta_js = lambda f: open(ROOT / 'tools' / f, encoding='utf-8').read().replace("'stellyrun_", "'stellyrun_test_")
sub_once('\nrequestAnimationFrame(frame);\n', '\nrequestAnimationFrame(frame);\n' + DBG, 'injection du panneau debug')

(ROOT / 'beta.html').write_text(out, encoding='utf-8')
# garde-fou : le script du jeu doit rester valide (vérifié avec node s'il est installé)
import shutil, subprocess, tempfile
if shutil.which('node'):
    big = max(re.findall(r'<script>(.*?)</script>', out, re.S), key=len)
    with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as f: f.write(big)
    r = subprocess.run(['node', '--check', f.name], capture_output=True, text=True)
    if r.returncode: sys.exit('[make_beta] ERREUR DE SYNTAXE dans beta.html :\n' + r.stderr[:600])
print('[make_beta] beta.html v' + re.search(r"APP_VERSION = '([^']+)'", src).group(1) + '-b' + str(BETA_REV) + ' généré depuis index.html')
