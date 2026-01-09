# Reversee - Digital Mirror of Your Future Self

Reversee est une application complète de suivi d'habitudes avec des fonctionnalités avancées d'IA, de réalité augmentée et d'analyse comportementale.

## 🚀 Fonctionnalités

- **Gestion d'habitudes** : Créez, suivez et analysez vos habitudes quotidiennes
- **Habit DNA** : Analysez votre profil d'habitudes unique
- **IA intégrée** : Chat avec IA pour obtenir des conseils personnalisés
- **Réalité Augmentée** : Visualisez vos habitudes en AR
- **Badges et récompenses** : Collectionnez des badges pour vos accomplissements
- **Statistiques avancées** : Analysez vos progrès avec des graphiques détaillés
- **Notifications** : Recevez des rappels pour vos habitudes
- **Administration** : Panel d'administration complet

## 📁 Structure du projet

```
reversee-app/
├── backend/          # API Node.js/Express
├── frontend/         # Application React
└── docker-compose.yml # Configuration Docker
```

## 🛠️ Technologies

### Backend
- Node.js / Express
- MongoDB / Mongoose
- JWT pour l'authentification
- Ollama pour l'IA locale (par défaut)
- OpenAI (optionnel)

### Frontend
- React 19
- React Router
- Tailwind CSS
- Chart.js pour les graphiques
- Framer Motion pour les animations

## 📦 Installation

### Prérequis
- Node.js (v18 ou supérieur)
- MongoDB
- Ollama (pour l'IA locale, optionnel)

### Backend

```bash
cd backend
npm install
cp env-template.txt .env
# Éditez .env avec vos configurations
npm start
```

### Frontend

```bash
cd frontend
npm install
npm start
```

### Docker

```bash
docker-compose up
```

## ⚙️ Configuration

### Variables d'environnement (Backend)

Créez un fichier `.env` dans le dossier `backend` basé sur `env-template.txt` :

```env
MONGODB_URI=mongodb://localhost:27017/reversee
JWT_SECRET=votre_secret_jwt
PORT=5000
LOCAL_AI_ENDPOINT=http://localhost:11434
OPENAI_API_KEY= (optionnel)
ADMIN_EMAILS=admin@example.com
```

## 🚀 Démarrage rapide

1. Clonez le dépôt
2. Installez les dépendances (backend et frontend)
3. Configurez MongoDB
4. Créez le fichier `.env` dans `backend/`
5. Démarrez le backend : `cd backend && npm start`
6. Démarrez le frontend : `cd frontend && npm start`

## 📝 Scripts disponibles

### Backend
- `npm start` : Démarre le serveur
- `npm run dev` : Mode développement avec nodemon

### Frontend
- `npm start` : Démarre l'application React
- `npm run build` : Build de production
- `npm test` : Lance les tests

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📄 Licence

ISC

## 👤 Auteur

Louay Daoud
