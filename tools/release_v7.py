#!/usr/bin/env python3
"""Bascule de la beta (b12) dans le vrai jeu : v7.0.

À lancer une seule fois depuis la racine du dépôt : python3 tools/release_v7.py
- applique à index.html toutes les modifs de gameplay de la beta (PATCHES de tools/make_beta.py)
- intègre les modules de la beta (tutoriel, bonus, défis du jour, remise à zéro) + flèches des Nouvelles
- déplace leurs textes dans langues.js, ajoute la news de la boutique Bonus
- récompenses de trophées, parties boostées hors classement
- version 7.0 (index.html, stats.html, sw.js)
"""
import ast, json, pathlib, re, sys, shutil, subprocess, tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
T = ROOT / 'tools'
idx = (ROOT / 'index.html').read_text(encoding='utf-8')
lng = (ROOT / 'langues.js').read_text(encoding='utf-8')
OLD = re.search(r"const APP_VERSION = '([^']+)'", idx).group(1)
NEW = '7.0'

def once(s, old, new, label):
    n = s.count(old)
    if n != 1: sys.exit(f'[release] « {label} » : {n} occurrence(s) au lieu de 1')
    return s.replace(old, new)

# ---------- 1. modifs de gameplay de la beta ----------
src = (T / 'make_beta.py').read_text(encoding='utf-8')
PATCHES = next(ast.literal_eval(n.value) for n in ast.walk(ast.parse(src)) if isinstance(n, ast.Assign) and getattr(n.targets[0], 'id', '') == 'PATCHES')
for old, new, label in PATCHES: idx = once(idx, old, new, label)

# ---------- 2. modifs propres à la version officielle ----------
TIERS = {
  50:   ['crampons', 'pasdebol', 'taupe', 'amateur', 'combo5', 'soldes', 'vitrine', 'junior', 'crabe', 'marmotte', 'mains', 'fashion'],
  150:  ['gym', 'force', 'combo10', 'plumes', 'requin', 'deer', 'bronze', 'senior', 'heros', 'voltige', 'cendrillon', 'tetedure', 'huck', 'elfe', 'hydrate', 'mcfly', 'rainbow', 'cowboy', 'son31', 'promqueen'],
  400:  ['beach', 'peuf', 'angry', 'combo50', 'master', 'bulldozer', 'argent', 'picsou', 'chapelier', 'gmaster', 'prada', 'intouchable', 'cascadeuse', 'marathon'],
  1000: ['fields', 'city', 'forest', 'globe', 'combo100', 'or', 'dressing', 'legende', 'accro', 'parzival'],
  2500: ['greatest'],
  500:  ['serial', 'firecatch', 'rainbow2', 'platine', 'diamant', 'obsidienne', 'adamantium', 'getalife', 'flambeur', 'dam'],
}
REW = {i: v for v, ids in TIERS.items() for i in ids}
ids_all = re.search(r"const TROPHY_IDS = \[([^\]]*)\]", idx).group(1) + ',' + re.search(r"const CHROME_IDS = \[([^\]]*)\]", idx).group(1)
ids_all = re.findall(r"'([a-z0-9]+)'", ids_all)
missing = [i for i in ids_all if i not in REW]
if missing: sys.exit(f'[release] trophées sans récompense : {missing}')
REL = [
  # récompense en disques au déblocage d'un trophée (rien pour les trophées déjà obtenus avant la v7.0)
  ("const LOOKS = {", "// v7.0 : disques offerts au déblocage d'un trophée (facile 50, moyen 150, difficile 400, exploit 1000, secret 500, Greatest 2500)\n"
   "const TROPHY_REWARD = " + json.dumps(REW, separators=(',', ':')) + ";\n"
   "function trophyReward(d, id){ const n = TROPHY_REWARD[id] || 0; if (!n) return; d.coins = (d.coins || 0) + n; toast(txt('tr.reward', { name: txt('tr.' + id + '.n'), n }), true); }\n"
   "const LOOKS = {", 'récompenses : barème'),
  ("    if (d.u[id]) return; d.u[id] = Date.now();\n    if (!d.u.greatest && TROPHY_IDS.every(k => k === 'greatest' || k === 'parzival' || d.u[k])) d.u.greatest = Date.now();",
   "    if (d.u[id]) return; d.u[id] = Date.now(); trophyReward(d, id);\n    if (!d.u.greatest && TROPHY_IDS.every(k => k === 'greatest' || k === 'parzival' || d.u[k])){ d.u.greatest = Date.now(); trophyReward(d, 'greatest'); }", 'récompenses : versement'),
  # parties boostées (bonus ou cœur) : jamais envoyées au classement mondial
  ("if (score > (TR.d.lbBest || 0) && !AC.sus()) lbEntry.show(", "if (score > (TR.d.lbBest || 0) && !AC.sus() && !RUN_C.boosted) lbEntry.show(", 'classement : parties boostées exclues'),
  # icône de la news Bonus (le cœur, x2)
  ("    reglages: () => mk(22, 22, g => { g.imageSmoothingEnabled = false; g.drawImage($('icoSet'), 0, 0, 22, 22); }) };",
   "    reglages: () => mk(22, 22, g => { g.imageSmoothingEnabled = false; g.drawImage($('icoSet'), 0, 0, 22, 22); }),\n    bonus: () => mk(22, 20, g => { g.imageSmoothingEnabled = false; g.drawImage(ICO_HEART, 0, 0, 22, 20); }) };", 'news : icône bonus'),
]
for old, new, label in REL: idx = once(idx, old, new, label)

# ---------- 3. modules : textes vers langues.js, code dans index.html ----------
texts = []
def take_texts(js):
    out = js
    for m in re.finditer(r"Object\.assign\(TEXTS, \{\n(.*?)\n\}\);\n", js, re.S):
        body = m.group(1).rstrip()
        if not body.endswith(','): body += ','
        texts.append(body); out = out.replace(m.group(0), '')
    return out
mods = []
# (déjà exécuté pour la v7.0 ; les modules de la beta sont depuis rangés dans tools/archive_beta)
for f in ['beta_tuto.js', 'beta_cons.js', 'beta_daily.js', 'beta_reset.js', 'v7_news.js']:
    js = take_texts((T / f).read_text(encoding='utf-8'))
    if f == 'beta_daily.js': js = '\nconst DQ_DATA = ' + (T / 'beta_defis.json').read_text(encoding='utf-8').strip() + ';\n' + js
    mods.append(js.replace('BETA : ', 'v7.0 : '))
idx = once(idx, '\nrequestAnimationFrame(frame);\n', '\nrequestAnimationFrame(frame);\n' + ''.join(mods), 'injection des modules')
texts.append('''  "tr.reward":  { fr:"Trophée « {name} » · +{n}", en:"Trophy “{name}” · +{n}", es:"Trofeo «{name}» · +{n}" },''')
lng = once(lng, '\n};\n\n/* Nouvelles du jeu', '\n  // v7.0 : tutoriel, boutique Bonus, Cœur, défis du jour, remise à zéro, récompenses de trophées\n' + '\n'.join(texts) + '\n};\n\n/* Nouvelles du jeu', 'langues : textes v7.0')
NEWS = '''  { id:'2026-10-17-bonus', date:'2026-10-17', icon:'bonus',
    title:{ fr:'La boutique Bonus est ouverte', en:'The Boosts shop is open', es:'Abre la tienda de Bonus' },
    text:{ fr:'Nouvel onglet Bonus dans la boutique : Bouclier, Chaussette de départ, Chrono de poche, Gant collant, Billet de biome et Cœur pour ré-animer Stelly. Achète, équipe, et c\\u2019est parti ! Une partie avec un bonus ne compte pas au classement mondial.',
      en:'New Boosts tab in the shop: Shield, Head-start sock, Pocket stopwatch, Sticky glove, Biome ticket and Heart to revive Stelly. Buy, equip and go! A run with a boost doesn\\u2019t count for the world ranking.',
      es:'Nueva pestaña Bonus en la tienda: Escudo, Calcetín de salida, Cronómetro de bolsillo, Guante pegajoso, Billete de bioma y Corazón para reanimar a Stelly. ¡Compra, equipa y a correr! Una partida con bonus no cuenta para la clasificación mundial.' } },
'''
lng = once(lng, "const NEWS = [\n", "const NEWS = [\n" + NEWS, 'news : boutique Bonus')

# ---------- 4. version ----------
idx = once(idx, f"const APP_VERSION = '{OLD}';", f"const APP_VERSION = '{NEW}';", 'version')
idx = idx.replace(f'?v={OLD}', f'?v={NEW}')
st = (ROOT / 'stats.html').read_text(encoding='utf-8').replace(f'?v={OLD}', f'?v={NEW}')
sw = once((ROOT / 'sw.js').read_text(encoding='utf-8'), f"'stelly-run-v{OLD}'", f"'stelly-run-v{NEW}'", 'sw version')

# ---------- 5. garde-fous ----------
if 'stellyrun_test_' in idx: sys.exit('[release] clé de sauvegarde de test trouvée')
if '#dbg' in idx or "d.id = 'dbg'" in idx: sys.exit('[release] panneau debug trouvé')
if shutil.which('node'):
    for name, code in [('index.html', max(re.findall(r'<script>(.*?)</script>', idx, re.S), key=len)), ('langues.js', lng)]:
        with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as f: f.write(code)
        r = subprocess.run(['node', '--check', f.name], capture_output=True, text=True)
        if r.returncode: sys.exit(f'[release] ERREUR DE SYNTAXE dans {name} :\n' + r.stderr[:600])

(ROOT / 'index.html').write_text(idx, encoding='utf-8'); (ROOT / 'langues.js').write_text(lng, encoding='utf-8')
(ROOT / 'stats.html').write_text(st, encoding='utf-8'); (ROOT / 'sw.js').write_text(sw, encoding='utf-8')
print(f'[release] v{OLD} -> v{NEW} : {len(PATCHES)} modifs beta + {len(REL)} modifs officielles, {len(texts)} blocs de textes, {sum(len(v) for v in TIERS.values())} trophées récompensés')
