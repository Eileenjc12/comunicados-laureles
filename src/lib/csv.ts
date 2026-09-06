export interface AttendanceCsvRow {
  manzana?: string;
  block?: string;
  lote?: string;
  lot?: string;
  code?: string;
  codigo?: string;
  codigo_inmueble?: string;
  address?: string;
  street?: string;
  direccion?: string;
  confirmed?: boolean;
  status?: string;
  estado?: string;
  residentName?: string | null;
  resident_name?: string | null;
  owner_name?: string | null;
  primary_owner_name?: string | null;
  role?: string | null;
  rol?: string | null;
  confirmedAt?: string | null;
  confirmed_at?: string | null;
}

export interface CsvExportOptions {
  delimiter?: string;
  mode?: 'full_census' | 'confirmed_only';
}

/**
 * Escapes CSV special characters: quotes, delimiters, and line breaks.
 */
function escapeCsvValue(val: unknown): string {
  const str = String(val ?? '');
  if (str.includes(';') || str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generates an official attendance / read confirmation CSV string
 * with UTF-8 Byte Order Mark (\uFEFF) for seamless Microsoft Excel rendering.
 *
 * Supports both signatures:
 * 1. generateAttendanceCsv(announcementTitle, rows, options)
 * 2. generateAttendanceCsv(rows, options)
 */
export function generateAttendanceCsv(
  titleOrRows: string | AttendanceCsvRow[],
  rowsOrOptions?: AttendanceCsvRow[] | CsvExportOptions,
  optionalOptions?: CsvExportOptions
): string {
  let rows: AttendanceCsvRow[] = [];
  let options: CsvExportOptions = {};

  if (typeof titleOrRows === 'string') {
    rows = Array.isArray(rowsOrOptions) ? rowsOrOptions : [];
    options = optionalOptions || {};
  } else if (Array.isArray(titleOrRows)) {
    rows = titleOrRows;
    options = (rowsOrOptions as CsvExportOptions) || {};
  }

  const delimiter = options.delimiter || ';';
  const mode = options.mode || 'full_census';
  const BOM = '\uFEFF'; // UTF-8 Byte Order Mark

  // Spanish headers required for official records & E2E verification
  const headers = [
    'Manzana',
    'Lote',
    'Codigo_Inmueble',
    'Direccion',
    'Residente',
    'Rol',
    'Fecha_Hora',
    'Estado'
  ];

  const lines = [headers.join(delimiter)];

  for (const row of rows) {
    const isConfirmed =
      row.confirmed === true ||
      row.status === 'CONFIRMADO' ||
      row.estado === 'CONFIRMADO' ||
      Boolean(row.confirmedAt || row.confirmed_at);

    if (mode === 'confirmed_only' && !isConfirmed) {
      continue;
    }

    const manzana = row.manzana || row.block || '';
    const lote = row.lote || row.lot || '';

    // Standardize property code format if missing
    let code = row.code || row.codigo || row.codigo_inmueble;
    if (!code) {
      const mzClean = manzana.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
      const ltClean = lote.replace(/[^0-9]/g, '');
      code = mzClean && ltClean ? `${mzClean}-${ltClean.padStart(2, '0')}` : `${manzana} ${lote}`.trim();
    }

    const direccion = row.direccion || row.address || row.street || '';
    const residente =
      row.residentName ||
      row.resident_name ||
      row.owner_name ||
      row.primary_owner_name ||
      'N/A';
    const rol = row.rol || row.role || (isConfirmed ? 'Propietario' : 'N/A');
    const fechaHora =
      row.confirmedAt ||
      row.confirmed_at ||
      (isConfirmed ? new Date().toISOString() : 'Pendiente');
    const estado = isConfirmed ? 'CONFIRMADO' : 'PENDIENTE';

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

  return BOM + lines.join('\r\n');
}
