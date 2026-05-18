package com.example.hms.dto.bed_dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DischargePatientRequestDto {

    @Size(max = 8000)
    private String dischargeSummary;
}
