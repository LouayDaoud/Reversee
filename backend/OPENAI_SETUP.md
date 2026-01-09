# 🚀 Configuration OpenAI (ChatGPT) pour Reversee

Ce guide vous explique comment configurer OpenAI pour que toutes les réponses de l'Assistant IA utilisent ChatGPT.

## 📋 Prérequis

1. Une clé API OpenAI valide
2. Node.js et MongoDB installés
3. Le backend configuré et fonctionnel

## 🔑 Étape 1 : Obtenir une clé API OpenAI

1. Allez sur [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Connectez-vous ou créez un compte
3. Cliquez sur "Create new secret key"
4. Copiez la clé API (elle ne sera affichée qu'une seule fois !)

## ⚙️ Étape 2 : Configurer la clé API

Ajoutez votre clé API dans le fichier `.env` à la racine du dossier `backend` :

```env
OPENAI_API_KEY=sk-votre-clé-api-ici
MONGODB_URI=mongodb://localhost:27017/reversee
JWT_SECRET=votre-secret-jwt
```

## 🛠️ Étape 3 : Configurer le modèle OpenAI

Exécutez le script de configuration :

```bash
cd backend
node scripts/setup-openai-model.js
```

Ce script va :
- ✅ Vérifier que votre clé API est configurée
- ✅ Créer ou mettre à jour le modèle OpenAI par défaut
- ✅ Configurer GPT-4 Turbo comme modèle principal
- ✅ Désactiver les autres modèles

## ✅ Vérification

Après avoir exécuté le script, vous devriez voir :

```
✅ Connected to MongoDB
✅ Modèle OpenAI créé et défini comme modèle par défaut

📋 Configuration du modèle:
   Nom: OpenAI GPT-4 Turbo
   Provider: openai
   Model ID: gpt-4-turbo-preview
   Temperature: 0.7
   Max Tokens: 1000
   Actif: true
   Par défaut: true

✅ Configuration OpenAI terminée avec succès!
💡 Toutes les réponses de l'Assistant IA utiliseront maintenant ChatGPT.
```

## 🎯 Modèles OpenAI disponibles

Vous pouvez utiliser différents modèles OpenAI :

- `gpt-4-turbo-preview` (recommandé) - Le plus puissant
- `gpt-4` - Version stable de GPT-4
- `gpt-3.5-turbo` - Plus rapide et moins cher

Pour changer de modèle, modifiez le `modelId` dans le script `setup-openai-model.js` ou via l'API admin.

## 🔧 Configuration avancée

### Changer les paramètres du modèle

Vous pouvez modifier les paramètres dans le script ou via l'API :

```javascript
config: {
  temperature: 0.7,        // Créativité (0-2)
  maxTokens: 1000,          // Longueur max de la réponse
  topP: 1.0,               // Diversité
  frequencyPenalty: 0,      // Pénalité de répétition
  presencePenalty: 0        // Pénalité de présence
}
```

### Via l'API Admin

```http
PUT /api/ai/models/:id
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "config": {
    "temperature": 0.8,
    "maxTokens": 1500
  }
}
```

## 🐛 Dépannage

### Erreur : "OPENAI_API_KEY n'est pas configurée"

**Solution :** Vérifiez que vous avez ajouté `OPENAI_API_KEY` dans votre fichier `.env` et redémarrez le serveur.

### Erreur : "Clé API OpenAI invalide ou expirée"

**Solution :** 
1. Vérifiez que votre clé API est correcte
2. Vérifiez que vous avez des crédits sur votre compte OpenAI
3. Générez une nouvelle clé API si nécessaire

### Erreur : "Modèle OpenAI non trouvé"

**Solution :** Vérifiez que le `modelId` est correct. Les modèles disponibles sont :
- `gpt-4-turbo-preview`
- `gpt-4`
- `gpt-3.5-turbo`

### Les réponses ne sont pas générées

**Vérifications :**
1. Le serveur backend est-il démarré ?
2. MongoDB est-il connecté ?
3. Le modèle OpenAI est-il actif et défini comme défaut ?
4. Avez-vous des crédits OpenAI disponibles ?

## 📊 Coûts OpenAI

Les appels à l'API OpenAI sont facturés selon l'utilisation :
- GPT-4 Turbo : ~$0.01-0.03 par 1000 tokens
- GPT-3.5 Turbo : ~$0.001-0.002 par 1000 tokens

Consultez [https://openai.com/pricing](https://openai.com/pricing) pour les tarifs à jour.

## 🎉 C'est prêt !

Une fois configuré, toutes les réponses de l'Assistant IA utiliseront ChatGPT. Les réponses seront :
- ✅ Personnalisées selon les données de l'utilisateur
- ✅ Contextuelles et intelligentes
- ✅ En français
- ✅ Basées sur les habitudes réelles de l'utilisateur

Plus de réponses génériques ! 🚀

