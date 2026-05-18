package com.example.hms.dto.notification_dto;

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
public class BroadcastRequestDto {

    @NotBlank
    @Size(max = 255)
    private String title;

    @NotBlank
    @Size(max = 2000)
    private String message;

    /** "ALL", "DOCTOR", "PATIENT", "RECEPTIONIST", "PHARMACIST", "LAB_TECHNICIAN", "ADMIN" */
    @NotBlank
    private String targetAudience;

    /** info, success, warning */
    private String type;
}
