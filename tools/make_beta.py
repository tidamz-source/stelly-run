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
    # Fast Count : puissance 25 % (au lieu de 20 %)
    ("slowMul = Math.max(.35, slowMul*.8);", "slowMul = Math.max(.35, slowMul*.75);", 'Fast Count puissance'),
    # Fast Count : un chrono toutes les 25 à 30 s (au lieu de 30 à 45 s) ; premier chrono inchangé
    ("slowIn = 30 + Math.random()*15;", "slowIn = 25 + Math.random()*5;", 'Fast Count fréquence'),
]
for old, new, label in PATCHES:
    sub_once(old, new, label)

# 6. Panneau debug (injecté dans l'IIFE du jeu)
DBG = r"""
/* ================= BETA : panneau debug ================= */
{ const d = document.createElement('div'); d.id = 'dbg';
  d.style.cssText = 'position:fixed;left:50%;top:6px;transform:translateX(-50%);z-index:99;font:11px/1.35 monospace;color:#fff;background:rgba(46,14,48,.82);padding:6px 8px;border-radius:6px;white-space:pre;text-align:center';
  const info = document.createElement('div'); info.style.pointerEvents = 'none';
  const b = document.createElement('button'); b.type = 'button'; b.tabIndex = -1; b.textContent = '🧦 donner une chaussette';
  b.style.cssText = 'margin-top:4px;font:11px monospace;padding:3px 8px;border-radius:5px;border:1px solid #fff;background:#7B4FA0;color:#fff';
  b.addEventListener('click', e => { e.stopPropagation(); b.blur(); if (state !== 'play') return; P.sockT = 7; sfx.sock(); toast(txt('toast.superJump')); });
  d.append(info, b); document.body.appendChild(d);
  setInterval(() => { info.textContent = 'BETA v' + APP_VERSION + ' · chaussette\n' + (state === 'play'
    ? 'vitesse ' + Math.round(spEff) + ' (x' + slowMul.toFixed(2) + ')\nchaussette ' + (P.sockT > 0 ? 'ACTIVE ' + P.sockT.toFixed(1) + ' s' : 'dans ' + Math.max(0, sockIn).toFixed(1) + ' s') + '\nFast Count x' + slowMul.toFixed(2) + ' · ' + (t > 25 ? 'chrono dans ' + Math.max(0, slowIn).toFixed(1) + ' s' : 'pas de chrono avant 25 s')
    : 'lance une partie'); }, 200); }
"""
sub_once('\nrequestAnimationFrame(frame);\n', '\nrequestAnimationFrame(frame);\n' + DBG, 'injection debug')

(ROOT / 'beta.html').write_text(out, encoding='utf-8')
print('[make_beta] beta.html généré depuis index.html v' + re.search(r"APP_VERSION = '([^']+)'", src).group(1))
