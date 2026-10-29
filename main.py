# -*- coding: utf-8 -*-
"""
LINK 1.720 Agentes Aduanales S.A. & Holding Logístico
Plataforma Web Centralizada & API Gateway SSO
Sistema Oficial: Sistema_ERP (Link, Logi, Consolidadora, Consignatarios)
Implementación del Estándar Completo de Seguridad:
  - Doble Factor de Autenticación Obligatorio (Google Authenticator TOTP RFC 6238)
  - Control de Inactividad (5 minutos)
  - Política Anti Fuerza Bruta Estricta (Bloqueo de 24 Horas al 3er Fallo)
  - Bitácora de Auditoría en Hora de Venezuela (VET UTC-4)
"""
import os
import time
import json
import secrets
from typing import Optional, Dict, Any
from fastapi import FastAPI, Request, Response, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import jwt

from security_service import (
    security_db,
    generate_base32_secret,
    generate_8_backup_codes,
    generate_totp_uri,
    generate_qr_base64_data_uri,
    verify_totp_code,
    format_venezuela_time,
    SISTEMA_NOMBRE
)

def get_sso_secret() -> str:
    env_secret = os.getenv("LINK_SSO_SECRET")
    if env_secret:
        return env_secret
    secret_path = os.path.join(os.path.dirname(__file__), ".sso_secret")
    if os.path.exists(secret_path):
        try:
            with open(secret_path, "r", encoding="utf-8") as f:
                content = f.read().strip()
                if content:
                    return content
        except Exception:
            pass
    gen_secret = secrets.token_hex(32)
    try:
        with open(secret_path, "w", encoding="utf-8") as f:
            f.write(gen_secret)
    except Exception:
        pass
    return gen_secret

# Constantes de Seguridad SSO Link 1.720
SECRET_KEY = get_sso_secret()
ALGORITHM = "HS256"
COOKIE_NAME = "link_sso_session"
TEMP_TOKEN_EXPIRY = 600  # 10 minutos para completar 2FA

app = FastAPI(
    title="Sistema ERP | Holding Central Gateway SSO",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url=None
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_client_ip(request: Request) -> str:
    """Extrae la IP real del cliente usando X-Forwarded-For o socket."""
    forwarded_for = request.headers.get("x-forwarded-for") or request.headers.get("X-Forwarded-For")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    real_ip = request.headers.get("x-real-ip") or request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip.strip()
    if request.client and request.client.host:
        return request.client.host
    return "127.0.0.1"

# Modelos Pydantic
class LoginRequest(BaseModel):
    identifier: str
    password: str

class Verify2FARequest(BaseModel):
    temp_token: str
    code: str

class Activate2FARequest(BaseModel):
    temp_token: str
    code: str

class UnlockUserRequest(BaseModel):
    username: str
    ip_address: Optional[str] = None

def create_sso_token(user_data: dict) -> str:
    """Emite el token definitivo de sesión SSO (7 días)."""
    modulos = user_data["modulos"]
    if isinstance(modulos, str):
        try:
            modulos = json.loads(modulos)
        except Exception:
            modulos = []

    permisos = user_data["permisos"]
    if isinstance(permisos, str):
        try:
            permisos = json.loads(permisos)
        except Exception:
            permisos = []

    payload = {
        "sub": user_data["id"],
        "username": user_data["username"],
        "nombre": user_data["nombre"],
        "email": user_data["email"],
        "rol": user_data["rol"],
        "cargo": user_data.get("cargo", ""),
        "modulos": modulos,
        "permisos": permisos,
        "exp": int(time.time()) + 86400 * 7
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def create_temp_token(user_id: str, username: str, stage: str) -> str:
    """Emite un token temporal firmado de 10 minutos para el flujo 2FA."""
    payload = {
        "sub": user_id,
        "username": username,
        "type": stage,  # '2fa_pending' o 'onboarding_pending'
        "exp": int(time.time()) + TEMP_TOKEN_EXPIRY
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def verify_temp_token(temp_token: str, expected_stage: str) -> Dict[str, Any]:
    """Verifica la firma y validez del token temporal."""
    try:
        payload = jwt.decode(temp_token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != expected_stage:
            raise HTTPException(status_code=400, detail="Etapa de autenticación 2FA no válida.")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="El token temporal de autenticación ha expirado (límite 10 minutos). Inicie sesión nuevamente."
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token temporal de autenticación inválido."
        )

# ==========================================
# RUTAS DE AUTENTICACIÓN & SEGURIDAD
# ==========================================

@app.post("/api/auth/login")
async def login(req: LoginRequest, request: Request, response: Response):
    """
    Paso 1: Validación de Credenciales Primarias y Política Anti Fuerza Bruta.
    """
    client_ip = get_client_ip(request)
    username = req.identifier.lower().strip()

    # 1. Comprobar si la combinación usuario:IP está bloqueada por 24 horas
    lock_info = security_db.check_lock_status(username, client_ip)
    if lock_info and lock_info.get("locked"):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "message": "Ha superado el límite de 3 intentos fallidos permitidos. Su acceso ha sido bloqueado temporalmente por 24 horas por motivos de seguridad.",
                "locked": True,
                "remaining_attempts": 0,
                "remaining_seconds": lock_info["remaining_seconds"],
                "locked_until": lock_info["locked_until"]
            }
        )

    # 2. Búsqueda y Verificación del Usuario
    user = security_db.get_user_by_username(username)
    if not user or not security_db.verify_password(user, req.password):
        # Registro de intento fallido
        fail_res = security_db.record_failed_attempt(username, client_ip)
        security_db.add_audit_log(
            event_type="LOGIN_FALLIDO",
            username=username,
            ip_address=client_ip,
            details=f"Intento fallido de contraseña. {fail_res['message']}"
        )

        if fail_res["locked"]:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=fail_res
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=fail_res
            )

    # 3. Credenciales correctas: Registrar éxito de Paso 1 en Bitácora
    security_db.add_audit_log(
        event_type="LOGIN_PASO1_EXITOSO",
        username=username,
        ip_address=client_ip,
        details="Credenciales de usuario y contraseña validadas exitosamente."
    )

    # 4. Caso A: Usuario YA tiene 2FA configurado y confirmado (totp_enabled == 1)
    if user.get("totp_enabled") == 1:
        temp_token = create_temp_token(user["id"], user["username"], "2fa_pending")
        return {
            "status": "2FA_REQUIRED",
            "temp_token": temp_token,
            "username": user["username"],
            "message": "Credenciales correctas. Ingrese el código de autenticación de 6 dígitos o código de respaldo."
        }

    # 5. Caso B: Usuario NO tiene 2FA activo (totp_enabled == 0 o nulo)
    # Interceptar acceso e imponer Enrolamiento Obligatorio
    secret = user.get("totp_secret")
    if not secret:
        secret = generate_base32_secret()

    backup_codes = generate_8_backup_codes()
    security_db.update_user_totp_onboarding(username, secret, backup_codes)

    totp_uri = generate_totp_uri(user["username"], secret)
    qr_code_data_uri = generate_qr_base64_data_uri(totp_uri)
    temp_token = create_temp_token(user["id"], user["username"], "onboarding_pending")

    security_db.add_audit_log(
        event_type="ENROLAMIENTO_OBLIGATORIO_2FA",
        username=username,
        ip_address=client_ip,
        details="Inicio de asistente obligatorio de enrolamiento 2FA (RFC 6238)."
    )

    return {
        "status": "ONBOARDING_REQUIRED",
        "temp_token": temp_token,
        "username": user["username"],
        "qr_code": qr_code_data_uri,
        "secret": secret,
        "backup_codes": backup_codes,
        "issuer": SISTEMA_NOMBRE,
        "message": "Enrolamiento obligatorio de doble factor de autenticación requerido."
    }

@app.post("/api/auth/2fa/verify")
async def verify_2fa(req: Verify2FARequest, request: Request, response: Response):
    """
    Paso 2 Habitual: Validación del código TOTP de 6 dígitos o código de respaldo.
    """
    client_ip = get_client_ip(request)
    payload = verify_temp_token(req.temp_token, "2fa_pending")
    username = payload["username"]

    # Comprobar bloqueo
    lock_info = security_db.check_lock_status(username, client_ip)
    if lock_info and lock_info.get("locked"):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "message": "Ha superado el límite de 3 intentos fallidos permitidos. Su acceso ha sido bloqueado temporalmente por 24 horas por motivos de seguridad.",
                "locked": True,
                "remaining_attempts": 0,
                "remaining_seconds": lock_info["remaining_seconds"]
            }
        )

    user = security_db.get_user_by_username(username)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")

    code = req.code.strip().replace(" ", "")
    is_valid_totp = verify_totp_code(user.get("totp_secret", ""), code, valid_window=1)
    is_backup_used = False

    if not is_valid_totp:
        # Verificar si es un código de respaldo de emergencia
        is_backup_used = security_db.consume_backup_code(username, code)

    if not is_valid_totp and not is_backup_used:
        # Fallo de código 2FA
        fail_res = security_db.record_failed_attempt(username, client_ip)
        security_db.add_audit_log(
            event_type="FALLO_TOKEN_2FA",
            username=username,
            ip_address=client_ip,
            details=f"Código 2FA / respaldo inválido. {fail_res['message']}"
        )

        if fail_res["locked"]:
            raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=fail_res)
        else:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=fail_res)

    # Éxito de 2FA: reiniciar contador de fallos
    security_db.reset_failed_attempts(username, client_ip)
    security_db.add_audit_log(
        event_type="LOGIN_2FA_EXITOSO",
        username=username,
        ip_address=client_ip,
        details="Acceso completado exitosamente mediante " + ("código de respaldo." if is_backup_used else "Google Authenticator TOTP.")
    )

    # Otorgar Sesión Definitiva
    token = create_sso_token(user)
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        max_age=604800,
        httponly=True,
        samesite="lax",
        secure=False
    )

    modulos = json.loads(user["modulos"]) if isinstance(user["modulos"], str) else user["modulos"]
    permisos = json.loads(user["permisos"]) if isinstance(user["permisos"], str) else user["permisos"]

    return {
        "token": token,
        "user": {
            "id": user["id"],
            "username": user["username"],
            "nombre": user["nombre"],
            "email": user["email"],
            "rol": user["rol"],
            "cargo": user["cargo"],
            "modulos": modulos,
            "permisos": permisos,
            "cargasTotal": 463,
            "cargasSinAsignar": 47,
            "cargasEnProceso": 416
        }
    }

@app.post("/api/auth/2fa/activate")
async def activate_2fa(req: Activate2FARequest, request: Request, response: Response):
    """
    Paso 3 del Onboarding: Validación del primer código numérico y activación de totp_enabled = 1.
    """
    client_ip = get_client_ip(request)
    payload = verify_temp_token(req.temp_token, "onboarding_pending")
    username = payload["username"]

    # Comprobar bloqueo
    lock_info = security_db.check_lock_status(username, client_ip)
    if lock_info and lock_info.get("locked"):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "message": "Ha superado el límite de 3 intentos fallidos permitidos. Su acceso ha sido bloqueado temporalmente por 24 horas por motivos de seguridad.",
                "locked": True,
                "remaining_attempts": 0,
                "remaining_seconds": lock_info["remaining_seconds"]
            }
        )

    user = security_db.get_user_by_username(username)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")

    code = req.code.strip().replace(" ", "")
    is_valid = verify_totp_code(user.get("totp_secret", ""), code, valid_window=1)

    if not is_valid:
        fail_res = security_db.record_failed_attempt(username, client_ip)
        security_db.add_audit_log(
            event_type="FALLO_TOKEN_2FA",
            username=username,
            ip_address=client_ip,
            details=f"Fallo de confirmación en activación 2FA. {fail_res['message']}"
        )

        if fail_res["locked"]:
            raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=fail_res)
        else:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=fail_res)

    # Activar formalmente el 2FA en base de datos
    security_db.activate_user_totp(username)
    security_db.reset_failed_attempts(username, client_ip)

    security_db.add_audit_log(
        event_type="ACTIVACION_2FA",
        username=username,
        ip_address=client_ip,
        details="Enrolamiento completado con éxito: 2FA TOTP RFC 6238 activado."
    )
    security_db.add_audit_log(
        event_type="LOGIN_2FA_EXITOSO",
        username=username,
        ip_address=client_ip,
        details="Primera sesión iniciada tras enrolamiento de seguridad."
    )

    # Actualizar estado de usuario en memoria para respuesta
    updated_user = security_db.get_user_by_username(username)
    token = create_sso_token(updated_user)
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        max_age=604800,
        httponly=True,
        samesite="lax",
        secure=False
    )

    modulos = json.loads(updated_user["modulos"]) if isinstance(updated_user["modulos"], str) else updated_user["modulos"]
    permisos = json.loads(updated_user["permisos"]) if isinstance(updated_user["permisos"], str) else updated_user["permisos"]

    return {
        "token": token,
        "user": {
            "id": updated_user["id"],
            "username": updated_user["username"],
            "nombre": updated_user["nombre"],
            "email": updated_user["email"],
            "rol": updated_user["rol"],
            "cargo": updated_user["cargo"],
            "modulos": modulos,
            "permisos": permisos,
            "cargasTotal": 463,
            "cargasSinAsignar": 47,
            "cargasEnProceso": 416
        }
    }

@app.get("/api/auth/status")
async def check_status(request: Request, identifier: Optional[str] = None):
    """Verifica si la cuenta o IP actual tiene algún bloqueo activo."""
    client_ip = get_client_ip(request)
    username = identifier.lower().strip() if identifier else ""
    lock_info = security_db.check_lock_status(username, client_ip) if username else None
    return {
        "client_ip": client_ip,
        "username": username,
        "locked": bool(lock_info and lock_info.get("locked")),
        "lock_info": lock_info,
        "system_time_vet": format_venezuela_time()
    }

@app.get("/api/auth/me")
async def get_current_user(request: Request):
    """Retorna los datos del usuario activo a partir del token SSO."""
    token = request.cookies.get(COOKIE_NAME)
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]

    if not token:
        raise HTTPException(status_code=401, detail="No autenticado en Link SSO.")

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except Exception:
        raise HTTPException(status_code=401, detail="Token SSO inválido o expirado.")

@app.post("/api/auth/logout")
async def logout(response: Response, request: Request):
    """Cierra la sesión y limpia la cookie SSO."""
    response.delete_cookie(COOKIE_NAME)
    return {"message": "Sesión cerrada correctamente."}

# ==========================================
# ENDPOINTS ADMINISTRATIVOS (DESBLOQUEO & AUDITORÍA)
# ==========================================

@app.post("/api/admin/unlock-user")
async def unlock_user(req: UnlockUserRequest):
    """
    Función de soporte para Administradores:
    Desbloquea inmediatamente a un usuario tras bloqueo de 24 horas.
    """
    affected = security_db.admin_unlock(req.username, req.ip_address)
    return {
        "success": True,
        "message": f"Usuario '{req.username}' desbloqueado exitosamente por administración.",
        "records_cleared": affected
    }

@app.get("/api/admin/audit-logs")
async def get_audit_logs(limit: int = 100):
    """Consulta la bitácora de auditoría en hora oficial de Venezuela (VET UTC-4)."""
    return security_db.get_audit_logs(limit=limit)

@app.get("/api/admin/users")
async def list_admin_users():
    """Listado de usuarios con estado de autenticador 2FA."""
    return security_db.list_all_users()

# ==========================================
# ENDPOINTS OPERATIVOS Y ESTÁTICOS
# ==========================================

@app.get("/api/despacho/metricas")
async def get_metrics():
    return {
        "cargasRegistradas": 463,
        "sinAsignar": 47,
        "enProceso": 416,
        "vaciosEntregados": 197,
        "vaciosPendientes": 219
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "online",
        "platform": "Link 1.720 Plataforma Unificada",
        "authenticator_name": SISTEMA_NOMBRE,
        "security_features": {
            "totp_rfc6238": "enabled",
            "inactivity_control": "5_minutes",
            "anti_brute_force": "24h_lock_3_fails",
            "audit_timezone": "VET (America/Caracas UTC-4)"
        },
        "modules": {
            "sea_link1720": "connected",
            "asignacion_vehicular": "connected",
            "preliquidaciones": "connected",
            "finanzas": "connected",
            "resguardo": "EXCLUDED_BY_DESIGN"
        }
    }

# Servir Frontend compilado (Vite dist) si está disponible
dist_dir = os.path.join(os.path.dirname(__file__), "dist")
if os.path.exists(dist_dir):
    assets_dir = os.path.join(dist_dir, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="Not Found")
        file_path = os.path.join(dist_dir, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(dist_dir, "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
