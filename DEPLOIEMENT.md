# Guide de Déploiement Docker - DIC2IABD

## 📋 Prérequis
- Docker installé
- Docker Compose installé
- Accès au serveur (89.167.43.95)

## 🚀 Instructions de Déploiement

### 1. Connexion au serveur
```bash
ssh m2soir@89.167.43.95
# Mot de passe : m2soir2026
```

### 2. Créer votre compte utilisateur (OBLIGATOIRE)
```bash
# Remplacer "votrenomcomplet" par votre nom
sudo useradd -m -s /bin/bash votrenomcomplet
sudo usermod -aG docker votrenomcomplet
sudo passwd votrenomcomplet
newgrp docker
```

### 3. Télécharger et extraire le code source
```bash
# Télécharger le code source
wget https://mandicouba.net/ctp/ctp-m2soir.zip

# Extraire l'archive
unzip ctp-m2soir.zip

# Accéder au dossier
cd ctp-m2soir
```

### 4. Vérifier les fichiers Docker
Assurez-vous que les fichiers suivants sont présents :
- `Dockerfile`
- `docker-compose.yml`
- `.dockerignore`

### 5. Lancer l'application avec Docker Compose
```bash
# Construire et démarrer les conteneurs
docker-compose up -d --build
```

### 6. Vérifier le déploiement
```bash
# Vérifier que les conteneurs sont en cours d'exécution
docker-compose ps

# Voir les logs de l'application
docker-compose logs -f app

# Voir les logs de la base de données
docker-compose logs -f db
```

### 7. Accéder à l'application
Ouvrez votre navigateur et accédez à :
```
http://89.167.43.95:3000
```

## 🛠 Commandes Utiles

### Arrêter l'application
```bash
docker-compose down
```

### Arrêter et supprimer les volumes (données)
```bash
docker-compose down -v
```

### Redémarrer l'application
```bash
docker-compose restart
```

### Voir les logs en temps réel
```bash
docker-compose logs -f
```

### Reconstruire les images
```bash
docker-compose up -d --build --force-recreate
```

## 📦 Architecture du Déploiement

### Conteneurs
1. **dic2iabd_app** : Application (Frontend React + Backend Node.js)
   - Port : 3000
   - Build depuis le Dockerfile local

2. **dic2iabd_mysql** : Base de données MySQL 8.0
   - Port : 3306
   - Volume persistant : `mysql_data`
   - Script d'initialisation : `db/init.sql`

### Réseau
- Réseau bridge : `dic2iabd_network`
- Communication interne entre conteneurs

### Volumes
- `mysql_data` : Persistance des données MySQL

## 🔧 Configuration

### Variables d'environnement
Les variables suivantes sont configurées dans `docker-compose.yml` :

**Application :**
- `PORT=3000`
- `DB_HOST=db`
- `DB_USER=root`
- `DB_PASSWORD=rootpassword`
- `DB_NAME=dic2iabd_db`

**Base de données :**
- `MYSQL_ROOT_PASSWORD=rootpassword`
- `MYSQL_DATABASE=dic2iabd_db`

## ✅ Vérification du Fonctionnement

1. **Vérifier la connexion à la base de données**
```bash
docker-compose exec db mysql -u root -prootpassword -e "SHOW DATABASES;"
```

2. **Vérifier la table detections**
```bash
docker-compose exec db mysql -u root -prootpassword dic2iabd_db -e "SHOW TABLES;"
```

3. **Tester l'API**
```bash
curl http://localhost:3000/api/history
```

## 🐛 Dépannage

### Les conteneurs ne démarrent pas
```bash
# Voir les logs détaillés
docker-compose logs

# Vérifier l'état des conteneurs
docker-compose ps
```

### Problème de connexion à la base de données
```bash
# Vérifier que MySQL est prêt
docker-compose exec db mysqladmin ping -h localhost -u root -prootpassword
```

### Reconstruire complètement
```bash
docker-compose down -v
docker-compose up -d --build --force-recreate
```

## 📝 Livrable

### À fournir dans le Google Sheet
1. **URL de déploiement** : `http://89.167.43.95:3000`

### À fournir dans Google Drive
Créer un dossier contenant :
1. `Dockerfile`
2. `docker-compose.yml`
3. Ce fichier `DEPLOIEMENT.md` (optionnel)

**Partager avec** : fall.babacar@esp.sn

## 🎯 Points Clés du Déploiement

✅ **Reproductibilité** : Une seule commande lance tout (`docker-compose up -d`)
✅ **Isolation** : Services séparés en conteneurs distincts
✅ **Persistance** : Données MySQL conservées dans un volume
✅ **Communication** : Réseau Docker bridge pour la communication inter-conteneurs
✅ **Healthcheck** : Vérification automatique de la santé de MySQL
✅ **Dépendances** : L'app attend que MySQL soit prêt avant de démarrer

---

**Auteur** : [Votre Nom]
**Date** : Avril 2026
**Contexte** : TP Infrastructure de Virtualisation - Master 2 SOIR GLSI/SRT
