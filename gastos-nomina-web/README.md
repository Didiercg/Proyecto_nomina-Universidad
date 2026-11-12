# 📊 Sistema de Nómina, Gastos y Presupuesto Web

Aplicación web moderna y 100% responsiva diseñada para acceder desde **celulares, tablets o computadoras**. Conectada con **Supabase** (base de datos en la nube) y lista para desplegar en **Netlify**, con una función de **exportación a Excel (.xlsm)** que genera exactamente el mismo archivo original con su diseño, fórmulas, consolidaciones y pestañas actualizadas.

---

## 🚀 Características Principales

1. **Acceso Multiplataforma**:
   - Diseño optimizado para pantallas táctiles móviles (barra de navegación inferior, botones de incremento rápido, tarjetas compactas).
   - Vista amplia para tablets y PC con menús y gráficos analíticos.

2. **Registro de Movimientos**:
   - **Registro Rápido**: Formulario ágil para registrar ingresos o egresos en segundos, con sugerencias automáticas de conceptos frecuentes (Mercado, Gasolina, Internet, Zoe, Cuota Moto, etc.).
   - **Registro en Lote (Hoja DATOS)**: Réplica interactiva de la hoja `DATOS` con 3 columnas (Ingresos, Gastos Fijos y Gastos Variables) para ingresar las cifras de la quincena o fin de mes y guardarlas todas a la vez.

3. **Dashboard Interactivo**:
   - Selector dinámico de Mes y Año.
   - Tarjetas de Ingresos Totales, Egresos Totales y Saldo Neto (Presupuesto vs. Real y Diferencia).
   - Gráfico de barras comparativo Ingresos vs. Egresos por mes.
   - Gráfico tipo Donut con distribución porcentual de gastos por categoría.
   - Tablas de resumen por categoría y desglose de servicios, gastos y deudas.

4. **Consolidados & Deudas**:
   - Consolidado Mensual, Trimestral (Q1 - Q4) y Comparativo Anual por Categoría.
   - Seguimiento de amortización de las 4 deudas (Moto, Tablet, Crédito, Madre), con porcentaje de avance y registro de abonos extra.

5. **Mantenimiento de Moto (Cambio de Aceite)**:
   - Contador de kilometraje con alerta para el próximo cambio cada 2.500 km.

6. **Exportable 1:1 Idéntico a tu Excel**:
   - Botón **"Exportar Excel (.xlsm)"** que toma la plantilla original, actualiza la tabla maestra `Registro` con todos los datos guardados en Supabase/local y fuerza el recálculo automático de Excel.
   - Conserva el 100% de formatos, colores, tipografías, pestañas (`Dashboard`, `DATOS`, `BD`, `CONSOLIDADOS`, `Deudas`) y fórmulas SUMIFS.

---

## 🗄️ Paso 1: Configurar Supabase

1. Entra a tu cuenta en [Supabase](https://supabase.com/) y abre tu proyecto (o crea uno nuevo).
2. Ve al menú lateral izquierdo y haz clic en **SQL Editor**.
3. Abre el archivo `supabase_schema.sql` de este proyecto, copia todo su contenido y pégalo en el SQL Editor de Supabase. Luego haz clic en **Run**.
   - Esto creará las tablas `registro`, `cambio_aceite`, `deudas` y configurará los permisos de lectura y escritura.
4. *(Opcional pero muy recomendado)*: Abre el archivo `supabase_seed.sql`, cópialo y ejecútalo en el SQL Editor de Supabase.
   - Esto insertará de inmediato tus **503 registros históricos** que tenías en el Excel desde mayo de 2025 hasta noviembre de 2026.
5. Obtén tus credenciales de Supabase:
   - Ve a **Project Settings** > **API**.
   - Copia la **Project URL** (ejemplo: `https://xyzcompany.supabase.co`).
   - Copia la **anon public key** (una clave larga que empieza por `eyJ...`).

---

## 🌐 Paso 2: Desplegar en Netlify

Tienes dos formas sumamente sencillas de tener tu sitio web en línea:

### Opción A: Despliegue Rápido (Netlify Drop - Sin instalar nada)
1. Inicia sesión en [Netlify](https://app.netlify.com/).
2. Ve a la sección **Sites** y baja hasta donde dice **"Want to deploy a new site without connecting to Git? Drag and drop your site output folder here"** o entra directamente a:
   👉 [app.netlify.com/drop](https://app.netlify.com/drop)
3. Arrastra la carpeta completa `gastos-nomina-web` a esa ventana.
4. ¡Listo! En 5 segundos Netlify te dará una URL pública gratuita (con certificado HTTPS y soporte móvil) que podrás abrir en tu celular, tablet o PC.

### Opción B: Conectar con GitHub
1. Sube los archivos de esta carpeta a un repositorio en tu GitHub.
2. En Netlify, haz clic en **Add new site > Import an existing project > GitHub**.
3. Selecciona tu repositorio.
4. Netlify detectará automáticamente el archivo `netlify.toml` incluido en el proyecto. Haz clic en **Deploy Site**.

---

## 📱 Paso 3: Conectar la Aplicación Web con tu Supabase

1. Abre tu nuevo sitio web en el celular o PC.
2. Haz clic en el botón superior **"Modo Local"** o ve a la pestaña **"Supabase & Ajustes"**.
3. Pega tu **Project URL** y tu **anon public key**.
4. Haz clic en **Guardar y Conectar**.
5. Verás cómo la insignia superior cambia a 🟢 **"Supabase Conectado"**.
6. A partir de ese momento, cualquier gasto, ingreso, abono o cambio de aceite que registres desde tu teléfono o computador quedará guardado inmediatamente en tu base de datos de Supabase.

> **Nota:** La aplicación cuenta con modo sin conexión (Offline) automático mediante `localStorage`, por lo que si pierdes conexión a internet o antes de configurar Supabase, puedes seguir usándola sin interrupciones.

---

## 💻 Probar Localmente en tu PC

Si quieres abrirlo en tu computadora antes de subirlo a Netlify:
- Haz doble clic en el archivo `start-server.bat`.
- Se abrirá automáticamente tu navegador en `http://localhost:8080/`.

---

## 📁 Estructura del Proyecto

```
gastos-nomina-web/
├── index.html            # Interfaz web responsiva (Tailwind CSS + Lucide Icons + Chart.js)
├── app.js                # Lógica del cliente, sincronización Supabase, filtros y gráficos
├── exportExcel.js        # Motor de inyección de datos que genera el .xlsm idéntico
├── templateBase64.js     # Plantilla base64 del archivo original Proyecto_gastos_final.xlsm
├── initialData.js        # Copia de seguridad en JS de los 503 registros históricos
├── supabase_schema.sql   # Script DDL para crear las tablas y políticas en Supabase
├── supabase_seed.sql     # Script SQL con los 503 registros históricos listos para insertar
├── netlify.toml          # Configuración de despliegue para Netlify
├── start-server.bat      # Acceso directo para ejecutar en Windows con 1 clic
├── start-server.ps1      # Servidor HTTP local ligero en PowerShell
└── README.md             # Esta documentación
```
