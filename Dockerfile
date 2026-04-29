# Utiliser l'image officielle Node.js 18
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier tout le code source
COPY . .

# Construire le frontend avec Vite
RUN npm run build

# Exposer le port de l'application
EXPOSE 3000

# Variables d'environnement par défaut
ENV PORT=3000
ENV DB_HOST=db
ENV DB_USER=root
ENV DB_PASSWORD=rootpassword
ENV DB_NAME=dic2iabd_db

# Démarrer le serveur Node.js
CMD ["node", "server.js"]
