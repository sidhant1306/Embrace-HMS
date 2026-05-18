package com.example.hms.dto.consultation_dto;

import com.example.hms.enums.Statuses;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsultationResponseDto {
    private Integer consultationId;
    private String consultationComplaint;
    private String consultationDiagnosis;
    private String consultationNotes;
    private Statuses consultationStatus;
    private LocalDateTime consultationCreatedAt;
    private LocalDateTime consultationUpdatedAt;
    private Integer appointmentId;
    private Integer doctorId;
    private String doctorName;
    private Integer patientId;
    private String patientName;
}
