# DIC2IABD - Analyse d'Images Open Source

Une application web moderne et élégante qui utilise des modèles d'IA **open-source** directement dans le navigateur.

## ✨ Fonctionnalités Premium

1.  **Détection d'objets Temps Réel** : Utilise TensorFlow.js (COCO-SSD).
2.  **Description de Scène (Captioning)** : Utilise **Transformers.js** avec le modèle `vit-gpt2-image-captioning` de Hugging Face.
3.  **Privacy First** : Aucune image n'est envoyée à une API externe (Google/OpenAI). Tout tourne en local.
4.  **Historique** : Sauvegarde MySQL persistante.

## 🚀 Déploiement

Aucune clé API n'est requise.

```

Ouvrez **http://IP:PORT.

### Note sur le premier lancement
Lors de la première analyse, le navigateur téléchargera automatiquement le modèle `vit-gpt2` (environ 100 Mo). Cela peut prendre quelques secondes selon votre connexion, mais les analyses suivantes seront instantanées.

## 🛠 Stack Technique
- **Frontend** : React, Vite, TailwindCSS
- **IA** : @tensorflow/tfjs, @xenova/transformers (ONNX Runtime Web)
- **Backend** : Node.js (Express)
- **Database** : MySQL
