import React from 'react';
import { DetectedObject, AnalysisState } from '../types';
import { Box, Sparkles, Tag, AlertCircle, RotateCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AnalysisPanelProps {
  predictions: DetectedObject[];
  analysisState: AnalysisState;
  onRequestAnalysis: () => void;
  onReset: () => void;
  isModelReady: boolean;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  predictions,
  analysisState,
  onRequestAnalysis,
  onReset,
  isModelReady
}) => {
  // Count object occurrences
  const counts = predictions.reduce((acc, curr) => {
    acc[curr.class] = (acc[curr.class] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="h-full flex flex-col bg-white border-l border-slate-200 shadow-xl z-20 overflow-hidden">
      
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Box className="w-5 h-5 text-indigo-600" />
            Résultats
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            {isModelReady ? "Modèle de détection actif" : "Démarrage du modèle..."}
          </p>
        </div>
        <button 
          onClick={onReset}
          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
          title="Nouvelle image"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Detected Objects List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Objets Détectés
          </h3>
          {predictions.length === 0 ? (
            <div className="text-slate-400 text-sm italic">
              Aucun objet détecté ou en attente d'image...
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {Object.entries(counts).map(([className, count]) => (
                <div key={className} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100 hover:border-indigo-200 transition-colors shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-md">
                      <Tag className="w-4 h-4" />
                    </div>
                    <span className="text-slate-700 capitalize font-medium">{className}</span>
                  </div>
                  <span className="px-2 py-1 bg-white border border-slate-200 rounded-full text-xs text-slate-500 font-mono shadow-sm">
                    x{count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Gemini Analysis Section */}
        <div className="pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Analyse IA
            </h3>
          </div>
         
          {!analysisState.result && !analysisState.loading && (
            <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 px-4">
               <p className="text-slate-500 text-sm mb-4">
                 Obtenez une description détaillée et artistique de cette scène grâce à l'IA.
               </p>
               <button
                onClick={onRequestAnalysis}
                disabled={predictions.length === 0}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-all shadow-md shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                Lancer l'analyse (100% Gratuit)
              </button>
            </div>
          )}

          {analysisState.loading && (
             <div className="flex flex-col items-center py-8 space-y-3 bg-slate-50 rounded-xl border border-slate-100">
               <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
               <span className="text-xs text-indigo-600 font-medium animate-pulse">L'IA analyse votre image...</span>
             </div>
          )}

          {analysisState.error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{analysisState.error}</p>
            </div>
          )}

          {analysisState.result && (
            <div className="space-y-4">
              <div className="prose prose-sm prose-slate max-w-none text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                 <ReactMarkdown>{analysisState.result}</ReactMarkdown>
              </div>
              
              <button
                onClick={onReset}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-sm font-semibold transition-all"
              >
                Analyser une autre image
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};