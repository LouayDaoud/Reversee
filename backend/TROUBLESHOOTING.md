# 🔧 Guide de dépannage - Configuration OpenAI

## ❌ Erreurs courantes et solutions

### Erreur : "Erreur lors de la génération du message d'accueil. Vérifiez que OpenAI est correctement configuré."

**Causes possibles :**
1. La clé API OpenAI n'est pas dans le fichier `.env`
2. La clé API est vide ou incorrecte
3. Le script `setup-openai-model.js` n'a pas été exécuté
4. Le serveur backend n'a pas été redémarré après l'ajout de la clé

**Solutions :**

#### Étape 1 : Vérifier le fichier .env

Ouvrez `backend/.env` et vérifiez que vous avez :
```env
OPENAI_API_KEY=sk-votre-vraie-clé-ici
```

⚠️ **Important :** 
- La clé doit commencer par `sk-`
- Ne mettez pas d'espaces autour du `=`
- Ne mettez pas de guillemets autour de la clé

#### Étape 2 : Tester la clé API

Exécutez le script de test :
```bash
cd backend
node scripts/test-openai.js
```

Ce script va :
- ✅ Vérifier que la clé est dans le .env
- ✅ Tester la connexion à OpenAI
- ✅ Vous dire exactement quel est le problème

#### Étape 3 : Configurer le modèle OpenAI

Si le test passe, configurez le modèle :
```bash
cd backend
node scripts/setup-openai-model.js
```

#### Étape 4 : Redémarrer le serveur

**IMPORTANT :** Après avoir modifié le `.env`, vous DEVEZ redémarrer le serveur backend :

```bash
# Arrêtez le serveur (Ctrl+C)
# Puis redémarrez-le
npm run dev
```

### Erreur : "OPENAI_API_KEY n'est pas configurée"

**Solution :**
1. Vérifiez que le fichier `.env` existe dans le dossier `backend`
2. Vérifiez que la ligne `OPENAI_API_KEY=...` est présente
3. Redémarrez le serveur backend

### Erreur : "Clé API OpenAI invalide ou expirée"

**Solutions :**
1. Vérifiez votre clé sur https://platform.openai.com/api-keys
2. Générez une nouvelle clé si nécessaire
3. Vérifiez que vous avez des crédits sur votre compte OpenAI
4. Mettez à jour le `.env` et redémarrez le serveur

### Erreur : "Aucun modèle IA actif trouvé"

**Solution :**
Exécutez le script de configuration :
```bash
cd backend
node scripts/setup-openai-model.js
```

## ✅ Checklist de vérification

Avant de tester le chatbot, vérifiez :

- [ ] Le fichier `backend/.env` existe
- [ ] `OPENAI_API_KEY=sk-...` est dans le `.env` avec votre vraie clé
- [ ] Le script `test-openai.js` passe sans erreur
- [ ] Le script `setup-openai-model.js` a été exécuté avec succès
- [ ] Le serveur backend a été redémarré après l'ajout de la clé
- [ ] MongoDB est démarré et connecté
- [ ] Vous avez des crédits sur votre compte OpenAI

## 🧪 Test rapide

1. **Tester la clé API :**
   ```bash
   cd backend
   node scripts/test-openai.js
   ```

2. **Configurer le modèle :**
   ```bash
   node scripts/setup-openai-model.js
   ```

3. **Vérifier les logs du serveur :**
   Quand vous ouvrez le chatbot, vous devriez voir dans les logs :
   ```
   📤 Appel OpenAI avec le modèle gpt-4-turbo-preview
   ✅ Réponse OpenAI reçue
   ```

## 📞 Besoin d'aide ?

Si les erreurs persistent :
1. Vérifiez les logs du serveur backend dans la console
2. Vérifiez que votre clé API fonctionne sur https://platform.openai.com/playground
3. Vérifiez vos crédits OpenAI sur https://platform.openai.com/account/usage



