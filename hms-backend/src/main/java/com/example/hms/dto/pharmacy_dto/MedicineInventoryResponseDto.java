package com.example.hms.dto.pharmacy_dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicineInventoryResponseDto {
    private Integer medicineId;
    private String medicineName;
    private String medicineCategory;
    private int medicineStock;
    private String medicinePrice;
    private LocalDate medicineExpiryDate;
}
