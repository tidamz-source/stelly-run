# Stelly Run – version PWA

Jeu de course en pixel art de Lutèce Games, installable sur téléphone et jouable hors ligne.

## Contenu du dossier

| Fichier | Rôle |
|---|---|
| `index.html` | Le jeu complet (polices intégrées, aucune dépendance externe) |
| `manifest.webmanifest` | Nom, icônes, couleurs et orientation de l'application |
| `sw.js` | Service worker : met le jeu en cache pour le hors ligne |
| `icons/` | Icônes Android, iPhone et favicon |

## Mise en ligne sur GitHub Pages

1. Crée un dépôt public nommé `stelly-run` sur github.com.
2. Dans le dépôt : **Add file → Upload files**, glisse tout le contenu de ce dossier (pas le dossier lui-même : `index.html` doit être à la racine), puis **Commit changes**.
3. Va dans **Settings → Pages**. Sous « Build and deployment », choisis **Deploy from a branch**, branche `main`, dossier `/ (root)`, puis **Save**.
4. Après une à deux minutes, le jeu est en ligne à l'adresse `https://TON-COMPTE.github.io/stelly-run/`.

## Installer le jeu sur un téléphone

- **Android (Chrome)** : ouvrir l'adresse, puis toucher le bouton « Installer l'appli » en haut à gauche de l'écran d'accueil du jeu (ou le menu ⋮ → « Installer l'application »).
- **iPhone (Safari)** : ouvrir l'adresse, toucher le bouton Partager, puis « Sur l'écran d'accueil ».

## Publier une mise à jour

1. Remplace `index.html` (et les icônes si besoin) dans le dépôt.
2. Dans `sw.js`, change la ligne `const VERSION = 'stelly-run-v1';` en `v2`, `v3`…
3. Les joueurs reçoivent la nouvelle version à leur prochaine ouverture du jeu avec une connexion.

## À savoir

- Le record et le réglage du son sont enregistrés sur le téléphone du joueur (localStorage).
- Le jeu est prévu en paysage : en portrait, un écran « Tourne ton téléphone » s'affiche et la partie se met en pause.
