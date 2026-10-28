import React, { useState } from "react";
import { Receipt, UploadCloud, RefreshCw, CheckCheck, AlertCircle, ArrowUpRight } from "lucide-react";

export const FinanzasView: React.FC = () => {
  const [bcvRate] = useState(48.25);
  const [transactions] = useState([
    { id: "TX-9012", banco: "Banesco", referencia: "89123812", montoBs: 48250.00, montoUSD: 1000.00, tasa: 48.25, conciliado: true, expediente: "EXP-2026-001" },
    { id: "TX-9013", banco: "Mercantil", referencia: "55419201", montoBs: 24125.00, montoUSD: 500.00, tasa: 48.25, conciliado: true, expediente: "EXP-2026-002" },
    { id: "TX-9014", banco: "BNC", referencia: "11928374", montoBs: 86850.00, montoUSD: 1800.00, tasa: 48.25, conciliado: false, expediente: "EXP-2026-003" },
  ]);

  return (
    <div className="space-y-4">
      {/* Cabecera del Módulo Finanzas */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Receipt className="w-5 h-5 text-blue-600" />
            <span>Módulo de Finanzas & Conciliación Bancaria (CxP)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Automatización de estados de cuenta, conciliación de transferencias, tasas BCV y control de devaluación
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 border border-slate-200">
            <UploadCloud className="w-4 h-4 text-blue-600" />
            <span>Subir Estado de Cuenta Excel</span>
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-sm">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Auto-Conciliar</span>
          </button>
        </div>
      </div>

      {/* Grid de Resumen Financiero & Tasa BCV */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tasa BCV Oficial Vigente</p>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-1">{bcvRate.toFixed(2)} Bs / USD</p>
          <p className="text-[11px] text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            Actualizado hoy automáticamente
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Movimientos Conciliados</p>
          <p className="text-2xl font-bold font-mono text-emerald-600 mt-1">94.8%</p>
          <p className="text-[11px] text-slate-400 mt-0.5">38 de 40 transferencias</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cuentas por Pagar (CxP)</p>
          <p className="text-2xl font-bold font-mono text-blue-600 mt-1">$4,850.00</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Navieras, fletes y almacenaje</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Desviación Cambiaria</p>
          <p className="text-2xl font-bold font-mono text-slate-800 mt-1">0.00%</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Alineación exacta con tasa de cierre</p>
        </div>
      </div>

      {/* Tabla de Movimientos Bancarios */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Libro de Movimientos Bancarios & Comprobantes
          </h3>
          <span className="text-xs text-slate-500 font-mono">LINK-FINANZAS-CXP</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3">ESTADO</th>
                <th className="py-2.5 px-3">BANCO</th>
                <th className="py-2.5 px-3">REFERENCIA</th>
                <th className="py-2.5 px-3 text-right">MONTO BS.</th>
                <th className="py-2.5 px-3 text-right">MONTO USD</th>
                <th className="py-2.5 px-3 text-center">TASA APLICADA</th>
                <th className="py-2.5 px-3">EXPEDIENTE</th>
                <th className="py-2.5 px-3 text-right">COMPROBANTE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 transition">
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    {tx.conciliado ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">
                        <CheckCheck className="w-3 h-3" />
                        CONCILIADO
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold">
                        <AlertCircle className="w-3 h-3" />
                        PENDIENTE
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">{tx.banco}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{tx.referencia}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-700">Bs. {tx.montoBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-700">${tx.montoUSD.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-center font-mono text-slate-600">{tx.tasa.toFixed(2)}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-700 font-semibold">{tx.expediente}</td>
                  <td className="py-2.5 px-3 text-right">
                    <button className="text-blue-700 hover:text-blue-900 font-bold text-[11px] hover:underline">
                      Ver PDF ➜
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
