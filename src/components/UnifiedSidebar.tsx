import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  LayoutGrid,
  FileSpreadsheet,
  CheckCheck,
  Building2,
  Archive,
  ClipboardList,
  Truck,
  PlusCircle,
  Route,
  UploadCloud,
  Scale,
  TrendingUp,
  FileBarChart,
  Receipt,
  DollarSign,
  CreditCard,
  LayoutDashboard,
  ShieldCheck,
  KeyRound,
  LogOut,
  User,
  BookOpen,
  PieChart,
  Inbox,
  BarChart3,
  Mail,
  AlertTriangle,
  Users,
  DollarSign as CashIcon,
  LucideIcon
} from "lucide-react";
import { UserSession } from "../types";
import { BrandMark } from "./BrandMark";

export interface SubMenuItem {
  id: string;
  label: string;
  hint: string;
  url: string;
  badge?: string;
  badgeColor?: string;
  icon?: LucideIcon;
}

export interface RepoModule {
  id: string;
  title: string;
  repoName: string;
  port: string;
  badge: string;
  badgeColor: string;
  icon: LucideIcon;
  defaultView: string;
  defaultUrl: string;
  items: SubMenuItem[];
}

interface SidebarProps {
  user: UserSession;
  activeView: string;
  onSelectView: (view: string, targetUrl: string, repoName: string, port: string) => void;
  onLogout: () => void;
  onOpenSecurityModal: () => void;
}

export const REPO_MODULES: RepoModule[] = [
  {
    id: "sea_link1720",
    title: "Sistema SEA 1.720",
    repoName: "sea-link1720-main",
    port: "Puerto 43123",
    badge: "SEA MAIN",
    badgeColor: "bg-red-50 text-[#DC2626] border-red-200",
    icon: LayoutGrid,
    defaultView: "sea_tablero",
    defaultUrl: "http://localhost:43123/?sso_token=81c280d95d1aa799569036468f7012d6ae9ce47c02dd2090",
    items: [
      {
        id: "sea_tablero",
        label: "Tablero Kanban de BLs",
        hint: "Seguimiento de expedientes aduanales",
        url: "http://localhost:43123/tablero?sso_token=81c280d95d1aa799569036468f7012d6ae9ce47c02dd2090",
        icon: LayoutGrid,
      },
      {
        id: "sea_cola",
        label: "Pendientes de Hoy",
        hint: "Demora, bloqueo y ETA de buques",
        url: "http://localhost:43123/cola?sso_token=81c280d95d1aa799569036468f7012d6ae9ce47c02dd2090",
        icon: Inbox,
      },
      {
        id: "sea_metricas",
        label: "Dashboard de Métricas",
        hint: "KPIs por área, cliente y naviera",
        url: "http://localhost:43123/metricas?sso_token=81c280d95d1aa799569036468f7012d6ae9ce47c02dd2090",
        badge: "KPIS",
        badgeColor: "bg-red-600 text-white",
        icon: BarChart3,
      },
      {
        id: "sea_grilla",
        label: "Grilla de Despachos",
        hint: "Expedientes, arribos y reconocimiento",
        url: "http://localhost:43123/grilla?vista=despachos&sso_token=81c280d95d1aa799569036468f7012d6ae9ce47c02dd2090",
        icon: FileSpreadsheet,
      },
      {
        id: "sea_ingesta",
        label: "Sombra & Hub Gmail",
        hint: "Robot clasificador de correos",
        url: "http://localhost:43123/ingesta?sso_token=81c280d95d1aa799569036468f7012d6ae9ce47c02dd2090",
        icon: Mail,
      },
      {
        id: "sea_cuarentena",
        label: "Cuarentena de Registros",
        hint: "Expedientes incompletos o faltantes",
        url: "http://localhost:43123/cuarentena?sso_token=81c280d95d1aa799569036468f7012d6ae9ce47c02dd2090",
        badge: "ALERTA",
        badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
        icon: AlertTriangle,
      },
      {
        id: "sea_maestros",
        label: "Catálogo de Clientes",
        hint: "Maestro de importadores registrados",
        url: "http://localhost:43123/maestros?sso_token=81c280d95d1aa799569036468f7012d6ae9ce47c02dd2090",
        icon: Users,
      },
    ],
  },
  {
    id: "modulo_vehicular",
    title: "Asignación Vehicular",
    repoName: "Link-Modulo_Asignacion_Vehicular",
    port: "Puerto 8002",
    badge: "FLOTA & PATIO",
    badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
    icon: Truck,
    defaultView: "veh_tablero",
    defaultUrl: "http://localhost:8002/sso-auto-login?user=eliana&next=/",
    items: [
      {
        id: "veh_tablero",
        label: "Tablero de Cargas & Asignación",
        hint: "Control operativo de movilización",
        url: "http://localhost:8002/sso-auto-login?user=eliana&next=/",
        icon: Truck,
      },
      {
        id: "veh_preview",
        label: "Vista Planilla Excel",
        hint: "Cuadrícula de movilización",
        url: "http://localhost:8002/sso-auto-login?user=eliana&next=/#preview",
        icon: FileSpreadsheet,
      },
      {
        id: "veh_delivered",
        label: "Contenedores Entregados",
        hint: "Histórico de ciclo cerrado",
        url: "http://localhost:8002/sso-auto-login?user=eliana&next=/#delivered",
        badge: "197",
        badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: CheckCheck,
      },
      {
        id: "veh_fleet",
        label: "Flota & Camiones",
        hint: "Catálogo de choferes y placas",
        url: "http://localhost:8002/sso-auto-login?user=eliana&next=/#fleet",
        icon: Route,
      },
      {
        id: "veh_customers",
        label: "Catálogo de Clientes",
        hint: "Direcciones y destinos entrega",
        url: "http://localhost:8002/sso-auto-login?user=eliana&next=/#customers",
        icon: Building2,
      },
      {
        id: "veh_orders",
        label: "Histórico Órdenes de Entrega",
        hint: "Registro oficial de despachos",
        url: "http://localhost:8002/sso-auto-login?user=eliana&next=/#orders",
        icon: Archive,
      },
      {
        id: "veh_manual",
        label: "Manual de Procesos SOP",
        hint: "Procedimiento oficial interactivo & PDF",
        url: "http://localhost:8002/sso-auto-login?user=eliana&next=/manual",
        badge: "SOP",
        badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
        icon: BookOpen,
      },
      {
        id: "veh_activity",
        label: "Bitácora",
        hint: "Auditoría de asignaciones y patio",
        url: "http://localhost:8002/sso-auto-login?user=eliana&next=/#activity",
        icon: ClipboardList,
      },
    ],
  },
  {
    id: "modulo_preliquidaciones",
    title: "Preliquidaciones",
    repoName: "Link_Preliquidaciones",
    port: "Puerto 8090",
    badge: "LINK PRELIQ",
    badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
    icon: Scale,
    defaultView: "preliq_dashboard",
    defaultUrl: "http://localhost:8090/sso-auto-login?user=eliana&next=/dashboard",
    items: [
      {
        id: "preliq_dashboard",
        label: "Dashboard de Expedientes",
        hint: "Resumen general de liquidaciones",
        url: "http://localhost:8090/sso-auto-login?user=eliana&next=/dashboard",
        icon: Scale,
      },
      {
        id: "preliq_ingesta",
        label: "Ingesta de Cargas",
        hint: "Carga de archivos y casos",
        url: "http://localhost:8090/sso-auto-login?user=eliana&next=/ingesta",
        icon: UploadCloud,
      },
      {
        id: "preliq_costos",
        label: "Control de Costos",
        hint: "Gastos portuarios y fletes",
        url: "http://localhost:8090/sso-auto-login?user=eliana&next=/costos",
        icon: FileBarChart,
      },
      {
        id: "preliq_ventas",
        label: "Control de Ventas",
        hint: "Preliquidación y facturas",
        url: "http://localhost:8090/sso-auto-login?user=eliana&next=/ventas",
        icon: TrendingUp,
      },
      {
        id: "preliq_estados",
        label: "Estados de Expediente",
        hint: "Tracking de pipeline",
        url: "http://localhost:8090/sso-auto-login?user=eliana&next=/estados",
        icon: CheckCheck,
      },
      {
        id: "preliq_utilidad",
        label: "Análisis de Utilidad",
        hint: "Márgenes y rentabilidad",
        url: "http://localhost:8090/sso-auto-login?user=eliana&next=/utilidad",
        icon: PieChart,
      },
      {
        id: "preliq_ficha_usd",
        label: "Ficha USD",
        hint: "Cálculos en divisa y liquidación",
        url: "http://localhost:8090/sso-auto-login?user=eliana&next=/ficha-usd",
        icon: DollarSign,
      },
      {
        id: "preliq_rubros",
        label: "Catálogo de Rubros",
        hint: "Conceptos contables y aduana",
        url: "http://localhost:8090/sso-auto-login?user=eliana&next=/rubros",
        icon: Building2,
      },
      {
        id: "preliq_conciliacion",
        label: "Conciliación & Efectivo",
        hint: "Auditoría de caja chica",
        url: "http://localhost:8090/sso-auto-login?user=eliana&next=/conciliacion",
        icon: CashIcon,
      },
    ],
  },
  {
    id: "modulo_finanzas",
    title: "Finanzas & Bancos",
    repoName: "Modulo-Finanzas",
    port: "Puerto 8001",
    badge: "CXP & BANCOS",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Receipt,
    defaultView: "fin_cxp",
    defaultUrl: "http://localhost:8001/sso-auto-login?user=eliana&next=/CxP",
    items: [
      {
        id: "fin_cxp",
        label: "Conciliación Bancaria Principal",
        hint: "Estados de cuenta y comprobantes",
        url: "http://localhost:8001/sso-auto-login?user=eliana&next=/CxP",
        icon: Receipt,
      },
      {
        id: "fin_dashboard",
        label: "Dashboard Financiero CxP",
        hint: "Métricas de cuentas por pagar",
        url: "http://localhost:8001/sso-auto-login?user=eliana&next=/CxP/dashboard",
        icon: LayoutDashboard,
      },
      {
        id: "fin_semanal",
        label: "Flujo de Caja Semanal",
        hint: "Proyección semanal de pagos",
        url: "http://localhost:8001/sso-auto-login?user=eliana&next=/CxP/dashboard#semanal",
        icon: TrendingUp,
      },
      {
        id: "fin_trading",
        label: "Trading & Devaluación BCV",
        hint: "Monitoreo cambiario oficial",
        url: "http://localhost:8001/sso-auto-login?user=eliana&next=/CxP/trading-devaluacion",
        badge: "BCV",
        badgeColor: "bg-blue-600 text-white",
        icon: DollarSign,
      },
    ],
  },
  {
    id: "sistema_erp_admin",
    title: "Administración Central",
    repoName: "Sistema_ERP",
    port: "Puerto 8000",
    badge: "HOLDING",
    badgeColor: "bg-cyan-50 text-cyan-800 border-cyan-200",
    icon: LayoutDashboard,
    defaultView: "user_coordinador",
    defaultUrl: "http://localhost:8002/sso-auto-login?user=eliana&next=/coordinacion",
    items: [
      {
        id: "user_coordinador",
        label: "Panel Coordinador",
        hint: "Tiempos & Pipeline general",
        url: "http://localhost:8002/sso-auto-login?user=eliana&next=/coordinacion",
        badge: "KPIS",
        badgeColor: "bg-indigo-600 text-white",
        icon: LayoutDashboard,
      },
      {
        id: "user_admin",
        label: "Panel Administrador",
        hint: "Usuarios & Contraseñas SSO",
        url: "http://localhost:8002/sso-auto-login?user=eliana&next=/administrador",
        badge: "SEGURIDAD",
        badgeColor: "bg-purple-600 text-white",
        icon: ShieldCheck,
      },
      {
        id: "user_preliq_admin",
        label: "Admin Preliquidaciones",
        hint: "Seguridad y permisos Preliq",
        url: "http://localhost:8090/sso-auto-login?user=eliana&next=/administrador",
        badge: "PRELIQ",
        badgeColor: "bg-amber-600 text-white",
        icon: ShieldCheck,
      },
      {
        id: "user_2fa",
        label: "Autenticador (2FA) & Llaves",
        hint: "Configurar app & Claves de recuperación",
        url: "modal_2fa",
        icon: KeyRound,
      },
    ],
  },
];

export const UnifiedSidebar: React.FC<SidebarProps> = ({
  user,
  activeView,
  onSelectView,
  onLogout,
  onOpenSecurityModal,
}) => {
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    sea_link1720: true,
    modulo_vehicular: false,
    modulo_preliquidaciones: false,
    modulo_finanzas: false,
    sistema_erp_admin: false,
  });

  useEffect(() => {
    for (const mod of REPO_MODULES) {
      if (mod.items.some((item) => item.id === activeView)) {
        setExpandedModules((prev) => ({
          ...prev,
          [mod.id]: true,
        }));
        break;
      }
    }
  }, [activeView]);

  const toggleModule = (module: RepoModule) => {
    const willBeOpen = !expandedModules[module.id];
    setExpandedModules((prev) => ({
      ...prev,
      [module.id]: willBeOpen,
    }));

    // Cargar la vista principal por defecto de dicho repositorio con su URL SSO
    onSelectView(module.defaultView, module.defaultUrl, module.repoName, module.port);
  };

  const handleSubItemClick = (module: RepoModule, sub: SubMenuItem) => {
    if (sub.id === "user_2fa") {
      onOpenSecurityModal();
      return;
    }
    onSelectView(sub.id, sub.url, module.repoName, module.port);
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 h-screen sticky top-0 overflow-hidden select-none">
      {/* 1. CABECERA: SISTEMA ERP HOLDING */}
      <div className="p-4 border-b border-slate-100 flex flex-col items-center text-center shrink-0">
        <BrandMark size="md" showText={true} />
        <p className="text-[9px] text-slate-400 font-bold mt-2 tracking-wider uppercase">
          Holding: Link • Logi • Consolidadora
        </p>
      </div>

      {/* 2. MENÚ CON ACORDEÓN DESPLEGABLE POR REPOSITORIOS INTEGRADOS */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-3 text-xs">
        {REPO_MODULES.map((mod) => {
          const isExpanded = !!expandedModules[mod.id];
          const hasActiveChild = mod.items.some((item) => item.id === activeView);
          const ModIcon = mod.icon;

          return (
            <div key={mod.id} className="rounded-xl overflow-hidden border border-transparent transition-colors">
              {/* ELEMENTO RAÍZ DE NIVEL 1: ENCABEZADO DEL REPOSITORIO */}
              <button
                type="button"
                onClick={() => toggleModule(mod)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition text-left group ${
                  hasActiveChild
                    ? "bg-slate-100/90 text-slate-900 font-bold shadow-2xs"
                    : "text-slate-700 hover:bg-slate-50 font-semibold"
                }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition ${
                      hasActiveChild
                        ? "bg-[#18181B] text-white"
                        : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                    }`}
                  >
                    <ModIcon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs tracking-tight truncate leading-tight">
                      {mod.title}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className={`text-[8px] font-mono px-1 py-0.2 rounded font-bold border uppercase tracking-wider ${mod.badgeColor}`}
                      >
                        {mod.badge}
                      </span>
                    </div>
                  </div>
                </div>

                {/* CHEVRON INDICADOR CON ROTACIÓN 0deg a 180deg */}
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 group-hover:text-slate-700 shrink-0 transition-transform duration-300 ease-in-out ${
                    isExpanded ? "rotate-180 text-slate-800" : "rotate-0"
                  }`}
                />
              </button>

              {/* OPCIONES SECUNDARIAS (NIVEL 2 DESPLEGADO CON TRANSICIÓN SUAVE) */}
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  isExpanded
                    ? "grid-rows-[1fr] opacity-100 mt-1"
                    : "grid-rows-[0fr] opacity-0 pointer-events-none"
                }`}
              >
                <div className="overflow-hidden">
                  {/* Contenedor con línea guía vertical sutil */}
                  <div className="border-l-2 border-slate-200 ml-4 pl-2 space-y-1 py-1">
                    {mod.items.map((sub) => {
                      const isActive = activeView === sub.id;
                      const SubIcon = sub.icon || mod.icon;

                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => handleSubItemClick(mod, sub)}
                          className={`w-full flex items-start space-x-2 px-2.5 py-1.5 rounded-lg text-left transition duration-150 group relative ${
                            isActive
                              ? "bg-[#18181B] text-white shadow-xs font-semibold"
                              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                          }`}
                        >
                          <SubIcon
                            className={`w-3.5 h-3.5 mt-0.5 shrink-0 transition-colors ${
                              isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[11px] leading-snug font-bold truncate">
                                {sub.label}
                              </span>
                              {sub.badge && (
                                <span
                                  className={`text-[8px] font-mono font-bold px-1 py-0.2 rounded border ${
                                    sub.badgeColor || "bg-slate-100 text-slate-700 border-slate-200"
                                  }`}
                                >
                                  {sub.badge}
                                </span>
                              )}
                            </div>
                            <p
                              className={`text-[9.5px] truncate mt-0.2 ${
                                isActive ? "text-slate-300" : "text-slate-400 group-hover:text-slate-500"
                              }`}
                            >
                              {sub.hint}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      {/* 3. PARTE INFERIOR FIJA: CONTADOR, FICHA DEL PERFIL Y CERRAR SESIÓN */}
      <div className="shrink-0 p-3 border-t border-slate-200 space-y-2 bg-white">
        {/* Contadores Estadísticos Monospace */}
        <div className="bg-slate-50 rounded-xl p-2.5 text-[11px] font-mono space-y-1 text-slate-600 border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800">{user.cargasTotal}</span>
            <span className="text-slate-500 text-[10px]">cargas registradas</span>
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

        {/* Ficha de Perfil de Usuario Conectado */}
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
            >
              <ShieldCheck className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onOpenSecurityModal}
              className="text-slate-400 hover:text-amber-600 p-1 rounded hover:bg-slate-100 transition"
              title="Cambiar Clave"
            >
              <KeyRound className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Botón de Cierre de Sesión Estilizado */}
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center space-x-2 px-3 py-1.5 rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 hover:border-rose-300 transition text-xs font-semibold group shadow-2xs"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-500 group-hover:text-rose-700 transition-colors" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};
