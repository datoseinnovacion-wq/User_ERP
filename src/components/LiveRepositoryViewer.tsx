import React, { useRef, useState } from "react";
import { ExternalLink, RefreshCw, CheckCircle2, ShieldCheck, AlertTriangle } from "lucide-react";

interface LiveRepositoryViewerProps {
  url: string;
  title: string;
  repoName: string;
  port: string;
}

export const LiveRepositoryViewer: React.FC<LiveRepositoryViewerProps> = ({
  url,
  title,
  repoName,
  port,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const handleRefresh = () => {
    setLoading(true);
    setLoadError(false);
    if (iframeRef.current) {
      iframeRef.current.src = url;
    }
  };

  const handleOpenNewTab = () => {
    window.open(url, "_blank");
  };

  return (
    <div className="flex flex-col h-full w-full bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* BARRA SUPERIOR DE CONTROL DEL REPOSITORIO EN VIVO */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-tight">
              {repoName}
            </span>
          </div>
          <span className="text-slate-300">|</span>
          <span className="text-[11px] font-mono bg-slate-200/70 text-slate-700 px-2 py-0.5 rounded font-semibold">
            {port}
          </span>
          <span className="text-[11px] text-slate-500 font-medium truncate max-w-xs hidden sm:inline">
            {url}
          </span>
        </div>

        {/* Acciones Rápidas */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleRefresh}
            className="flex items-center space-x-1.5 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition shadow-2xs"
            title="Recargar vista del repositorio"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? "animate-spin text-red-600" : ""}`} />
            <span>Recargar</span>
          </button>

          <button
            type="button"
            onClick={handleOpenNewTab}
            className="flex items-center space-x-1.5 px-3 py-1 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition shadow-2xs"
            title="Abrir este repositorio en una pestaña completa"
          >
            <span>Abrir en Pestaña</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* CONTENEDOR DEL IFRAME DE LA APLICACIÓN NATIVA */}
      <div className="flex-1 relative w-full h-full min-h-[calc(100vh-175px)] bg-slate-100">
        {loading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-xs">
            <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs font-bold text-slate-800">Cargando repositorio {repoName}…</p>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">{url}</p>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={url}
          title={title}
          className="w-full h-full min-h-[calc(100vh-175px)] border-0"
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setLoadError(true);
          }}
        />

        {loadError && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-amber-500 mb-3" />
            <h3 className="text-sm font-bold text-slate-900">
              No se pudo cargar la vista embebida de {repoName}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              Puedes abrir el servicio directamente haciendo clic en el botón inferior:
            </p>
            <button
              onClick={handleOpenNewTab}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition"
            >
              Abrir {url} ➜
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
