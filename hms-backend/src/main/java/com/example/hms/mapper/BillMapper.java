package com.example.hms.mapper;

import com.example.hms.dto.billing_dto.BillItemDto;
import com.example.hms.dto.billing_dto.BillResponseDto;
import com.example.hms.model.billingModel.Bill;
import com.example.hms.model.billingModel.BillItem;

import java.util.List;

public final class BillMapper {

    private BillMapper() {
    }

    public static BillResponseDto toResponse(Bill bill) {
        List<BillItemDto> items = bill.getBillItems() == null ? List.of()
                : bill.getBillItems().stream().map(BillMapper::toItemDto).toList();
        return BillResponseDto.builder()
                .billId(bill.getBillId())
                .patientId(bill.getPatient() != null ? bill.getPatient().getPatientId() : null)
                .subTotal(bill.getSubTotal())
                .taxPercent(bill.getTaxPercent())
                .taxAmount(bill.getTaxAmount())
                .totalAmount(bill.getTotalAmount())
                .paymentStatuses(bill.getPaymentStatuses())
                .paymentMethod(bill.getPaymentMethod())
                .amountPaid(bill.getAmountPaid())
                .balanceDue(bill.getBalanceDue())
                .createdAt(bill.getCreatedAt())
                .updatedAt(bill.getUpdatedAt())
                .consultationId(bill.getConsultation() != null ? bill.getConsultation().getConsultationId() : null)
                .billItems(items)
                .build();
    }

    private static BillItemDto toItemDto(BillItem line) {
        return BillItemDto.builder()
                .itemId(line.getItemId())
                .itemName(line.getItemName())
                .itemType(line.getItemType())
                .quantity(line.getQuantity())
                .unitPrice(line.getUnitPrice())
                .lineTotal(line.getLineTotal())
                .build();
    }
}
