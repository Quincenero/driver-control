# Driver Control Pro

Aplicación web para conductores de taxi/remis que permite llevar el control
de viajes, gastos, combustible, mantenimiento, vehículos y documentación
legal (VTV, licencias, seguro, etc.), con alertas automáticas de vencimiento.

---

## ✨ Funcionalidades

### Operación diaria
- **Registro de viajes** con plataforma (Uber, Cabify, Didi, Taxi) y tipo de pago.
- **Cargas de combustible** por tipo (Nafta, Diesel, GNC, Eléctrico) con
  desglose por tipo en gráficos.
- **Gastos varios** (peajes, lavado, etc.) con categorías.
- **Mantenimiento** de vehículo (aceite, frenos, neumáticos, service, etc.)
  con kilometraje y costo.

### Vehículos
- CRUD completo de vehículos (marca, modelo, año, patente, combustible, odómetro).
- Vehículo "activo" que se usa por defecto en el resto de la app.
- Historial de todos los vehículos registrados.

### Documentación
- Gestión de: **VTV, licencia de taxi, licencia de conducir, seguro,
  oblea GNC y prueba hidráulica**.
- Cálculo automático de vencimientos según periodicidad (mensual, anual,
  trienal, quinquenal, etc.).
- **Alertas visuales** en el Dashboard para documentos vencidos o por vencer.
- Renovación con historial: al renovar, el documento anterior se archiva y
  se crea uno nuevo vinculado.
- Botón "Trámite" con link directo al sitio oficial (configurable por tipo).

### Dashboard
- Métricas del período seleccionable (hoy / semana / mes):
  - Ingresos, viajes, promedio por viaje.
  - Combustible, gastos, mantenimiento.
  - Utilidad neta y margen.
- Gráfico de distribución de gastos.
- Tabla de últimos viajes.
- Banner de alertas de documentos por vencer.

### Cuenta
- Autenticación con JWT.
- Perfil editable (nombre, apellido, teléfono, fecha de nacimiento).
- Recuperación de contraseña por email (Resend).
- Logout desde la barra de navegación.

---

## 🛠️ Stack

### Backend
- **Node.js** + **Express** `^4.22.2`
- **MongoDB** + **Mongoose** `^7.8.12`
- **JWT** (`jsonwebtoken` `^9.0.3`) para autenticación
- **bcryptjs** `^2.4.3` para hash de contraseñas
- **Resend** `^6.28.1` para envío de emails transaccionales
- **Helmet** `^7.2.0` y **express-rate-limit** `^8.7.0` para seguridad
- **CORS**, **dotenv**
- ES Modules (`"type": "module"`)

### Frontend
- **React** `^19.2.8` + **Vite** `^8.2.0`
- **React Router** `^7.18.2`
- **TanStack Query (React Query)** para data fetching y cache
- **Axios** `^1.19.0` con interceptores
- **Recharts** `^3.10.1` para gráficos
- **Lucide React** `^1.33.0` para iconografía
- **CSS Modules** para estilos
- **React Context** para auth

---

## 📁 Estructura del proyecto

driver-control-pro/
├── client/ # Frontend (Vite + React)
│ ├── public/
│ ├── src/
│ │ ├── api/ # Clientes HTTP
│ │ │ ├── axiosConfig.js
│ │ │ ├── documents.js
│ │ │ ├── tokenStore.js
│ │ │ └── vehicles.js
│ │ ├── assets/ # Logos e imágenes
│ │ ├── components/ # Componentes reutilizables
│ │ │ ├── ActiveVehicleCard.jsx
│ │ │ ├── ActiveVehicleCard.module.css
│ │ │ ├── AppLayout.jsx # Navbar + mobile menu
│ │ │ ├── AppLayout.module.css
│ │ │ ├── DocumentAlerts.jsx
│ │ │ ├── DocumentAlerts.module.css
│ │ │ └── PrivateRoute.jsx
│ │ ├── constants/
│ │ ├── context/
│ │ │ ├── AuthContext.js
│ │ │ └── AuthProvider.jsx
│ │ ├── hooks/ # React Query hooks
│ │ │ ├── queryHelpers.js
│ │ │ ├── useAuth.js
│ │ │ ├── useDocuments.js
│ │ │ ├── useExpenses.js
│ │ │ ├── useExpensesTotal.js
│ │ │ ├── useFuels.js
│ │ │ ├── useMaintenances.js
│ │ │ ├── useTripStats.js
│ │ │ ├── useTrips.js
│ │ │ └── useVehicles.js
│ │ ├── pages/
│ │ │ ├── Auth/
│ │ │ │ ├── ForgotPassword/
│ │ │ │ ├── Login/
│ │ │ │ ├── Register/
│ │ │ │ └── ResetPassword/
│ │ │ ├── Dashboard/
│ │ │ │ ├── Dashboard.jsx
│ │ │ │ ├── Dashboard.module.css
│ │ │ │ ├── MetricCard.jsx
│ │ │ │ └── MetricCard.module.css
│ │ │ ├── Documents/
│ │ │ │ ├── Documents.jsx
│ │ │ │ └── Documents.module.css
│ │ │ ├── Expenses/
│ │ │ │ ├── ExpenseEditModal.jsx
│ │ │ │ ├── ExpenseFilters.jsx
│ │ │ │ ├── ExpenseForm.jsx
│ │ │ │ └── ExpenseList.jsx
│ │ │ ├── Fuel/
│ │ │ │ ├── FuelEditModal.jsx
│ │ │ │ ├── FuelFilters.jsx
│ │ │ │ ├── FuelForm.jsx
│ │ │ │ ├── FuelList.jsx
│ │ │ │ └── FuelSummary.jsx
│ │ │ ├── Maintenance/
│ │ │ │ ├── MaintenanceEditModal.jsx
│ │ │ │ ├── MaintenanceFilters.jsx
│ │ │ │ ├── MaintenanceForm.jsx
│ │ │ │ ├── MaintenanceList.jsx
│ │ │ │ └── MaintenanceSummary.jsx
│ │ │ ├── Profile/
│ │ │ │ ├── Profile.jsx
│ │ │ │ └── Profile.module.css
│ │ │ ├── Trips/
│ │ │ │ ├── TripEditModal.jsx
│ │ │ │ ├── TripFilters.jsx
│ │ │ │ ├── TripForm.jsx
│ │ │ │ └── TripList.jsx
│ │ │ └── Vehicles/
│ │ │ ├── Vehicles.jsx
│ │ │ └── Vehicles.module.css
│ │ ├── styles/
│ │ │ ├── variables.css
│ │ │ └── globals.css
│ │ ├── utils/
│ │ │ ├── dateRange.js
│ │ │ ├── documents.js
│ │ │ └── format.js
│ │ ├── App.css
│ │ ├── App.jsx
│ │ ├── index.css
│ │ └── main.jsx
│ ├── index.html
│ ├── vite.config.js
│ └── package.json
│
└── server/ # Backend (Express + Mongoose)
├── src/
│ ├── config/
│ │ └── db.js
│ ├── controllers/
│ │ ├── authController.js
│ │ ├── expenseController.js
│ │ ├── fuelController.js
│ │ ├── maintenanceController.js
│ │ └── tripController.js
│ ├── middlewares/
│ │ ├── authMiddleware.js # protect
│ │ ├── errorHandler.js
│ │ └── validator.js
│ ├── models/
│ │ ├── Document.js
│ │ ├── Expense.js
│ │ ├── Fuel.js
│ │ ├── Trip.js
│ │ ├── User.js
│ │ ├── Vehicle.js
│ │ └── maintenance.js
│ ├── routes/
│ │ ├── authRoutes.js
│ │ ├── documents.js
│ │ ├── expenseRoutes.js
│ │ ├── fuelRoutes.js
│ │ ├── maintenanceRoutes.js
│ │ ├── tripRoutes.js
│ │ └── vehicles.js
│ ├── utils/
│ │ └── dateRange.js
│ └── index.js # Entry point
├── .env
├── .gitignore
└── package.json


---

## 🚀 Instalación y uso

### Requisitos previos
- **Node.js** 18 o superior
- **MongoDB** (local o Atlas)
- Cuenta en [Resend](https://resend.com) para emails

### 1. Clonar el repositorio

```bash
git clone https://github.com/Quincenero/driver-control.git
cd driver-control

### 2. Instalar dependencias  
# Backend
cd server
npm install

# Frontend
cd ../client
npm install

### 3. Configurar variables de entorno
cd server
cp .env.example .env

### 4. Levantar MongoDB (si es local)
# macOS con Homebrew
brew services start mongodb-community

# Linux con systemd
sudo systemctl start mongod

# Windows: iniciar el servicio desde Servicios o ejecutar mongod

### 5. Arrancar el backend
cd server
npm run dev

### 6. Arrancar el frontend
cd client
npm run dev

La app corre en http://localhost:5173. Vite tiene proxy configurado
para redirigir /api/* a http://localhost:4000.

📜 Scripts disponibles
Backend (server/)
Script	            Descripción
npm run dev	    Arranca con nodemon (recarga automática)
npm start	    Arranca en modo producción

Frontend (client/)
Script	            Descripción
npm run dev	    Servidor de desarrollo Vite
npm run build	Build de producción
npm run preview	Preview del build de producción
npm run lint	Ejecuta ESLint

🔌 API endpoints
Todos los endpoints protegidos requieren Authorization: Bearer <token>.

Auth

Método	    Ruta	                        Descripción
POST   /api/auth/register	            Registro de usuario
POST   /api/auth/login	                Login
GET	   /api/auth/me	                    Perfil del usuario autenticado
PUT	   /api/auth/profile	            Actualizar perfil
POST   /api/auth/forgot-passwor         Solicitar reset de contraseña
PUT	/api/auth/reset-password/:token	    Aplicar nueva contraseña

Vehículos
Método	         Ruta	            Descripción
GET	    /api/vehicles	        Listar vehículos del usuario
GET	    /api/vehicles/active	Vehículo activo
POST	/api/vehicles	        Crear vehículo
PATCH	/api/vehicles/:id	    Actualizar vehículo
DELETE  /api/vehicles/:id	    Dar de baja (soft delete)

Documentos
Método	    Ruta	                         Descripción
GET	    /api/documents/types	        Metadata de tipos de documento
GET	    /api/documents	                Listar documentos activos
GET	    /api/documents/alerts	        Documentos que necesitan atención
GET	    /api/documents/history	        Historial de un tipo
POST	/api/documents	                Crear documento
PATCH	/api/documents/:id	            Actualizar
POST	/api/documents/:id/renew	    Renovar (archiva + crea)
POST	/api/documents/:id/acknowledge	Marcar alerta como vista
DELETE	/api/documents/:id	            Archivar

Combustible
Método	        Ruta	                        Descripción
GET	       /api/fuel?periodo=&tipo=	        Listar cargas
GET	       /api/fuel/summary?periodo=	    Resumen por tipo
POST	   /api/fuel	                    Crear carga
PUT	       /api/fuel/:id	                Actualizar
DELETE	   /api/fuel/:id	                Eliminar

Mantenimiento
Método	    Ruta	                             Descripción
GET	    /api/maintenance?periodo=&tipo=	    Listar mantenimientos
GET	    /api/maintenance/summary?periodo=	Resumen por tipo
POST	/api/maintenance	                Crear
PUT	    /api/maintenance/:id	            Actualizar
DELETE	/api/maintenance/:id	            Eliminar

Viajes
Método	    Ruta	                        Descripción
GET	     /api/trips?periodo=	        Listar viajes
GET	     /api/trips/stats?periodo=	    Estadísticas del período
POST	 /api/trips	                    Crear viaje
PUT	     /api/trips/:id	                Actualizar
DELETE	 /api/trips/:id	                Eliminar

Gastos
Método	    Ruta	                            Descripción
GET	    /api/expenses?periodo=	            Listar gastos
GET	    /api/expenses/summary?periodo=	    Resumen por categoría
POST	/api/expenses	                    Crear gasto
PUT	    /api/expenses/:id	                Actualizar
DELETE	/api/expenses/:id	                Eliminar

Períodos válidos
hoy · semana · mes · año

🗄️ Modelos de datos

User
{
  name: String,
  lastName: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  birthDate: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt, updatedAt
}

Vehicle
{
  owner: ObjectId (ref: User),
  brand: String,
  model: String,
  year: Number,
  plate: String (unique, uppercase),
  color: String,
  fuelType: 'nafta' | 'diesel' | 'gnc' | 'hibrido' | 'electrico',
  status: 'activo' | 'inactivo' | 'mantenimiento' | 'baja',
  odometer: Number,
  lastServiceDate, lastServiceKm, nextServiceKm,
  notes: String,
  isActive: Boolean,
  createdAt, updatedAt
}

Document
{
  owner: ObjectId (ref: User),
  vehicle: ObjectId (ref: Vehicle) | null,
  type: 'vtv' | 'taxi_license' | 'driver_license' | 'insurance' | 'gnc_sticker' | 'hydraulic_test',
  number: String,
  issuedBy: String,
  issueDate: Date,
  periodicity: 'mensual' | 'bimestral' | ... | 'quinquenal',
  expiresAt: Date (auto-calculado),
  reminderDays: Number,
  acknowledgedAt, acknowledgedAtDaysRemaining,
  renewalUrl: String,
  attachments: [],
  isActive: Boolean,
  replaces, replacedBy,
  createdAt, updatedAt
}

Fuel
{
  user: ObjectId (ref: User),
  tipo: 'Nafta' | 'Diesel' | 'Eléctrico' | 'GNC',
  total: Number,
  lugarCarga: String,
  fecha: Date,
  vehiculo: ObjectId (ref: Vehicle) | null,
  createdAt, updatedAt
}

Maintenance
{
  user: ObjectId (ref: User),
  tipo: 'Aceite' | 'Frenos' | 'Neumáticos' | 'Filtros' | 'Batería' | 'Service' | 'Otro',
  costo: Number,
  descripcion: String,
  fecha: Date,
  kilometraje: Number,
  vehiculo: ObjectId (ref: Vehicle) | null,
  createdAt, updatedAt
}

🎨 Sistema de diseño

Paleta (CSS variables en client/src/styles/variables.css)
--bg-primary:      #0f0f1a
--bg-secondary:    #1a1a2e
--bg-hover:        #1e1e32
--border-color:    #2a2a3a
--text-primary:    #f0f0f0
--text-secondary:  #d0d0d8
--text-muted:      #a0a0b0

--accent-green:    #4ade80
--accent-blue:     #60a5fa
--accent-yellow:   #fbbf24
--accent-red:      #f43f5e
--accent-purple:   #a855f7
--accent-cyan:     #06b6d4

Identidad cromática por sección
Sección	        Color
Dashboard	    verde
Vehículos	    verde
Documentos	    azul
Combustible	    cian
Mantenimiento	violeta

🔐 Autenticación
JWT firmado con JWT_SECRET, expira según JWT_EXPIRE.

Se guarda en localStorage (frontend).

Interceptor de axios adjunta el token en cada request.

El middleware protect (backend) valida el token y adjunta req.user.

Si el token expira → el frontend redirige a /login.

PrivateRoute envuelve todas las rutas privadas.

🧪 Testing manual rápido
Probar el flujo de reset por curl

# 1. Solicitar reset
curl -X POST http://localhost:4000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"tu-email@ejemplo.com"}'

# 2. Copiar el token del email recibido
# 3. Aplicar nueva contraseña
curl -X PUT http://localhost:4000/api/auth/reset-password/<TOKEN> \
  -H "Content-Type: application/json" \
  -d '{"password":"nuevaPassword123"}'

# 4. Login con la nueva
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"tu-email@ejemplo.com","password":"nuevaPassword123"}'

🐛 Problemas comunes
Problema	                    Causa probable	                                     Solución
ERR_MODULE_NOT_FOUND	    Falta extensión .js en un import ESM	      Los imports locales en Node ESM requieren .js
Cannot                      use import statement	                      "type": "module" no está en package.json del server	Agregarlo
Invalid                     hook call	                                  Versiones duplicadas de React	Correr npm ls react, forzar resolve.dedupe en                                                                         Vite
CORS error	                Frontend y backend en puertos distintos	      Verificar config de cors() y el proxy de Vite
Email no llega(Resend dev)	Sin dominio verificado	                      Solo funciona al email de la cuenta, o verificar dominio
Token inválido o expirado	Token ya usado o pasaron 10 min	              Volver a solicitar reset
Mongoose Path ... is more than maximum	max con función en Number schema  Usar validate custom en lugar de max  

📄 Licencia
Este proyecto está bajo la licencia MIT. Ver LICENSE para más detalles.

👤 Autor
Marco Espinoza

GitHub: @Quincenero

Repositorio: driver-control

🙏 Agradecimientos
TanStack Query por el manejo de estado del servidor

Recharts por los gráficos

Lucide por la iconografía

Resend por el servicio de emails

Vite por el build tool