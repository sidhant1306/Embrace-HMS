package com.example.hms.util;

import com.example.hms.model.billingModel.Bill;
import com.example.hms.model.billingModel.BillItem;
import com.lowagie.text.Chunk;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.ColumnText;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfPageEventHelper;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.pdf.draw.LineSeparator;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

public final class BillPdfGenerator {

    private static final String HOSPITAL_NAME    = "Embrace Hospital";
    private static final String HOSPITAL_TAGLINE = "Compassionate Care. Trusted Excellence.";
    private static final String HOSPITAL_ADDRESS = "123 Healthcare Avenue, Medical District, New Delhi - 110001";
    private static final String HOSPITAL_PHONE   = "+91 11 2345 6789  |  emergency@embracehospital.in";
    private static final String HOSPITAL_WEBSITE = "www.embracehospital.in";

    // ── Color palette ─────────────────────────────────────────────────────────────
    private static final Color PRIMARY_COLOR  = new Color(0, 86, 145);
    private static final Color ACCENT_COLOR   = new Color(0, 168, 150);
    private static final Color HEADER_BG      = new Color(0, 86, 145);
    private static final Color ALT_ROW_BG     = new Color(235, 244, 252);
    private static final Color BORDER_COLOR   = new Color(180, 210, 235);
    private static final Color TOTAL_ROW_BG   = new Color(0, 86, 145);
    private static final Color LIGHT_GRAY     = new Color(248, 249, 250);
    private static final Color TEXT_SECONDARY = new Color(90, 100, 120);
    private static final Color PAID_GREEN     = new Color(39, 174, 96);
    private static final Color PENDING_ORANGE = new Color(230, 126, 34);

    private BillPdfGenerator() {}

    public static byte[] generate(Bill bill) throws IOException, DocumentException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        Document document = new Document(PageSize.A4, 40f, 40f, 30f, 40f);
        PdfWriter writer = PdfWriter.getInstance(document, out);
        writer.setPageEvent(new FooterPageEvent());
        document.open();

        addHospitalHeader(document, writer);
        addBillBanner(document, bill);
        addPatientInfo(document, bill);
        addSpacer(document);
        addItemTable(document, bill);
        addSpacer(document);
        addTotalsSection(document, bill);
        addSpacer(document);
        addPaymentStatus(document, bill);
        addSpacer(document);
        addFooterNote(document);

        document.close();
        return out.toByteArray();
    }

    // ─── Sections ────────────────────────────────────────────────────────────────

    private static void addHospitalHeader(Document document, PdfWriter writer) throws DocumentException {
        PdfContentByte cb = writer.getDirectContent();
        Rectangle pageRect = document.getPageSize();

        // Teal top accent bar
        cb.setColorFill(ACCENT_COLOR);
        cb.rectangle(0, pageRect.getHeight() - 8, pageRect.getWidth(), 8);
        cb.fill();

        // Blue header background
        cb.setColorFill(HEADER_BG);
        cb.rectangle(0, pageRect.getHeight() - 98f, pageRect.getWidth(), 90f);
        cb.fill();

        // Hospital name
        Font nameFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 26, Color.WHITE);
        Paragraph nameP = new Paragraph(HOSPITAL_NAME, nameFont);
        nameP.setSpacingBefore(14f);
        nameP.setAlignment(Element.ALIGN_CENTER);
        document.add(nameP);

        // Tagline
        Font taglineFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 11, ACCENT_COLOR);
        Paragraph taglineP = new Paragraph(HOSPITAL_TAGLINE, taglineFont);
        taglineP.setAlignment(Element.ALIGN_CENTER);
        document.add(taglineP);

        // Contact
        Font smallWhite = FontFactory.getFont(FontFactory.HELVETICA, 8, new Color(200, 220, 240));
        Paragraph addrP = new Paragraph(HOSPITAL_ADDRESS + "\n" + HOSPITAL_PHONE, smallWhite);
        addrP.setAlignment(Element.ALIGN_CENTER);
        addrP.setSpacingAfter(10f);
        document.add(addrP);

        // Separator line
        LineSeparator sep = new LineSeparator();
        sep.setLineColor(ACCENT_COLOR);
        sep.setLineWidth(1.5f);
        document.add(new Chunk(sep));
    }

    private static void addBillBanner(Document document, Bill bill) throws DocumentException {
        addSpacer(document);
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, PRIMARY_COLOR);
        Paragraph title = new Paragraph("INVOICE / BILL RECEIPT", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);

        Font subFont = FontFactory.getFont(FontFactory.HELVETICA, 9, TEXT_SECONDARY);
        String dateStr = bill.getCreatedAt() != null
                ? bill.getCreatedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a"))
                : "—";
        Paragraph sub = new Paragraph("Bill #" + bill.getBillId() + "   •   Generated: " + dateStr, subFont);
        sub.setAlignment(Element.ALIGN_CENTER);
        sub.setSpacingAfter(6f);
        document.add(sub);

        LineSeparator sep = new LineSeparator();
        sep.setLineColor(BORDER_COLOR);
        sep.setLineWidth(0.8f);
        document.add(new Chunk(sep));
    }

    private static void addPatientInfo(Document document, Bill bill) throws DocumentException {
        addSpacer(document);

        Font sectionHead = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, PRIMARY_COLOR);
        Font fieldKey    = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8.5f, TEXT_SECONDARY);
        Font fieldVal    = FontFactory.getFont(FontFactory.HELVETICA, 8.5f, Color.BLACK);

        PdfPTable infoTable = new PdfPTable(2);
        infoTable.setWidthPercentage(100);
        infoTable.setWidths(new float[]{1f, 1f});
        infoTable.setSpacingAfter(6f);

        // Left: Patient
        PdfPCell leftCell = new PdfPCell();
        leftCell.setBorder(Rectangle.NO_BORDER);
        leftCell.setBackgroundColor(LIGHT_GRAY);
        leftCell.setPadding(10f);
        leftCell.setBorderWidthLeft(3f);
        leftCell.setBorderColorLeft(ACCENT_COLOR);

        Paragraph ph = new Paragraph("PATIENT DETAILS", sectionHead);
        ph.setSpacingAfter(4f);
        leftCell.addElement(ph);

        if (bill.getPatient() != null) {
            com.example.hms.model.profileModel.User pu = bill.getPatient().getUser();
            leftCell.addElement(infoRow("Name", pu != null ? pu.getUserName() : null, fieldKey, fieldVal));
            leftCell.addElement(infoRow("Patient ID", "P-" + bill.getPatient().getPatientId(), fieldKey, fieldVal));
            if (pu != null && pu.getUserPhone() != null)
                leftCell.addElement(infoRow("Phone", pu.getUserPhone(), fieldKey, fieldVal));
            if (pu != null && pu.getDateOfBirth() != null)
                leftCell.addElement(infoRow("DOB", pu.getDateOfBirth().toString(), fieldKey, fieldVal));
            if (pu != null && pu.getUserGender() != null)
                leftCell.addElement(infoRow("Gender", pu.getUserGender().toString(), fieldKey, fieldVal));
            if (bill.getPatient().getBloodGroup() != null)
                leftCell.addElement(infoRow("Blood Group", bill.getPatient().getBloodGroup().toString(), fieldKey, fieldVal));
        } else {
            leftCell.addElement(new Paragraph("N/A", fieldVal));
        }

        // Right: Bill info
        PdfPCell rightCell = new PdfPCell();
        rightCell.setBorder(Rectangle.NO_BORDER);
        rightCell.setBackgroundColor(LIGHT_GRAY);
        rightCell.setPadding(10f);
        rightCell.setBorderWidthLeft(3f);
        rightCell.setBorderColorLeft(PRIMARY_COLOR);

        Paragraph bh = new Paragraph("BILL INFORMATION", sectionHead);
        bh.setSpacingAfter(4f);
        rightCell.addElement(bh);

        rightCell.addElement(infoRow("Bill ID", "#" + bill.getBillId(), fieldKey, fieldVal));
        if (bill.getConsultation() != null)
            rightCell.addElement(infoRow("Consultation ID", "C-" + bill.getConsultation().getConsultationId(), fieldKey, fieldVal));
        if (bill.getCreatedAt() != null)
            rightCell.addElement(infoRow("Date", bill.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")), fieldKey, fieldVal));
        if (bill.getUpdatedAt() != null)
            rightCell.addElement(infoRow("Last Updated", bill.getUpdatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")), fieldKey, fieldVal));
        if (bill.getPaymentMethod() != null)
            rightCell.addElement(infoRow("Payment Mode", bill.getPaymentMethod().toString(), fieldKey, fieldVal));
        rightCell.addElement(infoRow("Tax Rate", bill.getTaxPercent() + "%", fieldKey, fieldVal));

        infoTable.addCell(leftCell);
        infoTable.addCell(rightCell);
        document.add(infoTable);
    }

    private static void addItemTable(Document document, Bill bill) throws DocumentException {
        Font tableHeaderFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE);
        Font cellFont        = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.BLACK);
        Font cellFontGray    = FontFactory.getFont(FontFactory.HELVETICA, 8.5f, TEXT_SECONDARY);

        PdfPTable table = new PdfPTable(5);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{3.5f, 1.5f, 0.8f, 1.8f, 1.8f});
        table.setSpacingBefore(4f);

        String[] headers = {"Description", "Type", "Qty", "Unit Price (\u20B9)", "Total (\u20B9)"};
        for (String h : headers) {
            PdfPCell hc = new PdfPCell(new Phrase(h, tableHeaderFont));
            hc.setBackgroundColor(HEADER_BG);
            hc.setPadding(7f);
            hc.setHorizontalAlignment(Element.ALIGN_CENTER);
            hc.setVerticalAlignment(Element.ALIGN_MIDDLE);
            hc.setBorderColor(HEADER_BG);
            table.addCell(hc);
        }

        if (bill.getBillItems() != null) {
            boolean alt = false;
            for (BillItem item : bill.getBillItems()) {
                Color rowBg = alt ? ALT_ROW_BG : Color.WHITE;
                alt = !alt;
                table.addCell(styledCell(item.getItemName(), cellFont, rowBg, Element.ALIGN_LEFT));
                table.addCell(styledCell(capitalize(item.getItemType().toString()), cellFontGray, rowBg, Element.ALIGN_CENTER));
                table.addCell(styledCell(String.valueOf(item.getQuantity()), cellFont, rowBg, Element.ALIGN_CENTER));
                table.addCell(styledCell(formatRupees(item.getUnitPrice()), cellFont, rowBg, Element.ALIGN_RIGHT));
                table.addCell(styledCell(formatRupees(item.getLineTotal()), cellFont, rowBg, Element.ALIGN_RIGHT));
            }
        }

        document.add(table);
    }

    private static void addTotalsSection(Document document, Bill bill) throws DocumentException {
        Font labelFont      = FontFactory.getFont(FontFactory.HELVETICA, 9, TEXT_SECONDARY);
        Font valueFont      = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.BLACK);
        Font totalLabelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, Color.WHITE);
        Font totalValueFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, Color.WHITE);
        Font paidFont       = FontFactory.getFont(FontFactory.HELVETICA, 9, PAID_GREEN);

        PdfPTable totalsTable = new PdfPTable(2);
        totalsTable.setWidthPercentage(45);
        totalsTable.setHorizontalAlignment(Element.ALIGN_RIGHT);
        totalsTable.setWidths(new float[]{1.6f, 1f});

        // Subtotal
        totalsTable.addCell(summaryLabel("Subtotal", labelFont));
        totalsTable.addCell(summaryValue(formatRupees(bill.getSubTotal()), valueFont, Color.WHITE));

        // Tax
        totalsTable.addCell(summaryLabel("Tax (" + bill.getTaxPercent() + "%)", labelFont));
        totalsTable.addCell(summaryValue(formatRupees(bill.getTaxAmount()), valueFont, Color.WHITE));

        // Divider
        PdfPCell divL = dividerCell();
        PdfPCell divR = dividerCell();
        totalsTable.addCell(divL);
        totalsTable.addCell(divR);

        // Grand Total
        PdfPCell totalLabelCell = new PdfPCell(new Phrase("TOTAL AMOUNT", totalLabelFont));
        totalLabelCell.setBackgroundColor(TOTAL_ROW_BG);
        totalLabelCell.setPadding(8f);
        totalLabelCell.setBorder(Rectangle.NO_BORDER);
        totalsTable.addCell(totalLabelCell);

        PdfPCell totalValCell = new PdfPCell(new Phrase(formatRupees(bill.getTotalAmount()), totalValueFont));
        totalValCell.setBackgroundColor(TOTAL_ROW_BG);
        totalValCell.setPadding(8f);
        totalValCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        totalValCell.setBorder(Rectangle.NO_BORDER);
        totalsTable.addCell(totalValCell);

        // Amount paid
        BigDecimal paid = bill.getAmountPaid() != null ? bill.getAmountPaid() : BigDecimal.ZERO;
        totalsTable.addCell(summaryLabel("Amount Paid", labelFont));
        totalsTable.addCell(summaryValue(formatRupees(paid), paidFont, Color.WHITE));

        // Balance due
        BigDecimal balance = bill.getBalanceDue() != null ? bill.getBalanceDue() : BigDecimal.ZERO;
        Font balFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9.5f, balance.compareTo(BigDecimal.ZERO) > 0 ? PENDING_ORANGE : PAID_GREEN);
        totalsTable.addCell(summaryLabel("Balance Due", labelFont));
        totalsTable.addCell(summaryValue(formatRupees(balance), balFont, Color.WHITE));

        document.add(totalsTable);
    }

    private static void addPaymentStatus(Document document, Bill bill) throws DocumentException {
        String statusStr = bill.getPaymentStatuses() != null ? bill.getPaymentStatuses().toString() : "UNKNOWN";
        Color statusColor = switch (statusStr) {
            case "PAID"           -> PAID_GREEN;
            case "PARTIALLY_PAID" -> PENDING_ORANGE;
            default               -> new Color(150, 60, 60);
        };
        Font statusFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, statusColor);
        Paragraph p = new Paragraph("Payment Status:  " + statusStr.replace("_", " "), statusFont);
        p.setAlignment(Element.ALIGN_RIGHT);
        document.add(p);
    }

    private static void addFooterNote(Document document) throws DocumentException {
        addSpacer(document);
        LineSeparator sep = new LineSeparator();
        sep.setLineColor(BORDER_COLOR);
        document.add(new Chunk(sep));
        addSpacer(document);

        Font noteFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 8, TEXT_SECONDARY);
        Paragraph note = new Paragraph(
                "This is a system-generated invoice from Embrace Hospital. For billing queries, "
                + "please contact our billing department.\n"
                + "Thank you for choosing Embrace Hospital — we are committed to your health and wellbeing.",
                noteFont);
        note.setAlignment(Element.ALIGN_CENTER);
        document.add(note);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────────

    private static void addSpacer(Document document) throws DocumentException {
        document.add(Chunk.NEWLINE);
    }

    private static Paragraph infoRow(String key, String value, Font keyFont, Font valFont) {
        Paragraph p = new Paragraph();
        p.add(new Chunk(key + ": ", keyFont));
        p.add(new Chunk(value != null ? value : "\u2014", valFont));
        p.setSpacingAfter(2f);
        return p;
    }

    private static PdfPCell styledCell(String text, Font font, Color bg, int align) {
        PdfPCell c = new PdfPCell(new Phrase(text != null ? text : "\u2014", font));
        c.setBackgroundColor(bg);
        c.setPadding(6f);
        c.setHorizontalAlignment(align);
        c.setVerticalAlignment(Element.ALIGN_MIDDLE);
        c.setBorderColor(BORDER_COLOR);
        c.setBorderWidth(0.5f);
        return c;
    }

    private static PdfPCell summaryLabel(String text, Font font) {
        PdfPCell c = new PdfPCell(new Phrase(text, font));
        c.setPadding(5f);
        c.setBorderColor(BORDER_COLOR);
        c.setBorderWidth(0.4f);
        c.setBackgroundColor(Color.WHITE);
        return c;
    }

    private static PdfPCell summaryValue(String text, Font font, Color bg) {
        PdfPCell c = new PdfPCell(new Phrase(text, font));
        c.setPadding(5f);
        c.setHorizontalAlignment(Element.ALIGN_RIGHT);
        c.setBorderColor(BORDER_COLOR);
        c.setBorderWidth(0.4f);
        c.setBackgroundColor(bg);
        return c;
    }

    private static PdfPCell dividerCell() {
        PdfPCell c = new PdfPCell(new Phrase(" "));
        c.setBorderWidthTop(1f);
        c.setBorderColorTop(BORDER_COLOR);
        c.setBorderWidthLeft(0);
        c.setBorderWidthRight(0);
        c.setBorderWidthBottom(0);
        c.setFixedHeight(4f);
        return c;
    }

    /** Format a rupee amount: 500.0 -> ₹500.00 */
    private static String formatRupees(BigDecimal rupees) {
        return "\u20B9" + (rupees != null ? rupees.setScale(2, java.math.RoundingMode.HALF_UP) : "0.00");
    }

    /** Capitalize enum label: CONSULTATION → Consultation */
    private static String capitalize(String raw) {
        if (raw == null || raw.isEmpty()) return "";
        return raw.charAt(0) + raw.substring(1).toLowerCase();
    }

    // ─── Footer Page Event ────────────────────────────────────────────────────────

    static class FooterPageEvent extends PdfPageEventHelper {
        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            PdfContentByte cb = writer.getDirectContent();
            Rectangle pageSize = document.getPageSize();

            cb.setColorFill(ACCENT_COLOR);
            cb.rectangle(0, 0, pageSize.getWidth(), 5);
            cb.fill();

            Font footerFont = FontFactory.getFont(FontFactory.HELVETICA, 7.5f, TEXT_SECONDARY);
            ColumnText.showTextAligned(cb, Element.ALIGN_CENTER,
                    new Phrase(HOSPITAL_WEBSITE + "  |  " + HOSPITAL_PHONE, footerFont),
                    pageSize.getWidth() / 2, 18, 0);
            ColumnText.showTextAligned(cb, Element.ALIGN_RIGHT,
                    new Phrase("Page " + writer.getPageNumber(), footerFont),
                    pageSize.getWidth() - 40, 18, 0);
        }
    }
}
