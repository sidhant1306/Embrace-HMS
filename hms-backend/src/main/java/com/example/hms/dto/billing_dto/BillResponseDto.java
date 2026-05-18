package com.example.hms.dto.billing_dto;

import com.example.hms.enums.PaymentMethod;
import com.example.hms.enums.PaymentStatuses;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BillResponseDto {
    private Integer billId;
    private Integer patientId;
    private Double subTotal;
    private String taxPercent;
    private Double taxAmount;
    private Double totalAmount;
    private PaymentStatuses paymentStatuses;
    private PaymentMethod paymentMethod;
    private Double amountPaid;
    private Double balanceDue;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer consultationId;
    private List<BillItemDto> billItems;
}
