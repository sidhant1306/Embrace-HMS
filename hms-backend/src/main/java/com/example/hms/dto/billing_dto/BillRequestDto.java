package com.example.hms.dto.billing_dto;

import com.example.hms.enums.PaymentStatuses;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BillRequestDto {
    private Double subTotal;
    private String taxPercent;
    private Double taxAmount;
    private Double totalAmount;
    private PaymentStatuses paymentStatuses;
    private Double amountPaid;
    private Double balanceDue;
    private Integer consultationId;
    private List<BillItemDto> billItems;
}
