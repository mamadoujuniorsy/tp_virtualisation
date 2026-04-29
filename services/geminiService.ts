import { pipeline, env } from '@xenova/transformers';

// Configuration pour forcer l'exécution locale dans le navigateur
env.allowLocalModels = false;
env.useBrowserCache = true;

// Singleton pour ne charger le modèle qu'une seule fois
let captioner: any = null;

export const loadCaptioningModel = async (onProgress?: (progress: number) => void) => {
  if (captioner) return captioner;

  console.log("Chargement du modèle Xenova/vit-gpt2-image-captioning...");
  
  // Utilisation du modèle Vision Transformer + GPT2 optimisé pour le web
  captioner = await pipeline('image-to-text', 'Xenova/vit-gpt2-image-captioning', {
    progress_callback: (data: any) => {
      if (data.status === 'progress' && onProgress) {
        onProgress(data.progress);
      }
    }
  });

  return captioner;
};

export const analyzeImageLocal = async (
  imageSrc: string,
  onProgress?: (text: string) => void
): Promise<string> => {
  try {
    const model = await loadCaptioningModel();

    if (onProgress) onProgress("Génération de la description...");

    // Le modèle attend une URL ou des données brutes. 
    // Transformers.js gère le base64 ou les URL blob.
    const result = await model(imageSrc);

    // Résultat sous forme [{ generated_text: "a cat sitting on a couch" }]
    let text = result[0]?.generated_text || "Impossible de décrire l'image.";

    // Optionnel : Traduction simulée ou embellissement simple (le modèle est en anglais natif)
    // Pour un vrai système "Full Premium", on affiche le texte brut généré par le modèle.
    
    return `**Analyse IA (Modèle Local ViT-GPT2) :**\n\n"${text}"\n\n*Note : Ce modèle open-source tourne directement dans votre navigateur sans envoyer de données à un serveur externe.*`;

  } catch (error) {
    console.error("Local AI Error:", error);
    throw new Error("Erreur lors de l'exécution du modèle local.");
  }
};