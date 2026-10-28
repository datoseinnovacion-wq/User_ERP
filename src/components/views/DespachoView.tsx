import React, { useState } from "react";
import { ChevronDown, Calendar, RefreshCw } from "lucide-react";
import { CargaRecord } from "../../types";

const INITIAL_DATA: CargaRecord[] = [
  {
    id: "1",
    estado: "SIN_ASIGNAR",
    dua: "C-57772",
    contenedor: "CAIU9511868",
    naviera: "CMA CGM",
    navieraBooking: "GG23148886",
    cliente: "RAFAEL",
    consignatario: "CARS LUNA VIP, CA",
    proveedor: "-",
    almacen: "CIRRUS",
    finDiasLibres: "-",
    tipoContenedor: "01X40",
    destino: "VALENCIA"
  },
  {
    id: "2",
    estado: "SIN_ASIGNAR",
    dua: "C-57772",
    contenedor: "TGBU6546538",
    naviera: "CMA CGM",
    navieraBooking: "GG23148886",
    cliente: "RAFAEL",
    consignatario: "CARS LUNA VIP, CA",
    proveedor: "-",
    almacen: "CIRRUS",
    finDiasLibres: "-",
    tipoContenedor: "01X40",
    destino: "VALENCIA"
  },
  {
    id: "3",
    estado: "SIN_ASIGNAR",
    dua: "C-57772",
    contenedor: "ECMU5268668",
    naviera: "CMA CGM",
    navieraBooking: "GG23148886",
    cliente: "RAFAEL",
    consignatario: "CARS LUNA VIP, CA",
    proveedor: "-",
    almacen: "CIRRUS",
    finDiasLibres: "-",
    tipoContenedor: "01X40",
    destino: "VALENCIA"
  },
  {
    id: "4",
    estado: "SIN_ASIGNAR",
    dua: "C-57772",
    contenedor: "BEAU6092980",
    naviera: "CMA CGM",
    navieraBooking: "GG23148886",
    cliente: "RAFAEL",
    consignatario: "CARS LUNA VIP, CA",
    proveedor: "-",
    almacen: "CIRRUS",
    finDiasLibres: "-",
    tipoContenedor: "01X40",
    destino: "VALENCIA"
  },
  {
    id: "5",
    estado: "SIN_ASIGNAR",
    dua: "C-57772",
    contenedor: "ECMU5144899",
    naviera: "CMA CGM",
    navieraBooking: "GG23148886",
    cliente: "RAFAEL",
    consignatario: "CARS LUNA VIP, CA",
    proveedor: "-",
    almacen: "CIRRUS",
    finDiasLibres: "-",
    tipoContenedor: "01X40",
    destino: "VALENCIA"
  },
  {
    id: "6",
    estado: "SIN_ASIGNAR",
    dua: "C-57772",
    contenedor: "TLLU4626914",
    naviera: "CMA CGM",
    navieraBooking: "GG23148886",
    cliente: "RAFAEL",
    consignatario: "CARS LUNA VIP, CA",
    proveedor: "-",
    almacen: "CIRRUS",
    finDiasLibres: "-",
    tipoContenedor: "01X40",
    destino: "VALENCIA"
  },
  {
    id: "7",
    estado: "SIN_ASIGNAR",
    dua: "C-57772",
    contenedor: "TIIU6912678",
    naviera: "CMA CGM",
    navieraBooking: "GG23148886",
    cliente: "RAFAEL",
    consignatario: "CARS LUNA VIP, CA",
    proveedor: "-",
    almacen: "CIRRUS",
    finDiasLibres: "-",
    tipoContenedor: "01X40",
    destino: "VALENCIA"
  },
  {
    id: "8",
    estado: "SIN_ASIGNAR",
    dua: "C-57772",
    contenedor: "TRLU7287348",
    naviera: "CMA CGM",
    navieraBooking: "GG23148886",
    cliente: "RAFAEL",
    consignatario: "CARS LUNA VIP, CA",
    proveedor: "-",
    almacen: "CIRRUS",
    finDiasLibres: "-",
    tipoContenedor: "01X40",
    destino: "VALENCIA"
  },
  {
    id: "9",
    estado: "SIN_ASIGNAR",
    dua: "C-58107",
    contenedor: "TCNU3516927",
    naviera: "CMA CGM",
    navieraBooking: "SZFM2600000A / GG23563...",
    cliente: "STAR WHITE",
    consignatario: "INVERSIONES EL RINCON DE TODO 3000, CA",
    proveedor: "-",
    almacen: "SIRIUS",
    finDiasLibres: "-",
    tipoContenedor: "01X40 CARA",
    destino: "CARACAS"
  },
  {
    id: "10",
    estado: "ASIGNADO",
    dua: "C-57670",
    contenedor: "TCXU7530240",
    naviera: "CMA CGM",
    navieraBooking: "LT202600311 / GG23282...",
    cliente: "CHINO ALONSO",
    consignatario: "INVERSIONES PLAN ZHEN, CA / CONSOLIDADORA...",
    proveedor: "-",
    almacen: "SIRIUS",
    finDiasLibres: "-",
    tipoContenedor: "01X40 CARA",
    destino: "CARACAS"
  }
];

export const DespachoView: React.FC<{ searchQuery: string }> = ({ searchQuery }) => {
  const [filterType, setFilterType] = useState<"all" | "unassigned" | "pending_empty" | "delivered_empty">("all");
  const [selectedNaviera, setSelectedNaviera] = useState("all");
  const [selectedCliente, setSelectedCliente] = useState("all");

  const filteredData = INITIAL_DATA.filter((item) => {
    if (filterType === "unassigned" && item.estado !== "SIN_ASIGNAR") return false;
    if (filterType === "delivered_empty" && item.estado !== "ENTREGADO") return false;
    if (selectedNaviera !== "all" && item.naviera !== selectedNaviera) return false;
    if (selectedCliente !== "all" && item.cliente !== selectedCliente) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.dua.toLowerCase().includes(q) ||
        item.contenedor.toLowerCase().includes(q) ||
        item.cliente.toLowerCase().includes(q) ||
        item.consignatario.toLowerCase().includes(q) ||
        item.naviera.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* BARRA DE FILTROS IDÉNTICA A LA IMAGEN 2 */}
      <div className="sticky top-[58px] z-20 bg-white/95 backdrop-blur-xs flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200 shadow-xs">
        {/* Chips de Estado */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider mr-1">
            FILTRAR:
          </span>
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1 rounded-md text-xs font-bold transition shadow-2xs ${
              filterType === "all" ? "bg-[#18181B] text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Todas (266)
          </button>
          <button
            onClick={() => setFilterType("unassigned")}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
              filterType === "unassigned" ? "bg-[#18181B] text-white font-bold" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Sin Asignar (47)
          </button>
          <button
            onClick={() => setFilterType("pending_empty")}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
              filterType === "pending_empty" ? "bg-[#18181B] text-white font-bold" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Vacíos Pendientes (219)
          </button>
          <button
            onClick={() => setFilterType("delivered_empty")}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
              filterType === "delivered_empty" ? "bg-[#18181B] text-white font-bold" : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
            }`}
          >
            ✓ Vacíos Entregados (197)
          </button>
        </div>

        {/* Desplegables de Naviera, Cliente y Fecha */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* Dropdown Naviera */}
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
            <span className="font-bold text-slate-600 uppercase text-[10px]">NAVIERA:</span>
            <select
              value={selectedNaviera}
              onChange={(e) => setSelectedNaviera(e.target.value)}
              className="bg-transparent text-slate-800 text-xs font-medium outline-none cursor-pointer"
            >
              <option value="all">Todas las Navieras (266)</option>
              <option value="CMA CGM">CMA CGM</option>
              <option value="MAERSK">MAERSK</option>
              <option value="HAPAG LLOYD">HAPAG LLOYD</option>
            </select>
          </div>

          {/* Dropdown Cliente */}
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
            <span className="font-bold text-slate-600 uppercase text-[10px]">CLIENTE:</span>
            <select
              value={selectedCliente}
              onChange={(e) => setSelectedCliente(e.target.value)}
              className="bg-transparent text-slate-800 text-xs font-medium outline-none cursor-pointer"
            >
              <option value="all">Todos los clientes (266)</option>
              <option value="RAFAEL">RAFAEL</option>
              <option value="STAR WHITE">STAR WHITE</option>
              <option value="CHINO ALONSO">CHINO ALONSO</option>
            </select>
          </div>

          {/* Botón Filtrar Fecha */}
          <button className="flex items-center space-x-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-2.5 py-1 rounded-lg font-medium shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Filtrar Fecha</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      </div>

      {/* TABLA PRINCIPAL DE DATOS CON LOS ESTILOS EXACTOS */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">ESTADO</th>
                <th className="py-3 px-3">DUA</th>
                <th className="py-3 px-3">CONTENEDOR</th>
                <th className="py-3 px-3">NAVIERA</th>
                <th className="py-3 px-3">CLIENTE</th>
                <th className="py-3 px-3">CONSIGNATARIO</th>
                <th className="py-3 px-3">PROVEEDOR</th>
                <th className="py-3 px-3">ALMACÉN / PATIO</th>
                <th className="py-3 px-3 text-center">FIN DÍAS LIBRES</th>
                <th className="py-3 px-3">TIPO CONTENEDOR / DESTINO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  onDoubleClick={() => alert(`Asignar camión a contenedor: ${row.contenedor} (DUA: ${row.dua})`)}
                >
                  {/* ESTADO */}
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    {row.estado === "SIN_ASIGNAR" ? (
                      <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200/80 px-2 py-0.5 rounded text-[10px] font-bold tracking-tight">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        SIN ASIGNAR
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded text-[10px] font-bold tracking-tight">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                        ASIGNADO
                      </span>
                    )}
                  </td>

                  {/* DUA */}
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                    {row.dua}
                  </td>

                  {/* CONTENEDOR */}
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-800 whitespace-nowrap">
                    {row.contenedor}
                  </td>

                  {/* NAVIERA */}
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <div className="inline-flex flex-col">
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide border border-blue-100">
                        {row.naviera}
                      </span>
                      {row.navieraBooking && (
                        <span className="text-[9px] font-mono text-slate-400 mt-0.5 truncate max-w-[120px]">
                          {row.navieraBooking}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* CLIENTE */}
                  <td className="py-2.5 px-3 font-bold text-slate-800 whitespace-nowrap">
                    {row.cliente}
                  </td>

                  {/* CONSIGNATARIO */}
                  <td className="py-2.5 px-3 text-slate-600 font-medium truncate max-w-[220px]">
                    {row.consignatario}
                  </td>

                  {/* PROVEEDOR */}
                  <td className="py-2.5 px-3 text-slate-400 text-center">
                    {row.proveedor}
                  </td>

                  {/* ALMACÉN / PATIO */}
                  <td className="py-2.5 px-3 font-mono text-slate-700 font-semibold whitespace-nowrap">
                    {row.almacen}
                  </td>

                  {/* FIN DÍAS LIBRES */}
                  <td className="py-2.5 px-3 text-center text-slate-400 font-mono">
                    {row.finDiasLibres}
                  </td>

                  {/* TIPO CONTENEDOR / DESTINO */}
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="font-mono text-slate-800 font-semibold">{row.tipoContenedor}</span>
                    {row.destino && (
                      <span className="text-slate-400 ml-1.5 text-[11px]">&bull; {row.destino}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer de la Tabla */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-2 flex items-center justify-between text-xs text-slate-500">
          <span>Mostrando {filteredData.length} registros operativos</span>
          <span className="text-[11px] font-mono">LINK 1.720 Despacho Aduanero v2.4</span>
        </div>
      </div>
    </div>
  );
};
