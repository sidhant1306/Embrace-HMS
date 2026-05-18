package com.example.hms.dto.patient_dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientSummaryResponse {
    private Integer PatientSummaryResponseId;
    private String patientName;
    private Integer patientId;
    private String patientPhone;

}
