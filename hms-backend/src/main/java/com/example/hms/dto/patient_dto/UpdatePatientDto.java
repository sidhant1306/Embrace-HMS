package com.example.hms.dto.patient_dto;

import com.example.hms.enums.BloodGroups;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePatientDto {

    @Size(max = 500)
    private String patientAddress;

    @Size(max = 20)
    private String emergencyContact;

    private BloodGroups bloodGroup;
}

