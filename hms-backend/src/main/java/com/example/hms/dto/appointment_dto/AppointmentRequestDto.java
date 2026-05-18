package com.example.hms.dto.appointment_dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentRequestDto {

    @NotNull
    private LocalDate appointmentDate;

    @NotNull
    private LocalDateTime appointmentTime;

    @NotBlank
    @Size(max = 2000)
    private String appointmentReason;

    @NotNull
    private Integer doctorId;

    @NotNull
    private Integer patientId;
}
