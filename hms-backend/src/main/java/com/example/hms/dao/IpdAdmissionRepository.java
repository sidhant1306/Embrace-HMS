package com.example.hms.dao;

import com.example.hms.enums.AdmissionStatus;
import com.example.hms.model.bedModel.IpdAdmission;
import com.example.hms.model.profileModel.Patient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IpdAdmissionRepository extends JpaRepository<IpdAdmission, Integer> {

    Page<IpdAdmission> findByStatus(AdmissionStatus status, Pageable pageable);

    Page<IpdAdmission> findByPatient(Patient patient, Pageable pageable);

    boolean existsByBed_BedIdAndStatus(Integer bedId, AdmissionStatus status);

    boolean existsByPatient_PatientIdAndStatus(Integer patientId, AdmissionStatus status);
}
