package com.example.hms.dao;

import com.example.hms.model.prescriptionModel.PrescriptionItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PrescriptionItemRepository extends JpaRepository<PrescriptionItem, Integer> {
}
