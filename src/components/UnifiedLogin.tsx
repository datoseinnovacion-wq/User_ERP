import React, { useState, useEffect } from "react";
import {
  Lock,
  Mail,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  QrCode,
  Copy,
  Check,
  Download,
  KeyRound,
  ArrowLeft,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { UserSession } from "../types";
import { BrandMark } from "./BrandMark";

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
      if (data.status === "2FA_REQUIRED") {
        setTempToken(data.temp_token);
        setViewMode("2FA_VERIFY");
      } else if (data.status === "ONBOARDING_REQUIRED") {
        setTempToken(data.temp_token);
        setQrCodeDataUri(data.qr_code);
        setManualSecret(data.secret);
        setBackupCodes(data.backup_codes || []);
        setOnboardingStep(1);
        setViewMode("ONBOARDING");
      } else if (data.token && data.user) {
        // Sesión otorgada directamente (fallback)
        localStorage.setItem("link_sso_user", JSON.stringify(data.user));
        localStorage.setItem("link_sso_token", data.token);
        onLoginSuccess(data.user);
      }
    } catch {
      setError("Error de comunicación con el Gateway SSO de Link 1.720.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Validación de 2FA para usuario ya enrolado
  const handleVerify2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/2fa/verify", {
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
      `LINK 1.720 Agentes Aduanales S.A. - Códigos de Respaldo 2FA\n` +
      `Sistema: Link_User_Eliana\n` +
      `Usuario: ${username}\n` +
      `Fecha: ${new Date().toLocaleString()}\n` +
      `=====================================================\n\n` +
      `INSTRUCCIONES DE SEGURIDAD:\n` +
      `Cada código puede ser utilizado exactamente UNA SOLA VEZ para acceder si pierde su teléfono.\n` +
      `Guarde este archivo en un lugar cifrado o imprímalo en físico.\n\n` +
      `CÓDIGOS DE EMERGENCIA:\n` +
      backupCodes.map((c, i) => `  [${i + 1}] ${c}`).join("\n") +
      `\n\n=====================================================\n`;

    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `codigos_respaldo_Link_User_Eliana_${username}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex flex-col justify-center items-center p-4 selection:bg-red-500 selection:text-white">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl p-6 sm:p-8 relative overflow-hidden">
        {/* Franja de Acento Rojo Corporativo Link */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#DC2626]" />

        {/* Cabecera con Logo Oficial */}
        <div className="text-center mb-5">
          <BrandMark size="lg" />
          <h1 className="text-lg font-bold text-slate-900 mt-3 tracking-tight">
            Portal Central Link 1.720
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Autenticación Única (SSO) &bull; Link_User_Eliana
          </p>
        </div>

        {/* BANNER 1: Cierre por Inactividad */}
        {inactivityNotice && (
          <div className="mb-4 bg-amber-50 border border-amber-300 text-amber-800 text-xs rounded-xl p-3 flex items-start space-x-2">
            <Clock className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <div>
              <p className="font-bold">Sesión Finalizada por Inactividad</p>
              <p className="mt-0.5">
                Su sesión ha finalizado automáticamente tras 5 minutos de inactividad por motivos de seguridad.
              </p>
            </div>
          </div>
        )}

        {/* BANNER 2: Bloqueo Anti Fuerza Bruta (24h) */}
        {isLocked && (
          <div className="mb-4 bg-red-50 border border-red-300 text-red-800 text-xs rounded-xl p-3 flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <div>
              <p className="font-bold">Acceso Temporalmente Bloqueado</p>
              <p className="mt-0.5">
                Ha superado el límite de 3 intentos fallidos permitidos. Su acceso ha sido bloqueado temporalmente por 24 horas por motivos de seguridad.
              </p>
            </div>
          </div>
        )}

        {/* Mensaje de Error / Aviso de Intentos */}
        {error && !isLocked && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3 flex items-start space-x-2">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-[#DC2626]" />
            <span>{error}</span>
          </div>
        )}

        {/* ========================================================
            VISTA 1: INGRESO DE CREDENCIALES PRIMARIAS
           ======================================================== */}
        {viewMode === "CREDENTIALS" && (
          <>
            {/* Acceso Rápido de Perfil */}
            <div className="mb-5 bg-slate-50 p-2 rounded-xl border border-slate-200">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 mb-1.5">
                Seleccionar Perfil Autorizado (SSO):
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  disabled={isLocked}
                  onClick={() => handleQuickSelect("eliana")}
                  className={`px-2 py-1.5 rounded-lg text-xs font-semibold text-center transition ${
                    username === "eliana"
                      ? "bg-[#18181B] text-white shadow-xs"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 disabled:opacity-50"
                  }`}
                >
                  Eliana Da Costa
                </button>
                <button
                  type="button"
                  disabled={isLocked}
                  onClick={() => handleQuickSelect("admin")}
                  className={`px-2 py-1.5 rounded-lg text-xs font-semibold text-center transition ${
                    username === "admin"
                      ? "bg-[#18181B] text-white shadow-xs"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 disabled:opacity-50"
                  }`}
                >
                  Administrador
                </button>
                <button
                  type="button"
                  disabled={isLocked}
                  onClick={() => handleQuickSelect("coordinador")}
                  className={`px-2 py-1.5 rounded-lg text-xs font-semibold text-center transition ${
                    username === "coordinador"
                      ? "bg-[#18181B] text-white shadow-xs"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 disabled:opacity-50"
                  }`}
                >
                  Coordinador
                </button>
              </div>
            </div>

            <form onSubmit={handlePrimarySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Usuario o Correo
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    disabled={isLocked}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ej. eliana"
                    className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#DC2626] focus:border-[#DC2626] outline-none transition disabled:bg-slate-100 disabled:text-slate-400"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    disabled={isLocked}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#DC2626] focus:border-[#DC2626] outline-none transition disabled:bg-slate-100 disabled:text-slate-400"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || isLocked}
                className="w-full mt-2 bg-[#DC2626] hover:bg-[#B91C1C] disabled:bg-slate-400 text-white font-bold py-2.5 px-4 rounded-xl text-xs tracking-wider uppercase transition shadow-md flex items-center justify-center space-x-2"
              >
                {isLocked ? (
                  <span>Acceso Bloqueado (24h)</span>
                ) : loading ? (
                  <span>Validando credenciales…</span>
                ) : (
                  <>
                    <span>Ingresar a la Plataforma</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </>
        )}

        {/* ========================================================
            VISTA 2: VALIDACIÓN 2FA HABITUAL (USUARIO YA ENROLADO)
           ======================================================== */}
        {viewMode === "2FA_VERIFY" && (
          <form onSubmit={handleVerify2FASubmit} className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
              <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto mb-1.5" />
              <p className="text-xs font-bold text-slate-800">Verificación de Dos Factores (2FA)</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Google Authenticator &bull; <span className="font-semibold text-slate-700">Link_User_Eliana</span>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
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
                  className="w-full text-center text-lg font-mono font-bold tracking-widest pl-3 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#DC2626] focus:border-[#DC2626] outline-none transition"
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
                className="text-slate-600 hover:text-slate-900 font-semibold underline text-[11px]"
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
                className="text-slate-400 hover:text-slate-600 text-[11px] flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Volver</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || !totpCode}
              className="w-full mt-2 bg-[#DC2626] hover:bg-[#B91C1C] disabled:bg-slate-400 text-white font-bold py-2.5 px-4 rounded-xl text-xs tracking-wider uppercase transition shadow-md flex items-center justify-center space-x-2"
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
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-1.5">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    onboardingStep === 1
                      ? "bg-[#DC2626] text-white"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  1
                </span>
                <span className="text-[11px] font-bold text-slate-700">Escanear</span>
              </div>
              <div className="w-4 h-px bg-slate-300" />
              <div className="flex items-center space-x-1.5">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    onboardingStep === 2
                      ? "bg-[#DC2626] text-white"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  2
                </span>
                <span className="text-[11px] font-bold text-slate-700">Respaldos</span>
              </div>
              <div className="w-4 h-px bg-slate-300" />
              <div className="flex items-center space-x-1.5">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    onboardingStep === 3
                      ? "bg-[#DC2626] text-white"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  3
                </span>
                <span className="text-[11px] font-bold text-slate-700">Activar</span>
              </div>
            </div>

            {/* PASO 1: Escaneo de Código QR */}
            {onboardingStep === 1 && (
              <div className="space-y-3 text-center">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Paso 1: Vincular Google Authenticator
                </h3>
                <p className="text-[11px] text-slate-600">
                  Abra su app <strong>Google Authenticator</strong> y escanee el código QR asignado para el sistema <strong>Link_User_Eliana</strong>:
                </p>

                {qrCodeDataUri && (
                  <div className="inline-block p-2 bg-white border border-slate-300 rounded-xl shadow-xs">
                    <img
                      src={qrCodeDataUri}
                      alt="Código QR TOTP Link 1.720"
                      className="w-44 h-44 mx-auto"
                    />
                  </div>
                )}

                <div>
                  <button
                    type="button"
                    onClick={() => setShowManualKey(!showManualKey)}
                    className="text-[11px] font-bold text-[#DC2626] hover:underline"
                  >
                    {showManualKey ? "Ocultar clave manual" : "¿No puede escanear? Ver clave manual Base32"}
                  </button>

                  {showManualKey && (
                    <div className="mt-2 bg-slate-50 border border-slate-200 p-2.5 rounded-lg flex items-center justify-between text-left">
                      <span className="font-mono text-xs font-bold text-slate-800 tracking-wider">
                        {manualSecret}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(manualSecret, false)}
                        className="p-1.5 hover:bg-slate-200 rounded text-slate-600"
                        title="Copiar Clave"
                      >
                        {copiedKey ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setOnboardingStep(2)}
                  className="w-full mt-2 bg-[#18181B] hover:bg-black text-white font-bold py-2 px-4 rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center space-x-1.5"
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
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Paso 2: Códigos de Respaldo (Emergencia)
                  </h3>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Guarde estos 8 códigos en un lugar seguro. Si pierde acceso a su app, podrá utilizarlos una sola vez:
                  </p>
                </div>

                {/* Rejilla de Códigos */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-200 p-3 rounded-xl">
                  {backupCodes.map((code, index) => (
                    <div
                      key={index}
                      className="bg-white border border-slate-200 rounded-lg py-1.5 px-2 text-center font-mono text-xs font-bold text-slate-800 shadow-2xs"
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
                    className="flex items-center justify-center space-x-1 py-2 px-3 border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 transition"
                  >
                    {copiedCodes ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCodes ? "Copiados!" : "Copiar Códigos"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={downloadBackupCodes}
                    className="flex items-center justify-center space-x-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 transition"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-700" />
                    <span>Descargar (.txt)</span>
                  </button>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => setOnboardingStep(1)}
                    className="text-xs text-slate-500 hover:text-slate-700 font-semibold"
                  >
                    Atrás
                  </button>
                  <button
                    type="button"
                    onClick={() => setOnboardingStep(3)}
                    className="bg-[#18181B] hover:bg-black text-white font-bold py-2 px-4 rounded-xl text-xs uppercase tracking-wider transition flex items-center space-x-1.5"
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
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Paso 3: Confirmación y Activación
                  </h3>
                  <p className="text-[11px] text-slate-600 mt-1">
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
                    className="w-full text-center text-xl font-mono font-bold tracking-widest py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#DC2626] focus:border-[#DC2626] outline-none transition"
                  />
                </div>

                <div className="flex justify-between items-center text-xs">
                  <button
                    type="button"
                    onClick={() => setOnboardingStep(2)}
                    className="text-slate-500 hover:text-slate-700 font-semibold"
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
                    className="text-slate-400 hover:text-slate-600 text-[11px]"
                  >
                    Cancelar
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading || totpCode.length < 6}
                  className="w-full mt-2 bg-[#DC2626] hover:bg-[#B91C1C] disabled:bg-slate-400 text-white font-bold py-2.5 px-4 rounded-xl text-xs tracking-wider uppercase transition shadow-md flex items-center justify-center space-x-2"
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
        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400">
            LINK 1.720 Agentes Aduanales S.A. &bull; RIF J-503883587
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Seguridad RFC 6238 &bull; Emisor: Link_User_Eliana
          </p>
        </div>
      </div>
    </div>
  );
};
