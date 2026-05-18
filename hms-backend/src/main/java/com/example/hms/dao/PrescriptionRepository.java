package com.example.hms.dao;

import com.example.hms.model.prescriptionModel.Prescription;
import com.example.hms.model.profileModel.Doctor;
import com.example.hms.model.profileModel.Patient;
import com.example.hms.enums.PrescriptionStatuses;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PrescriptionRepository extends JpaRepository<Prescription, Integer> {
    Page<Prescription> findByPatient(Patient patient, Pageable pageable);
    Page<Prescription> findByPrescriptionStatus(PrescriptionStatuses status, Pageable pageable);
    Page<Prescription> findByConsultation_Doctor(Doctor doctor, Pageable pageable);

    @EntityGraph(attributePaths = {"prescriptionItem"})
    List<Prescription> findByConsultation_ConsultationId(Integer consultationId);
}
