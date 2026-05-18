package com.example.hms.mapper;

import com.example.hms.dto.prescription_dto.PrescriptionItemDto;
import com.example.hms.dto.prescription_dto.PrescriptionResponseDto;
import com.example.hms.model.prescriptionModel.Prescription;
import com.example.hms.model.prescriptionModel.PrescriptionItem;

import java.util.List;

public final class PrescriptionMapper {

    private PrescriptionMapper() {
    }

    public static PrescriptionResponseDto toResponse(Prescription p) {
        if (p == null) {
            return null;
        }
        List<PrescriptionItemDto> items = p.getPrescriptionItem() == null ? List.of()
                : p.getPrescriptionItem().stream().map(PrescriptionMapper::toItemDto).toList();
        return PrescriptionResponseDto.builder()
                .prescriptionId(p.getPrescriptionId())
                .prescriptionNumber(p.getPrescriptionNumber())
                .prescriptionStatus(p.getPrescriptionStatus())
                .prescriptionNotes(p.getPrescriptionNotes())
                .prescriptionCreatedAt(p.getPrescriptionCreatedAt())
                .prescriptionUpdatedAt(p.getPrescriptionUpdatedAt())
                .consultationId(p.getConsultation() != null ? p.getConsultation().getConsultationId() : null)
                .patientId(p.getPatient() != null ? p.getPatient().getPatientId() : null)
                .patientName(p.getPatient() != null && p.getPatient().getUser() != null
                        ? p.getPatient().getUser().getUserName() : null)
                .prescriptionItems(items)
                .build();
    }

    private static PrescriptionItemDto toItemDto(PrescriptionItem i) {
        return PrescriptionItemDto.builder()
                .prescriptionItemId(i.getPrescriptionItemId())
                .medicineName(i.getMedicineName())
                .medicineDosage(i.getMedicineDosage())
                .medicineDurationDays(i.getMedicineDurationDays())
                .medicineFrequency(i.getMedicineFrequency())
                .medicineInstructions(i.getMedicineInstructions())
                .build();
    }
}
