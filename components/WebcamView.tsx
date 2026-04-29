import React, { useRef, useEffect, useState } from 'react';
import { Camera, X, Aperture } from 'lucide-react';
import { detectObjects } from '../services/detectionService';
import { DetectedObject } from '../types';

interface WebcamViewProps {
  onCapture: (imageSrc: string) => void;
  onClose: () => void;
}

export const WebcamView: React.FC<WebcamViewProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestRef = useRef<number>(0);

  // Démarrer la webcam
  useEffect(() => {
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            setIsStreaming(true);
            videoRef.current?.play();
          };
        }
      } catch (err) {
        console.error("Erreur webcam:", err);
        setError("Impossible d'accéder à la caméra. Vérifiez les permissions.");
      }
    };

    startWebcam();

    return () => {
      // Nettoyage : arrêter le stream
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  // Boucle de détection temps réel
  useEffect(() => {
    if (!isStreaming) return;

    const detectFrame = async () => {
      if (videoRef.current && canvasRef.current && videoRef.current.readyState === 4) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Ajuster la taille du canvas à la vidéo
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        if (ctx) {
          // Détection
          const predictions = await detectObjects(video);

          // Nettoyer le canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Dessiner les boîtes
          predictions.forEach(prediction => {
            const [x, y, width, height] = prediction.bbox;
            
            // Style
            ctx.strokeStyle = '#4f46e5'; // Indigo
            ctx.lineWidth = 4;
            ctx.strokeRect(x, y, width, height);

            // Label fond
            ctx.fillStyle = '#4f46e5';
            ctx.font = '18px Inter';
            const text = `${prediction.class} ${Math.round(prediction.score * 100)}%`;
            const textWidth = ctx.measureText(text).width;
            ctx.fillRect(x, y > 24 ? y - 24 : 0, textWidth + 10, 24);

            // Label texte
            ctx.fillStyle = '#ffffff';
            ctx.fillText(text, x + 5, y > 24 ? y - 6 : 18);
          });
        }
      }
      requestRef.current = requestAnimationFrame(detectFrame);
    };

    detectFrame();
  }, [isStreaming]);

  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const imageSrc = canvas.toDataURL('image/jpeg');
        onCapture(imageSrc);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
      {error ? (
        <div className="text-white text-center p-6 bg-red-500/20 rounded-xl border border-red-500">
          <p>{error}</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-white text-black rounded-lg">Fermer</button>
        </div>
      ) : (
        <>
          <div className="relative w-full h-full max-w-5xl max-h-[90vh] flex items-center justify-center bg-black overflow-hidden rounded-2xl shadow-2xl">
            {/* Vidéo et Canvas superposés */}
            <video 
              ref={videoRef} 
              className="absolute w-full h-full object-contain" 
              playsInline 
              muted 
            />
            <canvas 
              ref={canvasRef} 
              className="absolute w-full h-full object-contain pointer-events-none" 
            />
            
            {!isStreaming && <div className="text-white animate-pulse">Démarrage de la caméra...</div>}
            
            {/* Overlay UI */}
            <div className="absolute top-4 right-4 z-10">
              <button onClick={onClose} className="p-2 bg-black/50 text-white rounded-full hover:bg-white/20 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="absolute top-4 left-4 bg-black/60 px-3 py-1 rounded-full text-green-400 text-xs font-mono flex items-center gap-2 border border-white/10">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              LIVE DETECTION
            </div>
          </div>

          {/* Controls */}
          <div className="absolute bottom-8 flex items-center justify-center w-full gap-8">
             <button 
               onClick={handleCapture}
               className="w-20 h-20 rounded-full border-4 border-white bg-transparent flex items-center justify-center hover:bg-white/20 transition-all active:scale-95 group"
             >
               <div className="w-16 h-16 rounded-full bg-white group-hover:bg-indigo-500 transition-colors" />
             </button>
          </div>
        </>
      )}
    </div>
  );
};