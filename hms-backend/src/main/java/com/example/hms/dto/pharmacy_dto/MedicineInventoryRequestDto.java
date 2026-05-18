package com.example.hms.dto.pharmacy_dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicineInventoryRequestDto {

    @NotBlank
    @Size(max = 255)
    private String medicineName;

    @Size(max = 120)
    private String medicineCategory;

    @Min(0)
    private int medicineStock;

    @NotBlank
    @Size(max = 32)
    private String medicinePrice;

    @NotNull
    private LocalDate medicineExpiryDate;
}
