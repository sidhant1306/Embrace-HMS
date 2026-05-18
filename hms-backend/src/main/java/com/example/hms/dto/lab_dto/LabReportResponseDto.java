package com.example.hms.dto.lab_dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LabReportResponseDto {
    private Integer labReportId;
    private String reportFilePath;
    private String doctorNotes;
    private boolean isViewedByDoctor;
    private boolean isViewedByPatient;
    private LocalDateTime uploadedAt;
    private Integer labOrderId;
    private Integer patientId;
    private String patientName;
}
