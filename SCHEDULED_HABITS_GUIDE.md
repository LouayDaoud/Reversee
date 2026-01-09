# 📅 Guide des Habitudes Planifiées

## Vue d'ensemble

Cette fonctionnalité permet aux administrateurs d'assigner des habitudes quotidiennes ou récurrentes aux utilisateurs, et aux utilisateurs de visualiser ces habitudes dans un calendrier interactif.

## 🎯 Fonctionnalités

### Pour l'Administrateur

1. **Assigner des habitudes planifiées**
   - Sélectionner un utilisateur
   - Définir la catégorie, le nom, la valeur cible et l'unité
   - Configurer la récurrence (quotidienne, hebdomadaire, personnalisée)
   - Définir la période (date de début, date de fin optionnelle)
   - Ajouter une heure préférée et des instructions
   - Activer/désactiver la création automatique

2. **Gérer les habitudes planifiées**
   - Voir toutes les habitudes assignées
   - Filtrer par utilisateur ou statut
   - Modifier les habitudes existantes
   - Supprimer des habitudes planifiées

3. **Accès**
   - Onglet "Habitudes Planifiées" dans le Dashboard Admin

### Pour l'Utilisateur

1. **Visualiser le calendrier**
   - Voir toutes les habitudes assignées dans un calendrier mensuel
   - Navigation entre les mois
   - Indicateurs visuels pour les habitudes complétées/non complétées
   - Codes couleur par catégorie

2. **Détails des habitudes**
   - Cliquer sur une date pour voir les habitudes du jour
   - Voir les instructions, l'heure recommandée, et qui a assigné l'habitude
   - Statut de complétion (complété/en attente)

3. **Accès**
   - Bouton "Calendrier" dans le Dashboard utilisateur

## 📋 Structure des Données

### Modèle ScheduledHabit

```javascript
{
  user: ObjectId,              // Utilisateur assigné
  assignedBy: ObjectId,       // Admin qui a assigné
  category: String,           // sleep, exercise, screen, mood, stress, nutrition, other
  name: String,               // Nom de l'habitude
  targetValue: Number,         // Valeur cible
  unit: String,               // Unité (heures, km, verres, etc.)
  recurrence: String,         // daily, weekly, custom
  daysOfWeek: [Number],        // Jours de la semaine (0-6) pour weekly
  startDate: Date,            // Date de début
  endDate: Date,              // Date de fin (optionnel)
  preferredTime: String,      // Heure préférée (HH:MM)
  instructions: String,      // Instructions pour l'utilisateur
  status: String,             // active, paused, completed, cancelled
  autoCreate: Boolean,        // Créer automatiquement les habitudes
  createdHabits: [ObjectId]    // Habitudes créées à partir de cette planification
}
```

## 🔌 API Endpoints

### Admin Routes (`/api/admin/scheduled-habits`)

- `POST /` - Assigner une habitude planifiée
- `GET /` - Récupérer toutes les habitudes planifiées (avec filtres)
- `GET /:id` - Récupérer une habitude planifiée par ID
- `PUT /:id` - Mettre à jour une habitude planifiée
- `DELETE /:id` - Supprimer une habitude planifiée

### User Routes (`/api/scheduled-habits`)

- `GET /` - Récupérer mes habitudes planifiées
- `GET /calendar` - Récupérer les habitudes pour le calendrier (avec dates)

## 🎨 Interface Utilisateur

### Admin Dashboard

1. **Onglet "Habitudes Planifiées"**
   - Formulaire d'assignation
   - Liste des habitudes planifiées avec filtres
   - Actions: Modifier, Supprimer

### User Dashboard

1. **Bouton "Calendrier"**
   - Calendrier mensuel interactif
   - Vue détaillée des habitudes par jour
   - Légende des catégories

## 🔄 Fonctionnement

### Création Automatique

Si `autoCreate` est activé, le système crée automatiquement une habitude dans la collection `Habit` pour chaque jour où l'habitude planifiée doit être complétée. L'utilisateur peut ensuite compléter cette habitude avec sa valeur réelle.

### Récurrence

- **Quotidienne**: L'habitude est créée tous les jours entre `startDate` et `endDate`
- **Hebdomadaire**: L'habitude est créée uniquement les jours spécifiés dans `daysOfWeek`
- **Personnalisée**: Pour l'instant, fonctionne comme quotidienne (peut être étendu)

### Statut

- **active**: L'habitude est active et sera créée automatiquement
- **paused**: L'habitude est en pause, ne sera pas créée
- **completed**: L'habitude est terminée
- **cancelled**: L'habitude est annulée

## 🚀 Utilisation

### Assigner une habitude (Admin)

1. Aller dans le Dashboard Admin
2. Cliquer sur l'onglet "Habitudes Planifiées"
3. Cliquer sur "Assigner une Habitude"
4. Remplir le formulaire:
   - Sélectionner l'utilisateur
   - Choisir la catégorie et le nom
   - Définir la valeur cible et l'unité
   - Configurer la récurrence
   - Définir les dates
   - Ajouter des instructions (optionnel)
5. Cliquer sur "Assigner"

### Voir le calendrier (Utilisateur)

1. Aller dans le Dashboard utilisateur
2. Cliquer sur le bouton "Calendrier"
3. Naviguer entre les mois avec les flèches
4. Cliquer sur une date pour voir les habitudes du jour
5. Les habitudes complétées sont marquées avec une coche verte

## 📝 Notes

- Les habitudes planifiées peuvent être modifiées ou supprimées à tout moment par l'admin
- Les habitudes déjà créées ne sont pas supprimées si la planification est modifiée
- Le calendrier montre les habitudes pour une période étendue (quelques jours avant et après le mois visible)
- Les couleurs dans le calendrier correspondent aux catégories d'habitudes

## 🔮 Améliorations Futures

- Export iCal pour synchronisation avec calendriers externes
- Notifications push pour rappels d'habitudes
- Statistiques de complétion des habitudes planifiées
- Templates d'habitudes récurrentes
- Récurrence personnalisée avancée (ex: tous les 3 jours, premier lundi du mois, etc.)
- Intégration avec Google Calendar, Outlook, etc.

