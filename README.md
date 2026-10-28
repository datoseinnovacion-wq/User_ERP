# LINK 1.720 - Plataforma Web Unificada

Plataforma centralizada del ecosistema **LINK 1.720 Agentes Aduanales S.A.** con arquitectura de **Autenticación Única (SSO)** y fidelidad estética al Tablero de Despacho Aduanero.

## Módulos Integrados
1. **Despacho Aduanero (`sea-link1720-main`)**: Tablero de cargas, DUAs, contenedores y tracking de navieras.
2. **Asignación Vehicular (`Link-Modulo_Asignacion_Vehicular`)**: Flota de camiones, choferes, placas y emisión de órdenes de entrega.
3. **Preliquidaciones (`Link_Preliquidaciones`)**: Ficha USD, cálculo de costos operativos, rubros y control de utilidades/ventas.
4. **Finanzas (`Modulo-Finanzas`)**: Conciliación bancaria automatizada (Banesco, Mercantil, BNC), tasas oficiales BCV y control de devaluación.

> **Segregación:** El repositorio `Resguardo` está **estrictamente excluido** de esta plataforma.

---

## Credenciales de Acceso SSO (Directorio Central)

| Perfil | Usuario | Contraseña | Rol Asignado | Alcance de Módulos |
| :--- | :--- | :--- | :--- | :--- |
| **Eliana Da Costa** | `eliana` | `GerenLink2026!` | **GERENTE** | Todos los módulos + Administración |
| **Admin Central** | `admin` | `LinkMaster1720!` | **ADMINISTRADOR** | Acceso Total (Superusuario) |
| **Coordinador** | `coordinador` | `LinkMaster1720!` | **COORDINADOR** | Despacho Aduanero & Asignación Vehicular |

---

## Cómo Iniciar la Plataforma

### 1. Iniciar Frontend (Vite + React + Tailwind)
```bash
npm install
npm run dev
```
La aplicación abrirá en: `http://localhost:3000`

### 2. Iniciar Backend / Gateway SSO (FastAPI)
```bash
pip install -r requirements.txt
python main.py
```
El API Gateway correrá en: `http://localhost:8000` con documentación interactiva en `/api/docs`.

O simplemente haz doble clic en `run.bat` en Windows.
