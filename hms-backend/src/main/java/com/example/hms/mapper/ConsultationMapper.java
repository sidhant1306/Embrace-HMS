package com.example.hms.mapper;

import com.example.hms.dto.consultation_dto.ConsultationResponseDto;
import com.example.hms.model.dataModel.Consultation;

public final class ConsultationMapper {

    private ConsultationMapper() {
    }

    public static ConsultationResponseDto toResponse(Consultation c) {
        if (c == null) {
            return null;
        }
        return ConsultationResponseDto.builder()
                .consultationId(c.getConsultationId())
                .consultationComplaint(c.getConsultationComplaint())
                .consultationDiagnosis(c.getConsultationDiagnosis())
                .consultationNotes(c.getConsultationNotes())
                .consultationStatus(c.getConsultationStatus())
                .consultationCreatedAt(c.getConsultationCreatedAt())
                .consultationUpdatedAt(c.getConsultationUpdatedAt())
                .appointmentId(c.getAppointment() != null ? c.getAppointment().getAppointmentId() : null)
                .doctorId(c.getDoctor() != null ? c.getDoctor().getDoctorId() : null)
                .doctorName(c.getDoctor() != null && c.getDoctor().getUser() != null
                        ? c.getDoctor().getUser().getUserName() : null)
                .patientId(c.getPatient() != null ? c.getPatient().getPatientId() : null)
                .patientName(c.getPatient() != null && c.getPatient().getUser() != null
                        ? c.getPatient().getUser().getUserName() : null)
                .build();
    }
}
