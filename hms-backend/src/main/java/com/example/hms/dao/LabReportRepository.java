package com.example.hms.dao;

import com.example.hms.model.dataModel.Appointment;
import com.example.hms.model.labModel.LabReport;
import com.example.hms.model.profileModel.Patient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Range;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LabReportRepository extends JpaRepository<LabReport, Integer> {
    Page<LabReport> findByPatient(Patient patient, Pageable pageable);
}
