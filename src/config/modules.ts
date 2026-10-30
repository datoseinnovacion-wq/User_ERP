import {
  LayoutGrid,
  FileSpreadsheet,
  CheckCheck,
  Building2,
  Archive,
  ClipboardList,
  Truck,
  Route,
  UploadCloud,
  Scale,
  TrendingUp,
  FileBarChart,
  Receipt,
  DollarSign,
  LayoutDashboard,
  ShieldCheck,
  KeyRound,
  BookOpen,
  PieChart,
  Inbox,
  BarChart3,
  AlertTriangle,
  LucideIcon,
} from "lucide-react";

export type ErpModuleId =
  | "modulo_vehicular"
  | "sea_link1720"
  | "modulo_preliquidaciones"
  | "modulo_finanzas"
  | "sistema_erp_admin";

export interface ModuleSection {
  id: string;
  label: string;
  hint: string;
  url: string;
  badge?: string;
  badgeColor?: string;
  icon?: LucideIcon;
}

export interface ErpModule {
  id: ErpModuleId;
  title: string;
  shortTitle: string;
  description: string;
  badge: string;
  badgeColor: string;
  accent: string;
  icon: LucideIcon;
  defaultSectionId: string;
  defaultUrl: string;
  sections: ModuleSection[];
}

function resolveIsLocal(): boolean {
  if (typeof window === "undefined") return true;
  const host = window.location.hostname.toLowerCase();
  // Solo usar URLs Cloud Run cuando el propio shell ERP está en producción.
  if (host.endsWith(".run.app") || host.endsWith(".vercel.app")) return false;
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.endsWith(".local") ||
    host.startsWith("192.168.") ||
    host.startsWith("10.") ||
    host.startsWith("172.") ||
    host.startsWith("100.") // Tailscale / CGNAT
  );
}

const isLocal = resolveIsLocal();

export const SEA_BASE = isLocal
  ? "http://localhost:43123"
  : "https://sea-link1720-804329607921.us-central1.run.app";

export const VEHICULAR_BASE = isLocal
  ? "http://localhost:8002"
  : "https://link-modulo-asignacion-vehicular-830816277767.us-central1.run.app";

export const PRELIQ_BASE = isLocal
  ? "http://localhost:8090"
  : "https://link-preliquidaciones-830816277767.us-central1.run.app";

export const FINANZAS_BASE = isLocal
  ? "http://localhost:8001"
  : "https://link-modulo-finanzas-830816277767.us-central1.run.app";

const SEA_SSO = import.meta.env.VITE_SEA_SSO_TOKEN ?? "";

function seaUrl(pathWithQuery: string): string {
  const url = new URL(pathWithQuery, `${SEA_BASE}/`);
  if (SEA_SSO) {
    url.searchParams.set("sso_token", SEA_SSO);
  }
  return url.toString();
}

export const ERP_MODULES: ErpModule[] = [
  {
    id: "modulo_vehicular",
    title: "Asignación Vehicular",
    shortTitle: "Vehicular",
    description: "Flota, choferes, patio y órdenes de entrega",
    badge: "FLOTA",
    badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
    accent: "slate",
    icon: Truck,
    defaultSectionId: "veh_tablero",
    // user= se sobrescribe con la sesión ERP (withSsoUser); default admin-first
    defaultUrl: `${VEHICULAR_BASE}/sso-auto-login?user=admin&next=/`,
    sections: [
      {
        id: "veh_tablero",
        label: "Tablero de Cargas",
        hint: "Control operativo de movilización",
        url: `${VEHICULAR_BASE}/sso-auto-login?user=admin&next=/`,
        icon: Truck,
      },
      {
        id: "veh_preview",
        label: "Planilla Excel",
        hint: "Cuadrícula de movilización",
        url: `${VEHICULAR_BASE}/sso-auto-login?user=admin&next=/#preview`,
        icon: FileSpreadsheet,
      },
      {
        id: "veh_delivered",
        label: "Entregados",
        hint: "Histórico de ciclo cerrado",
        url: `${VEHICULAR_BASE}/sso-auto-login?user=admin&next=/#delivered`,
        badge: "197",
        badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: CheckCheck,
      },
      {
        id: "veh_fleet",
        label: "Flota & Camiones",
        hint: "Choferes y placas",
        url: `${VEHICULAR_BASE}/sso-auto-login?user=admin&next=/#fleet`,
        icon: Route,
      },
      {
        id: "veh_customers",
        label: "Clientes",
        hint: "Destinos de entrega",
        url: `${VEHICULAR_BASE}/sso-auto-login?user=admin&next=/#customers`,
        icon: Building2,
      },
      {
        id: "veh_orders",
        label: "Órdenes de Entrega",
        hint: "Registro oficial de despachos",
        url: `${VEHICULAR_BASE}/sso-auto-login?user=admin&next=/#orders`,
        icon: Archive,
      },
      {
        id: "veh_manual",
        label: "Manual SOP",
        hint: "Procedimiento oficial",
        url: `${VEHICULAR_BASE}/sso-auto-login?user=admin&next=/manual`,
        badge: "SOP",
        badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
        icon: BookOpen,
      },
      {
        id: "veh_activity",
        label: "Bitácora",
        hint: "Auditoría de asignaciones",
        url: `${VEHICULAR_BASE}/sso-auto-login?user=admin&next=/#activity`,
        icon: ClipboardList,
      },
    ],
  },
  {
    id: "sea_link1720",
    title: "Módulo SEA",
    shortTitle: "SEA",
    description: "Tablero de BLs, despachos, métricas e ingesta",
    badge: "SEA",
    badgeColor: "bg-red-50 text-[#DC2626] border-red-200",
    accent: "red",
    icon: LayoutGrid,
    defaultSectionId: "sea_tablero",
    defaultUrl: seaUrl("/"),
    sections: [
      {
        id: "sea_tablero",
        label: "Tablero Kanban",
        hint: "Kanban del expediente",
        url: seaUrl("/tablero"),
        icon: LayoutGrid,
      },
      {
        id: "sea_cola",
        label: "Pendientes de Hoy",
        hint: "Demora, bloqueo y ETA",
        url: seaUrl("/cola"),
        icon: Inbox,
      },
      {
        id: "sea_metricas",
        label: "Dashboard",
        hint: "KPIs por área y naviera",
        url: seaUrl("/metricas"),
        badge: "KPIS",
        badgeColor: "bg-red-600 text-white",
        icon: BarChart3,
      },
      {
        id: "sea_grilla",
        label: "Tablas",
        hint: "Por llegar · registrar · reconocimiento · despacho · expediente",
        url: seaUrl("/grilla?vista=por_llegar"),
        icon: FileSpreadsheet,
      },
      {
        id: "sea_cuarentena",
        label: "Calidad",
        hint: "Cuarentena · clientes · usuarios",
        url: seaUrl("/cuarentena"),
        badge: "ALERTA",
        badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
        icon: AlertTriangle,
      },
    ],
  },
  {
    id: "modulo_preliquidaciones",
    title: "Preliquidaciones",
    shortTitle: "Preliquidaciones",
    description: "Preliquidaciones, costos, ventas y ficha USD",
    badge: "PRELIQ",
    badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
    accent: "amber",
    icon: Scale,
    defaultSectionId: "preliq_dashboard",
    defaultUrl: `${PRELIQ_BASE}/sso-auto-login?user=admin&next=/dashboard`,
    sections: [
      {
        id: "preliq_dashboard",
        label: "Dashboard",
        hint: "Resumen de liquidaciones",
        url: `${PRELIQ_BASE}/sso-auto-login?user=admin&next=/dashboard`,
        icon: Scale,
      },
      {
        id: "preliq_ingesta",
        label: "Ingesta",
        hint: "Carga de archivos y casos",
        url: `${PRELIQ_BASE}/sso-auto-login?user=admin&next=/ingesta`,
        icon: UploadCloud,
      },
      {
        id: "preliq_costos",
        label: "Costos",
        hint: "Gastos portuarios y fletes",
        url: `${PRELIQ_BASE}/sso-auto-login?user=admin&next=/costos`,
        icon: FileBarChart,
      },
      {
        id: "preliq_ventas",
        label: "Ventas",
        hint: "Preliquidación y facturas",
        url: `${PRELIQ_BASE}/sso-auto-login?user=admin&next=/ventas`,
        icon: TrendingUp,
      },
      {
        id: "preliq_estados",
        label: "Estados",
        hint: "Tracking de pipeline",
        url: `${PRELIQ_BASE}/sso-auto-login?user=admin&next=/estados`,
        icon: CheckCheck,
      },
      {
        id: "preliq_utilidad",
        label: "Utilidad",
        hint: "Márgenes y rentabilidad",
        url: `${PRELIQ_BASE}/sso-auto-login?user=admin&next=/utilidad`,
        icon: PieChart,
      },
      {
        id: "preliq_ficha_usd",
        label: "Ficha USD",
        hint: "Cálculos en divisa",
        url: `${PRELIQ_BASE}/sso-auto-login?user=admin&next=/ficha-usd`,
        icon: DollarSign,
      },
      {
        id: "preliq_rubros",
        label: "Rubros",
        hint: "Conceptos contables",
        url: `${PRELIQ_BASE}/sso-auto-login?user=admin&next=/rubros`,
        icon: Building2,
      },
      {
        id: "preliq_conciliacion",
        label: "Conciliación",
        hint: "Auditoría de caja",
        url: `${PRELIQ_BASE}/sso-auto-login?user=admin&next=/conciliacion`,
        icon: DollarSign,
      },
    ],
  },
  {
    id: "modulo_finanzas",
    title: "Consolidación Bancaria",
    shortTitle: "Bancos",
    description: "CxP, conciliación, flujo de caja y BCV",
    badge: "BANCOS",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    accent: "blue",
    icon: Receipt,
    defaultSectionId: "fin_cxp",
    defaultUrl: `${FINANZAS_BASE}/sso-auto-login?user=admin&next=/CxP`,
    sections: [
      {
        id: "fin_cxp",
        label: "Conciliación Bancaria",
        hint: "Estados de cuenta",
        url: `${FINANZAS_BASE}/sso-auto-login?user=admin&next=/CxP`,
        icon: Receipt,
      },
      {
        id: "fin_dashboard",
        label: "Dashboard CxP",
        hint: "Métricas de cuentas por pagar",
        url: `${FINANZAS_BASE}/sso-auto-login?user=admin&next=/CxP/dashboard`,
        icon: LayoutDashboard,
      },
      {
        id: "fin_semanal",
        label: "Flujo Semanal",
        hint: "Proyección de pagos",
        url: `${FINANZAS_BASE}/sso-auto-login?user=admin&next=/CxP/dashboard#semanal`,
        icon: TrendingUp,
      },
      {
        id: "fin_trading",
        label: "Trading & BCV",
        hint: "Monitoreo cambiario",
        url: `${FINANZAS_BASE}/sso-auto-login?user=admin&next=/CxP/trading-devaluacion`,
        badge: "BCV",
        badgeColor: "bg-blue-600 text-white",
        icon: DollarSign,
      },
    ],
  },
];

export const ADMIN_MODULE: ErpModule = {
  id: "sistema_erp_admin",
  title: "Administración",
  shortTitle: "Admin",
  description: "Usuarios SSO, 2FA y bitácora",
  badge: "HOLDING",
  badgeColor: "bg-cyan-50 text-cyan-800 border-cyan-200",
  accent: "cyan",
  icon: LayoutDashboard,
  defaultSectionId: "admin_panel",
  defaultUrl: "",
  sections: [
    {
      id: "admin_panel",
      label: "Panel Central",
      hint: "Usuarios y auditoría",
      url: "native_admin",
      icon: ShieldCheck,
    },
    {
      id: "user_2fa",
      label: "2FA & Seguridad",
      hint: "Autenticador y desbloqueo",
      url: "modal_2fa",
      icon: KeyRound,
    },
  ],
};

export function getModuleById(id: ErpModuleId | null): ErpModule | undefined {
  if (!id) return undefined;
  if (id === "sistema_erp_admin") return ADMIN_MODULE;
  return ERP_MODULES.find((m) => m.id === id);
}

export function getSection(module: ErpModule, sectionId: string | null): ModuleSection | undefined {
  if (!sectionId) return undefined;
  return module.sections.find((s) => s.id === sectionId);
}

/** Clave RBAC en users.modulos ↔ id de módulo del shell */
export const MODULE_ACCESS_KEY: Record<Exclude<ErpModuleId, "sistema_erp_admin">, string> = {
  modulo_vehicular: "VEHICULAR",
  sea_link1720: "DESPACHO",
  modulo_preliquidaciones: "PRELIQUIDACIONES",
  modulo_finanzas: "FINANZAS",
};

export const ASSIGNABLE_MODULES: { key: string; label: string }[] = [
  { key: "DESPACHO", label: "SEA / Despacho" },
  { key: "VEHICULAR", label: "Asignación Vehicular" },
  { key: "PRELIQUIDACIONES", label: "Preliquidaciones" },
  { key: "FINANZAS", label: "Finanzas / CxP" },
];

export function parseAccessList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  return [];
}

export function userCanAccessModule(
  moduleId: ErpModuleId,
  opts: { rol?: string; modulos?: unknown; permisos?: unknown }
): boolean {
  const rol = (opts.rol || "").toUpperCase();
  const modulos = parseAccessList(opts.modulos).map((m) => m.toUpperCase());
  const permisos = parseAccessList(opts.permisos);

  if (moduleId === "sistema_erp_admin") {
    return (
      rol === "ADMINISTRADOR" ||
      permisos.includes("*") ||
      permisos.some((p) => p === "admin:total" || p.startsWith("admin:"))
    );
  }

  if (rol === "ADMINISTRADOR" || permisos.includes("*")) return true;

  const key = MODULE_ACCESS_KEY[moduleId as Exclude<ErpModuleId, "sistema_erp_admin">];
  return Boolean(key && modulos.includes(key));
}

export function filterModulesForUser(opts: {
  rol?: string;
  modulos?: unknown;
  permisos?: unknown;
}): ErpModule[] {
  return ERP_MODULES.filter((m) => userCanAccessModule(m.id, opts));
}
