package com.example.hms.dto.bed_dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdmitPatientRequestDto {

    @NotNull
    private Integer patientId;

    @NotNull
    private Integer bedId;
}
