import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { ExternalLink, RefreshCw, AlertTriangle } from "lucide-react";

export interface LiveRepositoryHandle {
  postMessage: (data: Record<string, unknown>) => void;
  reload: () => void;
}

interface LiveRepositoryViewerProps {
  url: string;
  title: string;
  /** Oculta botones flotantes refresh/abrir (p. ej. cuando van en otra barra) */
  hideFloatingActions?: boolean;
}

export const LiveRepositoryViewer = forwardRef<
  LiveRepositoryHandle,
  LiveRepositoryViewerProps
>(function LiveRepositoryViewer(
  { url, title, hideFloatingActions = false },
  ref
) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setLoadError(false);
  }, [url]);

  useImperativeHandle(ref, () => ({
    postMessage: (data: Record<string, unknown>) => {
      const frame = iframeRef.current;
      if (!frame?.contentWindow) return;
      let targetOrigin = window.location.origin;
      try {
        targetOrigin = new URL(frame.src, window.location.origin).origin;
      } catch {
        return;
      }
      frame.contentWindow.postMessage(data, targetOrigin);
    },
    reload: () => {
      setLoading(true);
      setLoadError(false);
      if (iframeRef.current) iframeRef.current.src = url;
    },
  }));

  const handleRefresh = () => {
    setLoading(true);
    setLoadError(false);
    if (iframeRef.current) {
      iframeRef.current.src = url;
    }
  };

  const handleOpenNewTab = () => {
    try {
      const parsed = new URL(url, window.location.origin);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        window.open(parsed.href, "_blank", "noopener,noreferrer");
      }
    } catch {
      // Ignorar URLs no conformes
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white rounded-xl border border-slate-200 overflow-hidden relative">
      {!hideFloatingActions && (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleRefresh}
            className="flex items-center justify-center w-8 h-8 text-slate-600 bg-white/95 border border-slate-200 rounded-lg hover:bg-slate-50 transition shadow-sm"
            title="Recargar vista"
            aria-label="Recargar vista"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loading ? "animate-spin text-red-600" : ""}`}
            />
          </button>
          <button
            type="button"
            onClick={handleOpenNewTab}
            className="flex items-center justify-center w-8 h-8 text-slate-600 bg-white/95 border border-slate-200 rounded-lg hover:bg-slate-50 transition shadow-sm"
            title="Abrir en pestaña"
            aria-label="Abrir en pestaña"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="flex-1 relative w-full h-full min-h-0 bg-slate-100">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-xs">
            <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={url}
          title={title}
          className="w-full h-full min-h-[calc(100vh-220px)] border-0"
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
              No se pudo cargar {title}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              Verifica que el servicio del módulo esté corriendo en local, o
              ábrelo en una pestaña.
            </p>
            <button
              onClick={handleOpenNewTab}
              type="button"
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition"
            >
              Abrir en pestaña
            </button>
          </div>
        )}
      </div>
    </div>
  );
});
