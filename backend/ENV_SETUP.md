# 🔧 Configuration des variables d'environnement

## 📝 Créer le fichier .env

1. **Copiez le fichier exemple :**
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Ouvrez le fichier `.env` et remplissez les valeurs :**

## ✅ Variables obligatoires

### 1. OPENAI_API_KEY (REQUIS)
Votre clé API OpenAI pour utiliser ChatGPT.

**Comment l'obtenir :**
1. Allez sur [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Connectez-vous ou créez un compte
3. Cliquez sur "Create new secret key"
4. Copiez la clé (elle commence par `sk-`)
5. Collez-la dans `.env` :
   ```
   OPENAI_API_KEY=sk-votre-clé-ici
   ```

### 2. MONGODB_URI
L'URI de connexion à votre base de données MongoDB.

**Par défaut (MongoDB local) :**
```
MONGODB_URI=mongodb://localhost:27017/reversee
```

**Pour MongoDB Atlas (cloud) :**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/reversee
```

### 3. JWT_SECRET
Secret pour signer les tokens JWT d'authentification.

**Générer un secret sécurisé :**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copiez le résultat dans `.env` :
```
JWT_SECRET=votre-secret-genere-ici
```

### 4. PORT
Port sur lequel le serveur backend écoute.

**Par défaut :**
```
PORT=5000
```

## 🔐 Variables optionnelles

### ADMIN_EMAILS
Emails autorisés à devenir administrateurs (séparés par des virgules).

**Exemple :**
```
ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

## 📋 Exemple de fichier .env complet

```env
# Clé API OpenAI (REQUIS)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# MongoDB
MONGODB_URI=mongodb://localhost:27017/reversee

# JWT Secret
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6

# Port
PORT=5000

# Admins (optionnel)
ADMIN_EMAILS=admin@example.com
```

## ⚠️ Important

1. **Ne commitez JAMAIS le fichier `.env` dans Git**
   - Il est déjà dans `.gitignore`
   - Il contient des informations sensibles

2. **Gardez vos clés API secrètes**
   - Ne partagez jamais votre clé OpenAI
   - Si vous l'exposez, régénérez-la immédiatement

3. **Après avoir créé le `.env` :**
   ```bash
   # Configurez OpenAI
   node scripts/setup-openai-model.js
   
   # Démarrez le serveur
   npm run dev
   ```

## 🐛 Problèmes courants

### "OPENAI_API_KEY n'est pas configurée"
- Vérifiez que le fichier `.env` existe dans le dossier `backend`
- Vérifiez que la variable est bien nommée `OPENAI_API_KEY`
- Redémarrez le serveur après avoir modifié `.env`

### "MongoDB connection error"
- Vérifiez que MongoDB est démarré
- Vérifiez que `MONGODB_URI` est correct
- Pour MongoDB local : `mongodb://localhost:27017/reversee`

### "JWT_SECRET is not secure"
- Utilisez un secret d'au moins 32 caractères
- Générez-le avec la commande fournie ci-dessus



