package com.example.hms.dto.bed_dto;

import com.example.hms.enums.AdmissionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IpdAdmissionResponseDto {
    private Integer admissionId;
    private Integer patientId;
    private String patientName;
    private Integer bedId;
    private String bedNumber;
    private String wardName;
    private AdmissionStatus status;
    private LocalDateTime admittedAt;
    private LocalDateTime dischargedAt;
    private String dischargeSummary;
}
