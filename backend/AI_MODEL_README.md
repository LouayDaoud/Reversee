# 🤖 Système de Modèle IA - Documentation

Ce document explique comment utiliser le nouveau système de modèles IA dans l'application Reversee.

## 📋 Vue d'ensemble

Le système de modèles IA permet de :
- Gérer plusieurs modèles IA (OpenAI, Anthropic, modèles locaux, etc.)
- Basculer entre différents modèles facilement
- Configurer des prompts système personnalisés
- Suivre l'utilisation des modèles
- Tester les modèles avant de les activer

## 🚀 Installation et Configuration

### 1. Initialiser le modèle par défaut

Lancez le script d'initialisation pour créer un modèle IA par défaut :

```bash
cd backend
node scripts/init-ai-model.js
```

### 2. Configuration des variables d'environnement

Ajoutez les clés API dans votre fichier `.env` :

```env
# OpenAI (optionnel)
OPENAI_API_KEY=votre_clé_openai

# Anthropic Claude (optionnel)
ANTHROPIC_API_KEY=votre_clé_anthropic

# Modèle local (optionnel, ex: Ollama)
LOCAL_AI_ENDPOINT=http://localhost:11434
```

## 📡 API Endpoints

### Pour les utilisateurs authentifiés

#### Générer une réponse IA
```http
POST /api/ai/generate
Authorization: Bearer {token}
Content-Type: application/json

{
  "message": "Comment améliorer mon sommeil ?",
  "conversationId": "optional_conversation_id",
  "context": {}
}
```

#### Obtenir le modèle IA actif
```http
GET /api/ai/model/active
Authorization: Bearer {token}
```

### Pour les administrateurs

#### Lister tous les modèles
```http
GET /api/ai/models
Authorization: Bearer {admin_token}
```

#### Créer un nouveau modèle
```http
POST /api/ai/models
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "GPT-4 Turbo",
  "provider": "openai",
  "modelId": "gpt-4-turbo-preview",
  "description": "Modèle GPT-4 Turbo pour des réponses avancées",
  "config": {
    "temperature": 0.7,
    "maxTokens": 1000,
    "topP": 1.0
  },
  "systemPrompt": "Vous êtes un coach spécialisé...",
  "isDefault": true
}
```

#### Mettre à jour un modèle
```http
PUT /api/ai/models/:id
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "isActive": true,
  "isDefault": true
}
```

#### Tester un modèle
```http
POST /api/ai/models/:id/test
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "message": "Test message"
}
```

#### Supprimer un modèle
```http
DELETE /api/ai/models/:id
Authorization: Bearer {admin_token}
```

## 🔧 Providers supportés

### 1. OpenAI
```json
{
  "provider": "openai",
  "modelId": "gpt-3.5-turbo",
  "requiresApiKey": true
}
```

Modèles disponibles :
- `gpt-3.5-turbo`
- `gpt-4`
- `gpt-4-turbo-preview`

### 2. Anthropic (Claude)
```json
{
  "provider": "anthropic",
  "modelId": "claude-3-opus-20240229",
  "requiresApiKey": true
}
```

Modèles disponibles :
- `claude-3-opus-20240229`
- `claude-3-sonnet-20240229`
- `claude-3-haiku-20240307`

### 3. Modèle Local (Ollama, LM Studio, etc.)
```json
{
  "provider": "local",
  "modelId": "llama2",
  "apiEndpoint": "http://localhost:11434"
}
```

### 4. API Personnalisée
```json
{
  "provider": "custom",
  "modelId": "custom-model",
  "apiEndpoint": "https://votre-api.com/chat"
}
```

## 💡 Exemples d'utilisation

### Exemple 1 : Utiliser OpenAI GPT-4

```javascript
// Via l'API admin
const response = await fetch('/api/ai/models', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'GPT-4',
    provider: 'openai',
    modelId: 'gpt-4',
    description: 'Modèle GPT-4 pour des réponses avancées',
    config: {
      temperature: 0.7,
      maxTokens: 1000
    },
    isDefault: true
  })
});
```

### Exemple 2 : Générer une réponse dans le chat

```javascript
// Dans le frontend
const response = await axios.post('/api/ai/generate', {
  message: 'Comment améliorer mes habitudes de sommeil ?',
  conversationId: conversationId
}, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

console.log(response.data.data.response);
```

### Exemple 3 : Utiliser avec une conversation existante

```javascript
// Générer une réponse IA pour une conversation
const response = await axios.post(
  `/api/chat/${conversationId}/ai-response`,
  {
    message: 'Quels sont mes points à améliorer ?'
  },
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);
```

## 🎯 Intégration avec le Chat

Le système IA est automatiquement intégré avec le système de chat. Quand un utilisateur envoie un message dans le chat, vous pouvez :

1. **Utiliser l'endpoint de chat avec IA** :
   ```http
   POST /api/chat/:conversationId/ai-response
   ```

2. **Ou utiliser l'endpoint IA directement** :
   ```http
   POST /api/ai/generate
   ```

## 🔒 Sécurité

- Les clés API ne sont jamais stockées dans la base de données
- Les clés API doivent être configurées dans les variables d'environnement
- Seuls les administrateurs peuvent gérer les modèles IA
- Les utilisateurs peuvent uniquement utiliser les modèles actifs

## 📊 Statistiques

Chaque modèle suit :
- `usageCount` : Nombre de fois utilisé
- `lastUsed` : Dernière utilisation

## 🐛 Dépannage

### Le modèle ne répond pas
1. Vérifiez que le modèle est actif (`isActive: true`)
2. Vérifiez que les clés API sont correctement configurées
3. Vérifiez les logs du serveur pour les erreurs

### Erreur "API key not configured"
Ajoutez la clé API dans votre fichier `.env` :
```env
OPENAI_API_KEY=votre_clé
# ou
ANTHROPIC_API_KEY=votre_clé
```

### Le modèle par défaut n'existe pas
Lancez le script d'initialisation :
```bash
node scripts/init-ai-model.js
```

## 📝 Notes

- Le système utilise un fallback automatique vers des réponses basées sur des règles si l'API IA échoue
- Le contexte utilisateur (habitudes, statistiques) est automatiquement enrichi
- Les conversations sont sauvegardées dans la base de données

