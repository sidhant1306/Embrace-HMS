package com.example.hms.dto.consultation_dto;

import com.example.hms.enums.Statuses;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsultationRequestDto {

    @Size(max = 4000)
    private String consultationComplaint;

    @Size(max = 4000)
    private String consultationDiagnosis;

    @Size(max = 8000)
    private String consultationNotes;
    private Statuses consultationStatus;
    private Integer appointmentId;
    private Integer doctorId;
    private Integer patientId;
}
