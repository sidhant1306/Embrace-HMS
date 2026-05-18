package com.example.hms.dto.patient_dto;

import com.example.hms.enums.Genders;
import jakarta.validation.constraints.Email;
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
public class PatientDetailResponse {
    private Integer patientId;

    @NotBlank
    @Size(max = 200)
    private String patientName;

    @Size(max = 20)
    private String patientPhone;

    @Email
    @Size(max = 255)
    private String patientEmail;

    @Size(max = 500)
    private String patientAddress;

    @Size(max = 20)
    private String patientAge;
    private Genders patientGender;

    @Size(max = 10)
    private String patientBloodGroup;

    @Size(max = 2000)
    private String patientImage;

    @Size(max = 20)
    private String patientEmergencyContact;

    @Size(max = 64)
    private String patientCreatedAt;
}
