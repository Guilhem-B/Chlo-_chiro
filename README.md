# Chloé Chevallier — Chiropracteur · Neuilly-sur-Marne

Site vitrine statique, une seule page. Aucune dépendance, aucun build.
Ouvrir `index.html` dans un navigateur, ou déposer le dossier sur Vercel / Netlify / n'importe quel hébergement statique.

## Arborescence

```
.
├── index.html
├── css/style.css
├── js/main.js
├── js/spine.js
└── README.md
```

## Palette

| Rôle | Hex | Usage |
|---|---|---|
| `--paper` | `#FFFFFF` | fond dominant |
| `--wash` | `#FBF8F1` | sections de respiration |
| `--ink` | `#14140F` | texte |
| `--slate` | `#6B6B62` | texte secondaire |
| `--gold` | `#B08D2F` | filets, icônes, gros titres |
| `--gold-deep` | `#7A5F16` | boutons et liens (contraste AA sur blanc) |
| `--gold-pale` | `#EADFC0` | hairlines |

Le doré clair n'est jamais utilisé en texte courant : le ratio de contraste sur blanc
serait insuffisant. C'est `--gold-deep` qui porte tout le texte doré.

## Typographie

Fraunces (titres) + Jost (courant), chargées depuis Google Fonts.
Pour un site RGPD-strict, télécharger les deux familles en local et remplacer le `<link>`
par un `@font-face` — Google Fonts en CDN transmet l'IP du visiteur.

## À remplacer avant mise en ligne

- [ ] **Lien Doctolib** — 4 occurrences de `https://www.doctolib.fr/` dans `index.html`, à remplacer par l'URL réelle de la fiche.
- [ ] **`<link rel="canonical">`** et `og:url` — mettre le domaine définitif.
- [ ] **Mentions légales / politique de confidentialité** — les deux liens du pied de page pointent sur `#`. Obligatoires.
- [ ] **Photos** — le site fonctionne sans image. Une photo du cabinet et un portrait amélioreraient nettement la conversion.
- [ ] **Contenus santé** — faire relire l'ensemble des textes par la praticienne. Voir la note ci-dessous.

## Note réglementaire

La communication des professionnels de santé est encadrée : information loyale et
vérifiable, pas de promesse de résultat, pas de comparaison, pas de témoignage
présenté comme une preuve d'efficacité thérapeutique. Les textes ont été rédigés
dans cet esprit (aucune allégation de guérison, mention explicite que la chiropraxie
ne remplace pas un avis médical), mais la validation finale revient à la praticienne.

## Détail technique

### La colonne du héros

`js/spine.js` dessine une colonne vertébrale vue de profil (24 vertèbres, crâne,
sacrum, ligne de gravité) puis interpole en continu entre deux postures :

- **t = 0** — posture d'écran : tête projetée en avant, hypercyphose dorsale,
  lordose lombaire effacée, bassin en rétroversion ;
- **t = 1** — courbure physiologique en S.

`t` est piloté par la position de défilement à l'intérieur de la section `.stage`
(panneau interne en `position: sticky`). Le redressement complet demande environ
290 px de défilement en desktop, 170 px en mobile. Aucun événement de
molette n'est intercepté : le défilement natif reste intact, le clavier et le
trackpad fonctionnent normalement, et une fois la section franchie la page
reprend son cours.

La correction s'achève à 75 % de la course, les 25 % restants tenant le résultat
à l'écran avant de relâcher.

Si le visiteur a activé « réduire les animations », l'épinglage est désactivé
(`body.no-pin`) et la colonne s'affiche directement en position finale.

### Régler l'animation

- Course du défilement : variable `--pin` dans `style.css` — `145vh` par défaut,
  `132vh` sous 960 px. Plus la valeur est basse, plus le redressement est rapide ;
  en dessous de `125vh` il devient difficile à percevoir à la molette.
- Amplitude des courbures : fonctions `slouch()` et `normal()` dans `spine.js`.
- Palier de fin : la constante `0.75` dans `update()`.
