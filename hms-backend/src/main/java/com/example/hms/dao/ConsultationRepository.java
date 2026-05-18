package com.example.hms.dao;

import com.example.hms.model.dataModel.Appointment;
import com.example.hms.model.dataModel.Consultation;
import com.example.hms.model.profileModel.Doctor;
import com.example.hms.model.profileModel.Patient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ConsultationRepository extends JpaRepository<Consultation, Integer> {
    Page<Consultation> findByPatient(Patient patient, Pageable pageable);
    Page<Consultation> findByDoctor(Doctor doctor, Pageable pageable);
    Optional<Consultation> findByAppointment(Appointment appointment);
}
