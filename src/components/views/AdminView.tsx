import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  FileText,
  RotateCcw,
  KeyRound,
  ShieldAlert,
  UserPlus,
  Pencil,
  X,
} from "lucide-react";
import { adminFetch } from "../../config/adminApi";
import { ASSIGNABLE_MODULES, parseAccessList } from "../../config/modules";

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

const ROLES = ["ADMINISTRADOR", "GERENTE", "COORDINADOR", "OPERADOR", "ANALISTA_FINANZAS", "LIQUIDADOR"];

export const AdminView: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [unlockTarget, setUnlockTarget] = useState("");
  const [unlockMessage, setUnlockMessage] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [createForm, setCreateForm] = useState({
    username: "",
    password: "",
    nombre: "",
    email: "",
    rol: "GERENTE",
    cargo: "",
    modulos: [] as string[],
  });

  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [editModulos, setEditModulos] = useState<string[]>([]);
  const [editRol, setEditRol] = useState("GERENTE");
  const [editCargo, setEditCargo] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uRes, lRes] = await Promise.all([
        adminFetch("/api/admin/users"),
        adminFetch("/api/admin/audit-logs?limit=30"),
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
    void fetchData();
  }, []);

  const toggleCreateModule = (key: string) => {
    setCreateForm((prev) => ({
      ...prev,
      modulos: prev.modulos.includes(key)
        ? prev.modulos.filter((m) => m !== key)
        : [...prev.modulos, key],
    }));
  };

  const toggleEditModule = (key: string) => {
    setEditModulos((prev) =>
      prev.includes(key) ? prev.filter((m) => m !== key) : [...prev, key]
    );
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unlockTarget) return;
    try {
      const res = await adminFetch("/api/admin/unlock-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: unlockTarget }),
      });
      const data = await res.json();
      setUnlockMessage(data.message || "Usuario desbloqueado.");
      setUnlockTarget("");
      await fetchData();
    } catch {
      setUnlockMessage("Error al procesar el desbloqueo.");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMessage("");
    setFormError("");
    setSaving(true);
    try {
      const res = await adminFetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: createForm.username.trim(),
          password: createForm.password,
          nombre: createForm.nombre.trim(),
          email: createForm.email.trim() || undefined,
          rol: createForm.rol,
          cargo: createForm.cargo.trim() || createForm.rol,
          modulos: createForm.modulos,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(data.detail || "No se pudo crear el usuario.");
        return;
      }
      setFormMessage(`Perfil «${createForm.username}» creado. Debe completar 2FA en el primer ingreso.`);
      setCreateForm({
        username: "",
        password: "",
        nombre: "",
        email: "",
        rol: "GERENTE",
        cargo: "",
        modulos: [],
      });
      await fetchData();
    } catch {
      setFormError("Error de red al crear el perfil.");
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (u: AdminUser) => {
    setEditUser(u);
    setEditModulos(parseAccessList(u.modulos).map((m) => m.toUpperCase()));
    setEditRol(u.rol || "GERENTE");
    setEditCargo(u.cargo || "");
    setFormError("");
    setFormMessage("");
  };

  const handleSaveEdit = async () => {
    if (!editUser) return;
    setSaving(true);
    setFormError("");
    setFormMessage("");
    try {
      const res = await adminFetch(`/api/admin/users/${encodeURIComponent(editUser.username)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modulos: editModulos,
          rol: editRol,
          cargo: editCargo,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(data.detail || "No se pudo actualizar el acceso.");
        return;
      }
      setFormMessage(`Acceso de «${editUser.username}» actualizado.`);
      setEditUser(null);
      await fetchData();
    } catch {
      setFormError("Error de red al actualizar el acceso.");
    } finally {
      setSaving(false);
    }
  };

  const moduleChips = (raw: string | string[]) => {
    const list = parseAccessList(raw);
    if (!list.length) {
      return <span className="text-[10px] text-slate-400">Sin módulos</span>;
    }
    return (
      <div className="flex flex-wrap gap-1">
        {list.map((m) => (
          <span
            key={m}
            className="bg-slate-100 text-slate-700 border border-slate-200 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold"
          >
            {m}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-[#DC2626]" />
            <span>Panel de Administración Central, Seguridad SSO & 2FA</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Crea perfiles, asigna módulos y gestiona autenticación TOTP RFC 6238
          </p>
        </div>
        <button
          onClick={fetchData}
          type="button"
          className="bg-slate-900 hover:bg-black text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Actualizar Datos</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Estado SSO & 2FA</p>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5" />
            <span>100% OPERATIVO</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Emisor: Link_User_ERP</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Módulos Conectados</p>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1">4 Servicios Activos</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Despacho, Vehicular, Preliq, Finanzas</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Perfiles</p>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1">{users.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Directorio central SSO</p>
        </div>
      </div>

      {(formMessage || formError) && (
        <div
          className={`rounded-xl px-3.5 py-2.5 text-xs font-medium border ${
            formError
              ? "bg-rose-50 text-rose-800 border-rose-200"
              : "bg-emerald-50 text-emerald-800 border-emerald-200"
          }`}
        >
          {formError || formMessage}
        </div>
      )}

      {/* Crear perfil */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5 mb-3">
          <UserPlus className="w-4 h-4 text-[#DC2626]" />
          <span>Crear perfil</span>
        </h3>
        <form onSubmit={handleCreate} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            <label className="block text-[10px] font-bold text-slate-500 uppercase">
              Usuario
              <input
                required
                value={createForm.username}
                onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                className="mt-1 w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-[#DC2626]"
                placeholder="eliana"
              />
            </label>
            <label className="block text-[10px] font-bold text-slate-500 uppercase">
              Clave temporal
              <input
                required
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                className="mt-1 w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-[#DC2626]"
                placeholder="Clave inicial"
              />
            </label>
            <label className="block text-[10px] font-bold text-slate-500 uppercase">
              Nombre completo
              <input
                required
                value={createForm.nombre}
                onChange={(e) => setCreateForm({ ...createForm, nombre: e.target.value })}
                className="mt-1 w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-[#DC2626]"
                placeholder="Eliana Da Costa"
              />
            </label>
            <label className="block text-[10px] font-bold text-slate-500 uppercase">
              Email
              <input
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                className="mt-1 w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-[#DC2626]"
                placeholder="eliana@link1720.com"
              />
            </label>
            <label className="block text-[10px] font-bold text-slate-500 uppercase">
              Rol
              <select
                value={createForm.rol}
                onChange={(e) => setCreateForm({ ...createForm, rol: e.target.value })}
                className="mt-1 w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-[#DC2626]"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-[10px] font-bold text-slate-500 uppercase">
              Cargo
              <input
                value={createForm.cargo}
                onChange={(e) => setCreateForm({ ...createForm, cargo: e.target.value })}
                className="mt-1 w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-[#DC2626]"
                placeholder="Gerente de Operaciones"
              />
            </label>
          </div>

          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase mb-1.5">
              Módulos a los que puede acceder
            </p>
            <div className="flex flex-wrap gap-2">
              {ASSIGNABLE_MODULES.map((m) => {
                const on = createForm.modulos.includes(m.key);
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => toggleCreateModule(m.key)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition ${
                      on
                        ? "bg-[#18181B] text-white border-[#18181B]"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                    }`}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving || createForm.modulos.length === 0}
            className="bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-50 text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow-xs"
          >
            {saving ? "Guardando…" : "Crear perfil"}
          </button>
        </form>
      </div>

      {/* Desbloqueo */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
          <KeyRound className="w-4 h-4 text-[#DC2626]" />
          <span>Desbloqueo Inmediato Anti Fuerza Bruta (Soporte Técnico)</span>
        </h3>
        <p className="text-xs text-slate-500 mt-0.5 mb-2.5">
          Restablece intentos fallidos y anula el bloqueo de 24 horas.
        </p>
        <form onSubmit={handleUnlock} className="flex gap-2 max-w-md">
          <label htmlFor="admin-unlock-user" className="sr-only">
            Usuario a desbloquear
          </label>
          <input
            id="admin-unlock-user"
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
          <p className="text-xs font-bold text-emerald-700 mt-2">{unlockMessage}</p>
        )}
      </div>

      {/* Tabla usuarios */}
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
                <th className="py-2.5 px-3">NOMBRE</th>
                <th className="py-2.5 px-3">ROL</th>
                <th className="py-2.5 px-3">MÓDULOS</th>
                <th className="py-2.5 px-3 text-center">2FA</th>
                <th className="py-2.5 px-3 text-center">ACCIÓN</th>
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
                  <td className="py-2.5 px-3">{moduleChips(u.modulos)}</td>
                  <td className="py-2.5 px-3 text-center">
                    {u.totp_enabled === 1 ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">
                        <Lock className="w-3 h-3" />
                        ACTIVO
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold">
                        <ShieldAlert className="w-3 h-3" />
                        PENDIENTE
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => openEdit(u)}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700 hover:text-[#DC2626] border border-slate-200 hover:border-rose-200 px-2 py-1 rounded-lg transition"
                    >
                      <Pencil className="w-3 h-3" />
                      Editar acceso
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bitácora */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-slate-700" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Bitácora de Auditoría (VET UTC-4)
            </h3>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">AMERICA/CARACAS</span>
        </div>
        <div className="overflow-x-auto max-h-72">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-slate-500 font-bold uppercase text-[9px]">
              <tr>
                <th className="py-2 px-3">FECHA / HORA (VET)</th>
                <th className="py-2 px-3">EVENTO</th>
                <th className="py-2 px-3">USUARIO</th>
                <th className="py-2 px-3">IP</th>
                <th className="py-2 px-3">DETALLES</th>
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

      {/* Modal editar acceso */}
      {editUser && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Editar acceso</h3>
                <p className="text-xs text-slate-500 mt-0.5 font-mono">@{editUser.username}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <label className="block text-[10px] font-bold text-slate-500 uppercase">
              Rol
              <select
                value={editRol}
                onChange={(e) => setEditRol(e.target.value)}
                className="mt-1 w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-[#DC2626]"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-[10px] font-bold text-slate-500 uppercase">
              Cargo
              <input
                value={editCargo}
                onChange={(e) => setEditCargo(e.target.value)}
                className="mt-1 w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-[#DC2626]"
              />
            </label>

            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase mb-1.5">Módulos</p>
              <div className="flex flex-wrap gap-2">
                {ASSIGNABLE_MODULES.map((m) => {
                  const on = editModulos.includes(m.key);
                  return (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => toggleEditModule(m.key)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition ${
                        on
                          ? "bg-[#18181B] text-white border-[#18181B]"
                          : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                      }`}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setEditUser(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 border border-slate-200 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void handleSaveEdit()}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-50"
              >
                {saving ? "Guardando…" : "Guardar acceso"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
