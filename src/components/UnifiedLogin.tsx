import React, { useState, useEffect } from "react";
import {
  Lock,
  Mail,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  Copy,
  Check,
  Download,
  KeyRound,
  ArrowLeft,
  Clock,
  AlertTriangle,
  Building,
  Truck,
  Layers,
  Users
} from "lucide-react";
import { UserSession } from "../types";

interface LoginProps {
  onLoginSuccess: (user: UserSession) => void;
}

type AuthViewMode = "CREDENTIALS" | "2FA_VERIFY" | "ONBOARDING";

export const UnifiedLogin: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("eliana");
  const [password, setPassword] = useState("GerenLink2026!");
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  // Estados del flujo 2FA
  const [viewMode, setViewMode] = useState<AuthViewMode>("CREDENTIALS");
  const [tempToken, setTempToken] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);

  // Estados del Onboarding Obligatorio (3 pasos)
  const [onboardingStep, setOnboardingStep] = useState<1 | 2 | 3>(1);
  const [qrCodeDataUri, setQrCodeDataUri] = useState("");
  const [manualSecret, setManualSecret] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showManualKey, setShowManualKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);

  // Detección de Parámetro de Inactividad
  const [inactivityNotice, setInactivityNotice] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("reason") === "inactividad") {
      setInactivityNotice(true);
    }
  }, []);

  const handleQuickSelect = (key: string) => {
    if (isLocked) return;
    setUsername(key);
    setPassword(key === "eliana" ? "GerenLink2026!" : "LinkMaster1720!");
    setError("");
    setWarning("");
  };

  // 1. Envío de Credenciales Primarias (Paso 1)
  const handlePrimarySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    setError("");
    setWarning("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: username, password }),
      });

      const data = await response.json();

      if (response.status === 429) {
        setIsLocked(true);
        setError(
          data.detail?.message ||
            "Ha superado el límite de 3 intentos fallidos permitidos. Su acceso ha sido bloqueado temporalmente por 24 horas por motivos de seguridad."
        );
        return;
      }

      if (!response.ok) {
        const detailMsg =
          typeof data.detail === "object" ? data.detail?.message : data.detail;
        setError(detailMsg || "Credenciales incorrectas en el directorio central.");
        return;
      }

      // Procesar respuesta según estado 2FA
      if (data.status === "ONBOARDING_REQUIRED") {
        setTempToken(data.temp_token);
        setQrCodeDataUri(data.qr_code);
        setManualSecret(data.secret);
        setBackupCodes(data.backup_codes || []);
        setViewMode("ONBOARDING");
        setOnboardingStep(1);
      } else if (data.status === "2FA_REQUIRED") {
        setTempToken(data.temp_token);
        setViewMode("2FA_VERIFY");
      } else {
        localStorage.setItem("link_sso_user", JSON.stringify(data.user));
        localStorage.setItem("link_sso_token", data.token);
        onLoginSuccess(data.user);
      }
    } catch {
      setError("No fue posible conectar con el servidor de autenticación.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Validación de Token 2FA (Paso 2)
  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = useBackupCode
        ? "/api/auth/2fa/verify-backup"
        : "/api/auth/2fa/verify";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ temp_token: tempToken, code: totpCode }),
      });

      const data = await response.json();

      if (response.status === 429) {
        setIsLocked(true);
        setViewMode("CREDENTIALS");
        setError(
          data.detail?.message ||
            "Ha superado el límite de 3 intentos fallidos permitidos. Su acceso ha sido bloqueado temporalmente por 24 horas por motivos de seguridad."
        );
        return;
      }

      if (!response.ok) {
        const detailMsg =
          typeof data.detail === "object" ? data.detail?.message : data.detail;
        setError(detailMsg || "Código 2FA incorrecto o expirado.");
        return;
      }

      localStorage.setItem("link_sso_user", JSON.stringify(data.user));
      localStorage.setItem("link_sso_token", data.token);
      onLoginSuccess(data.user);
    } catch {
      setError("Error validando el código 2FA con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Activación y Enrolamiento de 2FA (Paso 3 del Onboarding)
  const handleActivate2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/2fa/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ temp_token: tempToken, code: totpCode }),
      });

      const data = await response.json();

      if (response.status === 429) {
        setIsLocked(true);
        setViewMode("CREDENTIALS");
        setError(
          data.detail?.message ||
            "Ha superado el límite de 3 intentos fallidos permitidos. Su acceso ha sido bloqueado temporalmente por 24 horas por motivos de seguridad."
        );
        return;
      }

      if (!response.ok) {
        const detailMsg =
          typeof data.detail === "object" ? data.detail?.message : data.detail;
        setError(detailMsg || "Código de confirmación incorrecto. Verifique su app Google Authenticator.");
        return;
      }

      localStorage.setItem("link_sso_user", JSON.stringify(data.user));
      localStorage.setItem("link_sso_token", data.token);
      onLoginSuccess(data.user);
    } catch {
      setError("Error activando el factor de autenticación.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, isCodes = false) => {
    navigator.clipboard.writeText(text);
    if (isCodes) {
      setCopiedCodes(true);
      setTimeout(() => setCopiedCodes(false), 2000);
    } else {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const downloadBackupCodes = () => {
    const textContent =
      `=====================================================\n` +
      `SISTEMA ERP - HOLDING DE COMERCIO EXTERIOR & LOGÍSTICA\n` +
      `Códigos de Respaldo 2FA (Google Authenticator RFC 6238)\n` +
      `Sistema Oficial: Sistema_ERP\n` +
      `Usuario: ${username}\n` +
      `Fecha de Emisión: ${new Date().toLocaleString()}\n` +
      `=====================================================\n\n` +
      `EMPRESAS INTEGRADAS EN EL HOLDING:\n` +
      `• Link 1.720 Agentes Aduanales S.A. (Aduanas & Nacionalización)\n` +
      `• Logi (Transporte Terrestre & Flota Vehicular)\n` +
      `• Consolidadora de Carga (LCL / FCL & Almacén)\n` +
      `• Portal de Consignatarios (Clientes & Tracking)\n\n` +
      `INSTRUCCIONES DE SEGURIDAD:\n` +
      `Cada código puede ser utilizado exactamente UNA SOLA VEZ para acceder si pierde su teléfono.\n` +
      `Guarde este archivo en un lugar cifrado o imprímalo en físico.\n\n` +
      `CÓDIGOS DE EMERGENCIA DE UN SOLO USO:\n` +
      backupCodes.map((c, i) => `  [${i + 1}] ${c}`).join("\n") +
      `\n\n=====================================================\n`;

    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `codigos_respaldo_Sistema_ERP_${username}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#070D18] flex flex-col justify-center items-center p-4 relative overflow-hidden select-none font-sans">
      {/* Resplandores ambientales cibernéticos */}
      <div className="absolute top-1/6 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/6 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-950/20 via-[#070D18]/90 to-[#040810] pointer-events-none" />

      {/* Contenedor Principal Glassmorphism */}
      <div className="w-full max-w-lg bg-[#0C1527]/90 backdrop-blur-xl border border-cyan-500/30 rounded-3xl shadow-[0_0_60px_rgba(0,194,203,0.18)] p-6 sm:p-9 relative overflow-hidden text-slate-100 z-10">
        
        {/* Barra superior con gradiente cian-azul-naranja inspirado en el logo */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-400 via-sky-500 to-orange-500" />

        {/* Cabecera con Banner Oficial SISTEMA ERP */}
        <div className="text-center mb-6">
          <div className="relative inline-block mx-auto mb-2">
            <img
              src="/sistema_erp_banner.png"
              alt="SISTEMA ERP"
              className="max-h-24 sm:max-h-28 mx-auto object-contain drop-shadow-[0_8px_24px_rgba(0,229,255,0.25)] rounded-xl"
            />
          </div>
          <div className="flex items-center justify-center space-x-1.5 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <p className="text-[11px] font-mono tracking-widest text-cyan-300 font-semibold uppercase">
              Plataforma Central Multiempresas
            </p>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Gateway Seguro SSO &bull; Autenticación TOTP RFC 6238
          </p>

          {/* Insignias de las 4 Empresas del Holding */}
          <div className="grid grid-cols-4 gap-1 mt-3 px-2 py-1.5 bg-[#060D1A]/80 border border-cyan-900/40 rounded-xl text-[9px] font-semibold text-slate-300">
            <div className="flex items-center justify-center space-x-1 py-0.5">
              <Building className="w-2.5 h-2.5 text-cyan-400" />
              <span>Link</span>
            </div>
            <div className="flex items-center justify-center space-x-1 py-0.5">
              <Truck className="w-2.5 h-2.5 text-orange-400" />
              <span>Logi</span>
            </div>
            <div className="flex items-center justify-center space-x-1 py-0.5">
              <Layers className="w-2.5 h-2.5 text-sky-400" />
              <span>Consolidadora</span>
            </div>
            <div className="flex items-center justify-center space-x-1 py-0.5">
              <Users className="w-2.5 h-2.5 text-emerald-400" />
              <span>Consignatarios</span>
            </div>
          </div>
        </div>

        {/* BANNER 1: Cierre por Inactividad */}
        {inactivityNotice && (
          <div className="mb-4 bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs rounded-xl p-3 flex items-start space-x-2">
            <Clock className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <div>
              <p className="font-bold">Sesión Finalizada por Inactividad</p>
              <p className="mt-0.5 text-[11px] text-amber-300/90">
                Su sesión ha finalizado automáticamente tras 5 minutos de inactividad por motivos de seguridad.
              </p>
            </div>
          </div>
        )}

        {/* BANNER 2: Bloqueo Anti Fuerza Bruta (24h) */}
        {isLocked && (
          <div className="mb-4 bg-red-950/70 border border-red-500/50 text-red-200 text-xs rounded-xl p-3 flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <div>
              <p className="font-bold">Acceso Temporalmente Bloqueado</p>
              <p className="mt-0.5 text-[11px] text-red-300/90">
                Ha superado el límite de 3 intentos fallidos permitidos. Su acceso ha sido bloqueado temporalmente por 24 horas por motivos de seguridad.
              </p>
            </div>
          </div>
        )}

        {/* Mensaje de Error / Aviso de Intentos */}
        {error && !isLocked && (
          <div className="mb-4 bg-red-950/60 border border-red-500/40 text-red-300 text-xs rounded-xl p-3 flex items-start space-x-2">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* ========================================================
            VISTA 1: INGRESO DE CREDENCIALES PRIMARIAS
           ======================================================== */}
        {viewMode === "CREDENTIALS" && (
          <>
            {/* Acceso Rápido de Perfil Autorizado */}
            <div className="mb-5 bg-[#060D1A]/90 p-2.5 rounded-2xl border border-cyan-900/40">
              <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider px-2 mb-2">
                Seleccionar Perfil Autorizado (SSO):
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  disabled={isLocked}
                  onClick={() => handleQuickSelect("eliana")}
                  className={`px-2 py-2 rounded-xl text-xs font-semibold text-center transition flex flex-col items-center justify-center ${
                    username === "eliana"
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                      : "bg-[#0B1527] text-slate-300 border border-slate-700/60 hover:border-cyan-500/50 hover:text-white disabled:opacity-40"
                  }`}
                >
                  <span>Eliana Da Costa</span>
                  <span className="text-[9px] opacity-80">Gerencia Link</span>
                </button>
                <button
                  type="button"
                  disabled={isLocked}
                  onClick={() => handleQuickSelect("admin")}
                  className={`px-2 py-2 rounded-xl text-xs font-semibold text-center transition flex flex-col items-center justify-center ${
                    username === "admin"
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                      : "bg-[#0B1527] text-slate-300 border border-slate-700/60 hover:border-cyan-500/50 hover:text-white disabled:opacity-40"
                  }`}
                >
                  <span>Administrador</span>
                  <span className="text-[9px] opacity-80">Holding Master</span>
                </button>
                <button
                  type="button"
                  disabled={isLocked}
                  onClick={() => handleQuickSelect("coordinador")}
                  className={`px-2 py-2 rounded-xl text-xs font-semibold text-center transition flex flex-col items-center justify-center ${
                    username === "coordinador"
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                      : "bg-[#0B1527] text-slate-300 border border-slate-700/60 hover:border-cyan-500/50 hover:text-white disabled:opacity-40"
                  }`}
                >
                  <span>Coordinador</span>
                  <span className="text-[9px] opacity-80">Operaciones</span>
                </button>
              </div>
            </div>

            <form onSubmit={handlePrimarySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Usuario o Correo Corporativo
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    disabled={isLocked}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ej. eliana"
                    className="w-full text-xs pl-10 pr-3 py-3 bg-[#060D1A] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:bg-[#081224] focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition disabled:bg-slate-900 disabled:text-slate-600"
                  />
                  <Mail className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Contraseña de Acceso
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    disabled={isLocked}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full text-xs pl-10 pr-3 py-3 bg-[#060D1A] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:bg-[#081224] focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition disabled:bg-slate-900 disabled:text-slate-600"
                  />
                  <Lock className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || isLocked}
                className="w-full mt-2 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black py-3 px-4 rounded-xl text-xs tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(6,182,212,0.35)] hover:shadow-[0_0_30px_rgba(6,182,212,0.55)] flex items-center justify-center space-x-2 disabled:opacity-40"
              >
                {isLocked ? (
                  <span>Acceso Bloqueado (24h)</span>
                ) : loading ? (
                  <span>Validando credenciales…</span>
                ) : (
                  <>
                    <span>Ingresar al Sistema ERP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </>
        )}

        {/* ========================================================
            VISTA 2: VERIFICACIÓN 2FA OBLIGATORIA
           ======================================================== */}
        {viewMode === "2FA_VERIFY" && (
          <form onSubmit={handle2FASubmit} className="space-y-4">
            <div className="text-center p-3 bg-[#060D1A] rounded-2xl border border-cyan-900/50">
              <ShieldCheck className="w-8 h-8 text-cyan-400 mx-auto mb-1" />
              <p className="text-xs font-bold text-white">Verificación de Dos Factores (2FA)</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Google Authenticator &bull; Emisor: <span className="font-semibold text-cyan-300">Sistema_ERP</span>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                {useBackupCode ? "Código de Respaldo de Emergencia" : "Código de Seguridad (6 Dígitos)"}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  autoFocus
                  maxLength={useBackupCode ? 10 : 6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.toUpperCase())}
                  placeholder={useBackupCode ? "XXXX-XXXX" : "123456"}
                  className="w-full text-center text-xl font-mono font-bold tracking-widest pl-3 pr-3 py-3 bg-[#060D1A] border border-cyan-500/50 rounded-xl text-cyan-300 focus:bg-[#081224] focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition"
                />
              </div>
            </div>

            <div className="flex justify-between items-center text-xs">
              <button
                type="button"
                onClick={() => {
                  setUseBackupCode(!useBackupCode);
                  setTotpCode("");
                  setError("");
                }}
                className="text-cyan-400 hover:text-cyan-300 font-semibold underline text-[11px]"
              >
                {useBackupCode ? "Usar app Google Authenticator" : "Usar código de respaldo"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode("CREDENTIALS");
                  setTotpCode("");
                  setError("");
                }}
                className="text-slate-400 hover:text-slate-200 text-[11px] flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Volver</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || !totpCode}
              className="w-full mt-2 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black py-3 px-4 rounded-xl text-xs tracking-wider uppercase transition shadow-[0_0_20px_rgba(6,182,212,0.35)] flex items-center justify-center space-x-2 disabled:opacity-40"
            >
              {loading ? (
                <span>Verificando código…</span>
              ) : (
                <>
                  <span>Verificar y Conceder Sesión</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* ========================================================
            VISTA 3: ASISTENTE DE ENROLAMIENTO OBLIGATORIO (3 PASOS)
           ======================================================== */}
        {viewMode === "ONBOARDING" && (
          <div className="space-y-4">
            {/* Indicador de Pasos */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
              <div className="flex items-center space-x-1.5">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    onboardingStep === 1
                      ? "bg-cyan-400 text-slate-950 font-black shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  1
                </span>
                <span className="text-[11px] font-bold text-slate-200">Escanear</span>
              </div>
              <div className="w-4 h-px bg-slate-700" />
              <div className="flex items-center space-x-1.5">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    onboardingStep === 2
                      ? "bg-cyan-400 text-slate-950 font-black shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  2
                </span>
                <span className="text-[11px] font-bold text-slate-200">Respaldos</span>
              </div>
              <div className="w-4 h-px bg-slate-700" />
              <div className="flex items-center space-x-1.5">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    onboardingStep === 3
                      ? "bg-cyan-400 text-slate-950 font-black shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  3
                </span>
                <span className="text-[11px] font-bold text-slate-200">Activar</span>
              </div>
            </div>

            {/* PASO 1: Escaneo de Código QR */}
            {onboardingStep === 1 && (
              <div className="space-y-3 text-center">
                <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                  Paso 1: Vincular Google Authenticator
                </h3>
                <p className="text-[11px] text-slate-300">
                  Abra su app <strong>Google Authenticator</strong> y escanee el código QR emitido para el sistema <strong>Sistema_ERP</strong>:
                </p>

                {qrCodeDataUri && (
                  <div className="inline-block p-2.5 bg-white border-2 border-cyan-400 rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                    <img
                      src={qrCodeDataUri}
                      alt="Código QR TOTP Sistema ERP"
                      className="w-44 h-44 mx-auto"
                    />
                  </div>
                )}

                <div>
                  <button
                    type="button"
                    onClick={() => setShowManualKey(!showManualKey)}
                    className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 underline"
                  >
                    {showManualKey ? "Ocultar clave manual" : "¿No puede escanear? Ver clave manual Base32"}
                  </button>

                  {showManualKey && (
                    <div className="mt-2 bg-[#060D1A] border border-cyan-800/60 p-2.5 rounded-xl flex items-center justify-between text-left">
                      <span className="font-mono text-xs font-bold text-cyan-300 tracking-wider">
                        {manualSecret}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(manualSecret, false)}
                        className="p-1.5 hover:bg-slate-800 rounded text-cyan-400"
                        title="Copiar Clave"
                      >
                        {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setOnboardingStep(2)}
                  className="w-full mt-2 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center space-x-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                >
                  <span>Continuar a Códigos de Respaldo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* PASO 2: Códigos de Respaldo (Grid + Copiar + Descargar) */}
            {onboardingStep === 2 && (
              <div className="space-y-3">
                <div className="text-center">
                  <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                    Paso 2: Códigos de Respaldo (Emergencia)
                  </h3>
                  <p className="text-[11px] text-slate-300 mt-1">
                    Guarde estos 8 códigos en un lugar seguro. Si pierde acceso a su app, podrá utilizarlos una sola vez:
                  </p>
                </div>

                {/* Rejilla de Códigos */}
                <div className="grid grid-cols-2 gap-2 bg-[#060D1A] border border-cyan-900/50 p-3 rounded-2xl">
                  {backupCodes.map((code, index) => (
                    <div
                      key={index}
                      className="bg-[#0B1527] border border-cyan-800/40 rounded-xl py-2 px-2 text-center font-mono text-xs font-bold text-cyan-200"
                    >
                      {code}
                    </div>
                  ))}
                </div>

                {/* Botones de Copiar y Descargar */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(backupCodes.join("\n"), true)}
                    className="flex items-center justify-center space-x-1 py-2 px-3 border border-cyan-700/60 hover:bg-cyan-950/40 rounded-xl text-xs font-semibold text-cyan-300 transition"
                  >
                    {copiedCodes ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCodes ? "¡Copiados!" : "Copiar Códigos"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={downloadBackupCodes}
                    className="flex items-center justify-center space-x-1 py-2 px-3 bg-cyan-900/40 hover:bg-cyan-800/50 border border-cyan-500/40 rounded-xl text-xs font-semibold text-white transition"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-300" />
                    <span>Descargar (.txt)</span>
                  </button>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => setOnboardingStep(1)}
                    className="text-xs text-slate-400 hover:text-white font-semibold"
                  >
                    Atrás
                  </button>
                  <button
                    type="button"
                    onClick={() => setOnboardingStep(3)}
                    className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black py-2 px-4 rounded-xl text-xs uppercase tracking-wider transition flex items-center space-x-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                  >
                    <span>Siguiente: Confirmar</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* PASO 3: Confirmación y Activación */}
            {onboardingStep === 3 && (
              <form onSubmit={handleActivate2FASubmit} className="space-y-4">
                <div className="text-center">
                  <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                    Paso 3: Confirmación y Activación
                  </h3>
                  <p className="text-[11px] text-slate-300 mt-1">
                    Escriba el código de 6 dígitos que muestra ahora la app Google Authenticator para confirmar la vinculación:
                  </p>
                </div>

                <div>
                  <input
                    type="text"
                    required
                    autoFocus
                    maxLength={6}
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value)}
                    placeholder="123456"
                    className="w-full text-center text-2xl font-mono font-bold tracking-widest py-3 bg-[#060D1A] border border-cyan-500/60 rounded-xl text-cyan-300 focus:bg-[#081224] focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition"
                  />
                </div>

                <div className="flex justify-between items-center text-xs">
                  <button
                    type="button"
                    onClick={() => setOnboardingStep(2)}
                    className="text-slate-400 hover:text-white font-semibold"
                  >
                    Atrás
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode("CREDENTIALS");
                      setOnboardingStep(1);
                      setTotpCode("");
                      setError("");
                    }}
                    className="text-slate-400 hover:text-slate-200 text-[11px]"
                  >
                    Cancelar
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading || totpCode.length < 6}
                  className="w-full mt-2 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black py-3 px-4 rounded-xl text-xs tracking-wider uppercase transition shadow-[0_0_20px_rgba(6,182,212,0.35)] flex items-center justify-center space-x-2 disabled:opacity-40"
                >
                  {loading ? (
                    <span>Activando 2FA…</span>
                  ) : (
                    <>
                      <span>Activar 2FA y Acceder</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Pie de Firma Institucional */}
        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
          <p className="text-[10px] text-slate-400">
            SISTEMA ERP &bull; LINK 1.720 Agentes Aduanales S.A. &bull; RIF J-503883587
          </p>
          <p className="text-[10px] text-cyan-400/80 mt-0.5 font-mono">
            Seguridad RFC 6238 &bull; Emisor Oficial: Sistema_ERP
          </p>
        </div>
      </div>
    </div>
  );
};
