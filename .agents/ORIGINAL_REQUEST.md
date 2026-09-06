# Original User Request

## Initial Request — 2026-09-04T22:59:40Z

Portal comunitario y web residencial integral para la Urbanización Los Laureles desarrollado con el framework Astro y SQLite nativo de Node.js v24. La plataforma centraliza los comunicados oficiales de la administración hacia los vecinos, gestiona el control y confirmación de lectura por inmueble (propietarios e inquilinos) con métricas en tiempo real y recordatorios para WhatsApp, e incorpora un directorio comercial ("Mercado Laureles") para que los residentes con actividades independientes (comida, ropa, oficios y servicios) puedan postular y exhibir sus emprendimientos con contacto directo a WhatsApp.

Working directory: d:/COMUNICADOS LAURELES
Integrity mode: development

## Requirements

### R1. Portal Institucional y Muro de Comunicados de Administración (Blog)
Portal web con diseño contemporáneo, sobrio y 100% optimizado para teléfonos móviles (los vecinos acceden principalmente desde WhatsApp).
- Portada de la Urbanización Los Laureles con teléfonos de emergencia, portería y contactos de administración.
- Muro de comunicados oficiales emitidos por la administración con clasificación por categorías: Urgente / Alertas, Mantenimiento, Convocatorias de Asamblea, Normas de Convivencia y Finanzas / Cuotas.
- Filtro por destinatario (General, Solo Propietarios, Solo Inquilinos) y buscador en tiempo real por palabras clave y fechas.
- Distintivos visuales para comunicados de alta urgencia o con fecha límite.

### R2. Sistema de Tracking y Confirmación de Lectura por Inmueble
- Contador de visitas globales por comunicado.
- Formulario de confirmación interactivo en cada comunicado donde el residente indica: Manzana/Torre, Casa/Apartamento, Nombre y Apellido, y Rol (Propietario o Inquilino).
- Validación de inmuebles contra el padrón residencial para evitar duplicados en un mismo comunicado.
- Barra de progreso de lectura comunitaria: cálculo visible del porcentaje de inmuebles que han confirmado la lectura respecto al total de la urbanización.

### R3. Directorio de Emprendimientos y Servicios Vecinales ("Mercado Laureles")
- Sección dedicada y accesible desde la navegación principal donde se exhiben los negocios de los residentes (gastronomía/comida, vestimenta/ropa, servicios técnicos, gasfitería, belleza, etc.).
- Tarjetas de presentación de cada emprendimiento con foto/icono, título, descripción, horario, casa/manzana del emprendedor y botón con enlace directo a WhatsApp (https://wa.me/...) con mensaje prellenado para hacer pedidos o consultas.
- Formulario público para que cualquier vecino pueda postular su emprendimiento. Las postulaciones quedan en estado "pendiente" hasta ser validadas por la administración.

### R4. Panel de Administración y Control Centralizado (/admin)
Panel seguro con PIN/clave de acceso para la Junta Directiva o Administración:
- Control de Lecturas: Cobertura porcentual, listado de inmuebles que ya confirmaron lectura (con fecha/hora y rol) y listado de inmuebles pendientes.
- Herramienta WhatsApp: Botón de 1 clic para generar y copiar el texto del recordatorio para WhatsApp con el enlace al comunicado y la lista de casas/aptos pendientes.
- Gestión de Comunicados Oficiales: Crear, editar, fijar o archivar comunicados de administración.
- Gestión de Emprendimientos: Revisar, aprobar, editar o dar de baja postulaciones de emprendedores vecinales.
- Exportación de Reportes: Descarga de constancia de lectura en CSV/Excel para asambleas y actas oficiales.

### R5. Almacenamiento Persistente y Datos Demostrativos
- Almacenamiento con node:sqlite nativo de Node.js v24 (sin dependencias C++ que requieran compilación).
- Padrón residencial precargado de la Urbanización Los Laureles (casas/manzanas estructuradas).
- Comunicados oficiales iniciales precargados (ej. Convocatoria a Asamblea General, Mantenimiento de bombas de agua, Normas de estacionamiento) y anuncios de emprendimientos de ejemplo (repostería/comida casera, confecciones, electricista/gasfitero de la comunidad).

## Acceptance Criteria

### Comunicados y Confirmación de Lectura
- [ ] La lectura individual por inmueble se registra de forma única en SQLite y persiste al reiniciar el servidor.
- [ ] El panel /admin muestra con exactitud qué casas han leído y cuáles faltan por leer.
- [ ] La función de copia para WhatsApp genera el mensaje con el formato adecuado y la lista de pendientes.

### Directorio Comercial Vecinal
- [ ] Los emprendimientos aprobados se listan con filtros por rubro (Comida, Ropa, Servicios, etc.).
- [ ] El botón de WhatsApp abre correctamente el chat con el número y mensaje correspondiente al emprendimiento.
- [ ] El formulario público de postulación guarda el nuevo negocio como pendiente y la administración puede aprobarlo desde /admin.

### Interfaz y Experiencia de Usuario
- [ ] Carga rápida, navegación fluida y diseño adaptado a celulares y pantallas de escritorio.
- [ ] No requiere que el usuario instale programas o servidores de bases de datos externos.
