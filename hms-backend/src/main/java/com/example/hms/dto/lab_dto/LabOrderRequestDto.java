package com.example.hms.dto.lab_dto;

import com.example.hms.enums.LabOrderStatuses;
import com.example.hms.enums.LabOrderUrgency;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LabOrderRequestDto {

    @Size(max = 64)
    private String labOrderNumber;

    @NotBlank
    @Size(max = 500)
    private String labOrderTestName;
    private LabOrderUrgency labOrderTestUrgency;
    private LabOrderStatuses labOrderStatus;

    @Size(max = 2000)
    private String labOrderNotes;

    @NotNull
    private Integer consultationId;
}
