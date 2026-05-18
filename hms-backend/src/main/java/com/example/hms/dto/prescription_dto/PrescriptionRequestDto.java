package com.example.hms.dto.prescription_dto;

import com.example.hms.enums.PrescriptionStatuses;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionRequestDto {

    @Size(max = 64)
    private String prescriptionNumber;
    private PrescriptionStatuses prescriptionStatus;

    @Size(max = 4000)
    private String prescriptionNotes;

    @NotNull
    private Integer consultationId;

    @NotNull
    private Integer patientId;

    @NotEmpty
    @Valid
    private List<PrescriptionItemDto> prescriptionItems;
}
