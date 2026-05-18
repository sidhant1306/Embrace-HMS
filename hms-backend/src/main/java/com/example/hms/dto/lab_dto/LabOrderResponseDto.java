package com.example.hms.dto.lab_dto;

import com.example.hms.enums.LabOrderStatuses;
import com.example.hms.enums.LabOrderUrgency;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LabOrderResponseDto {
    private Integer labOrderId;
    private String labOrderNumber;
    private String labOrderTestName;
    private LabOrderUrgency labOrderTestUrgency;
    private LabOrderStatuses labOrderStatus;
    private String labOrderNotes;
    private LocalDateTime labOrderCreatedAt;
    private LocalDateTime labOrderUpdatedAt;
    private Integer consultationId;
    private Integer patientId;
    private String patientName;
    private String doctorName;
}
