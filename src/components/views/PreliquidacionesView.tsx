import React, { useState } from "react";
import { Scale, Plus, DollarSign, FileText, CheckCircle2 } from "lucide-react";

export const PreliquidacionesView: React.FC = () => {
  const [expedientes] = useState([
    { id: "EXP-2026-001", cliente: "RAFAEL", dua: "C-57772", bultos: 120, costoUSD: 2450.00, ventaUSD: 3600.00, utilidadUSD: 1150.00, estado: "PRELIQUIDADO" },
    { id: "EXP-2026-002", cliente: "STAR WHITE", dua: "C-58107", bultos: 48, costoUSD: 1200.00, ventaUSD: 1850.00, utilidadUSD: 650.00, estado: "EN_REVISION" },
    { id: "EXP-2026-003", cliente: "CHINO ALONSO", dua: "C-57670", bultos: 260, costoUSD: 4100.00, ventaUSD: 5900.00, utilidadUSD: 1800.00, estado: "LIQUIDADO" },
  ]);

  return (
    <div className="space-y-4">
      {/* Cabecera del Módulo Preliquidaciones */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Scale className="w-5 h-5 text-amber-600" />
            <span>Módulo de Preliquidaciones & Ficha USD</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cálculo analítico de costos operativos, rubros aduaneros, utilidades y facturación preliminar
          </p>
        </div>
        <button className="bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-sm">
          <Plus className="w-4 h-4" />
          <span>Crear Nuevo Expediente</span>
        </button>
      </div>

      {/* Tarjetas Métricas Financieras */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Costo Total USD</p>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1">$7,750.00</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Gastos portuarios & fletes</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ventas Estimadas USD</p>
          <p className="text-xl font-bold font-mono text-blue-600 mt-1">$11,350.00</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Facturación a clientes</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Margen Bruto Proyectado</p>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-1">$3,600.00</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">+31.7% Margen Neto</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tasa Oficial de Cambio</p>
          <p className="text-xl font-bold font-mono text-slate-800 mt-1">BCV Oficial</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Sincronización en tiempo real</p>
        </div>
      </div>

      {/* Tabla de Expedientes */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Expedientes de Preliquidación Activos
          </h3>
          <span className="text-xs text-slate-500 font-mono">LINK-PRELIQ-EXP</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3">EXPEDIENTE</th>
                <th className="py-2.5 px-3">CLIENTE</th>
                <th className="py-2.5 px-3">DUA</th>
                <th className="py-2.5 px-3 text-right">COSTO TOTAL</th>
                <th className="py-2.5 px-3 text-right">VENTA TOTAL</th>
                <th className="py-2.5 px-3 text-right">UTILIDAD</th>
                <th className="py-2.5 px-3 text-center">ESTADO</th>
                <th className="py-2.5 px-3 text-right">DETALLE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expedientes.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50 transition">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{exp.id}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{exp.cliente}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-700">{exp.dua}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-700">${exp.costoUSD.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-700">${exp.ventaUSD.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600">${exp.utilidadUSD.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      {exp.estado}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button className="text-amber-700 hover:text-amber-900 font-bold text-[11px] hover:underline flex items-center justify-end gap-1 ml-auto">
                      <FileText className="w-3.5 h-3.5" />
                      Ficha USD
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
