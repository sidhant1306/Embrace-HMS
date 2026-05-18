package com.example.hms.model.prescriptionModel;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer prescriptionItemId;

    private String medicineName;
    private String medicineDosage;
    private int medicineDurationDays;
    private int medicineFrequency;
    private String medicineInstructions;

    @JoinColumn
    @ManyToOne
    private Prescription prescription;
}
