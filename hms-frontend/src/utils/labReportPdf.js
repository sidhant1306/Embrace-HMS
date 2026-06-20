import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generate a professional Embrace Hospital lab report PDF.
 *
 * @param {Object} opts
 * @param {string} opts.patientName
 * @param {number} opts.patientId
 * @param {string} opts.testName
 * @param {number} opts.labOrderId
 * @param {string} opts.doctorName
 * @param {Array<{parameter: string, value: string, unit: string, refRange: string, status: string}>} opts.results
 * @param {string} opts.remarks
 * @param {string} opts.technicianName
 * @returns {Blob} PDF blob
 */
export function generateLabReportPdf({
  patientName = 'Patient',
  patientId = '',
  testName = 'Lab Test',
  labOrderId = '',
  doctorName = '',
  results = [],
  remarks = '',
  technicianName = '',
}) {
  const doc = new jsPDF();
  const w = doc.internal.pageSize.getWidth();
  const now = new Date();

  // ── Header Bar ──
  doc.setFillColor(10, 36, 64); // navy
  doc.rect(0, 0, w, 38, 'F');
  doc.setFillColor(0, 168, 150); // teal accent
  doc.rect(0, 38, w, 3, 'F');

  // Hospital name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Embrace Hospital', 15, 18);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Advanced Diagnostics & Laboratory Services', 15, 26);
  doc.text('Tel: +91-9000000001  |  info@embrace.com', 15, 32);

  // Report label on right
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('LAB REPORT', w - 15, 18, { align: 'right' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${now.toLocaleDateString('en-IN')}`, w - 15, 26, { align: 'right' });
  doc.text(`Time: ${now.toLocaleTimeString('en-IN')}`, w - 15, 32, { align: 'right' });

  // ── Patient Info Section ──
  let y = 50;
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(12, y - 4, w - 24, 28, 3, 3, 'F');

  doc.setTextColor(10, 36, 64);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Patient Name:', 18, y + 4);
  doc.text('Patient ID:', 18, y + 12);
  doc.text('Test Name:', w / 2 + 5, y + 4);
  doc.text('Lab Order ID:', w / 2 + 5, y + 12);
  doc.text('Referring Doctor:', 18, y + 20);

  doc.setFont('helvetica', 'normal');
  doc.text(String(patientName), 55, y + 4);
  doc.text(String(patientId), 55, y + 12);
  doc.text(String(testName), w / 2 + 40, y + 4);
  doc.text(String(labOrderId), w / 2 + 40, y + 12);
  doc.text(String(doctorName || 'N/A'), 60, y + 20);

  // ── Results Table ──
  y += 34;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(10, 36, 64);
  doc.text('Test Results', 15, y);
  y += 4;

  const tableData = results.map((r) => {
    const status = r.status || '';
    return [r.parameter || '', r.value || '', r.unit || '', r.refRange || '', status];
  });

  if (tableData.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [['Parameter', 'Value', 'Unit', 'Reference Range', 'Status']],
      body: tableData,
      margin: { left: 15, right: 15 },
      headStyles: {
        fillColor: [10, 36, 64],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [30, 30, 30],
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250],
      },
      columnStyles: {
        4: {
          fontStyle: 'bold',
          cellWidth: 25,
        },
      },
      didParseCell(data) {
        // Color the status column
        if (data.column.index === 4 && data.section === 'body') {
          const val = (data.cell.raw || '').toLowerCase();
          if (val === 'high' || val === 'abnormal') {
            data.cell.styles.textColor = [220, 38, 38]; // red
          } else if (val === 'low') {
            data.cell.styles.textColor = [234, 88, 12]; // orange
          } else if (val === 'normal') {
            data.cell.styles.textColor = [22, 163, 74]; // green
          }
        }
      },
    });
    y = (doc.lastAutoTable?.finalY || y) + 10;
  } else {
    y += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(120, 120, 120);
    doc.text('No test parameters entered.', 15, y);
    y += 14;
  }

  // ── Remarks ──
  if (remarks.trim()) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(10, 36, 64);
    doc.text('Remarks / Observations', 15, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    const lines = doc.splitTextToSize(remarks, w - 30);
    doc.text(lines, 15, y);
    y += lines.length * 4.5 + 8;
  }

  // ── Signature Line ──
  y = Math.max(y, 220);
  doc.setDrawColor(180, 180, 180);
  doc.line(15, y, 80, y);
  doc.line(w - 80, y, w - 15, y);

  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Lab Technician', 15, y + 5);
  doc.text(technicianName || '________________', 15, y + 10);
  doc.text('Authorized Signatory', w - 80, y + 5);

  // ── Footer ──
  const ph = doc.internal.pageSize.getHeight();
  doc.setFillColor(10, 36, 64);
  doc.rect(0, ph - 14, w, 14, 'F');
  doc.setTextColor(200, 200, 200);
  doc.setFontSize(7);
  doc.text('This is a computer-generated report from Embrace Hospital Laboratory Information System.', w / 2, ph - 6, { align: 'center' });

  return doc.output('blob');
}
