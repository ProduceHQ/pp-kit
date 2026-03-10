import { unitLabel } from '../utils';

const HDR = {
  font: { bold: true, color: { rgb: 'FFFFFF' } },
  fill: { patternType: 'solid', fgColor: { rgb: '000000' } },
  alignment: { horizontal: 'center', vertical: 'center' },
};
const CENTER = { alignment: { horizontal: 'center' } };

export async function downloadKitXlsx(project, inventory) {
  const { utils, write } = await import('xlsx-js-style');

  const items = project.kit
    .map(k => inventory.find(u => u.id === k.itemId))
    .filter(Boolean);

  const n          = items.length;
  const dataLastRow = n + 1; // last data row (1-indexed; row 1 = header)
  const totalsRow  = n + 2;

  const aoa = [
    ['Item', 'Description', 'Serial Number', 'Quantity', 'Weight (kg)', 'Value (GBP)', 'Manufacture Country'],
    ...items.map((unit, i) => [
      i + 1,
      unitLabel(unit, inventory),
      unit.serial_number ?? '',
      1,
      '',   // weight  – not in data model
      '',   // value   – not in data model
      '',   // country – not in data model
    ]),
    ['', 'TOTALS', '', '', '', '', ''],
  ];

  const ws = utils.aoa_to_sheet(aoa);

  // Totals formulas
  ws[`D${totalsRow}`] = { t: 'n', f: `SUM(D2:D${dataLastRow})` };
  ws[`E${totalsRow}`] = { t: 'n', f: `SUM(E2:E${dataLastRow})` };
  ws[`F${totalsRow}`] = { t: 'n', f: `SUM(F2:F${dataLastRow})` };

  // Header styles
  ['A1', 'C1', 'D1', 'E1', 'F1', 'G1'].forEach(ref => { if (ws[ref]) ws[ref].s = HDR; });
  if (ws['B1']) ws['B1'].s = { ...HDR, alignment: { horizontal: 'left', vertical: 'center' } };

  // Centre-align all data cells except description (column B)
  for (let r = 2; r <= dataLastRow; r++) {
    ['A', 'C', 'D', 'E', 'F', 'G'].forEach(col => {
      const ref = `${col}${r}`;
      if (!ws[ref]) ws[ref] = { v: '', t: 's' };
      ws[ref].s = CENTER;
    });
  }

  ws['!cols'] = [
    { wch: 5  },   // A – Item
    { wch: 44 },   // B – Description
    { wch: 36 },   // C – Serial Number
    { wch: 10 },   // D – Quantity
    { wch: 15 },   // E – Weight (kg)
    { wch: 14 },   // F – Value (GBP)
    { wch: 20 },   // G – Manufacture Country
  ];

  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, 'Kit List');

  const buf  = write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([buf], { type: 'application/octet-stream' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `${project.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-kit-list.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}
