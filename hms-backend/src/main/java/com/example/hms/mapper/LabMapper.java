package com.example.hms.mapper;

import com.example.hms.dto.lab_dto.LabOrderResponseDto;
import com.example.hms.dto.lab_dto.LabReportResponseDto;
import com.example.hms.model.labModel.LabOrders;
import com.example.hms.model.labModel.LabReport;

public final class LabMapper {

    private LabMapper() {
    }

    public static LabOrderResponseDto toOrderResponse(LabOrders o) {
        if (o == null) {
            return null;
        }
        return LabOrderResponseDto.builder()
                .labOrderId(o.getLabOrderId())
                .labOrderNumber(o.getLabOrderNumber())
                .labOrderTestName(o.getLabOrderTestName())
                .labOrderTestUrgency(o.getLabOrderTestUrgency())
                .labOrderStatus(o.getLabOrderStatus())
                .labOrderNotes(o.getLabOrderNotes())
                .labOrderCreatedAt(o.getLabOrderCreatedAt())
                .labOrderUpdatedAt(o.getLabOrderUpdatedAt())
                .consultationId(o.getConsultation() != null ? o.getConsultation().getConsultationId() : null)
                .patientId(o.getConsultation() != null && o.getConsultation().getPatient() != null
                        ? o.getConsultation().getPatient().getPatientId() : null)
                .patientName(o.getConsultation() != null && o.getConsultation().getPatient() != null && o.getConsultation().getPatient().getUser() != null
                        ? o.getConsultation().getPatient().getUser().getUserName() : null)
                .doctorName(o.getConsultation() != null && o.getConsultation().getDoctor() != null && o.getConsultation().getDoctor().getUser() != null
                        ? o.getConsultation().getDoctor().getUser().getUserName() : null)
                .build();
    }

    public static LabReportResponseDto toReportResponse(LabReport r) {
        if (r == null) {
            return null;
        }
        return LabReportResponseDto.builder()
                .labReportId(r.getLabReportId())
                .reportFilePath(r.getReportFilePath())
                .doctorNotes(r.getDoctorNotes())
                .isViewedByDoctor(r.isViewedByDoctor())
                .isViewedByPatient(r.isViewedByPatient())
                .uploadedAt(r.getUploadedAt())
                .labOrderId(r.getLabOrder() != null ? r.getLabOrder().getLabOrderId() : null)
                .patientId(r.getPatient() != null ? r.getPatient().getPatientId() : null)
                .patientName(r.getPatient() != null && r.getPatient().getUser() != null
                        ? r.getPatient().getUser().getUserName() : null)
                .build();
    }
}
