import { g as getDb } from '../../../../../chunks/db_D9z2L-6S.mjs';
export { renderers } from '../../../../../renderers.mjs';

function escapeCsvValue(val) {
  const str = String(val ?? "");
  if (str.includes(";") || str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
function generateAttendanceCsv(titleOrRows, rowsOrOptions, optionalOptions) {
  let rows = [];
  let options = {};
  if (typeof titleOrRows === "string") {
    rows = Array.isArray(rowsOrOptions) ? rowsOrOptions : [];
    options = optionalOptions || {};
  } else if (Array.isArray(titleOrRows)) {
    rows = titleOrRows;
    options = rowsOrOptions || {};
  }
  const delimiter = options.delimiter || ";";
  const mode = options.mode || "full_census";
  const BOM = "\uFEFF";
  const headers = [
    "Manzana",
    "Lote",
    "Codigo_Inmueble",
    "Direccion",
    "Residente",
    "Rol",
    "Fecha_Hora",
    "Estado"
  ];
  const lines = [headers.join(delimiter)];
  for (const row of rows) {
    const isConfirmed = row.confirmed === true || row.status === "CONFIRMADO" || row.estado === "CONFIRMADO" || Boolean(row.confirmedAt || row.confirmed_at);
    if (mode === "confirmed_only" && !isConfirmed) {
      continue;
    }
    const manzana = row.manzana || row.block || "";
    const lote = row.lote || row.lot || "";
    let code = row.code || row.codigo || row.codigo_inmueble;
    if (!code) {
      const mzClean = manzana.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
      const ltClean = lote.replace(/[^0-9]/g, "");
      code = mzClean && ltClean ? `${mzClean}-${ltClean.padStart(2, "0")}` : `${manzana} ${lote}`.trim();
    }
    const direccion = row.direccion || row.address || row.street || "";
    const residente = row.residentName || row.resident_name || row.owner_name || row.primary_owner_name || "N/A";
    const rol = row.rol || row.role || (isConfirmed ? "Propietario" : "N/A");
    const fechaHora = row.confirmedAt || row.confirmed_at || (isConfirmed ? (/* @__PURE__ */ new Date()).toISOString() : "Pendiente");
    const estado = isConfirmed ? "CONFIRMADO" : "PENDIENTE";
    const line = [
      escapeCsvValue(manzana),
      escapeCsvValue(lote),
      escapeCsvValue(code),
      escapeCsvValue(direccion),
      escapeCsvValue(residente),
      escapeCsvValue(rol),
      escapeCsvValue(fechaHora),
      escapeCsvValue(estado)
    ].join(delimiter);
    lines.push(line);
  }
  return BOM + lines.join("\r\n");
}

const GET = async ({ params, url }) => {
  const id = Number(params.id);
  if (isNaN(id)) {
    return new Response("ID inválido", { status: 400 });
  }
  const db = getDb();
  const announcement = db.prepare("SELECT * FROM announcements WHERE id = ?").get(id);
  if (!announcement) {
    return new Response("Comunicado no encontrado", { status: 404 });
  }
  const mode = url.searchParams.get("mode") === "confirmed_only" ? "confirmed_only" : "full_census";
  const properties = db.prepare("SELECT * FROM census_properties WHERE is_active = 1 ORDER BY manzana ASC, lote ASC").all();
  const confirmedRows = db.prepare(`
    SELECT rc.*, cp.manzana, cp.lote, cp.address
    FROM read_confirmations rc
    JOIN census_properties cp ON rc.property_id = cp.id
    WHERE rc.announcement_id = ?
  `).all(id);
  const confirmedMap = /* @__PURE__ */ new Map();
  for (const c of confirmedRows) {
    confirmedMap.set(c.property_id, {
      resident_name: c.resident_name,
      role: c.role,
      confirmed_at: c.confirmed_at
    });
  }
  const rows = properties.map((p) => {
    const confirmed = confirmedMap.get(p.id);
    const mz = p.manzana.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
    const lt = p.lote.replace(/[^0-9]/g, "");
    const code = `${mz}-${lt.padStart(2, "0")}`;
    if (confirmed) {
      return {
        manzana: p.manzana,
        lote: p.lote,
        code,
        address: p.address,
        residentName: confirmed.resident_name,
        role: confirmed.role,
        confirmedAt: confirmed.confirmed_at,
        confirmed: true,
        status: "CONFIRMADO"
      };
    }
    return {
      manzana: p.manzana,
      lote: p.lote,
      code,
      address: p.address,
      residentName: p.owner_name,
      role: "Propietario",
      confirmedAt: "Pendiente",
      confirmed: false,
      status: "PENDIENTE"
    };
  });
  const csvContent = generateAttendanceCsv(announcement.title, rows, { mode, delimiter: ";" });
  const filename = `asistencia_${announcement.slug}.csv`;
  return new Response(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-cache, no-store, must-revalidate"
    }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
