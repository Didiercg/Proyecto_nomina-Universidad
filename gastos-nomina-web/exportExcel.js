// ==========================================================
// MOTOR DE EXPORTACIÓN A EXCEL (.xlsm)
// Preserva el 100% del diseño original, hojas, fórmulas y formatos
// ==========================================================
import { TEMPLATE_BASE64 } from './templateBase64.js';

function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function dateToExcelSerial(dateStr) {
  if (!dateStr) return 45778;
  try {
    const d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) return 45778;
    // Excel epoch es 30 de Diciembre de 1899 debido al bug bisiesto de Lotus 1-2-3 (1900)
    const epoch = new Date(1899, 11, 30);
    return Math.round((d.getTime() - epoch.getTime()) / (24 * 60 * 60 * 1000));
  } catch (e) {
    return 45778;
  }
}

function base64ToUint8Array(base64) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function exportarExcelConDatos(records, fileName = 'Proyecto_gastos_actualizado.xlsm') {
  if (!window.JSZip) {
    throw new Error('La librería JSZip no está disponible.');
  }

  // 1. Cargar el ZIP desde el archivo base64 plantilla
  const zip = new window.JSZip();
  const templateBytes = base64ToUint8Array(TEMPLATE_BASE64);
  await zip.loadAsync(templateBytes);

  // 2. Modificar sheet3.xml (Hoja BD que contiene la tabla maestra Registro)
  const sheet3File = zip.file('xl/worksheets/sheet3.xml');
  if (!sheet3File) {
    throw new Error('No se encontró xl/worksheets/sheet3.xml en la plantilla.');
  }

  const sheet3Xml = await sheet3File.async('text');

  // Extraer las primeras 19 filas (listas de validación de filas 1-15 y cabecera de fila 19)
  // Buscamos el cierre de la fila 19: </row>
  const row19EndMatch = sheet3Xml.match(/<row r="19"[\s\S]*?<\/row>/);
  if (!row19EndMatch) {
    throw new Error('Estructura de sheet3.xml no coincide con la esperada.');
  }

  const row19EndIndex = sheet3Xml.indexOf(row19EndMatch[0]) + row19EndMatch[0].length;
  const sheet3BeforeRows = sheet3Xml.substring(0, row19EndIndex);
  const sheet3AfterData = sheet3Xml.substring(sheet3Xml.indexOf('</sheetData>'));

  // Generar nuevas filas para los registros a partir de la fila 20
  const rowsXmlArr = [];
  const totalRecords = records.length;
  const lastRowNum = Math.max(522, 19 + totalRecords);

  records.forEach((rec, idx) => {
    const r = 20 + idx;
    const serial = rec.fecha_serial || dateToExcelSerial(rec.fecha);
    const mes = escapeXml(rec.mes || '');
    const ano = rec.año || (rec.fecha ? new Date(rec.fecha).getFullYear() : 2026);
    const tipo = escapeXml(rec.tipo || 'Egreso');
    const cat = escapeXml(rec.categoria || '');
    const con = escapeXml(rec.concepto || '');
    const ppto = Number(rec.presupuesto) || 0;
    const monto = Number(rec.monto) || 0;

    rowsXmlArr.push(
      `<row r="${r}" spans="1:8" x14ac:dyDescent="0.25">` +
      `<c r="A${r}" s="25"><v>${serial}</v></c>` +
      `<c r="B${r}" s="23" t="inlineStr"><is><t>${mes}</t></is></c>` +
      `<c r="C${r}" s="23"><v>${ano}</v></c>` +
      `<c r="D${r}" s="23" t="inlineStr"><is><t>${tipo}</t></is></c>` +
      `<c r="E${r}" s="23" t="inlineStr"><is><t>${cat}</t></is></c>` +
      `<c r="F${r}" s="23" t="inlineStr"><is><t>${con}</t></is></c>` +
      `<c r="G${r}" s="40"><v>${ppto}</v></c>` +
      `<c r="H${r}" s="40"><v>${monto}</v></c>` +
      `</row>`
    );
  });

  let newSheet3Xml = sheet3BeforeRows + rowsXmlArr.join('') + sheet3AfterData;

  // Actualizar dimension
  newSheet3Xml = newSheet3Xml.replace(/<dimension ref="[^"]*"\/>/, `<dimension ref="A1:J${lastRowNum}"/>`);
  zip.file('xl/worksheets/sheet3.xml', newSheet3Xml);

  // 3. Modificar table1.xml (Tabla Registro) para que cubra exactamente hasta la última fila
  const table1File = zip.file('xl/tables/table1.xml');
  if (table1File) {
    let table1Xml = await table1File.async('text');
    table1Xml = table1Xml.replace(/ref="A19:H\d+"/, `ref="A19:H${19 + totalRecords}"`);
    zip.file('xl/tables/table1.xml', table1Xml);
  }

  // 4. Modificar workbook.xml para forzar el recálculo automático de todas las fórmulas en Excel
  const wbFile = zip.file('xl/workbook.xml');
  if (wbFile) {
    let wbXml = await wbFile.async('text');
    if (wbXml.includes('<calcPr')) {
      wbXml = wbXml.replace(/<calcPr[^>]*\/>/, '<calcPr calcId="191028" fullCalcOnLoad="1" forceFullCalc="1"/>');
    } else {
      wbXml = wbXml.replace('</workbook>', '<calcPr calcId="191028" fullCalcOnLoad="1" forceFullCalc="1"/></workbook>');
    }
    zip.file('xl/workbook.xml', wbXml);
  }

  // 5. Eliminar calcChain.xml si existe para que Excel reconstruya la cadena de cálculo limpiamente
  zip.remove('xl/calcChain.xml');

  // 6. Generar el archivo final .xlsm
  const blob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.ms-excel.sheet.macroEnabled.12',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });

  // 7. Descargar en el navegador
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);

  return true;
}

export function exportarCSV(records, fileName = 'registro_movimientos.csv') {
  const headers = ['Fecha', 'Mes', 'Año', 'Tipo', 'Categoria', 'Concepto', 'Presupuesto', 'Monto'];
  const rows = records.map(r => [
    `"${r.fecha || ''}"`,
    `"${r.mes || ''}"`,
    `"${r.año || ''}"`,
    `"${r.tipo || ''}"`,
    `"${r.categoria || ''}"`,
    `"${(r.concepto || '').replace(/"/g, '""')}"`,
    `"${r.presupuesto || 0}"`,
    `"${r.monto || 0}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
