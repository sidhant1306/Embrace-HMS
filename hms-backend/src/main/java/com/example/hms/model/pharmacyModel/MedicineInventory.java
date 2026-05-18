package com.example.hms.model.pharmacyModel;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
public class MedicineInventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer medicineId;

    private String medicineName;
    private String medicineCategory;
    private int medicineStock;
    private String medicinePrice;
    private LocalDate medicineExpiryDate;

    @OneToMany(mappedBy = "inventory")
    private List<MedicineIssued> medicineIssuedList;
}
