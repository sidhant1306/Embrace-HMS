package com.example.hms.model.billingModel;

import com.example.hms.enums.PaymentMethod;
import com.example.hms.enums.PaymentStatuses;
import com.example.hms.model.dataModel.Consultation;
import com.example.hms.model.profileModel.Patient;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
public class Bill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer billId;

    private Double subTotal;

    private String taxPercent;

    private Double taxAmount;

    private Double totalAmount;

    @Enumerated(EnumType.STRING)
    private PaymentStatuses paymentStatuses;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    private Double amountPaid;

    private Double balanceDue;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @OneToOne
    @JoinColumn(name = "consultation_id")
    private Consultation consultation;

    @OneToMany(mappedBy = "bill", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BillItem> billItems = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;
}
