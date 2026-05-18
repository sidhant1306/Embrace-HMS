package com.example.hms.dto.pharmacy_dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicineIssuedRequestDto {
    private LocalDateTime issuedDate;

    @NotNull
    private Integer prescriptionId;
}
