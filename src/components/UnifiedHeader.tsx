import React from "react";
import { Search, Plus, Download, FileCheck2, X } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenAssignModal: () => void;
  onExportExcel: () => void;
  onExportDeliveryOrders: () => void;
}

export const UnifiedHeader: React.FC<HeaderProps> = ({
  title,
  subtitle,
  searchQuery,
  onSearchChange,
  onOpenAssignModal,
  onExportExcel,
  onExportDeliveryOrders,
}) => {
  return (
    <>
      {/* 1. BARRA SUPERIOR PRINCIPAL */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center space-x-3">
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>{title}</span>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-normal border border-slate-200 hidden sm:inline">
              LINK 1.720
            </span>
          </h1>
        </div>

        {/* Acciones del Header */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Campo de búsqueda idéntico a la imagen */}
          <div className="relative hidden sm:block w-64 lg:w-80">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="CU, BL, cliente, buque, DUA..."
              className="w-full text-xs pl-8 pr-7 py-1.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none transition"
            />
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded"
                title="Limpiar búsqueda"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Botón Rojo: Generar Asignación */}
          <button
            onClick={onOpenAssignModal}
            className="bg-[#DC2626] hover:bg-[#B91C1C] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-sm flex items-center space-x-1.5 tracking-wide"
          >
            <Plus className="w-4 h-4" />
            <span>Generar Asignación</span>
          </button>

          {/* Botón Slate: Planilla Excel */}
          <button
            onClick={onExportExcel}
            className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm flex items-center space-x-1.5"
            title="Descargar Planilla Excel de Movilización"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Planilla Excel</span>
          </button>

          {/* Botón Azul Marino: Orden de Entrega */}
          <button
            onClick={onExportDeliveryOrders}
            className="bg-[#1F4E78] hover:bg-[#163856] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-sm flex items-center space-x-1.5"
            title="Generar Órdenes de Entrega oficiales"
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Orden de Entrega</span>
          </button>
        </div>
      </header>

      {/* 2. BANNER OPERATIVO INSTITUCIONAL */}
      <div className="bg-[#FFFDFB] border-b border-orange-200/80 px-4 sm:px-6 py-2 flex items-center justify-between text-xs text-slate-700">
        <div className="flex items-center space-x-2 overflow-hidden truncate">
          <span className="w-2 h-2 rounded-full bg-red-600 shrink-0 animate-pulse" />
          <span className="font-bold text-slate-900 shrink-0">LINK 1.720 Agentes Aduanales S.A.</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-600 truncate">
            {subtitle || "Control operativo de movilización • RIF J-503883587 • Haz doble clic en cualquier fila para asignar camión"}
          </span>
        </div>
        <div className="hidden lg:flex items-center space-x-3 shrink-0 text-slate-500 text-[11px]">
          <span>Patio Bolipuertos</span>
          <span>&bull;</span>
          <span>Puerto Cabello / La Guaira</span>
        </div>
      </div>
    </>
  );
};
