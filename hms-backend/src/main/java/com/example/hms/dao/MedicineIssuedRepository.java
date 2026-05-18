package com.example.hms.dao;

import com.example.hms.dto.pharmacy_dto.MedicineIssuedResponseDto;
import com.example.hms.model.pharmacyModel.MedicineIssued;
import com.example.hms.model.profileModel.Patient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MedicineIssuedRepository extends JpaRepository<MedicineIssued, Integer> {
    Page<MedicineIssued> findByPatientPatientId(Integer patientPatientId, Pageable pageable);
}
