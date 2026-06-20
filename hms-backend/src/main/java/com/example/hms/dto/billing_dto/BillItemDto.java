package com.example.hms.dto.billing_dto;

import com.example.hms.enums.ItemTypes;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BillItemDto {
    private Integer itemId;
    private String itemName;
    private ItemTypes itemType;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal lineTotal;
}
