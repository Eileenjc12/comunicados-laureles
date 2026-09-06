import type { DatabaseSync } from 'node:sqlite';



export const SEED_PROPERTIES = [
  // Manzana A (10 Lotes - Calle Los Rosales)
  { manzana: 'Mz. A', lote: 'Lote 01', address: 'Calle Los Rosales 101', owner_name: 'Carlos Alberto Mendoza Silva' },
  { manzana: 'Mz. A', lote: 'Lote 02', address: 'Calle Los Rosales 103', owner_name: 'María Elena Paredes Ramos' },
  { manzana: 'Mz. A', lote: 'Lote 03', address: 'Calle Los Rosales 105', owner_name: 'Jorge Luis Villanueva Castro' },
  { manzana: 'Mz. A', lote: 'Lote 04', address: 'Calle Los Rosales 107', owner_name: 'Rosa Lucía Benites Morales' },
  { manzana: 'Mz. A', lote: 'Lote 05', address: 'Calle Los Rosales 109', owner_name: 'Héctor Manuel Quintana Torres' },
  { manzana: 'Mz. A', lote: 'Lote 06', address: 'Calle Los Rosales 111', owner_name: 'Gladys Patricia Huamán Ortiz' },
  { manzana: 'Mz. A', lote: 'Lote 07', address: 'Calle Los Rosales 113', owner_name: 'Víctor Raúl Espinoza Vega' },
  { manzana: 'Mz. A', lote: 'Lote 08', address: 'Calle Los Rosales 115', owner_name: 'Carmen Teresa Salazar Bravo' },
  { manzana: 'Mz. A', lote: 'Lote 09', address: 'Calle Los Rosales 117', owner_name: 'Eduardo Daniel Rivas Gómez' },
  { manzana: 'Mz. A', lote: 'Lote 10', address: 'Calle Los Rosales 119', owner_name: 'Silvia Mónica Cornejo Peña' },

  // Manzana B (12 Lotes - Calle Los Álamos)
  { manzana: 'Mz. B', lote: 'Lote 01', address: 'Calle Los Álamos 201', owner_name: 'Fernando José Alarcón Flores' },
  { manzana: 'Mz. B', lote: 'Lote 02', address: 'Calle Los Álamos 203', owner_name: 'Ana Cecilia Barrientos Luna' },
  { manzana: 'Mz. B', lote: 'Lote 03', address: 'Calle Los Álamos 205', owner_name: 'Manuel Alejandro Cárdenas Gil' },
  { manzana: 'Mz. B', lote: 'Lote 04', address: 'Calle Los Álamos 207', owner_name: 'Juana Isabel Domínguez Ríos' },
  { manzana: 'Mz. B', lote: 'Lote 05', address: 'Calle Los Álamos 209', owner_name: 'Roberto Carlos Estrada Pinto' },
  { manzana: 'Mz. B', lote: 'Lote 06', address: 'Calle Los Álamos 211', owner_name: 'Teresa De Jesús Figueroa Cruz' },
  { manzana: 'Mz. B', lote: 'Lote 07', address: 'Calle Los Álamos 213', owner_name: 'Gustavo Adolfo Gálvez León' },
  { manzana: 'Mz. B', lote: 'Lote 08', address: 'Calle Los Álamos 215', owner_name: 'Norma Beatriz Hidalgo Vera' },
  { manzana: 'Mz. B', lote: 'Lote 09', address: 'Calle Los Álamos 217', owner_name: 'César Augusto Iparraguirre Solís' },
  { manzana: 'Mz. B', lote: 'Lote 10', address: 'Calle Los Álamos 219', owner_name: 'Lucía Mercedes Jáuregui Cano' },
  { manzana: 'Mz. B', lote: 'Lote 11', address: 'Calle Los Álamos 221', owner_name: 'Oscar Enrique Loyola Montes' },
  { manzana: 'Mz. B', lote: 'Lote 12', address: 'Calle Los Álamos 223', owner_name: 'Yolanda Pilar Medina Soto' },

  // Manzana C (10 Lotes - Jirón Las Acacias)
  { manzana: 'Mz. C', lote: 'Lote 01', address: 'Jirón Las Acacias 301', owner_name: 'Javier Ignacio Navarro Campos' },
  { manzana: 'Mz. C', lote: 'Lote 02', address: 'Jirón Las Acacias 303', owner_name: 'Olga Rocío Ochoa Zambrano' },
  { manzana: 'Mz. C', lote: 'Lote 03', address: 'Jirón Las Acacias 305', owner_name: 'Pedro Pablo Quiroz Valdivia' },
  { manzana: 'Mz. C', lote: 'Lote 04', address: 'Jirón Las Acacias 307', owner_name: 'Sara Maritza Ramírez Leyva' },
  { manzana: 'Mz. C', lote: 'Lote 05', address: 'Jirón Las Acacias 309', owner_name: 'Raúl Enrique Salinas Miranda' },
  { manzana: 'Mz. C', lote: 'Lote 06', address: 'Jirón Las Acacias 311', owner_name: 'Miriam Esther Toledo Bustos' },
  { manzana: 'Mz. C', lote: 'Lote 07', address: 'Jirón Las Acacias 313', owner_name: 'Alfredo Martín Ugarte Ponce' },
  { manzana: 'Mz. C', lote: 'Lote 08', address: 'Jirón Las Acacias 315', owner_name: 'Delia Esperanza Vargas Prado' },
  { manzana: 'Mz. C', lote: 'Lote 09', address: 'Jirón Las Acacias 317', owner_name: 'Hugo Hernán Wong Carranza' },
  { manzana: 'Mz. C', lote: 'Lote 10', address: 'Jirón Las Acacias 319', owner_name: 'Beatriz Aurora Yáñez Chávez' },

  // Manzana D (10 Lotes - Pasaje Los Cipreses)
  { manzana: 'Mz. D', lote: 'Lote 01', address: 'Pasaje Los Cipreses 401', owner_name: 'Gonzalo Andrés Zapata Robles' },
  { manzana: 'Mz. D', lote: 'Lote 02', address: 'Pasaje Los Cipreses 403', owner_name: 'Adriana Jimena Acosta Bellido' },
  { manzana: 'Mz. D', lote: 'Lote 03', address: 'Pasaje Los Cipreses 405', owner_name: 'Emilio Tomás Bravo Calderón' },
  { manzana: 'Mz. D', lote: 'Lote 04', address: 'Pasaje Los Cipreses 407', owner_name: 'Clara Isabel Castañeda Dávila' },
  { manzana: 'Mz. D', lote: 'Lote 05', address: 'Pasaje Los Cipreses 409', owner_name: 'David Esteban Fuentes Fuentes' },
  { manzana: 'Mz. D', lote: 'Lote 06', address: 'Pasaje Los Cipreses 411', owner_name: 'Guillermo Felipe Guerra Lazo' },
  { manzana: 'Mz. D', lote: 'Lote 07', address: 'Pasaje Los Cipreses 413', owner_name: 'Helena Marcela Lozano Meza' },
  { manzana: 'Mz. D', lote: 'Lote 08', address: 'Pasaje Los Cipreses 415', owner_name: 'Julio César Naranjo Ojeda' },
  { manzana: 'Mz. D', lote: 'Lote 09', address: 'Pasaje Los Cipreses 417', owner_name: 'Karina Paola Pizarro Quintana' },
  { manzana: 'Mz. D', lote: 'Lote 10', address: 'Pasaje Los Cipreses 419', owner_name: 'Leonardo Favio Reátegui Saavedra' },

  // Manzana E (10 Lotes - Avenida Los Laureles Principal)
  { manzana: 'Mz. E', lote: 'Lote 01', address: 'Av. Los Laureles 501', owner_name: 'Marcos Antonio Tejada Urbina' },
  { manzana: 'Mz. E', lote: 'Lote 02', address: 'Av. Los Laureles 503', owner_name: 'Nelly Violeta Valera Vivanco' },
  { manzana: 'Mz. E', lote: 'Lote 03', address: 'Av. Los Laureles 505', owner_name: 'Walter Oswaldo Zamora Arce' },
  { manzana: 'Mz. E', lote: 'Lote 04', address: 'Av. Los Laureles 507', owner_name: 'Alicia Consuelo Cabrera Díaz' },
  { manzana: 'Mz. E', lote: 'Lote 05', address: 'Av. Los Laureles 509', owner_name: 'Bernardo José Córdova Erazo' },
  { manzana: 'Mz. E', lote: 'Lote 06', address: 'Av. Los Laureles 511', owner_name: 'Diana Carolina Falcón Garay' },
  { manzana: 'Mz. E', lote: 'Lote 07', address: 'Av. Los Laureles 513', owner_name: 'Esteban Daniel Guzmán Heredia' },
  { manzana: 'Mz. E', lote: 'Lote 08', address: 'Av. Los Laureles 515', owner_name: 'Flor De María Iriarte Jáuregui' },
  { manzana: 'Mz. E', lote: 'Lote 09', address: 'Av. Los Laureles 517', owner_name: 'Gerardo Alfonso Jurado Luque' },
  { manzana: 'Mz. E', lote: 'Lote 10', address: 'Av. Los Laureles 519', owner_name: 'Hilda Noemí Márquez Noriega' },
];

export const SEED_ANNOUNCEMENTS = [
  {
    id: 1,
    title: 'Convocatoria Oficial: Asamblea General Ordinaria de Residentes 2026',
    slug: 'asamblea-general-ordinaria-2026',
    summary:
      'La Junta Directiva convoca formalmente a todos los propietarios a la Asamblea General para tratar el balance anual y elección del nuevo comité.',
    content: `# Convocatoria a Asamblea General Ordinaria 2026

Estimados vecinos y propietarios de la **Urbanización Los Laureles**:

De conformidad con el Estatuto Vecinal vigente, la Junta Directiva convoca a sesión de **Asamblea General Ordinaria** de carácter obligatorio.

### Datos de la Sesión:
- **Fecha:** Sábado 20 de Septiembre de 2026
- **Primera Citación:** 19:00 horas (Quórum estatutario: 50% + 1)
- **Segunda Citación:** 19:30 horas (Válida con los presentes)
- **Lugar:** Salón Comunal de la Urbanización (o enlace virtual vía Google Meet)

### Tabla de Temas (Orden del Día):
1. Lectura y aprobación del Acta de la Asamblea anterior.
2. Informe de gestión económica y rendición del balance financiero 2025-2026.
3. Aprobación del presupuesto para la renovación del sistema de cámaras de seguridad perimetral.
4. Elección del Comité Electoral para la renovación de Junta Directiva periodo 2026-2028.

> **Nota:** Se solicita a cada propietario registrar su confirmación de lectura en el formulario inferior para verificar el quórum previo de la citación.`,
    category: 'Convocatorias de Asamblea' as const,
    audience: 'Solo Propietarios' as const,
    is_urgent: 0,
    deadline_date: '2026-09-20',
    pinned: 1,
    archived: 0,
    visit_count: 148,
  },
  {
    id: 2,
    title: 'Mantenimiento Preventivo Semestral de Cisterna y Bombas de Agua',
    slug: 'mantenimiento-cisterna-bombas-agua-septiembre',
    summary:
      'Corte programado del servicio de agua potable este jueves de 08:00 a 16:00 hrs por limpieza, desinfección y mantenimiento técnico de electrobombas.',
    content: `# Mantenimiento Preventivo de Cisterna y Electrobombas

Estimados vecinos (Propietarios e Inquilinos):

Se informa que este **Jueves 10 de Septiembre de 2026**, la empresa de saneamiento ambiental *HidroServicios S.A.C.* ejecutará el lavado integral, desinfección certificada de la cisterna principal y mantenimiento preventivo de las dos bombas hidroneumáticas de la urbanización.

### Horario de Suspensión Temporal:
- **Inicio de corte:** 08:00 hrs.
- **Restablecimiento gradual:** 16:00 hrs a 17:30 hrs.

### Recomendaciones para todos los hogares:
1. Almacenar agua potable en recipientes limpios con debida anticipación para el consumo del día.
2. Mantener cerradas las llaves de paso durante el trabajo para evitar ingreso de sedimentos a las cañerías internas.
3. El personal técnico estará debidamente acreditado y supervisado por la portería y la administración.

Agradecemos su comprensión y colaboración para mantener la salubridad y operatividad de nuestros equipos comunitarios.`,
    category: 'Mantenimiento' as const,
    audience: 'General' as const,
    is_urgent: 1,
    deadline_date: '2026-09-10',
    pinned: 1,
    archived: 0,
    visit_count: 215,
  },
  {
    id: 3,
    title: 'Normas de Convivencia: Control de Ruidos Molestos y Manejo de Mascotas en Áreas Comunes',
    slug: 'normas-convivencia-ruidos-y-mascotas',
    summary:
      'Recordatorio estricto sobre horarios de silencio vecinal y uso obligatorio de correa y recojo de excretas de mascotas en parques y pasajes.',
    content: `# Disposiciones Obligatorias de Convivencia Vecinal

Con el propósito de salvaguardar la tranquilidad, el descanso y el orden de todas las familias de **Los Laureles**, la Junta Directiva recuerda el cumplimiento irrestricto de las normas aprobadas en asamblea:

### 1. Ruidos y Reuniones Sociales:
- Los días de semana (Lunes a Jueves), el límite máximo para música y ruido perceptible fuera del inmueble es a las **22:00 hrs**.
- Los días Viernes, Sábados y vísperas de feriado, el horario límite es a las **01:00 hrs** del día siguiente.
- Queda terminantemente prohibido estacionar vehículos con volumen de audio alto en las vías internas.

### 2. Tenencia Responsable de Mascotas:
- Todo canino debe circular por veredas y parques provisto obligatoriamente de **correa y collar** en compañía de un adulto responsable.
- Es deber ciudadano e insoslayable portar bolsas para el **inmediato recojo de deposiciones**.
- Las razas de manejo especial deben utilizar bozal reglamentario según Ley N° 27596.

El incumplimiento reiterado dará lugar a la aplicación de sanciones y multas en la cuota de mantenimiento respectiva.`,
    category: 'Normas de Convivencia' as const,
    audience: 'General' as const,
    is_urgent: 0,
    deadline_date: null,
    pinned: 0,
    archived: 0,
    visit_count: 92,
  },
  {
    id: 4,
    title: 'Cierre Financiero Agosto 2026 y Publicación de Estado de Cuotas de Mantenimiento',
    slug: 'cierre-financiero-agosto-2026-estado-cuotas',
    summary:
      'Balance contable disponible con ingresos, egresos por seguridad y áreas verdes, y lista de inmuebles al día.',
    content: `# Rendición de Cuentas: Balance Mensual Agosto 2026

Estimados vecinos copropietarios:

En cumplimiento del compromiso de absoluta transparencia, adjuntamos el resumen financiero correspondiente al mes de Agosto 2026:

### Resumen Contable:
- **Ingresos por Cuotas Ordinarias (52 casas):** S/. 7,800.00 (92% de recaudación)
- **Ingresos por uso de Salón Comunal:** S/. 350.00
- **Egresos Operativos:**
  - Servicio de Seguridad y Vigilancia 24/7 (2 guardias): S/. 4,200.00
  - Servicio de Jardinería y Mantenimiento de Parques: S/. 1,100.00
  - Consumo de Energía Eléctrica Común (Alumbrado interno y bombas): S/. 890.00
  - Mantenimiento menor de portón levadizo: S/. 280.00
- **Superávit del mes a Fondo de Reserva:** S/. 1,680.00

El detalle pormenorizado con comprobantes de pago escaneados se encuentra en la carpeta física de administración en garita y puede solicitarse digitalmente por WhatsApp.`,
    category: 'Finanzas / Cuotas' as const,
    audience: 'Solo Propietarios' as const,
    is_urgent: 0,
    deadline_date: '2026-09-15',
    pinned: 0,
    archived: 0,
    visit_count: 64,
  },
  {
    id: 5,
    title: 'Alerta Urgente: Reparación Inmediata de Alumbrado en Pasaje Los Cipreses y Portón 2',
    slug: 'alerta-reparacion-alumbrado-pasaje-cipreses',
    summary:
      'Falla en el circuito secundario del Pasaje Los Cipreses será subsanada por cuadrilla técnica eléctrica hoy a partir de las 18:30 hrs.',
    content: `# Alerta de Mantenimiento Urgente

Se pone en conocimiento de los residentes de la **Manzana D (Pasaje Los Cipreses)** que se ha detectado una desconexión en el transformador auxiliar del alumbrado público interno.

- Cuadrilla de técnicos electricistas ingresará hoy a las **18:30 hrs** para el reemplazo del interruptor termomagnético y cableado averiado.
- Durante las maniobras (estimadas en 45 minutos), habrá breves parpadeos en el alumbrado comunal.
- Rogamos a los conductores circular a baja velocidad por la presencia de escaleras y conos de señalización en la vía.

Personal de garita brindará apoyo de tránsito en el sector.`,
    category: 'Urgente / Alertas' as const,
    audience: 'General' as const,
    is_urgent: 1,
    deadline_date: null,
    pinned: 0,
    archived: 0,
    visit_count: 110,
  },
];

export const SEED_MARKETPLACE_LISTINGS = [
  {
    title: 'Repostería & Tortas Doña Rosa',
    description:
      'Tortas personalizadas para cumpleaños, pies de limón, kekes caseros y bocaditos dulces para reuniones. Entregas a domicilio en toda la urbanización.',
    category: 'Gastronomía / Comida' as const,
    entrepreneur_name: 'Rosa Paredes',
    property_address: 'Mz. B Lote 02 (Calle Los Álamos 203)',
    phone: '+51 987 112 233',
    whatsapp_message:
      '¡Hola Doña Rosa! Vi sus deliciosas tortas en Mercado Laureles. Quisiera cotizar una torta para este fin de semana.',
    image_url: '/images/marketplace/reposteria-rosa.svg',
    schedule_hours: 'Mar - Dom: 10:00 AM - 8:00 PM',
    status: 'approved' as const,
    admin_notes: 'Verificado. Vecina activa y cumple con estándares sanitarios.',
  },
  {
    title: 'Servicio Técnico & Redes Laureles',
    description:
      'Mantenimiento de computadoras, laptops, instalación de repetidores Wi-Fi, cámaras de seguridad y soporte remoto para vecinos.',
    category: 'Servicios Técnicos' as const,
    entrepreneur_name: 'Ing. Carlos Mendoza',
    property_address: 'Mz. A Lote 01 (Calle Los Rosales 101)',
    phone: '+51 991 223 344',
    whatsapp_message:
      '¡Hola Carlos! Vi tu servicio técnico en Mercado Laureles. Tengo un problema con mi computadora/red y requiero asistencia.',
    image_url: '/images/marketplace/servicio-tecnico.svg',
    schedule_hours: 'Lun - Sáb: 9:00 AM - 7:00 PM',
    status: 'approved' as const,
    admin_notes: 'Verificado. Ingeniero residente de la comunidad.',
  },
  {
    title: 'Gasfitería & Electricidad Don Lucho',
    description:
      'Especialista en fugas de agua, bombas de presión, termas, cambio de tableros eléctricos, cableado e iluminación LED. Atención de emergencias vecinales.',
    category: 'Gasfitería / Electricidad' as const,
    entrepreneur_name: 'Luis Huamán',
    property_address: 'Mz. A Lote 06 (Calle Los Rosales 111)',
    phone: '+51 976 334 455',
    whatsapp_message:
      '¡Hola Don Lucho! Lo contacto desde Urbanización Los Laureles para una urgencia de gasfitería/electricidad en mi casa.',
    image_url: '/images/marketplace/gasfiteria-lucho.svg',
    schedule_hours: 'Lun - Dom: 7:00 AM - 9:00 PM (Emergencias 24/7)',
    status: 'approved' as const,
    admin_notes: 'Técnico certificado con excelente reputación en la comunidad.',
  },
  {
    title: 'Confecciones & Arreglos Carmen',
    description:
      'Bastas de pantalones, cambio de cierres, entalle de prendas, confección de cortinas y uniformes escolares.',
    category: 'Vestimenta / Ropa' as const,
    entrepreneur_name: 'Carmen Salazar',
    property_address: 'Mz. A Lote 08 (Calle Los Rosales 115)',
    phone: '+51 982 445 566',
    whatsapp_message:
      '¡Hola Sra. Carmen! Vi su taller de confecciones en Mercado Laureles. Quisiera consultar sobre el arreglo de unas prendas.',
    image_url: '/images/marketplace/confecciones-carmen.svg',
    schedule_hours: 'Lun - Vie: 9:00 AM - 6:00 PM',
    status: 'approved' as const,
    admin_notes: 'Taller de costura verificado.',
  },
  {
    title: 'Studio de Belleza & Manicure Yanet',
    description:
      'Manicure rusa, pedicure spa, lifting de pestañas, depilación y peinados para eventos. Atención previa cita en la comodidad de la urbanización.',
    category: 'Belleza / Cuidado Personal' as const,
    entrepreneur_name: 'Yanet Jáuregui',
    property_address: 'Mz. B Lote 10 (Calle Los Álamos 219)',
    phone: '+51 998 556 677',
    whatsapp_message:
      '¡Hola Yanet! Vi tu studio de belleza en Mercado Laureles. Quisiera agendar una cita para esta semana.',
    image_url: '/images/marketplace/belleza-yanet.svg',
    schedule_hours: 'Mar - Sáb: 10:00 AM - 7:00 PM',
    status: 'approved' as const,
    admin_notes: 'Estudio de belleza verificado.',
  },
  {
    title: 'Piqueos & Empanadas Caseras San Martín',
    description:
      'Empanadas horneadas artesanales de carne y pollo, tablas de quesos y bocaditos salados para el lonche familiar o reuniones.',
    category: 'Gastronomía / Comida' as const,
    entrepreneur_name: 'Jorge San Martín',
    property_address: 'Mz. C Lote 05 (Jirón Las Acacias 309)',
    phone: '+51 984 667 788',
    whatsapp_message:
      '¡Hola Jorge! Quisiera hacer un pedido de empanadas artesanales para hoy en la tarde.',
    image_url: '/images/marketplace/empanadas-sanmartin.svg',
    schedule_hours: 'Jue - Dom: 4:00 PM - 9:00 PM',
    status: 'approved' as const,
    admin_notes: 'Aprobado por administración.',
  },
];

export const SEED_READ_CONFIRMATIONS = [

  { announcement_id: 1, property_id: 1, resident_name: 'Carlos Alberto Mendoza Silva', role: 'Propietario' as const, confirmed_at: '2026-09-01 11:20:00' },
  { announcement_id: 1, property_id: 2, resident_name: 'María Elena Paredes Ramos', role: 'Propietario' as const, confirmed_at: '2026-09-01 11:45:00' },
  { announcement_id: 1, property_id: 3, resident_name: 'Jorge Luis Villanueva Castro', role: 'Propietario' as const, confirmed_at: '2026-09-01 12:10:00' },
  { announcement_id: 1, property_id: 5, resident_name: 'Héctor Manuel Quintana Torres', role: 'Propietario' as const, confirmed_at: '2026-09-01 13:05:00' },
  { announcement_id: 1, property_id: 7, resident_name: 'Víctor Raúl Espinoza Vega', role: 'Propietario' as const, confirmed_at: '2026-09-01 14:22:00' },
  { announcement_id: 1, property_id: 11, resident_name: 'Fernando José Alarcón Flores', role: 'Propietario' as const, confirmed_at: '2026-09-01 15:30:00' },
  { announcement_id: 1, property_id: 12, resident_name: 'Ana Cecilia Barrientos Luna', role: 'Propietario' as const, confirmed_at: '2026-09-01 16:15:00' },
  { announcement_id: 1, property_id: 14, resident_name: 'Juana Isabel Domínguez Ríos', role: 'Propietario' as const, confirmed_at: '2026-09-01 17:00:00' },
  { announcement_id: 1, property_id: 15, resident_name: 'Roberto Carlos Estrada Pinto', role: 'Propietario' as const, confirmed_at: '2026-09-01 18:40:00' },
  { announcement_id: 1, property_id: 17, resident_name: 'Gustavo Adolfo Gálvez León', role: 'Propietario' as const, confirmed_at: '2026-09-01 19:12:00' },
  { announcement_id: 1, property_id: 23, resident_name: 'Javier Ignacio Navarro Campos', role: 'Propietario' as const, confirmed_at: '2026-09-02 09:10:00' },
  { announcement_id: 1, property_id: 25, resident_name: 'Pedro Pablo Quiroz Valdivia', role: 'Propietario' as const, confirmed_at: '2026-09-02 10:35:00' },
  { announcement_id: 1, property_id: 27, resident_name: 'Raúl Enrique Salinas Miranda', role: 'Propietario' as const, confirmed_at: '2026-09-02 11:50:00' },
  { announcement_id: 1, property_id: 29, resident_name: 'Alfredo Martín Ugarte Ponce', role: 'Propietario' as const, confirmed_at: '2026-09-02 14:05:00' },
  { announcement_id: 1, property_id: 33, resident_name: 'Gonzalo Andrés Zapata Robles', role: 'Propietario' as const, confirmed_at: '2026-09-02 15:20:00' },
  { announcement_id: 1, property_id: 35, resident_name: 'Emilio Tomás Bravo Calderón', role: 'Propietario' as const, confirmed_at: '2026-09-02 16:45:00' },
  { announcement_id: 1, property_id: 37, resident_name: 'David Esteban Fuentes Fuentes', role: 'Propietario' as const, confirmed_at: '2026-09-03 08:30:00' },
  { announcement_id: 1, property_id: 43, resident_name: 'Marcos Antonio Tejada Urbina', role: 'Propietario' as const, confirmed_at: '2026-09-03 10:15:00' },
  { announcement_id: 1, property_id: 45, resident_name: 'Walter Oswaldo Zamora Arce', role: 'Propietario' as const, confirmed_at: '2026-09-03 11:40:00' },
  { announcement_id: 1, property_id: 47, resident_name: 'Bernardo José Córdova Erazo', role: 'Propietario' as const, confirmed_at: '2026-09-03 13:00:00' },
  { announcement_id: 1, property_id: 51, resident_name: 'Gerardo Alfonso Jurado Luque', role: 'Propietario' as const, confirmed_at: '2026-09-04 09:20:00' },
];

/**
 * Seeds the database with 52 census properties, 5 official announcements, 6 marketplace listings,
 * and demonstration quorum read confirmations.
 * Idempotent: safe to run multiple times without duplicating entries.
 */

export function seedDatabase(db: DatabaseSync): {
  propertiesCount: number;
  announcementsCount: number;
  listingsCount: number;
} {


  // 1. Seed Census Properties (52 Properties)
  const propInsert = db.prepare(`
    INSERT OR IGNORE INTO census_properties (manzana, lote, address, owner_name, is_active)
    VALUES (?, ?, ?, ?, 1)
  `);

  for (const prop of SEED_PROPERTIES) {
    propInsert.run(prop.manzana, prop.lote, prop.address, prop.owner_name);
  }

  // 2. Seed Official Announcements (5 Announcements)
  const annCheck = db.prepare('SELECT COUNT(*) as count FROM announcements');
  const annCount = (annCheck.get() as { count: number }).count;

  if (annCount === 0) {
    const annInsert = db.prepare(`
      INSERT INTO announcements (
        id, title, slug, summary, content, category, audience,
        is_urgent, deadline_date, pinned, archived, visit_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const ann of SEED_ANNOUNCEMENTS) {
      annInsert.run(
        ann.id,
        ann.title,
        ann.slug,
        ann.summary,
        ann.content,
        ann.category,
        ann.audience,
        ann.is_urgent,
        ann.deadline_date,
        ann.pinned,
        ann.archived,
        ann.visit_count
      );
    }
  }

  // 3. Seed Marketplace Listings (6 Approved Listings)
  const marketCheck = db.prepare('SELECT COUNT(*) as count FROM marketplace_listings');
  const marketCount = (marketCheck.get() as { count: number }).count;

  if (marketCount === 0) {
    const marketInsert = db.prepare(`
      INSERT INTO marketplace_listings (
        title, description, category, entrepreneur_name, property_address,
        phone, whatsapp_message, image_url, schedule_hours, status, admin_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const item of SEED_MARKETPLACE_LISTINGS) {
      marketInsert.run(
        item.title,
        item.description,
        item.category,
        item.entrepreneur_name,
        item.property_address,
        item.phone,
        item.whatsapp_message,
        item.image_url,
        item.schedule_hours,
        item.status,
        item.admin_notes
      );
    }
  }

  // 4. Seed Initial Read Confirmations for Demo Quorum (21 confirmed)
  const readCheck = db.prepare('SELECT COUNT(*) as count FROM read_confirmations');
  const readCount = (readCheck.get() as { count: number }).count;

  if (readCount === 0) {
    const readInsert = db.prepare(`
      INSERT OR IGNORE INTO read_confirmations (
        announcement_id, property_id, resident_name, role, confirmed_at
      ) VALUES (?, ?, ?, ?, ?)
    `);

    for (const read of SEED_READ_CONFIRMATIONS) {
      readInsert.run(
        read.announcement_id,
        read.property_id,
        read.resident_name,
        read.role,
        read.confirmed_at
      );
    }
  }

  const finalProps = (db.prepare('SELECT COUNT(*) as count FROM census_properties').get() as { count: number }).count;
  const finalAnn = (db.prepare('SELECT COUNT(*) as count FROM announcements').get() as { count: number }).count;
  const finalList = (db.prepare('SELECT COUNT(*) as count FROM marketplace_listings').get() as { count: number }).count;
  const finalReads = (db.prepare('SELECT COUNT(*) as count FROM read_confirmations').get() as { count: number }).count;

  return {
    propertiesCount: finalProps,
    announcementsCount: finalAnn,
    listingsCount: finalList,
    confirmationsCount: finalReads,
  };
}


export default seedDatabase;
