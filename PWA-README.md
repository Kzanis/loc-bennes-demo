# PWA Loc Bennes - Documentation

## 📁 Fichiers PWA

| Fichier | Localisation | Description |
|---------|--------------|-------------|
| Configuration PWA | `vite.config.ts` | Configuration vite-plugin-pwa |
| Manifest | Généré au build → `dist/manifest.webmanifest` | Métadonnées PWA |
| Service Worker | Généré au build → `dist/sw.js` | Cache NetworkFirst |
| Icône 192x192 | `public/icons/icon-192.png` | Icône Android standard |
| Icône 512x512 | `public/icons/icon-512.png` | Icône haute résolution |
| Icône iOS | `public/icons/apple-touch-icon.png` | Icône Safari iOS |

## 🚀 Déploiement sur Hostinger

### Prérequis
- HTTPS activé (obligatoire pour les PWA)
- Fichiers uploadés dans le dossier `public_html`

### Étapes
1. Exécuter `npm run build` localement
2. Uploader le contenu du dossier `dist/` vers Hostinger
3. Vérifier que le fichier `manifest.webmanifest` est accessible via `https://votredomaine.com/manifest.webmanifest`

## ✅ Vérification de la PWA

### Chrome DevTools (Desktop)
1. Ouvrir l'application dans Chrome
2. F12 → Onglet **Application**
3. Vérifier :
   - **Manifest** : Toutes les informations doivent être affichées
   - **Service Workers** : Status "activated and running"
   - **Installability** : Pas d'erreurs

### Test sur Mobile

#### Android (Chrome)
1. Ouvrir l'URL dans Chrome
2. Menu ⋮ → "Installer l'application" ou "Ajouter à l'écran d'accueil"
3. L'icône Loc Bennes apparaît sur l'écran d'accueil
4. L'application se lance en plein écran (sans barre navigateur)

#### iOS (Safari)
1. Ouvrir l'URL dans Safari
2. Appuyer sur le bouton Partager (carré avec flèche)
3. Sélectionner "Sur l'écran d'accueil"
4. Confirmer le nom "Loc Bennes"
5. L'application se lance en mode standalone

## 🔧 Configuration PWA

```typescript
// vite.config.ts
VitePWA({
  registerType: "autoUpdate",
  manifest: {
    name: "Loc Bennes",
    short_name: "Loc Bennes",
    display: "standalone",
    theme_color: "#E02020",
    background_color: "#2A2A2C"
  },
  workbox: {
    runtimeCaching: [{
      handler: "NetworkFirst" // Priorité réseau, cache en fallback
    }]
  }
})
```

## 📱 Comportement attendu

| Fonctionnalité | Statut |
|----------------|--------|
| Installable depuis navigateur | ✅ |
| Icône sur écran d'accueil | ✅ |
| Lancement plein écran | ✅ |
| Barre de statut thématisée | ✅ |
| Cache des assets | ✅ |
| Priorité réseau (NetworkFirst) | ✅ |

## ⚠️ Troubleshooting

### L'application n'est pas installable
- Vérifier que HTTPS est actif
- Vérifier que le manifest est accessible
- Vérifier qu'il n'y a pas d'erreurs dans la console

### Le Service Worker ne s'active pas
- Vider le cache du navigateur
- Forcer la mise à jour : DevTools → Application → Service Workers → Update

### Les icônes n'apparaissent pas
- Vérifier que les fichiers sont dans `public/icons/`
- Vérifier les chemins dans le manifest
