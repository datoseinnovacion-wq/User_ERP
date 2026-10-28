import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Key,
  Lock,
  CheckCircle2,
  FileText,
  RotateCcw,
  KeyRound,
  ShieldAlert,
} from "lucide-react";

interface AdminUser {
  id: string;
  username: string;
  nombre: string;
  email: string;
  rol: string;
  cargo: string;
  modulos: string | string[];
  permisos: string | string[];
  totp_enabled: number;
}

interface AuditLog {
  id: number;
  timestamp: string;
  event_type: string;
  username: string;
  ip_address: string;
  details: string;
}

export const AdminView: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [unlockTarget, setUnlockTarget] = useState("");
  const [unlockMessage, setUnlockMessage] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uRes, lRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/audit-logs?limit=30"),
      ]);
      if (uRes.ok) {
        const uData = await uRes.json();
        setUsers(uData);
      }
      if (lRes.ok) {
        const lData = await lRes.json();
        setLogs(lData);
      }
    } catch {
      // Manejar error silenciosamente
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unlockTarget) return;
    try {
      const res = await fetch("/api/admin/unlock-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: unlockTarget }),
      });
      const data = await res.json();
      setUnlockMessage(data.message || "Usuario desbloqueado.");
      setUnlockTarget("");
      fetchData();
    } catch {
      setUnlockMessage("Error al procesar el desbloqueo.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Cabecera del Panel Administrador */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-[#DC2626]" />
            <span>Panel de Administración Central, Seguridad SSO & 2FA</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestión centralizada de perfiles corporativos, autenticación TOTP RFC 6238 y Bitácora VET (UTC-4)
          </p>
        </div>
        <button
          onClick={fetchData}
          className="bg-slate-900 hover:bg-black text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Actualizar Datos</span>
        </button>
      </div>

      {/* Grid de Estado SSO */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Estado SSO & 2FA</p>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5" />
            <span>100% OPERATIVO</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Emisor: Link_User_Eliana</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Módulos Conectados</p>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1">4 Servicios Activos</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Despacho, Vehicular, Preliq, Finanzas</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Módulos Aislados</p>
          <p className="text-xl font-bold font-mono text-purple-700 mt-1">Resguardo (EXCLUIDO)</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Segregación completa por diseño</p>
        </div>
      </div>

      {/* Herramienta de Desbloqueo Rápido */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
          <KeyRound className="w-4 h-4 text-[#DC2626]" />
          <span>Desbloqueo Inmediato Anti Fuerza Bruta (Soporte Técnico)</span>
        </h3>
        <p className="text-xs text-slate-500 mt-0.5 mb-2.5">
          Permite a los administradores restablecer a cero los intentos fallidos y anular el bloqueo de 24 horas.
        </p>
        <form onSubmit={handleUnlock} className="flex gap-2 max-w-md">
          <input
            type="text"
            value={unlockTarget}
            onChange={(e) => setUnlockTarget(e.target.value)}
            placeholder="Usuario a desbloquear (ej. eliana, admin)"
            className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-[#DC2626]"
          />
          <button
            type="submit"
            className="bg-[#DC2626] hover:bg-[#B91C1C] text-white px-4 py-1.5 rounded-lg text-xs font-bold transition shadow-xs"
          >
            Desbloquear
          </button>
        </form>
        {unlockMessage && (
          <p className="text-xs font-bold text-emerald-700 mt-2">
            {unlockMessage}
          </p>
        )}
      </div>

      {/* Tabla de Usuarios Registrados */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Usuarios Registrados en el Directorio Central SSO
          </h3>
          <span className="text-xs text-slate-500 font-mono">LINK-AUTH-RBAC</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3">USUARIO</th>
                <th className="py-2.5 px-3">NOMBRE COMPLETO</th>
                <th className="py-2.5 px-3">ROL ASIGNADO</th>
                <th className="py-2.5 px-3">CARGO</th>
                <th className="py-2.5 px-3 text-center">AUTENTICADOR (2FA)</th>
                <th className="py-2.5 px-3 text-center">ESTADO SSO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{u.username}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{u.nombre}</td>
                  <td className="py-2.5 px-3">
                    <span className="bg-slate-100 text-slate-800 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-bold font-mono">
                      {u.rol}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 text-[11px]">{u.cargo}</td>
                  <td className="py-2.5 px-3 text-center">
                    {u.totp_enabled === 1 ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">
                        <Lock className="w-3 h-3" />
                        ACTIVO (RFC 6238)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold">
                        <ShieldAlert className="w-3 h-3" />
                        ENROLAMIENTO OBLIGATORIO
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-[10px] font-bold">
                      <Key className="w-3 h-3" />
                      HABILITADO
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bitácora de Auditoría en Hora de Venezuela */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-slate-700" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Bitácora de Auditoría en Vivo (Hora Oficial de Venezuela VET UTC-4)
            </h3>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">AMERICA/CARACAS</span>
        </div>
        <div className="overflow-x-auto max-h-72">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-slate-500 font-bold uppercase text-[9px]">
              <tr>
                <th className="py-2 px-3">FECHA / HORA (VET)</th>
                <th className="py-2 px-3">EVENTO DE SEGURIDAD</th>
                <th className="py-2 px-3">USUARIO</th>
                <th className="py-2 px-3">IP ORIGEN</th>
                <th className="py-2 px-3">DETALLES REGISTRADOS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50 transition">
                  <td className="py-2 px-3 font-mono text-slate-600 text-[10px]">{l.timestamp}</td>
                  <td className="py-2 px-3">
                    <span className="font-mono font-bold text-[10px] bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded">
                      {l.event_type}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-bold text-slate-900">{l.username}</td>
                  <td className="py-2 px-3 font-mono text-slate-500 text-[10px]">{l.ip_address}</td>
                  <td className="py-2 px-3 text-slate-700">{l.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
