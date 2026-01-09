# 🤖 Configuration d'un Modèle ML Local pour le Chatbot

Ce guide vous explique comment configurer un modèle Machine Learning local pour votre chatbot, utilisant **Ollama** (gratuit et sans quota).

## 📋 Avantages d'un Modèle ML Local

- ✅ **Gratuit** - Pas de coûts d'API
- ✅ **Sans quota** - Utilisation illimitée
- ✅ **Données locales** - Vos conversations restent sur votre machine
- ✅ **Rapide** - Pas de latence réseau
- ✅ **Personnalisable** - Vous pouvez entraîner votre propre modèle

## 🚀 Installation d'Ollama

### Windows

1. Téléchargez Ollama depuis https://ollama.ai/download
2. Installez l'application
3. Ollama démarrera automatiquement en arrière-plan

### macOS

```bash
brew install ollama
```

### Linux

```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

## 📥 Télécharger un Modèle

Une fois Ollama installé, téléchargez un modèle (recommandé: **llama3**):

```bash
ollama pull llama3
```

Autres modèles disponibles:
- `llama3` - Modèle généraliste, bon équilibre (recommandé)
- `llama3:8b` - Version plus légère
- `mistral` - Modèle rapide et efficace
- `codellama` - Spécialisé pour le code
- `phi` - Modèle très léger

## ⚙️ Configuration dans l'Application

### Étape 1: Vérifier qu'Ollama fonctionne

```bash
ollama list
```

Vous devriez voir la liste des modèles téléchargés.

### Étape 2: Configurer le modèle ML local

Exécutez le script de configuration:

```bash
cd backend
node scripts/setup-local-ml.js
```

Ce script va:
- ✅ Vérifier qu'Ollama est disponible
- ✅ Télécharger llama3 si nécessaire
- ✅ Créer/configurer le modèle dans la base de données
- ✅ Le définir comme modèle par défaut

### Étape 3: (Optionnel) Configurer l'endpoint personnalisé

Si Ollama tourne sur un autre port ou une autre machine, ajoutez dans `backend/.env`:

```env
LOCAL_AI_ENDPOINT=http://localhost:11434
```

## 🔄 Basculer entre OpenAI et Modèle Local

### Utiliser le Modèle Local (par défaut après setup)

Le modèle local sera automatiquement utilisé après avoir exécuté `setup-local-ml.js`.

### Revenir à OpenAI

```bash
cd backend
node scripts/setup-openai-model-gpt4o.js
```

## 🧪 Tester le Modèle Local

### Test manuel avec Ollama

```bash
ollama run llama3
```

Puis tapez un message pour tester.

### Test via l'application

1. Démarrez le backend
2. Ouvrez le chatbot dans l'interface
3. Envoyez un message
4. Vérifiez les logs du backend pour voir "🤖 Utilisation du modèle ML local"

## 📊 Comparaison des Modèles

| Modèle | Taille | Vitesse | Qualité | RAM Requise |
|--------|--------|---------|---------|-------------|
| llama3 | ~4.7GB | ⭐⭐⭐ | ⭐⭐⭐⭐ | 8GB+ |
| llama3:8b | ~4.7GB | ⭐⭐⭐⭐ | ⭐⭐⭐ | 8GB+ |
| mistral | ~4.1GB | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 8GB+ |
| phi | ~1.6GB | ⭐⭐⭐⭐⭐ | ⭐⭐ | 4GB+ |

## 🐛 Dépannage

### Erreur: "Modèle ML local non disponible"

**Solution:**
1. Vérifiez qu'Ollama est démarré:
   ```bash
   ollama list
   ```
2. Si Ollama n'est pas démarré, lancez-le manuellement
3. Vérifiez que le port 11434 est accessible

### Erreur: "Le modèle llama3 n'est pas installé"

**Solution:**
```bash
ollama pull llama3
```

### Le modèle est lent

**Solutions:**
1. Utilisez un modèle plus léger: `ollama pull mistral`
2. Mettez à jour le script pour utiliser mistral au lieu de llama3
3. Vérifiez que vous avez assez de RAM (8GB+ recommandé)

### Le modèle ne répond pas en français

Le modèle devrait répondre en français grâce au prompt système. Si ce n'est pas le cas:
1. Vérifiez les logs du backend
2. Le prompt système inclut "Répondez toujours en français"

## 🔧 Personnalisation

### Changer le modèle utilisé

Modifiez `backend/scripts/setup-local-ml.js` et changez:
```javascript
const modelName = 'mistral'; // Au lieu de 'llama3'
```

Puis réexécutez le script.

### Ajuster les paramètres

Dans `backend/services/localMLService.js`, vous pouvez modifier:
- `temperature`: Créativité (0.0-1.0)
- `top_p`: Diversité des réponses
- `maxTokens`: Longueur maximale des réponses

## 📚 Ressources

- [Documentation Ollama](https://github.com/ollama/ollama)
- [Liste des modèles disponibles](https://ollama.ai/library)
- [Guide de fine-tuning](https://github.com/ollama/ollama/blob/main/docs/finetuning.md)

## 💡 Astuces

1. **Premier démarrage**: Le premier appel peut être lent (chargement du modèle en mémoire)
2. **Performance**: Gardez Ollama ouvert pour des réponses plus rapides
3. **Multi-modèles**: Vous pouvez avoir plusieurs modèles installés et basculer entre eux
4. **GPU**: Si vous avez une carte graphique NVIDIA, Ollama l'utilisera automatiquement pour accélérer les réponses

## ✅ Checklist de Configuration

- [ ] Ollama installé et démarré
- [ ] Modèle téléchargé (`ollama pull llama3`)
- [ ] Script `setup-local-ml.js` exécuté avec succès
- [ ] Backend redémarré
- [ ] Chatbot testé et fonctionnel

---

**Note**: Le modèle ML local est une excellente alternative à OpenAI, surtout si vous avez des problèmes de quota ou souhaitez garder vos données locales.

