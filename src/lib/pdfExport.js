import { fmtDate, unitLabel } from '../utils';

const GOLD  = [232, 184, 66];
const DARK  = [26, 26, 24];
const MUTED = [110, 110, 108];
const RULE  = [220, 218, 212];
const CAT_BG = [242, 239, 232];

function buildKitGroups(project, inventory) {
  const groups = {};
  for (const { itemId } of project.kit) {
    const unit = inventory.find(u => u.id === itemId);
    if (!unit) continue;
    (groups[unit.category] ??= []).push(unit);
  }
  return groups;
}

export async function downloadKitPdf(project, inventory) {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);

  const doc    = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW  = doc.internal.pageSize.getWidth();
  const pageH  = doc.internal.pageSize.getHeight();
  const M      = 20; // margin
  const W      = pageW - M * 2;

  const groups     = buildKitGroups(project, inventory);
  const totalUnits = Object.values(groups).reduce((s, a) => s + a.length, 0);
  const generated  = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  // ── Branding ────────────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...GOLD);
  doc.text('PERSPECTIVE PICTURES  /  KIT', M, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  doc.text(`Generated ${generated}`, pageW - M, 18, { align: 'right' });

  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.4);
  doc.line(M, 22, pageW - M, 22);

  // ── Project name ────────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...DARK);
  doc.text(project.name.toUpperCase(), M, 34);

  // ── Meta row ────────────────────────────────────────────────────────────────
  const metaY  = 43;
  const colW   = W / 4;
  const meta   = [
    ['PROJECT NO.', project.number || '—'],
    ['DATES', `${fmtDate(project.startDate)} — ${fmtDate(project.endDate)}`],
    ['REGION', (project.region || '—').toUpperCase()],
    ['TOTAL UNITS', String(totalUnits)],
  ];

  for (let i = 0; i < meta.length; i++) {
    const x = M + i * colW;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...MUTED);
    doc.text(meta[i][0], x, metaY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...DARK);
    doc.text(meta[i][1], x, metaY + 5);
  }

  doc.setDrawColor(...RULE);
  doc.setLineWidth(0.2);
  doc.line(M, metaY + 11, pageW - M, metaY + 11);

  // ── Kit table ────────────────────────────────────────────────────────────────
  const body = [];
  for (const [cat, units] of Object.entries(groups)) {
    body.push([{
      content: cat.toUpperCase(),
      colSpan: 2,
      styles: {
        fillColor: CAT_BG,
        textColor: GOLD,
        fontStyle: 'bold',
        fontSize: 7.5,
        cellPadding: { top: 5, bottom: 3, left: 4, right: 4 },
      },
    }]);
    for (const unit of units) {
      body.push([
        unitLabel(unit, inventory),
        unit.serial_number || '—',
      ]);
    }
  }

  autoTable(doc, {
    startY: metaY + 15,
    head:   [['ITEM', 'SERIAL NO.']],
    body,
    margin: { left: M, right: M },
    styles: {
      font:        'helvetica',
      fontSize:    9,
      textColor:   DARK,
      cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
    },
    headStyles: {
      fillColor:  DARK,
      textColor:  GOLD,
      fontStyle:  'bold',
      fontSize:   7.5,
    },
    alternateRowStyles: { fillColor: [250, 249, 246] },
    columnStyles: {
      0: { cellWidth: W * 0.65 },
      1: { cellWidth: W * 0.35, textColor: MUTED },
    },
  });

  // ── Footer on every page ────────────────────────────────────────────────────
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    doc.text(
      `${project.name}  ·  Kit List  ·  Page ${i} of ${pageCount}`,
      M, pageH - 10,
    );
    doc.setDrawColor(...RULE);
    doc.setLineWidth(0.15);
    doc.line(M, pageH - 14, pageW - M, pageH - 14);
  }

  const filename = `${project.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-kit-list.pdf`;
  doc.save(filename);
}
