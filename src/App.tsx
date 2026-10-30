import React, { useState, useEffect } from "react";
import { UserSession } from "./types";
import { UnifiedLogin } from "./components/UnifiedLogin";
import { UnifiedSidebar, REPO_MODULES } from "./components/UnifiedSidebar";
import { UnifiedHeader } from "./components/UnifiedHeader";
import { LiveRepositoryViewer } from "./components/LiveRepositoryViewer";
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ShieldAlert,
  FileText,
  KeyRound,
  RotateCcw,
} from "lucide-react";

interface AuditLogEntry {
  id: number;
  timestamp: string;
  event_type: string;
  username: string;
  ip_address: string;
  details: string;
}

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem("link_sso_user");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const defaultModule = REPO_MODULES[0];
  const defaultItem = defaultModule.items[0];

  const [activeView, setActiveView] = useState(defaultItem.id);
  const [activeUrl, setActiveUrl] = useState(defaultItem.url);
  const [activeRepoName, setActiveRepoName] = useState(defaultModule.repoName);
  const [activePort, setActivePort] = useState(defaultModule.port);

  const [searchQuery, setSearchQuery] = useState("");
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Estados de Auditoría y Soporte Administrativo
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [unlockTarget, setUnlockTarget] = useState("");
  const [unlockFeedback, setUnlockFeedback] = useState("");

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignorar fallos de red al cerrar sesión
    }
    localStorage.removeItem("link_sso_user");
    localStorage.removeItem("link_sso_token");
    window.history.replaceState(null, "", "/login");
    setCurrentUser(null);
  };

  // Monitor de Inactividad: 5 Minutos Continuos (300,000 ms)
  useEffect(() => {
    if (!currentUser) return;

    const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000; // 300,000 ms
    let timer: ReturnType<typeof setTimeout>;

    const performInactivityLogout = async () => {
      try {
        await fetch("/api/auth/logout", { method: "POST" });
      } catch {
        // Red limpia
      }
      localStorage.removeItem("link_sso_user");
      localStorage.removeItem("link_sso_token");
      setCurrentUser(null);
      // Redirigir con razón de inactividad
      window.history.replaceState(null, "", "/login?reason=inactividad");
    };

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(performInactivityLogout, INACTIVITY_TIMEOUT_MS);
    };

    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"];
    events.forEach((evt) => window.addEventListener(evt, resetTimer, { passive: true }));

    // Iniciar temporizador
    resetTimer();

    return () => {
      clearTimeout(timer);
      events.forEach((evt) => window.removeEventListener(evt, resetTimer));
    };
  }, [currentUser]);

  // Cargar Bitácora de Auditoría en Hora de Venezuela
  const fetchAuditLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch("/api/admin/audit-logs?limit=25");
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data);
      }
    } catch {
      // Error silencioso
    } finally {
      setLoadingLogs(false);
    }
  };

  // Desbloqueo Inmediato por Administración
  const handleAdminUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unlockTarget) return;
    try {
      const res = await fetch("/api/admin/unlock-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: unlockTarget }),
      });
      const data = await res.json();
      setUnlockFeedback(data.message || `Usuario ${unlockTarget} desbloqueado.`);
      setUnlockTarget("");
      await fetchAuditLogs();
    } catch {
      setUnlockFeedback("Error al procesar el desbloqueo.");
    }
  };

  useEffect(() => {
    if (showSecurityModal) {
      void fetchAuditLogs();
    }
  }, [showSecurityModal]);

  if (!currentUser) {
    return <UnifiedLogin onLoginSuccess={(u) => setCurrentUser(u)} />;
  }

  const handleSelectView = (viewId: string, targetUrl: string, repoName: string, port: string) => {
    setActiveView(viewId);
    setActiveUrl(targetUrl);
    setActiveRepoName(repoName);
    setActivePort(port);
  };

  const getViewTitle = () => {
    for (const mod of REPO_MODULES) {
      const found = mod.items.find((item) => item.id === activeView);
      if (found) {
        return `${mod.title} • ${found.label}`;
      }
    }
    return "LINK 1.720 • Plataforma Web Unificada";
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8F9FA]">
      {/* 1. SIDEBAR IZQUIERDO UNIFICADO */}
      <UnifiedSidebar
        user={currentUser}
        activeView={activeView}
        onSelectView={handleSelectView}
        onLogout={handleLogout}
        onOpenSecurityModal={() => setShowSecurityModal(true)}
      />

      {/* 2. ÁREA PRINCIPAL CON HEADER Y CANVAS */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <UnifiedHeader
          title={getViewTitle()}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenAssignModal={() => setShowAssignModal(true)}
          onExportExcel={() => alert("Descargando Planilla Oficial de Movilización Excel...")}
          onExportDeliveryOrders={() => alert("Generando Órdenes de Entrega oficiales...")}
        />

        {/* CANVAS PRINCIPAL */}
        <main className="p-3 sm:p-4 flex-1 flex flex-col overflow-hidden">
          <LiveRepositoryViewer
            url={activeUrl}
            title={getViewTitle()}
            repoName={activeRepoName}
            port={activePort}
          />
        </main>
      </div>

      {/* MODAL DE SEGURIDAD, 2FA & AUDITORÍA VET */}
      {showSecurityModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-[#DC2626]" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Seguridad Central, 2FA & Bitácora de Auditoría
                </h3>
              </div>
              <button
                onClick={() => setShowSecurityModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto text-xs text-slate-600 flex-1">
              {/* Tarjetas de Estado de Seguridad */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
                  <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                    Doble Factor (2FA)
                  </p>
                  <p className="font-bold text-emerald-900 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Sistema_ERP</span>
                  </p>
                  <p className="text-[10px] text-emerald-700 mt-0.5">
                    Google Authenticator RFC 6238
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl">
                  <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                    Control de Inactividad
                  </p>
                  <p className="font-bold text-amber-900 mt-1 flex items-center gap-1">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>5 Minutos</span>
                  </p>
                  <p className="text-[10px] text-amber-700 mt-0.5">
                    Cierre automático de sesión
                  </p>
                </div>

                <div className="bg-red-50 border border-red-200 p-3 rounded-xl">
                  <p className="text-[10px] font-bold text-red-800 uppercase tracking-wider">
                    Anti Fuerza Bruta
                  </p>
                  <p className="font-bold text-red-900 mt-1 flex items-center gap-1">
                    <ShieldAlert className="w-4 h-4 text-red-600" />
                    <span>Bloqueo 24 Horas</span>
                  </p>
                  <p className="text-[10px] text-red-700 mt-0.5">
                    Al 3er fallo consecutivo (IP/User)
                  </p>
                </div>
              </div>

              {/* Herramienta de Desbloqueo Administrativo */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                <h4 className="font-bold text-slate-800 mb-1.5 flex items-center space-x-1.5 text-xs">
                  <KeyRound className="w-4 h-4 text-slate-600" />
                  <span>Desbloqueo Inmediato de Usuario (Soporte Técnico)</span>
                </h4>
                <p className="text-[11px] text-slate-500 mb-2">
                  Permite desbloquear una cuenta que haya superado los 3 intentos fallidos antes de las 24 horas.
                </p>
                <form onSubmit={handleAdminUnlock} className="flex gap-2">
                  <input
                    type="text"
                    value={unlockTarget}
                    onChange={(e) => setUnlockTarget(e.target.value)}
                    placeholder="ej. eliana o admin"
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-[#DC2626]"
                  />
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-black text-white px-3 py-1.5 rounded-lg font-bold text-xs transition"
                  >
                    Desbloquear
                  </button>
                </form>
                {unlockFeedback && (
                  <p className="text-[11px] font-bold text-emerald-700 mt-1.5">
                    {unlockFeedback}
                  </p>
                )}
              </div>

              {/* Bitácora de Auditoría en Hora de Venezuela (VET UTC-4) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-800 text-xs flex items-center space-x-1.5">
                    <FileText className="w-4 h-4 text-slate-600" />
                    <span>Bitácora de Auditoría Oficial (Hora VET UTC-4)</span>
                  </h4>
                  <button
                    onClick={fetchAuditLogs}
                    className="text-[11px] font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Actualizar</span>
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-100 text-slate-600 uppercase text-[9px] font-bold">
                      <tr>
                        <th className="py-2 px-3">Fecha / Hora (VET)</th>
                        <th className="py-2 px-3">Evento</th>
                        <th className="py-2 px-3">Usuario</th>
                        <th className="py-2 px-3">IP Real</th>
                        <th className="py-2 px-3">Detalle</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loadingLogs ? (
                        <tr>
                          <td colSpan={5} className="py-4 text-center text-slate-400">
                            Cargando bitácora de auditoría…
                          </td>
                        </tr>
                      ) : auditLogs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-4 text-center text-slate-400">
                            No hay eventos registrados en la bitácora aún.
                          </td>
                        </tr>
                      ) : (
                        auditLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50 transition">
                            <td className="py-2 px-3 font-mono text-[10px] text-slate-700">
                              {log.timestamp}
                            </td>
                            <td className="py-2 px-3">
                              <span className="font-mono font-bold text-[10px] bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded">
                                {log.event_type}
                              </span>
                            </td>
                            <td className="py-2 px-3 font-bold text-slate-800">
                              {log.username}
                            </td>
                            <td className="py-2 px-3 font-mono text-slate-500 text-[10px]">
                              {log.ip_address}
                            </td>
                            <td className="py-2 px-3 text-slate-600">
                              {log.details}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setShowSecurityModal(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition"
              >
                Cerrar Panel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL GENERAR ASIGNACIÓN */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Generar Asignación de Camión</h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label htmlFor="assign-modal-container" className="block text-slate-700 font-bold mb-1">Contenedor / DUA</label>
                <input
                  id="assign-modal-container"
                  type="text"
                  placeholder="CAIU9511868 (C-57772)"
                  defaultValue="CAIU9511868 (C-57772)"
                  className="w-full border border-slate-300 rounded-lg p-2 font-mono bg-slate-50"
                  readOnly
                />
              </div>
              <div>
                <label htmlFor="assign-modal-truck" className="block text-slate-700 font-bold mb-1">Seleccionar Camión & Chofer</label>
                <select id="assign-modal-truck" className="w-full border border-slate-300 rounded-lg p-2 bg-white">
                  <option>Mack Granite (Placa: A92BL4K) - José Ramírez</option>
                  <option>Mack Vision (Placa: A02FF7L) - Alejandro Pérez</option>
                </select>
              </div>
              <div>
                <label htmlFor="assign-modal-destination" className="block text-slate-700 font-bold mb-1">Destino de Entrega</label>
                <input
                  id="assign-modal-destination"
                  type="text"
                  placeholder="VALENCIA - CIRRUS"
                  defaultValue="VALENCIA - CIRRUS"
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end space-x-2">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-3.5 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  alert("Asignación confirmada con éxito. Actualizando tablero de despacho...");
                  setShowAssignModal(false);
                }}
                className="px-4 py-2 bg-[#DC2626] text-white rounded-lg text-xs font-bold hover:bg-[#B91C1C] transition shadow-xs"
              >
                Confirmar Asignación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
