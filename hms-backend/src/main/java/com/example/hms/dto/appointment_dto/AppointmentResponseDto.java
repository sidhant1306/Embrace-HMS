package com.example.hms.dto.appointment_dto;

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
public class AppointmentResponseDto {

    private Integer appointmentId;
    private LocalDate appointmentDate;
    private LocalDateTime appointmentTime;
    private String appointmentStatus;
    private String appointmentDescription;
    private String appointmentCancelReason;
    private LocalDateTime appointmentCreatedAt;
    private LocalDateTime appointmentUpdatedAt;
    private Integer doctorId;
    private String doctorName;
    private Integer patientId;
    private String patientName;

}
