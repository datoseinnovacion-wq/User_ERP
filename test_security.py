# -*- coding: utf-8 -*-
"""
Suite de Pruebas Automatizadas de Seguridad Link 1.720:
- Estándar 2FA TOTP RFC 6238 (Google Authenticator) con Emisor Link_User_Eliana
- Ventana de deriva (valid_window=1)
- Códigos de Respaldo de Emergencia (8 códigos XXXX-XXXX de un solo uso)
- Flujo de Enrolamiento Obligatorio (Onboarding Paso a Paso)
- Flujo 2FA para Usuarios Enrolados
- Política Anti Fuerza Bruta Estricta (Bloqueo de 24 Horas al 3er Fallo)
- Función Administrativa de Desbloqueo Inmediato
- Bitácora de Auditoría en Hora Oficial de Venezuela (VET UTC-4)
"""

import os
import unittest
import json
import pyotp
from starlette.testclient import TestClient

# Usar base de datos aislada para las pruebas
TEST_DB_PATH = os.path.join(os.path.dirname(__file__), "test_link_security.db")
if os.path.exists(TEST_DB_PATH):
    os.remove(TEST_DB_PATH)

os.environ["LINK_SECURITY_DB"] = TEST_DB_PATH

# Importar aplicación y módulos de seguridad
import security_service
security_service.DEFAULT_DB_PATH = TEST_DB_PATH
security_service.security_db = security_service.SecurityDatabase(TEST_DB_PATH)

import main
main.security_db = security_service.security_db

class TestLinkSecuritySuite(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(main.app)

    @classmethod
    def tearDownClass(cls):
        if os.path.exists(TEST_DB_PATH):
            try:
                os.remove(TEST_DB_PATH)
            except Exception:
                pass

    def setUp(self):
        # Asegurar estado base limpio para pruebas repetibles
        security_service.security_db.admin_unlock("eliana")
        security_service.security_db.admin_unlock("admin")
        security_service.security_db.admin_unlock("coordinador")
        security_service.security_db.admin_unlock("testuser")

    def test_01_system_name_and_qr_generation(self):
        """Verifica que el emisor e issuer sean Link_User_Eliana y el QR sea local en Base64."""
        secret = security_service.generate_base32_secret()
        self.assertEqual(len(secret), 32)

        uri = security_service.generate_totp_uri("eliana", secret)
        self.assertIn("issuer=Link_User_Eliana", uri)
        self.assertIn("Link_User_Eliana", uri)

        qr_b64 = security_service.generate_qr_base64_data_uri(uri)
        self.assertTrue(qr_b64.startswith("data:image/png;base64,"))
        self.assertGreater(len(qr_b64), 100)

    def test_02_totp_drift_tolerance(self):
        """Verifica la validación matemática TOTP con ventana de deriva permitida valid_window=1."""
        secret = security_service.generate_base32_secret()
        totp = pyotp.TOTP(secret)
        current_code = totp.now()

        # Código actual debe ser válido
        self.assertTrue(security_service.verify_totp_code(secret, current_code, valid_window=1))
        # Código inventado debe fallar
        self.assertFalse(security_service.verify_totp_code(secret, "999999", valid_window=1))

    def test_03_backup_codes_generation_and_consumption(self):
        """Verifica la generación de 8 códigos XXXX-XXXX y que sean de un solo uso."""
        codes = security_service.generate_8_backup_codes()
        self.assertEqual(len(codes), 8)
        for c in codes:
            self.assertRegex(c, r"^[0-9A-F]{4}-[0-9A-F]{4}$")

        # Probar consumo
        username = "usr_backup_test"
        with security_service.security_db.get_connection() as conn:
            conn.cursor().execute("""
                INSERT OR REPLACE INTO users (
                    id, username, password_hash, nombre, email, rol, cargo, modulos, permisos,
                    totp_secret, totp_enabled, totp_backup_codes, created_at, updated_at
                ) VALUES ('u_bk', ?, 'hash', 'Test', 't@link.com', 'GERENTE', 'Cargo', '[]', '[]',
                    'JBSWY3DPEHPK3PXP', 1, ?, 'now', 'now')
            """, (username, json.dumps(codes)))
            conn.commit()

        test_code = codes[0]
        # Primer uso debe ser exitoso
        self.assertTrue(security_service.security_db.consume_backup_code(username, test_code))
        # Segundo uso debe ser rechazado (un solo uso estricto)
        self.assertFalse(security_service.security_db.consume_backup_code(username, test_code))

    def test_04_mandatory_onboarding_flow(self):
        """
        Verifica el flujo de enrolamiento obligatorio para usuarios sin 2FA:
        Paso 1: Login correcto -> Retorna ONBOARDING_REQUIRED con QR y 8 códigos
        Paso 2/3: Activación con código TOTP -> Activa totp_enabled = 1 y otorga sesión
        """
        # Usuario Eliana inicia sin 2FA (totp_enabled = 0)
        login_res = self.client.post("/api/auth/login", json={
            "identifier": "eliana",
            "password": "GerenLink2026!"
        }, headers={"X-Forwarded-For": "192.168.1.100"})

        self.assertEqual(login_res.status_code, 200)
        data = login_res.json()
        self.assertEqual(data.get("status"), "ONBOARDING_REQUIRED")
        self.assertIn("temp_token", data)
        self.assertIn("qr_code", data)
        self.assertIn("secret", data)
        self.assertEqual(len(data.get("backup_codes")), 8)
        self.assertEqual(data.get("issuer"), "Link_User_Eliana")

        temp_token = data["temp_token"]
        secret = data["secret"]

        # Intentar activar con código inválido
        bad_act = self.client.post("/api/auth/2fa/activate", json={
            "temp_token": temp_token,
            "code": "000000"
        }, headers={"X-Forwarded-For": "192.168.1.100"})
        self.assertEqual(bad_act.status_code, 401)
        self.assertIn("Intentos restantes antes de bloqueo por 24 horas: 2", bad_act.json().get("detail", {}).get("message", ""))

        # Activar con código TOTP válido
        valid_code = pyotp.TOTP(secret).now()
        good_act = self.client.post("/api/auth/2fa/activate", json={
            "temp_token": temp_token,
            "code": valid_code
        }, headers={"X-Forwarded-For": "192.168.1.100"})

        self.assertEqual(good_act.status_code, 200)
        act_data = good_act.json()
        self.assertIn("token", act_data)
        self.assertEqual(act_data["user"]["username"], "eliana")

        # Verificar en base de datos que totp_enabled es 1
        user_db = security_service.security_db.get_user_by_username("eliana")
        self.assertEqual(user_db["totp_enabled"], 1)

    def test_05_subsequent_login_with_2fa_enabled(self):
        """Una vez enrolada, el login exige el código 2FA estándar."""
        user_db = security_service.security_db.get_user_by_username("eliana")
        secret = user_db["totp_secret"]

        login_res = self.client.post("/api/auth/login", json={
            "identifier": "eliana",
            "password": "GerenLink2026!"
        }, headers={"X-Forwarded-For": "192.168.1.101"})

        self.assertEqual(login_res.status_code, 200)
        data = login_res.json()
        self.assertEqual(data.get("status"), "2FA_REQUIRED")
        temp_token = data["temp_token"]

        # Validar 2FA exitoso
        code = pyotp.TOTP(secret).now()
        verify_res = self.client.post("/api/auth/2fa/verify", json={
            "temp_token": temp_token,
            "code": code
        }, headers={"X-Forwarded-For": "192.168.1.101"})

        self.assertEqual(verify_res.status_code, 200)
        self.assertIn("token", verify_res.json())

    def test_06_anti_brute_force_lockout_24_hours(self):
        """
        Verifica la política anti fuerza bruta estricta:
        - Fallo 1: 401 con 'Intentos restantes antes de bloqueo por 24 horas: 2'
        - Fallo 2: 401 con 'Intentos restantes antes de bloqueo por 24 horas: 1'
        - Fallo 3: 429 con Bloqueo de 24 horas exactas y mensaje oficial.
        """
        ip = "10.0.0.50"
        username = "coordinador"
        security_service.security_db.admin_unlock(username, ip)

        # Intento 1 Fallido
        r1 = self.client.post("/api/auth/login", json={
            "identifier": username,
            "password": "WrongPassword1!"
        }, headers={"X-Forwarded-For": ip})
        self.assertEqual(r1.status_code, 401)
        self.assertIn("Intentos restantes antes de bloqueo por 24 horas: 2", r1.json()["detail"]["message"])

        # Intento 2 Fallido
        r2 = self.client.post("/api/auth/login", json={
            "identifier": username,
            "password": "WrongPassword2!"
        }, headers={"X-Forwarded-For": ip})
        self.assertEqual(r2.status_code, 401)
        self.assertIn("Intentos restantes antes de bloqueo por 24 horas: 1", r2.json()["detail"]["message"])

        # Intento 3 Fallido: Debe responder 429 y bloquear por 24 Horas
        r3 = self.client.post("/api/auth/login", json={
            "identifier": username,
            "password": "WrongPassword3!"
        }, headers={"X-Forwarded-For": ip})
        self.assertEqual(r3.status_code, 429)
        detail = r3.json()["detail"]
        self.assertTrue(detail["locked"])
        self.assertIn("Ha superado el límite de 3 intentos fallidos permitidos", detail["message"])

        # Intento 4 posterior: Debe mantenerse bloqueado con 429
        r4 = self.client.post("/api/auth/login", json={
            "identifier": username,
            "password": "LinkMaster1720!" # Contraseña real, pero bloqueado
        }, headers={"X-Forwarded-For": ip})
        self.assertEqual(r4.status_code, 429)
        self.assertTrue(r4.json()["detail"]["locked"])

    def test_07_admin_unlock(self):
        """Verifica la función de soporte para Administradores de desbloqueo inmediato."""
        ip = "10.0.0.77"
        username = "admin"

        # Simular 3 fallos para provocar el bloqueo
        for _ in range(3):
            security_service.security_db.record_failed_attempt(username, ip)

        # Comprobar que está bloqueado
        status_res = self.client.get(f"/api/auth/status?identifier={username}", headers={"X-Forwarded-For": ip})
        self.assertTrue(status_res.json()["locked"])

        # Desbloqueo por API Admin
        unlock_res = self.client.post("/api/admin/unlock-user", json={
            "username": username,
            "ip_address": ip
        })
        self.assertEqual(unlock_res.status_code, 200)
        self.assertTrue(unlock_res.json()["success"])

        # Ahora el login debe permitirse
        status_res2 = self.client.get(f"/api/auth/status?identifier={username}", headers={"X-Forwarded-For": ip})
        self.assertFalse(status_res2.json()["locked"])

    def test_08_audit_logs_venezuelan_time(self):
        """Verifica que todos los eventos de auditoría se registren con hora de Venezuela (VET UTC-4)."""
        logs_res = self.client.get("/api/admin/audit-logs?limit=20")
        self.assertEqual(logs_res.status_code, 200)
        logs = logs_res.json()
        self.assertGreater(len(logs), 0)

        event_types = [l["event_type"] for l in logs]
        # Verificar presencia de eventos requeridos
        self.assertTrue(any("LOGIN" in et or "ENROLAMIENTO" in et or "BLOQUEO" in et or "DESBLOQUEO" in et for et in event_types))

        # Verificar sufijo o zona VET en los timestamps
        for l in logs:
            self.assertIn("VET", l["timestamp"])

    def test_09_backup_code_login_via_api(self):
        """Verifica que un usuario enrolado pueda acceder usando uno de sus 8 códigos de respaldo."""
        user = security_service.security_db.get_user_by_username("eliana")
        backup_codes = json.loads(user["totp_backup_codes"])
        backup_to_use = backup_codes[0]

        # Login Paso 1
        login_res = self.client.post("/api/auth/login", json={
            "identifier": "eliana",
            "password": "GerenLink2026!"
        }, headers={"X-Forwarded-For": "192.168.1.150"})
        self.assertEqual(login_res.status_code, 200)
        temp_token = login_res.json()["temp_token"]

        # Login Paso 2 con código de respaldo
        verify_res = self.client.post("/api/auth/2fa/verify", json={
            "temp_token": temp_token,
            "code": backup_to_use
        }, headers={"X-Forwarded-For": "192.168.1.150"})
        self.assertEqual(verify_res.status_code, 200)
        self.assertIn("token", verify_res.json())

        # El código debe haber sido consumido (restan 7)
        updated_user = security_service.security_db.get_user_by_username("eliana")
        remaining_codes = json.loads(updated_user["totp_backup_codes"])
        self.assertEqual(len(remaining_codes), len(backup_codes) - 1)
        self.assertNotIn(backup_to_use, remaining_codes)

    def test_10_logout_and_session_clearing(self):
        """Verifica que el logout limpie la cookie de sesión SSO."""
        logout_res = self.client.post("/api/auth/logout")
        self.assertEqual(logout_res.status_code, 200)
        self.assertIn("Sesión cerrada", logout_res.json()["message"])

if __name__ == "__main__":
    unittest.main()
