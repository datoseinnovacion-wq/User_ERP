import React from "react";
import { Search, Plus, Download, FileCheck2, X, ChevronRight } from "lucide-react";
import type { ErpModule } from "../config/modules";

interface HeaderProps {
  module: ErpModule | null;
  sectionLabel: string | null;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenAssignModal: () => void;
  onExportExcel: () => void;
  onExportDeliveryOrders: () => void;
}

export const UnifiedHeader: React.FC<HeaderProps> = ({
  module,
  sectionLabel,
  searchQuery,
  onSearchChange,
  onOpenAssignModal,
  onExportExcel,
  onExportDeliveryOrders,
}) => {
  const isHome = !module;
  const isVehicular = module?.id === "modulo_vehicular";
  const isSea = module?.id === "sea_link1720";
  const showSearch = isSea || isVehicular || isHome;

  const title = isHome ? "Inicio" : module.title;
  const subtitle = isHome
    ? "Plataforma central Link — selecciona un módulo en el panel izquierdo"
    : sectionLabel
      ? `Repositorio en vivo · ${sectionLabel}`
      : module.description;

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 py-3 flex items-center justify-between shadow-2xs gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
            <span>Sistema ERP</span>
            {module && (
              <>
                <ChevronRight className="w-3 h-3" />
                <span className="text-slate-600">{module.shortTitle}</span>
              </>
            )}
            {sectionLabel && (
              <>
                <ChevronRight className="w-3 h-3" />
                <span className="text-slate-800 truncate">{sectionLabel}</span>
              </>
            )}
          </div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
            {title}
          </h1>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {showSearch && (
            <div className="relative hidden md:block w-56 lg:w-72">
              <label htmlFor="erp-global-search" className="sr-only">
                Buscar en el sistema
              </label>
              <input
                id="erp-global-search"
                type="search"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={
                  isSea
                    ? "CU, BL, cliente, buque, DUA..."
                    : isVehicular
                      ? "Placa, chofer, contenedor..."
                      : "Buscar en el sistema..."
                }
                className="w-full text-xs pl-8 pr-7 py-1.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none transition"
              />
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded"
                  title="Limpiar búsqueda"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {isVehicular && (
            <>
              <button
                onClick={onOpenAssignModal}
                type="button"
                className="bg-[#DC2626] hover:bg-[#B91C1C] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-sm flex items-center space-x-1.5 tracking-wide"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Generar Asignación</span>
              </button>
              <button
                onClick={onExportExcel}
                type="button"
                className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm flex items-center space-x-1.5"
                title="Descargar Planilla Excel de Movilización"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Planilla Excel</span>
              </button>
              <button
                onClick={onExportDeliveryOrders}
                type="button"
                className="bg-[#1F4E78] hover:bg-[#163856] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-sm flex items-center space-x-1.5"
                title="Generar Órdenes de Entrega oficiales"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Orden de Entrega</span>
              </button>
            </>
          )}
        </div>
      </header>

      <div className="bg-[#FFFDFB] border-b border-orange-200/80 px-4 sm:px-6 py-2 flex items-center justify-between text-xs text-slate-700">
        <div className="flex items-center space-x-2 overflow-hidden truncate">
          <span className="w-2 h-2 rounded-full bg-red-600 shrink-0 animate-pulse" />
          <span className="font-bold text-slate-900 shrink-0">LINK 1.720</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-600 truncate">{subtitle}</span>
        </div>
        {module && (
          <span
            className={`hidden sm:inline text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${module.badgeColor}`}
          >
            {module.badge}
          </span>
        )}
      </div>
    </>
  );
};
