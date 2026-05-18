package com.example.hms.dto.pharmacy_dto;

import com.example.hms.model.profileModel.Patient;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicineIssuedResponseDto {
    private Integer issueId;
    private LocalDateTime issuedDate;
    private Integer prescriptionId;
    private String prescriptionNumber;
    private String medicineName;
    private String medicineDosage;
    private int medicineDurationDays;
    private int medicineFrequency;
    private String medicineInstructions;

    private String patientName;
    private int patientId;
}
