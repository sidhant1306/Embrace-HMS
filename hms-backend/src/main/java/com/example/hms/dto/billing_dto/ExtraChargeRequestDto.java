package com.example.hms.dto.billing_dto;

import com.example.hms.enums.ItemTypes;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExtraChargeRequestDto {

    @NotBlank
    @Size(max = 500)
    private String itemName;

    @NotNull
    private ItemTypes itemType;

    @Min(1)
    private Integer quantity;

    @Min(0)
    private Double unitPrice;
}
