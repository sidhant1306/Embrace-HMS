package com.example.hms.dto.appointment_dto;

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
public class AppointmentCancelDto {

    @NotBlank
    @Size(max = 2000)
    private String appointmentCancelReason;
}
