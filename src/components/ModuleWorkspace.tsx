import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  LayoutDashboard,
  ExternalLink,
  ChevronDown,
  Download,
  FileSpreadsheet,
  Files,
  Globe,
  Search,
  Plus,
} from "lucide-react";
import { FINANZAS_BASE, type ErpModule, type ModuleSection } from "../config/modules";
import {
  LiveRepositoryViewer,
  type LiveRepositoryHandle,
} from "./LiveRepositoryViewer";
import { VehicularView } from "./views/VehicularView";
import { DespachoView } from "./views/DespachoView";
import { PreliquidacionesView } from "./views/PreliquidacionesView";
import { FinanzasView } from "./views/FinanzasView";
import { AdminView } from "./views/AdminView";

interface ModuleWorkspaceProps {
  module: ErpModule;
  activeSectionId: string | null;
  searchQuery: string;
  onSelectSection: (sectionId: string | null) => void;
  onOpenSecurityModal: () => void;
  ssoUsername?: string;
}

interface CxpBankOption {
  id: string;
  name: string;
}

function isTrustedCxpMessage(event: MessageEvent): boolean {
  try {
    return event.origin === new URL(FINANZAS_BASE).origin;
  } catch {
    return false;
  }
}

function withSsoUser(url: string, username?: string): string {
  if (!url.includes("sso-auto-login")) return url;
  try {
    const parsed = new URL(url);
    // next=/#preview deja #preview como fragmento del login SSO.
    // El navegador no lo envía al servidor, y todas las secciones caen en /.
    const outerHash = parsed.hash || "";
    if (outerHash) parsed.hash = "";

    if (username) parsed.searchParams.set("user", username);
    parsed.searchParams.set("embed", "1");

    let next = parsed.searchParams.get("next") || "/";
    if (outerHash && !next.includes("#")) next = `${next}${outerHash}`;
    if (next && !next.includes("embed=1")) {
      const hashIdx = next.indexOf("#");
      const pathPart = hashIdx >= 0 ? next.slice(0, hashIdx) : next;
      const hashPart = hashIdx >= 0 ? next.slice(hashIdx) : "";
      const sep = pathPart.includes("?") ? "&" : "?";
      next = `${pathPart}${sep}embed=1${hashPart}`;
    }
    parsed.searchParams.set("next", next);
    return parsed.toString();
  } catch {
    return url;
  }
}

const CXP_ACTIONS = [
  {
    group: "Ingesta",
    items: [
      { id: "statement", label: "Estado de Cuenta", icon: FileSpreadsheet },
      { id: "transfers", label: "Transferencias PDF", icon: Files },
    ],
  },
  {
    group: "Conciliar",
    items: [
      { id: "auto-match", label: "Auto-Conciliar", icon: Globe },
      { id: "search-pdf", label: "Buscar PDF", icon: Search },
    ],
  },
  {
    group: "Registro",
    items: [
      { id: "new-tx", label: "+ Movimiento", icon: Plus },
      { id: "excel", label: "Exportar Excel", icon: Download },
    ],
  },
] as const;

export const ModuleWorkspace: React.FC<ModuleWorkspaceProps> = ({
  module,
  activeSectionId,
  searchQuery,
  onSelectSection,
  onOpenSecurityModal,
  ssoUsername = "admin",
}) => {
  const activeSection: ModuleSection | undefined = activeSectionId
    ? module.sections.find((s) => s.id === activeSectionId)
    : undefined;

  const showNativeHub = !activeSectionId;
  const isAdmin = module.id === "sistema_erp_admin";
  const showIframe =
    !!activeSection &&
    activeSection.url !== "native_admin" &&
    activeSection.url !== "modal_2fa";

  /** Controles CxP en la misma fila de pestañas (prompt diseño Conciliación) */
  const showCxpTabControls =
    module.id === "modulo_finanzas" && activeSectionId === "fin_cxp";

  const liveRef = useRef<LiveRepositoryHandle>(null);
  const accionesRef = useRef<HTMLDivElement>(null);
  const [cxpBanks, setCxpBanks] = useState<CxpBankOption[]>([
    { id: "", name: "Todos los bancos" },
  ]);
  const [cxpBankId, setCxpBankId] = useState("");
  const [accionesOpen, setAccionesOpen] = useState(false);

  const postToCxp = useCallback((data: Record<string, unknown>) => {
    liveRef.current?.postMessage({ target: "link-cxp", ...data });
  }, []);

  useEffect(() => {
    if (!showCxpTabControls) {
      setAccionesOpen(false);
      return;
    }
    const onMsg = (event: MessageEvent) => {
      if (!isTrustedCxpMessage(event)) return;
      const data = event.data;
      if (!data || data.source !== "link-cxp") return;
      if (data.type === "banks" && Array.isArray(data.banks)) {
        setCxpBanks([
          { id: "", name: "Todos los bancos" },
          ...data.banks.map((b: { id: string | number; name: string }) => ({
            id: String(b.id),
            name: b.name,
          })),
        ]);
      }
      if (data.type === "ready") {
        postToCxp({ type: "ping" });
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [showCxpTabControls, postToCxp]);

  useEffect(() => {
    if (!accionesOpen) return;
    const close = (event: MouseEvent) => {
      if (accionesRef.current?.contains(event.target as Node)) return;
      setAccionesOpen(false);
    };
    const t = window.setTimeout(() => {
      document.addEventListener("click", close);
    }, 0);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("click", close);
    };
  }, [accionesOpen]);

  const handleSectionClick = (section: ModuleSection) => {
    if (section.url === "modal_2fa") {
      onOpenSecurityModal();
      return;
    }
    if (section.url === "native_admin") {
      onSelectSection(null);
      return;
    }
    onSelectSection(section.id);
  };

  const handleCxpBankChange = (value: string) => {
    setCxpBankId(value);
    postToCxp({ type: "set-bank", bankId: value });
  };

  const handleCxpAction = (actionId: string) => {
    setAccionesOpen(false);
    postToCxp({ type: "action", action: actionId });
  };

  const renderHub = () => {
    switch (module.id) {
      case "modulo_vehicular":
        return <VehicularView />;
      case "sea_link1720":
        return <DespachoView searchQuery={searchQuery} />;
      case "modulo_preliquidaciones":
        return <PreliquidacionesView />;
      case "modulo_finanzas":
        return <FinanzasView />;
      case "sistema_erp_admin":
        return <AdminView />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 gap-3">
      {/* Subnav: pestañas + (CxP) Acciones/Banco a la derecha */}
      <div className="shrink-0 bg-white border border-slate-200 rounded-xl px-2 py-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-thin min-w-0 flex-1">
          <button
            type="button"
            onClick={() => onSelectSection(null)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition shrink-0 ${
              showNativeHub
                ? "bg-[#18181B] text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Resumen</span>
          </button>

          <span className="w-px h-5 bg-slate-200 mx-1 shrink-0" />

          {module.sections
            .filter((s) => s.url !== "native_admin")
            .map((section) => {
              const isActive = activeSectionId === section.id;
              const Icon = section.icon || module.icon;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => handleSectionClick(section)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition shrink-0 ${
                    isActive
                      ? "bg-[#18181B] text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                  title={section.hint}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{section.label}</span>
                  {section.badge && (
                    <span
                      className={`text-[8px] font-mono font-bold px-1 py-0.5 rounded ${
                        isActive
                          ? "bg-white/20 text-white"
                          : section.badgeColor || "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {section.badge}
                    </span>
                  )}
                </button>
              );
            })}
        </div>

        {showCxpTabControls && (
          <div ref={accionesRef} className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <button
                type="button"
                onClick={() => setAccionesOpen((v) => !v)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide border transition ${
                  accionesOpen
                    ? "bg-[#18181B] text-white border-[#18181B]"
                    : "bg-white text-slate-700 border-slate-300 hover:border-slate-400"
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                Acciones Operativas
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>
              {accionesOpen && (
                <div className="absolute right-0 top-full mt-1.5 z-40 w-64 bg-white border border-slate-200 rounded-xl shadow-xl p-2.5 space-y-2.5">
                  {CXP_ACTIONS.map((group) => (
                    <div key={group.group}>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-1">
                        {group.group}
                      </p>
                      <div className="space-y-0.5">
                        {group.items.map((item) => {
                          const Icon = item.icon;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleCxpAction(item.id)}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 text-left"
                            >
                              <Icon className="w-3.5 h-3.5 text-slate-500" />
                              {item.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <label htmlFor="cxp-bank-filter" className="sr-only">
              Entidad bancaria
            </label>
            <select
              id="cxp-bank-filter"
              value={cxpBankId}
              onChange={(e) => handleCxpBankChange(e.target.value)}
              className="text-[11px] font-bold bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10 max-w-[180px]"
              title="Entidad bancaria"
            >
              {cxpBanks.map((b) => (
                <option key={b.id || "all"} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        {showNativeHub && (
          <div className="flex-1 overflow-y-auto scrollbar-thin pr-0.5 space-y-3">
            {!isAdmin && (
              <div className="bg-white border border-slate-200 rounded-xl p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Abrir sección en vivo
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {module.sections
                    .filter(
                      (s) => s.url !== "modal_2fa" && s.url !== "native_admin"
                    )
                    .map((section) => {
                      const Icon = section.icon || module.icon;
                      return (
                        <button
                          key={section.id}
                          type="button"
                          onClick={() => handleSectionClick(section)}
                          className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-left transition group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 group-hover:bg-[#18181B] group-hover:text-white transition">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <p className="text-xs font-bold text-slate-900 truncate">
                                {section.label}
                              </p>
                              <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-slate-500 shrink-0" />
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                              {section.hint}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>
            )}
            {renderHub()}
          </div>
        )}

        {showIframe && activeSection && (
          <LiveRepositoryViewer
            ref={liveRef}
            key={`${module.id}:${activeSection.id}:${ssoUsername}`}
            url={withSsoUser(activeSection.url, ssoUsername)}
            title={`${module.shortTitle} · ${activeSection.label}`}
            hideFloatingActions={showCxpTabControls}
          />
        )}
      </div>
    </div>
  );
};
