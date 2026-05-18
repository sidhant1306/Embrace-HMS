package com.example.hms.util;

import com.example.hms.model.prescriptionModel.Prescription;
import com.example.hms.model.prescriptionModel.PrescriptionItem;
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
import java.time.format.DateTimeFormatter;

public final class PrescriptionPdfGenerator {

    private static final String HOSPITAL_NAME    = "Embrace Hospital";
    private static final String HOSPITAL_TAGLINE = "Compassionate Care. Trusted Excellence.";
    private static final String HOSPITAL_ADDRESS = "123 Healthcare Avenue, Medical District, New Delhi - 110001";
    private static final String HOSPITAL_PHONE   = "+91 11 2345 6789  |  emergency@embracehospital.in";
    private static final String HOSPITAL_WEBSITE = "www.embracehospital.in";

    // ── Color palette ─────────────────────────────────────────────────────────────
    private static final Color PRIMARY_COLOR  = new Color(27, 94, 60);
    private static final Color ACCENT_COLOR   = new Color(56, 178, 122);
    private static final Color HEADER_BG      = new Color(27, 94, 60);
    private static final Color ALT_ROW_BG     = new Color(232, 248, 240);
    private static final Color BORDER_COLOR   = new Color(170, 220, 195);
    private static final Color LIGHT_GRAY     = new Color(247, 250, 248);
    private static final Color TEXT_SECONDARY = new Color(80, 100, 90);

    private PrescriptionPdfGenerator() {}

    public static byte[] generate(Prescription prescription) throws IOException, DocumentException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        Document document = new Document(PageSize.A4, 40f, 40f, 30f, 40f);
        PdfWriter writer = PdfWriter.getInstance(document, out);
        writer.setPageEvent(new FooterPageEvent());
        document.open();

        addHospitalHeader(document, writer);
        addRxBanner(document, prescription);
        addInfo(document, prescription);
        addSpacer(document);
        addRxLabel(document);
        addMedicinesTable(document, prescription);
        addSpacer(document);
        if (prescription.getPrescriptionNotes() != null && !prescription.getPrescriptionNotes().isBlank()) {
            addNotes(document, prescription);
            addSpacer(document);
        }
        addSignatureArea(document);
        addFooterNote(document);

        document.close();
        return out.toByteArray();
    }

    // ─── Sections ────────────────────────────────────────────────────────────────

    private static void addHospitalHeader(Document document, PdfWriter writer) throws DocumentException {
        PdfContentByte cb = writer.getDirectContent();
        Rectangle pageRect = document.getPageSize();

        // Accent top bar
        cb.setColorFill(ACCENT_COLOR);
        cb.rectangle(0, pageRect.getHeight() - 8, pageRect.getWidth(), 8);
        cb.fill();

        // Header background
        cb.setColorFill(HEADER_BG);
        cb.rectangle(0, pageRect.getHeight() - 98f, pageRect.getWidth(), 90f);
        cb.fill();

        Font nameFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 26, Color.WHITE);
        Paragraph nameP = new Paragraph(HOSPITAL_NAME, nameFont);
        nameP.setSpacingBefore(14f);
        nameP.setAlignment(Element.ALIGN_CENTER);
        document.add(nameP);

        Font taglineFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 11, ACCENT_COLOR);
        Paragraph taglineP = new Paragraph(HOSPITAL_TAGLINE, taglineFont);
        taglineP.setAlignment(Element.ALIGN_CENTER);
        document.add(taglineP);

        Font smallWhite = FontFactory.getFont(FontFactory.HELVETICA, 8, new Color(200, 235, 215));
        Paragraph addrP = new Paragraph(HOSPITAL_ADDRESS + "\n" + HOSPITAL_PHONE, smallWhite);
        addrP.setAlignment(Element.ALIGN_CENTER);
        addrP.setSpacingAfter(10f);
        document.add(addrP);

        LineSeparator sep = new LineSeparator();
        sep.setLineColor(ACCENT_COLOR);
        sep.setLineWidth(1.5f);
        document.add(new Chunk(sep));
    }

    private static void addRxBanner(Document document, Prescription prescription) throws DocumentException {
        addSpacer(document);
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, PRIMARY_COLOR);
        Paragraph title = new Paragraph("MEDICAL PRESCRIPTION", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);

        Font subFont = FontFactory.getFont(FontFactory.HELVETICA, 9, TEXT_SECONDARY);
        String dateStr = prescription.getPrescriptionCreatedAt() != null
                ? prescription.getPrescriptionCreatedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a"))
                : "\u2014";
        String rxNum = prescription.getPrescriptionNumber() != null ? prescription.getPrescriptionNumber() : "\u2014";
        Paragraph sub = new Paragraph(
                "Rx# " + rxNum + "   \u2022   Date: " + dateStr
                + "   \u2022   Status: " + prescription.getPrescriptionStatus(), subFont);
        sub.setAlignment(Element.ALIGN_CENTER);
        sub.setSpacingAfter(6f);
        document.add(sub);

        LineSeparator sep = new LineSeparator();
        sep.setLineColor(BORDER_COLOR);
        sep.setLineWidth(0.8f);
        document.add(new Chunk(sep));
    }

    private static void addInfo(Document document, Prescription prescription) throws DocumentException {
        addSpacer(document);

        Font sectionHead = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, PRIMARY_COLOR);
        Font fieldKey    = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8.5f, TEXT_SECONDARY);
        Font fieldVal    = FontFactory.getFont(FontFactory.HELVETICA, 8.5f, Color.BLACK);

        PdfPTable infoTable = new PdfPTable(2);
        infoTable.setWidthPercentage(100);
        infoTable.setWidths(new float[]{1f, 1f});
        infoTable.setSpacingAfter(6f);

        // Left: Patient
        PdfPCell patCell = new PdfPCell();
        patCell.setBorder(Rectangle.NO_BORDER);
        patCell.setBackgroundColor(LIGHT_GRAY);
        patCell.setPadding(10f);
        patCell.setBorderWidthLeft(3f);
        patCell.setBorderColorLeft(ACCENT_COLOR);

        Paragraph ph = new Paragraph("PATIENT DETAILS", sectionHead);
        ph.setSpacingAfter(4f);
        patCell.addElement(ph);

        if (prescription.getPatient() != null) {
            com.example.hms.model.profileModel.User pu = prescription.getPatient().getUser();
            patCell.addElement(infoRow("Name", pu != null ? pu.getUserName() : null, fieldKey, fieldVal));
            patCell.addElement(infoRow("Patient ID", "P-" + prescription.getPatient().getPatientId(), fieldKey, fieldVal));
            if (pu != null && pu.getDateOfBirth() != null)
                patCell.addElement(infoRow("DOB", pu.getDateOfBirth().toString(), fieldKey, fieldVal));
            if (pu != null && pu.getUserGender() != null)
                patCell.addElement(infoRow("Gender", pu.getUserGender().toString(), fieldKey, fieldVal));
            if (prescription.getPatient().getBloodGroup() != null)
                patCell.addElement(infoRow("Blood Group", prescription.getPatient().getBloodGroup().toString(), fieldKey, fieldVal));
            if (pu != null && pu.getUserPhone() != null)
                patCell.addElement(infoRow("Phone", pu.getUserPhone(), fieldKey, fieldVal));
        }

        // Right: Prescription details
        PdfPCell rxCell = new PdfPCell();
        rxCell.setBorder(Rectangle.NO_BORDER);
        rxCell.setBackgroundColor(LIGHT_GRAY);
        rxCell.setPadding(10f);
        rxCell.setBorderWidthLeft(3f);
        rxCell.setBorderColorLeft(PRIMARY_COLOR);

        Paragraph rxh = new Paragraph("PRESCRIPTION DETAILS", sectionHead);
        rxh.setSpacingAfter(4f);
        rxCell.addElement(rxh);

        rxCell.addElement(infoRow("Rx Number", prescription.getPrescriptionNumber(), fieldKey, fieldVal));
        rxCell.addElement(infoRow("Prescription ID", "Rx-" + prescription.getPrescriptionId(), fieldKey, fieldVal));
        if (prescription.getConsultation() != null) {
            rxCell.addElement(infoRow("Consultation ID", "C-" + prescription.getConsultation().getConsultationId(), fieldKey, fieldVal));
            // Doctor name comes from consultation→doctor→user
            if (prescription.getConsultation().getDoctor() != null
                    && prescription.getConsultation().getDoctor().getUser() != null) {
                rxCell.addElement(infoRow("Prescribing Doctor",
                        "Dr. " + prescription.getConsultation().getDoctor().getUser().getUserName(),
                        fieldKey, fieldVal));
            }
            if (prescription.getConsultation().getConsultationDiagnosis() != null)
                rxCell.addElement(infoRow("Diagnosis",
                        prescription.getConsultation().getConsultationDiagnosis(), fieldKey, fieldVal));
        }
        if (prescription.getPrescriptionCreatedAt() != null)
            rxCell.addElement(infoRow("Date",
                    prescription.getPrescriptionCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")),
                    fieldKey, fieldVal));

        infoTable.addCell(patCell);
        infoTable.addCell(rxCell);
        document.add(infoTable);
    }

    private static void addRxLabel(Document document) throws DocumentException {
        Font rxFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, ACCENT_COLOR);
        Paragraph rx = new Paragraph("\u211E  Medicines Prescribed", rxFont);
        rx.setSpacingAfter(4f);
        document.add(rx);
    }

    private static void addMedicinesTable(Document document, Prescription prescription) throws DocumentException {
        Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE);
        Font cellFont   = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.BLACK);
        Font boldGreen  = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, PRIMARY_COLOR);
        Font noteFont   = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 8.5f, TEXT_SECONDARY);

        PdfPTable table = new PdfPTable(5);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{2.8f, 1.4f, 1.2f, 1.2f, 2.5f});

        String[] headers = {"Medicine / Drug", "Dosage", "Duration (days)", "Freq / day", "Instructions"};
        for (String h : headers) {
            PdfPCell hc = new PdfPCell(new Phrase(h, headerFont));
            hc.setBackgroundColor(HEADER_BG);
            hc.setPadding(7f);
            hc.setHorizontalAlignment(Element.ALIGN_CENTER);
            hc.setVerticalAlignment(Element.ALIGN_MIDDLE);
            hc.setBorderColor(HEADER_BG);
            table.addCell(hc);
        }

        boolean alt = false;
        int sNo = 1;
        if (prescription.getPrescriptionItem() != null) {
            for (PrescriptionItem item : prescription.getPrescriptionItem()) {
                Color rowBg = alt ? ALT_ROW_BG : Color.WHITE;
                alt = !alt;

                PdfPCell nameCell = new PdfPCell(new Phrase(sNo++ + ".  " + item.getMedicineName(), boldGreen));
                nameCell.setBackgroundColor(rowBg);
                nameCell.setPadding(6f);
                nameCell.setBorderColor(BORDER_COLOR);
                nameCell.setBorderWidth(0.5f);
                table.addCell(nameCell);

                table.addCell(styledCell(item.getMedicineDosage(), cellFont, rowBg, Element.ALIGN_CENTER));
                table.addCell(styledCell(String.valueOf(item.getMedicineDurationDays()), cellFont, rowBg, Element.ALIGN_CENTER));
                table.addCell(styledCell(String.valueOf(item.getMedicineFrequency()), cellFont, rowBg, Element.ALIGN_CENTER));
                table.addCell(styledCell(item.getMedicineInstructions(), noteFont, rowBg, Element.ALIGN_LEFT));
            }
        }

        document.add(table);
    }

    private static void addNotes(Document document, Prescription prescription) throws DocumentException {
        PdfPTable notesTable = new PdfPTable(1);
        notesTable.setWidthPercentage(100);

        Font labelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, PRIMARY_COLOR);
        Font notesFont = FontFactory.getFont(FontFactory.HELVETICA, 9.5f, Color.BLACK);

        PdfPCell cell = new PdfPCell();
        cell.setBorderWidthLeft(3f);
        cell.setBorderColorLeft(ACCENT_COLOR);
        cell.setBorderWidthTop(0);
        cell.setBorderWidthRight(0);
        cell.setBorderWidthBottom(0);
        cell.setBackgroundColor(LIGHT_GRAY);
        cell.setPadding(10f);

        Paragraph label = new Paragraph("Clinical Notes / Additional Instructions:", labelFont);
        label.setSpacingAfter(4f);
        cell.addElement(label);
        cell.addElement(new Paragraph(prescription.getPrescriptionNotes(), notesFont));

        notesTable.addCell(cell);
        document.add(notesTable);
    }

    private static void addSignatureArea(Document document) throws DocumentException {
        addSpacer(document);
        PdfPTable sigTable = new PdfPTable(2);
        sigTable.setWidthPercentage(100);
        sigTable.setWidths(new float[]{1f, 1f});

        Font sigLabel = FontFactory.getFont(FontFactory.HELVETICA, 9, TEXT_SECONDARY);
        Font sigLine  = FontFactory.getFont(FontFactory.HELVETICA, 8, TEXT_SECONDARY);

        PdfPCell patSig = new PdfPCell();
        patSig.setBorder(Rectangle.NO_BORDER);
        patSig.setPadding(8f);
        patSig.addElement(new Paragraph("\n\n\n________________________________", sigLabel));
        patSig.addElement(new Paragraph("Patient / Guardian Signature", sigLine));
        sigTable.addCell(patSig);

        PdfPCell docSig = new PdfPCell();
        docSig.setBorder(Rectangle.NO_BORDER);
        docSig.setPadding(8f);
        docSig.setHorizontalAlignment(Element.ALIGN_RIGHT);
        docSig.addElement(new Paragraph("\n\n\n________________________________", sigLabel));
        docSig.addElement(new Paragraph("Doctor's Signature & Stamp", sigLine));
        sigTable.addCell(docSig);

        document.add(sigTable);
    }

    private static void addFooterNote(Document document) throws DocumentException {
        LineSeparator sep = new LineSeparator();
        sep.setLineColor(BORDER_COLOR);
        document.add(new Chunk(sep));
        addSpacer(document);

        Font noteFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 8, TEXT_SECONDARY);
        Paragraph note = new Paragraph(
                "This prescription is valid for 30 days from the date of issue. "
                + "Please dispense medicines only as prescribed. "
                + "For queries, contact Embrace Hospital pharmacy at the number above.",
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
