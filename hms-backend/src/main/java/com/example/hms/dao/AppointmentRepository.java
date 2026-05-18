package com.example.hms.dao;

import com.example.hms.model.dataModel.Appointment;
import com.example.hms.model.profileModel.Doctor;
import com.example.hms.model.profileModel.Patient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Integer> {
    Page<Appointment> findByPatient(Patient patient, Pageable pageable);
    Page<Appointment> findByDoctor(Doctor doctor, Pageable pageable);
    Page<Appointment> findByAppointmentDateAndDoctor(Pageable pageable, LocalDate appointmentDate, Doctor doctor);
    Page<Appointment> findByAppointmentDate(Pageable pageable, LocalDate appointmentDate);

    List<Appointment> findByAppointmentDateAndDoctorOrderByAppointmentTimeAsc(LocalDate appointmentDate, Doctor doctor);
}
