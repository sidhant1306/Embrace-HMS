package com.example.hms.mapper;

import com.example.hms.dto.appointment_dto.AppointmentResponseDto;
import com.example.hms.model.dataModel.Appointment;

public final class AppointmentMapper {

    private AppointmentMapper() {
    }

    public static AppointmentResponseDto toResponse(Appointment a) {
        if (a == null) {
            return null;
        }
        return AppointmentResponseDto.builder()
                .appointmentId(a.getAppointmentId())
                .appointmentDate(a.getAppointmentDate())
                .appointmentTime(a.getAppointmentTime())
                .appointmentStatus(a.getAppointmentStatus() != null ? a.getAppointmentStatus().name() : null)
                .appointmentDescription(a.getAppointmentDescription())
                .appointmentCancelReason(a.getAppointmentCancelReason())
                .appointmentCreatedAt(a.getAppointmentCreatedAt())
                .appointmentUpdatedAt(a.getAppointmentUpdatedAt())
                .doctorId(a.getDoctor() != null ? a.getDoctor().getDoctorId() : null)
                .doctorName(a.getDoctor() != null && a.getDoctor().getUser() != null
                        ? a.getDoctor().getUser().getUserName() : null)
                .patientId(a.getPatient() != null ? a.getPatient().getPatientId() : null)
                .patientName(a.getPatient() != null && a.getPatient().getUser() != null
                        ? a.getPatient().getUser().getUserName() : null)
                .build();
    }
}
