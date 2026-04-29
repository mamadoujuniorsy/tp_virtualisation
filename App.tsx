import React, { useState, useEffect, useCallback } from 'react';
import { loadModel, detectObjects } from './services/detectionService';
import { analyzeImageLocal, loadCaptioningModel } from './services/geminiService';
import { DetectedObject, AnalysisState, ViewMode } from './types';
import { CanvasOverlay } from './components/CanvasOverlay';
import { AnalysisPanel } from './components/AnalysisPanel';
import { ImageUploader } from './components/ImageUploader';
import { HistoryView } from './components/HistoryView';
import { Loader } from './components/Loader';
import { WebcamView } from './components/WebcamView';
import { ScanEye, ChevronLeft, History, Cpu } from 'lucide-react';

export default function App() {
  const [modelReady, setModelReady] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.UPLOAD);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<DetectedObject[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  
  // Analysis State
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    loading: false,
    result: null,
    error: null
  });

  // Initialize Models
  useEffect(() => {
    const init = async () => {
      try {
        await loadModel(); 
        // Pré-chauffage du modèle de captioning
        loadCaptioningModel((p) => console.log(`Chargement IA: ${Math.round(p)}%`));
        setModelReady(true);
      } catch (err) {
        console.error("Failed to load model", err);
      }
    };
    init();
  }, []);

  const saveToHistory = async (preds: DetectedObject[], analysisText?: string) => {
    try {
      const uniqueObjects = Array.from(new Set(preds.map(p => p.class))).join(', ');
      
      await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objects_found: uniqueObjects,
          analysis_summary: analysisText || 'Analyse locale en attente...'
        })
      });
    } catch (e) {
      console.warn("API sauvegarde indisponible", e);
    }
  };

  const handleImageSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImageSrc(e.target.result as string);
        setViewMode(ViewMode.ANALYSIS);
        setPredictions([]);
        setAnalysisState({ loading: false, result: null, error: null });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleWebcamCapture = (capturedImageSrc: string) => {
    setImageSrc(capturedImageSrc);
    setViewMode(ViewMode.ANALYSIS);
    setPredictions([]); // Seront re-détectées par handleImageLoaded
    setAnalysisState({ loading: false, result: null, error: null });
  };

  const handleImageLoaded = useCallback(async (img: HTMLImageElement) => {
    if (!modelReady) return;
    
    setIsDetecting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      const results = await detectObjects(img);
      setPredictions(results);
      saveToHistory(results);
    } catch (error) {
      console.error("Detection error:", error);
    } finally {
      setIsDetecting(false);
    }
  }, [modelReady]);

  const handleRequestAnalysis = async () => {
    if (!imageSrc) return;
    
    setAnalysisState({ loading: true, result: null, error: null });
    try {
      const result = await analyzeImageLocal(imageSrc);
      setAnalysisState({ loading: false, result, error: null });
      saveToHistory(predictions, result);
    } catch (err) {
      setAnalysisState({ 
        loading: false, 
        result: null, 
        error: "Erreur lors de l'exécution du modèle local." 
      });
    }
  };

  const handleReset = () => {
    setViewMode(ViewMode.UPLOAD);
    setImageSrc(null);
    setPredictions([]);
    setAnalysisState({ loading: false, result: null, error: null });
  };

  // --- Render ---

  if (!modelReady) {
    return (
      <div className="h-screen w-screen bg-white flex flex-col items-center justify-center">
        <Loader text="Initialisation des réseaux de neurones..." />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-slate-50 text-slate-900 flex flex-col overflow-hidden font-sans">
      
      {/* Navigation Bar */}
      <nav className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-50 sticky top-0">
        <div 
          className="flex items-center gap-3 cursor-pointer" 
          onClick={handleReset}
        >
          <div className="bg-indigo-600 p-2 rounded-lg shadow-md shadow-indigo-200">
            <ScanEye className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800">DIC2<span className="text-indigo-600">IABD</span></span>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-100">
             <Cpu className="w-3 h-3" />
             IA Locale Active
           </div>

           {viewMode === ViewMode.ANALYSIS && (
             <button 
                onClick={handleReset}
                className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors bg-slate-100 hover:bg-indigo-50 px-3 py-1.5 rounded-full"
             >
               <ChevronLeft className="w-4 h-4" />
               Nouvelle Image
             </button>
           )}

           <button 
             onClick={() => setViewMode(ViewMode.HISTORY)}
             className={`flex items-center gap-2 text-sm font-medium transition-colors px-3 py-1.5 rounded-full ${viewMode === ViewMode.HISTORY ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-100'}`}
           >
             <History className="w-4 h-4" />
             Historique
           </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden relative">
        
        {viewMode === ViewMode.HISTORY ? (
          <div className="w-full h-full animate-in fade-in duration-300">
            <HistoryView />
          </div>
        ) : viewMode === ViewMode.WEBCAM ? (
          <WebcamView 
            onCapture={handleWebcamCapture} 
            onClose={() => setViewMode(ViewMode.UPLOAD)} 
          />
        ) : viewMode === ViewMode.UPLOAD ? (
          <div className="w-full h-full animate-in fade-in zoom-in duration-300">
            <ImageUploader 
              onImageSelect={handleImageSelect} 
              onWebcamClick={() => setViewMode(ViewMode.WEBCAM)}
            />
          </div>
        ) : (
          <div className="flex w-full h-full animate-in fade-in duration-300">
            {/* Left: Canvas / Image Area */}
            <div className="flex-1 relative bg-slate-100 overflow-hidden flex flex-col">
              <CanvasOverlay 
                imageSrc={imageSrc} 
                predictions={predictions} 
                onImageLoaded={handleImageLoaded}
              />
            </div>

            {/* Right: Analysis Panel */}
            <div className="w-96 shrink-0 h-full border-l border-slate-200 z-20 shadow-xl">
              <AnalysisPanel 
                predictions={predictions}
                analysisState={analysisState}
                onRequestAnalysis={handleRequestAnalysis}
                onReset={handleReset}
                isModelReady={modelReady}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}