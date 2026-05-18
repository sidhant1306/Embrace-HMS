package com.example.hms.dto.prescription_dto;

import com.example.hms.enums.PrescriptionStatuses;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionResponseDto {
    private Integer prescriptionId;
    private String prescriptionNumber;
    private PrescriptionStatuses prescriptionStatus;
    private String prescriptionNotes;
    private LocalDateTime prescriptionCreatedAt;
    private LocalDateTime prescriptionUpdatedAt;
    private Integer consultationId;
    private Integer patientId;
    private String patientName;
    private List<PrescriptionItemDto> prescriptionItems;
}
