package com.example.hms.dto.billing_dto;

import com.example.hms.enums.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequestDto {

    @Positive
    private Double paymentAmount;

    @NotNull
    private PaymentMethod paymentMethod;
}
