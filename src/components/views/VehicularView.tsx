import React, { useState } from "react";
import { Truck, Plus, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";

export const VehicularView: React.FC = () => {
  const [trucks] = useState([
    { id: "1", placa: "A92BL4K", modelo: "Mack Granite", chofer: "José Ramírez", cedula: "V-14.892.401", telefono: "0414-9421882", estado: "DISPONIBLE", viajes: 42 },
    { id: "2", placa: "A15CK9P", modelo: "Iveco Stralis", chofer: "Carlos Mendoza", cedula: "V-16.782.110", telefono: "0412-3319022", estado: "ASIGNADO", viajes: 67 },
    { id: "3", placa: "A88DH2M", modelo: "Freightliner", chofer: "Manuel Gómez", cedula: "V-12.441.905", telefono: "0424-8891230", estado: "EN_RUTA", viajes: 104 },
    { id: "4", placa: "A02FF7L", modelo: "Mack Vision", chofer: "Alejandro Pérez", cedula: "V-19.002.341", telefono: "0414-5512033", estado: "DISPONIBLE", viajes: 19 },
  ]);

  return (
    <div className="space-y-4">
      {/* Cabecera del Módulo Vehicular */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Truck className="w-5 h-5 text-red-600" />
            <span>Módulo de Asignación Vehicular & Flota</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestión de transporte pesado, control de conductores y órdenes de despacho portuario
          </p>
        </div>
        <button className="bg-red-600 hover:bg-red-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-sm">
          <Plus className="w-4 h-4" />
          <span>Registrar Nuevo Camión</span>
        </button>
      </div>

      {/* Grid de Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Flota Total Activa</p>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-1">28 Unidades</p>
          <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Bolipuertos & Patio Central</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Unidades Disponibles</p>
          <p className="text-2xl font-bold font-mono text-emerald-600 mt-1">11 Camiones</p>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">Listos para asignar contenedor</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Unidades en Ruta / Despacho</p>
          <p className="text-2xl font-bold font-mono text-red-600 mt-1">17 Camiones</p>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">En tránsito hacia clientes</p>
        </div>
      </div>

      {/* Tabla de Flota */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Catálogo Oficial de Camiones & Conductores
          </h3>
          <span className="text-xs text-slate-500 font-mono">LINK-OPS-VEH-01</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3">ESTADO</th>
                <th className="py-2.5 px-3">PLACA</th>
                <th className="py-2.5 px-3">MODELO / CHUTO</th>
                <th className="py-2.5 px-3">CONDUCTOR ASIGNADO</th>
                <th className="py-2.5 px-3">CÉDULA</th>
                <th className="py-2.5 px-3">TELÉFONO</th>
                <th className="py-2.5 px-3 text-center">HISTÓRICO VIAJES</th>
                <th className="py-2.5 px-3 text-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {trucks.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition">
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    {t.estado === "DISPONIBLE" ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        DISPONIBLE
                      </span>
                    ) : t.estado === "ASIGNADO" ? (
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-[10px] font-bold">
                        <ShieldCheck className="w-3 h-3" />
                        ASIGNADO
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold">
                        <AlertCircle className="w-3 h-3" />
                        EN RUTA
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{t.placa}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">{t.modelo}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{t.chofer}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{t.cedula}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{t.telefono}</td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-700">{t.viajes}</td>
                  <td className="py-2.5 px-3 text-right">
                    <button className="text-red-600 hover:text-red-800 font-bold text-[11px] hover:underline">
                      Asignar Carga ➜
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
