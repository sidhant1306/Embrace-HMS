package com.example.hms.dto.billing_dto;

import com.example.hms.enums.PaymentStatuses;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BillRequestDto {
    private BigDecimal subTotal;
    private String taxPercent;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
    private PaymentStatuses paymentStatuses;
    private BigDecimal amountPaid;
    private BigDecimal balanceDue;
    private Integer consultationId;
    private List<BillItemDto> billItems;
}
