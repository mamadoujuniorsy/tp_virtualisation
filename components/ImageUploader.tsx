import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, Camera } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  onWebcamClick: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, onWebcamClick }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
       validateAndProcess(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcess(e.target.files[0]);
    }
  };

  const validateAndProcess = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert("Veuillez télécharger un fichier image valide.");
      return;
    }
    onImageSelect(file);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full max-w-4xl mx-auto px-6 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-8">
        
        {/* Upload Box */}
        <div 
          className={`
            relative group aspect-square md:aspect-[4/3] rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer
            flex flex-col items-center justify-center gap-4 bg-white shadow-xl shadow-slate-200/50
            ${isDragging 
              ? 'border-indigo-500 bg-indigo-50 scale-[1.02]' 
              : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
            }
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="p-5 bg-indigo-50 rounded-full shadow-sm ring-1 ring-indigo-100 group-hover:scale-110 transition-transform duration-300">
            <Upload className="w-8 h-8 text-indigo-600" />
          </div>
          
          <div className="text-center space-y-2 relative z-10 px-4">
            <h3 className="text-xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
              Importer une image
            </h3>
            <p className="text-slate-500 text-sm">
              Glissez-déposez ou cliquez
            </p>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleChange}
          />
        </div>

        {/* Webcam Box */}
        <div 
          className="
            relative group aspect-square md:aspect-[4/3] rounded-3xl border-2 border-slate-200 bg-white transition-all duration-300 cursor-pointer
            flex flex-col items-center justify-center gap-4 shadow-xl shadow-slate-200/50 hover:border-indigo-300 hover:bg-slate-50
          "
          onClick={onWebcamClick}
        >
          <div className="p-5 bg-pink-50 rounded-full shadow-sm ring-1 ring-pink-100 group-hover:scale-110 transition-transform duration-300">
            <Camera className="w-8 h-8 text-pink-600" />
          </div>
          
          <div className="text-center space-y-2 relative z-10 px-4">
            <h3 className="text-xl font-bold text-slate-800 group-hover:text-pink-600 transition-colors">
              Utiliser la Caméra
            </h3>
            <p className="text-slate-500 text-sm">
              Détection en temps réel
            </p>
          </div>
        </div>

      </div>
      
      <div className="mt-4 text-center max-w-lg">
        <h2 className="text-2xl font-bold text-slate-800 mb-3">
          IA Open Source & <span className="text-indigo-600">Temps Réel</span>
        </h2>
        <p className="text-slate-600 text-sm leading-relaxed">
          Analysez vos photos ou utilisez votre webcam pour une détection d'objets instantanée propulsée par TensorFlow.js.
        </p>
      </div>
    </div>
  );
};