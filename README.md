# Server AU - API de validation BCInet

API Node.js pour valider les identifiants BCInet en utilisant Puppeteer pour l'automatisation web.

## 🚀 Déploiement avec Coolify sur Ubuntu

### Prérequis
- Ubuntu 20.04+ 
- Coolify installé et configuré
- Docker et Docker Compose

### Configuration Coolify

1. **Créer un nouveau projet dans Coolify**
   - Type: Docker Compose
   - Repository: Votre dépôt Git contenant ce code

2. **Variables d'environnement à configurer dans Coolify:**
   ```
   NODE_ENV=production
   PORT=3000
   PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
   ```

3. **Configuration du port**
   - Coolify détectera automatiquement le port 3000 exposé
   - L'application s'adaptera au port fourni par Coolify via `process.env.PORT`

### Structure des fichiers de déploiement

- `Dockerfile` - Configuration Docker optimisée pour Ubuntu avec Chrome
- `docker-compose.yml` - Configuration pour le déploiement
- `.dockerignore` - Exclusions pour l'image Docker
- `package.json` - Scripts de démarrage mis à jour

### Endpoints disponibles

- `POST /api/validate-login` - Valider des identifiants BCInet
- `GET /api/health` - Vérifier l'état de l'API

### Test de l'API

```bash
# Test de santé
curl http://your-domain.com/api/health

# Test de validation (remplacez par vos identifiants)
curl -X POST http://your-domain.com/api/validate-login \
  -H "Content-Type: application/json" \
  -d '{"username":"votre_username","password":"votre_password"}'
```

### Développement local

```bash
# Installation des dépendances
npm install

# Démarrage en mode développement
npm run dev

# Avec Docker
docker-compose up --build
```

### Notes importantes pour la production

1. **Sécurité Puppeteer**: L'application utilise Chrome en mode headless avec des arguments de sécurité appropriés
2. **Ressources**: Puppeteer peut consommer beaucoup de mémoire, assurez-vous d'avoir au moins 1GB de RAM disponible
3. **Monitoring**: Utilisez l'endpoint `/api/health` pour le monitoring de l'application
4. **Logs**: Les logs sont disponibles via `docker logs` ou dans l'interface Coolify

### Dépannage

**Erreur Chrome/Puppeteer:**
- Vérifiez que Chrome est installé dans le conteneur
- Vérifiez les permissions utilisateur (pptruser)

**Erreur de port:**
- Coolify gère automatiquement le mapping des ports
- L'application utilise `process.env.PORT` fourni par Coolify

**Problèmes de mémoire:**
- Augmentez les limites mémoire dans Coolify
- Surveillez l'utilisation via les métriques Coolify
