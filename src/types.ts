import type { ErpModuleId } from "./config/modules";

export type UserRole =
  | "ADMINISTRADOR"
  | "GERENTE"
  | "COORDINADOR"
  | "OPERADOR"
  | "ANALISTA_FINANZAS"
  | "LIQUIDADOR";

export interface UserSession {
  id: string;
  username: string;
  nombre: string;
  email: string;
  rol: UserRole;
  cargo: string;
  permisos: string[];
  modulos: string[];
  cargasTotal: number;
  cargasSinAsignar: number;
  cargasEnProceso: number;
}

/** null = home del sistema (tarjetas de módulos) */
export type ActiveModuleId = ErpModuleId | null;

/** null = hub nativo del módulo; string = sección embebida (iframe) */
export type ActiveSectionId = string | null;

export interface CargaRecord {
  id: string;
  estado: "SIN_ASIGNAR" | "ASIGNADO" | "EN_TRANSITO" | "ENTREGADO";
  dua: string;
  contenedor: string;
  naviera: string;
  navieraBooking?: string;
  cliente: string;
  consignatario: string;
  proveedor: string;
  almacen: string;
  finDiasLibres: string;
  tipoContenedor: string;
  destino: string;
}
