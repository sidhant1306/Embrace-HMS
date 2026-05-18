package com.example.hms.dto.prescription_dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionItemDto {
    private Integer prescriptionItemId;

    @NotBlank
    @Size(max = 255)
    private String medicineName;

    @Size(max = 255)
    private String medicineDosage;

    @Min(1)
    private int medicineDurationDays;

    @Min(1)
    private int medicineFrequency;

    @Size(max = 2000)
    private String medicineInstructions;
}
