package com.example.hms.dto.lab_dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LabReportRequestDto {

    @Size(max = 2000)
    private String reportFilePath;

    @Size(max = 4000)
    private String doctorNotes;
    private boolean isViewedByDoctor;
    private boolean isViewedByPatient;

    @NotNull
    private Integer labOrderId;

    @NotNull
    private Integer patientId;
}
