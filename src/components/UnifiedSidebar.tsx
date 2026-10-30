import React from "react";
import {
  LogOut,
  User,
  ShieldCheck,
  KeyRound,
  Home,
  LucideIcon,
} from "lucide-react";
import { UserSession, ActiveModuleId } from "../types";
import { BrandMark } from "./BrandMark";
import {
  ADMIN_MODULE,
  ErpModuleId,
  filterModulesForUser,
  userCanAccessModule,
} from "../config/modules";

interface SidebarProps {
  user: UserSession;
  activeModule: ActiveModuleId;
  onSelectHome: () => void;
  onSelectModule: (moduleId: ErpModuleId) => void;
  onLogout: () => void;
  onOpenSecurityModal: () => void;
}

export const UnifiedSidebar: React.FC<SidebarProps> = ({
  user,
  activeModule,
  onSelectHome,
  onSelectModule,
  onLogout,
  onOpenSecurityModal,
}) => {
  const renderModuleButton = (
    id: ErpModuleId,
    title: string,
    description: string,
    badge: string,
    badgeColor: string,
    Icon: LucideIcon
  ) => {
    const isActive = activeModule === id;
    return (
      <button
        key={id}
        type="button"
        onClick={() => onSelectModule(id)}
        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition ${
          isActive
            ? "bg-[#18181B] text-white shadow-sm"
            : "text-slate-700 hover:bg-slate-50 border border-transparent hover:border-slate-200"
        }`}
      >
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
            isActive ? "bg-white/15 text-white" : "bg-slate-100 text-slate-600"
          }`}
        >
          <Icon className="w-4.5 h-4.5 w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className={`text-xs font-bold truncate ${isActive ? "text-white" : "text-slate-900"}`}>
              {title}
            </p>
            <span
              className={`text-[8px] font-mono px-1.5 py-0.5 rounded border uppercase tracking-wider shrink-0 ${
                isActive ? "bg-white/10 text-white border-white/20" : badgeColor
              }`}
            >
              {badge}
            </span>
          </div>
          <p className={`text-[10px] truncate mt-0.5 ${isActive ? "text-slate-300" : "text-slate-500"}`}>
            {description}
          </p>
        </div>
      </button>
    );
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 h-screen sticky top-0 overflow-hidden select-none">
      <div className="p-4 border-b border-slate-100 flex flex-col items-center text-center shrink-0">
        <BrandMark size="lg" showText={false} />
        <p className="text-[9px] text-slate-400 font-bold mt-2 tracking-wider uppercase">
          Sistema ERP • Holding Central
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-2 text-xs">
        <button
          type="button"
          onClick={onSelectHome}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition ${
            activeModule === null
              ? "bg-slate-100 text-slate-900 font-bold"
              : "text-slate-600 hover:bg-slate-50 font-semibold"
          }`}
        >
          <Home className="w-4 h-4 shrink-0" />
          <span>Inicio</span>
        </button>

        <p className="px-2 pt-3 pb-1 text-[9px] font-bold uppercase tracking-widest text-slate-400">
          Módulos Link
        </p>

        {filterModulesForUser({
          rol: user.rol,
          modulos: user.modulos,
          permisos: user.permisos,
        }).map((mod) =>
          renderModuleButton(
            mod.id,
            mod.title,
            mod.description,
            mod.badge,
            mod.badgeColor,
            mod.icon
          )
        )}

        {userCanAccessModule("sistema_erp_admin", {
          rol: user.rol,
          modulos: user.modulos,
          permisos: user.permisos,
        }) && (
          <>
            <p className="px-2 pt-3 pb-1 text-[9px] font-bold uppercase tracking-widest text-slate-400">
              Sistema
            </p>
            {renderModuleButton(
              ADMIN_MODULE.id,
              ADMIN_MODULE.title,
              ADMIN_MODULE.description,
              ADMIN_MODULE.badge,
              ADMIN_MODULE.badgeColor,
              ADMIN_MODULE.icon
            )}
          </>
        )}
      </nav>

      <div className="shrink-0 p-3 border-t border-slate-200 space-y-2 bg-white">
        <div className="bg-slate-50 rounded-xl p-2.5 text-[11px] font-mono space-y-1 text-slate-600 border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800">{user.cargasTotal}</span>
            <span className="text-slate-500 text-[10px]">cargas</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-700">{user.cargasSinAsignar}</span>
            <span className="text-amber-700 text-[10px]">sin asignar</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#DC2626]">{user.cargasEnProceso}</span>
            <span className="text-red-700 text-[10px]">en proceso</span>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 flex items-center justify-between">
          <div className="flex items-center space-x-2 overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="overflow-hidden min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">{user.nombre}</p>
              <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider truncate">
                {user.cargo || user.rol}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-0.5 shrink-0">
            <button
              onClick={onOpenSecurityModal}
              className="text-slate-400 hover:text-indigo-600 p-1 rounded hover:bg-slate-100 transition"
              title="2FA & Seguridad"
              aria-label="2FA y seguridad"
              type="button"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onOpenSecurityModal}
              className="text-slate-400 hover:text-amber-600 p-1 rounded hover:bg-slate-100 transition"
              title="Cambiar Clave"
              aria-label="Cambiar clave"
              type="button"
            >
              <KeyRound className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <button
          onClick={onLogout}
          type="button"
          className="w-full flex items-center justify-center space-x-2 px-3 py-1.5 rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 hover:border-rose-300 transition text-xs font-semibold group shadow-2xs"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-500 group-hover:text-rose-700 transition-colors" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};

// Re-export for any leftover imports during migration
export { ERP_MODULES, ADMIN_MODULE, SEA_BASE, VEHICULAR_BASE, PRELIQ_BASE, FINANZAS_BASE } from "../config/modules";
export type { ErpModule as RepoModule, ModuleSection as SubMenuItem } from "../config/modules";
