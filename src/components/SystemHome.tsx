import React from "react";
import { ArrowRight } from "lucide-react";
import { ErpModuleId, filterModulesForUser } from "../config/modules";
import type { UserSession } from "../types";

interface SystemHomeProps {
  onSelectModule: (moduleId: ErpModuleId) => void;
  user?: Pick<UserSession, "rol" | "modulos" | "permisos"> | null;
}

const accentRing: Record<string, string> = {
  slate: "hover:border-slate-400 group-hover:bg-slate-900",
  red: "hover:border-red-300 group-hover:bg-red-600",
  amber: "hover:border-amber-300 group-hover:bg-amber-600",
  blue: "hover:border-blue-300 group-hover:bg-blue-600",
  cyan: "hover:border-cyan-300 group-hover:bg-cyan-600",
};

export const SystemHome: React.FC<SystemHomeProps> = ({ onSelectModule, user }) => {
  const visibleModules = filterModulesForUser({
    rol: user?.rol,
    modulos: user?.modulos,
    permisos: user?.permisos,
  });

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="max-w-5xl mx-auto py-4 sm:py-8 px-1">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Bienvenido al Sistema ERP
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Un clic en un módulo abre su workspace con resumen nativo y secciones en vivo.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {visibleModules.map((mod) => {
            const Icon = mod.icon;
            const ring = accentRing[mod.accent] || accentRing.slate;
            return (
              <button
                key={mod.id}
                type="button"
                onClick={() => onSelectModule(mod.id)}
                className={`group text-left bg-white border border-slate-200 rounded-2xl p-5 shadow-xs transition ${ring.split(" ")[0]} hover:shadow-md`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center transition ${ring.split(" ").slice(1).join(" ")} group-hover:text-white`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${mod.badgeColor}`}
                  >
                    {mod.badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-4">{mod.title}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{mod.description}</p>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-slate-800 group-hover:text-slate-950">
                  <span>Entrar al módulo</span>
                  <ArrowRight className="w-3.5 h-3.5 transition group-hover:translate-x-0.5" />
                </div>
                <p className="text-[10px] text-slate-400 mt-2">
                  {mod.sections.length} secciones disponibles
                </p>
              </button>
            );
          })}
        </div>

        <p className="text-[11px] text-slate-400 mt-8 text-center">
          Logi se integrará en una fase posterior · Los módulos Link se cargan por SSO embebido
        </p>
      </div>
    </div>
  );
};
