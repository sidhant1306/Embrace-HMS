package com.example.hms.dao;

import com.example.hms.model.pharmacyModel.MedicineInventory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;

public interface MedicineInventoryRepository extends JpaRepository<MedicineInventory, Integer> {
    Page<MedicineInventory> getMedicineInventoriesByMedicineStockLessThanEqual(int medicineStockIsLessThan, Pageable pageable);
    Page<MedicineInventory> getMedicineInventoriesByMedicineExpiryDateBefore(Pageable pageable, LocalDate medicineExpiryDateBefore);

    MedicineInventory findByMedicineId(Integer medicineId);

    MedicineInventory findByMedicineName(String medicineName);
}
