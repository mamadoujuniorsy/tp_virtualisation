import React, { useEffect, useState } from 'react';
import { HistoryItem } from '../types';
import { Clock, Box, FileText } from 'lucide-react';
import { Loader } from './Loader';

export const HistoryView: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('/api/history');
        if (!response.ok) throw new Error('Erreur réseau');
        const data = await response.json();
        setHistory(data);
      } catch (err) {
        setError("Impossible de charger l'historique. Vérifiez que la base de données est connectée.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) return <div className="flex justify-center p-10"><Loader text="Chargement de l'historique..." /></div>;
  if (error) return <div className="text-center text-red-500 p-10">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 w-full h-full overflow-y-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Clock className="w-6 h-6 text-indigo-600" />
        Historique des Détections
      </h2>
      
      {history.length === 0 ? (
        <div className="text-center text-slate-500 py-10 bg-white rounded-xl shadow-sm border border-slate-200">
          Aucun historique disponible pour le moment.
        </div>
      ) : (
        <div className="grid gap-4">
          {history.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2 text-indigo-600 font-medium">
                  <Box className="w-4 h-4" />
                  <span className="text-sm">Scan #{item.id}</span>
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(item.date_scan).toLocaleString('fr-FR')}
                </span>
              </div>
              
              <div className="mb-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Objets</h4>
                <div className="flex flex-wrap gap-2">
                  {item.objects_found.split(', ').map((obj, i) => (
                    <span key={i} className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md text-xs border border-slate-200">
                      {obj}
                    </span>
                  ))}
                </div>
              </div>

              {item.analysis_summary && item.analysis_summary !== 'Aucune analyse IA' && (
                <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
                  <div className="flex items-center gap-2 mb-1 text-indigo-700">
                    <FileText className="w-3 h-3" />
                    <span className="text-xs font-bold uppercase">Résumé IA</span>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">
                    {item.analysis_summary.substring(0, 150)}...
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};