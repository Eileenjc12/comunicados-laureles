# 📘 Manual de Uso: Portal Residencial Urbanización Los Laureles

Guía completa de operación para la **Junta Directiva**, el personal de **Administración** y los **Vecinos (Propietarios e Inquilinos)**.

---

## 🔑 1. Clave de Administración y Cómo Cambiarla

### Clave actual por defecto:
```text
1234
```
*(También se admite `123456` para pruebas).*

### ¿Dónde y cómo cambiar la clave?

La clave se configura de manera muy sencilla a través del archivo de configuración **`.env`** ubicado en la carpeta principal del proyecto:

📍 **Ruta del archivo:**
`d:\COMUNICADOS-LAURELES\.env`

#### Pasos para cambiarla:
1. Abre el archivo **`.env`** con el **Bloc de notas** (o tu editor favorito).
2. Verás la siguiente línea:
   ```env
   ADMIN_PIN=1234
   ```
3. Reemplaza `1234` por la contraseña o PIN que tú desees. Por ejemplo:
   ```env
   ADMIN_PIN=LaurelesSeguro2026
   ```
4. Guarda el archivo (`Ctrl + S`).
5. Reinicia la aplicación en tu consola (`Ctrl + C` y vuelve a escribir `npm run dev`).
6. ¡Listo! A partir de ese momento solo se podrá ingresar al panel de administración con tu nueva clave.

> **💡 Nota de seguridad:** Si alguna vez borras el archivo `.env`, el sistema utilizará por defecto `1234` como respaldo de emergencia. También puedes editar directamente el archivo de código [`src/lib/auth.ts`](file:///d:/COMUNICADOS-LAURELES/src/lib/auth.ts) en la línea 30 si prefieres cambiar el valor predeterminado del sistema.

---

## 🚀 2. Cómo Encender la Plataforma

1. Abre tu terminal de comandos (PowerShell o CMD).
2. Entra a la carpeta del proyecto:
   ```powershell
   cd d:\COMUNICADOS-LAURELES
   ```
3. Ejecuta el comando de inicio:
   ```powershell
   npm run dev
   ```
4. Verás en pantalla que el servidor está activo en:
   👉 **`http://localhost:4321`**

---

## 🌐 3. Accesos Principales del Sistema

| Módulo | Enlace | Para quién es |
| :--- | :--- | :--- |
| **Portal y Comunicados** | [http://localhost:4321](http://localhost:4321) | Todos los residentes y visitantes. |
| **Mercado Laureles** | [http://localhost:4321/mercado](http://localhost:4321/mercado) | Vecinos compradores y emprendedores. |
| **Postular Negocio** | [http://localhost:4321/mercado/postular](http://localhost:4321/mercado/postular) | Vecinos que deseen vender productos/servicios. |
| **Panel de Administración** | [http://localhost:4321/admin](http://localhost:4321/admin) | Junta Directiva y Administración. |

---

## 📱 4. Guía para los Vecinos (Portal Público)

### A. Directorio de Emergencia
En la parte superior de la página, los vecinos encontrarán los teléfonos de contacto inmediato con enlace directo a llamada telefónica y WhatsApp:
- 🚨 **Portería Principal / Acceso**
- 🛡️ **Vigilancia 24/7**
- 🏢 **Oficina de Administración**
- 🚒 **Bomberos (116)**, 🚓 **Policía (105)**, 🚑 **Ambulancia SAMU (106)**

### B. Lectura y Búsqueda de Comunicados
- Los comunicados están organizados por categorías: *Urgente / Alertas*, *Mantenimiento*, *Convocatorias de Asamblea*, *Normas de Convivencia* y *Finanzas / Cuotas*.
- El vecino puede filtrar por su rol (*General*, *Solo Propietarios* o *Solo Inquilinos*).
- Dispone de un buscador en tiempo real para localizar cualquier anuncio por palabras clave o fechas.

### C. ¿Cómo confirma lectura el vecino?
1. El vecino hace clic en cualquier comunicado para leer el contenido completo.
2. Al final del texto encontrará la sección: **"Confirmación de Lectura Obligatoria"**.
3. Selecciona su **Manzana** (de la Mz. A a la Mz. E) y su número de **Casa/Lote**.
4. Escribe su **Nombre y Apellido**.
5. Selecciona su condición: **Propietario** o **Inquilino**.
6. Presiona el botón verde: **"Confirmar Lectura del Comunicado"**.
7. El sistema registrará la fecha y hora exacta.
8. **Prevención de duplicados:** Si alguien de esa misma casa ya confirmó la lectura, el sistema le avisará que dicho inmueble ya tomó conocimiento, evitando conteos dobles o falsos quórums.
9. La **Barra de Quórum** mostrará el avance general (por ejemplo: *"38 de 52 casas (73%) han confirmado"*).

---

## 🛍️ 5. Guía del "Mercado Laureles" (Emprendimientos Vecinales)

Espacio solidario creado para apoyar a los vecinos independientes:

### A. ¿Cómo compran los vecinos?
1. Ingresan a [http://localhost:4321/mercado](http://localhost:4321/mercado).
2. Pueden filtrar por categoría:
   - 🍲 **Gastronomía / Comida**: Menús del día, postres, empanadas, desayunos.
   - 👗 **Vestimenta / Ropa**: Ropa de temporada, arreglos de costura, accesorios.
   - 🔧 **Servicios Técnicos**: Reparación de electrodomésticos, soporte de cómputo.
   - 🚰 **Gasfitería y Electricidad**: Instalaciones y reparaciones del hogar.
   - 💇 **Belleza / Cuidado Personal**: Peluquería, manicura, masajes.
3. Cada anuncio tiene un botón verde: **"Contactar por WhatsApp"**.
4. Al hacer clic, se abre automáticamente el chat de WhatsApp del celular del vecino con un mensaje listo para pedir productos o consultar precios.

### B. ¿Cómo postula un vecino su negocio?
1. El vecino entra a: [http://localhost:4321/mercado/postular](http://localhost:4321/mercado/postular).
2. Llena sus datos:
   - Nombre de su emprendimiento.
   - Rubro o categoría.
   - Descripción de los productos o servicios que ofrece.
   - Su nombre completo y dirección en la urbanización (ej. *Mz. B, Lote 04*).
   - Número de WhatsApp para recibir pedidos.
   - Horario de atención.
3. Envía el formulario.
4. El anuncio pasa a estado **Pendiente** hasta que la administración lo apruebe.

---

## 🔒 6. Guía para la Administración (`/admin`)

### A. Inicio de Sesión
1. Entra a [http://localhost:4321/admin](http://localhost:4321/admin).
2. Ingresa el **PIN** (por defecto `1234` o el que hayas configurado en tu `.env`).
3. El sistema mantendrá tu sesión abierta durante 24 horas.

### B. Control de Visualizaciones y Lecturas
1. En la pestaña de **Comunicados**, haz clic en **"Ver Lecturas"** en cualquier comunicado.
2. Verás en pantalla:
   - **Porcentaje de Cobertura**: Por ejemplo, 75% del total de la urbanización.
   - **Lista de Inmuebles Confirmados**: Muestra la Manzana, Lote, Nombre del residente, si es Propietario o Inquilino, y la fecha/hora exacta en que leyó el comunicado.
   - **Lista de Inmuebles Pendientes**: Muestra qué casas aún **NO** han confirmado la lectura.

### C. Botón "Copiar Recordatorio para WhatsApp" 📲
Esta es una de las herramientas más útiles para la administración:
1. En la pantalla del comunicado, presiona el botón: **"Generar Recordatorio para WhatsApp"**.
2. El sistema creará automáticamente un mensaje con este formato:
   ```text
   📢 URBANIZACIÓN LOS LAURELES — COMUNICADO OFICIAL
   📋 Asunto: Convocatoria a Asamblea General Extraordinaria 2026
   🔗 Leer y confirmar aquí: http://localhost:4321/comunicados/convocatoria-asamblea
   
   Estimados vecinos, la Junta Directiva solicita revisar este comunicado...
   
   📊 Avance: 32/52 inmuebles (62%)
   ⏳ Inmuebles pendientes por confirmar (20):
   • Mz. A: Lote 03, Lote 08
   • Mz. B: Lote 01, Lote 05, Lote 11
   • Mz. C: Lote 04, Lote 09
   ...
   👉 Por favor ingresen al enlace y confirmen su lectura. ¡Gracias!
   ```
3. Presiona **"Copiar Mensaje"** y pégalo directamente en el grupo general de WhatsApp de la urbanización.

### D. Publicar un Nuevo Comunicado
1. En el panel `/admin`, ve a **"Crear Comunicado"** ([http://localhost:4321/admin/comunicados/nuevo](http://localhost:4321/admin/comunicados/nuevo)).
2. Rellena los campos:
   - **Título**: Claro y formal.
   - **Categoría**: Selecciona la adecuada (Urgente, Mantenimiento, Asamblea, etc.).
   - **Destinatario**: General, Solo Propietarios o Solo Inquilinos.
   - **¿Es Urgente?**: Marca la casilla si requiere alerta visual roja.
   - **Fecha límite** (opcional): Si hay una fecha tope de respuesta o asistencia.
   - **Contenido**: Redacta el comunicado con detalles, puntos de agenda, etc.
3. Haz clic en **"Publicar Comunicado"**. Aparecerá inmediatamente en el portal para todos los vecinos.

### E. Moderar Emprendimientos Vecinales
1. En el menú superior del panel, entra a **"Mercado"** ([http://localhost:4321/admin/mercado](http://localhost:4321/admin/mercado)).
2. Encontrarás la lista de negocios que los vecinos han postulado.
3. Revisa los datos y presiona:
   - ✅ **Aprobar**: El negocio se hace visible de inmediato en el directorio público.
   - ❌ **Rechazar**: Si el anuncio no cumple con las normas de convivencia de la urbanización.

### F. Descargar Actas Oficiales en Excel / CSV 📑
Para auditorías, actas notariales o asambleas generales:
1. En el detalle de lecturas de un comunicado, haz clic en **"Exportar a Excel (CSV)"**.
2. Se descargará un archivo `.csv` con formato especial **UTF-8 BOM**.
3. Ábrelo directamente con **Microsoft Excel**. Los caracteres con tildes, la 'ñ' y los nombres peruanos se mostrarán perfectamente legibles y ordenados por columnas (Manzana, Lote, Dirección, Residente, Rol, Fecha y Estado).

---

## 💾 7. Respaldo y Base de Datos

Toda la información del sistema (comunicados, padrón de las 52 casas, registros de lectura y emprendimientos) se almacena de forma segura y permanente en un único archivo:

📍 **Ruta de la base de datos:**
`d:\COMUNICADOS-LAURELES\data\laureles.db`

### ¿Cómo hacer una copia de seguridad (Backup)?
Para hacer un respaldo de seguridad de todos los datos de la urbanización:
1. Simplemente copia el archivo `laureles.db` y guárdalo en una memoria USB, en Google Drive o en tu correo.
2. Si alguna vez necesitas restaurar el sistema, solo vuelve a pegar ese archivo en la carpeta `data/` y todos los datos históricos se recuperarán al instante.

---

¡Tu plataforma de la **Urbanización Los Laureles** está 100% lista y protegida para el uso diario de la comunidad!
