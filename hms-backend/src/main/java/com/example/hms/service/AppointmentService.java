package com.example.hms.service;

import com.example.hms.dao.AppointmentRepository;
import com.example.hms.dao.DoctorRepository;
import com.example.hms.dao.PatientRepository;
import com.example.hms.dao.UserRepository;
import com.example.hms.dto.appointment_dto.AppointmentCancelDto;
import com.example.hms.dto.appointment_dto.AppointmentRequestDto;
import com.example.hms.dto.appointment_dto.AppointmentResponseDto;
import com.example.hms.enums.Roles;
import com.example.hms.enums.Statuses;
import com.example.hms.exception.ResourceNotFoundException;
import com.example.hms.mapper.AppointmentMapper;
import com.example.hms.model.dataModel.Appointment;
import com.example.hms.model.profileModel.Doctor;
import com.example.hms.model.profileModel.Patient;
import com.example.hms.model.profileModel.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;

    public AppointmentService(AppointmentRepository appointmentRepository, PatientRepository patientRepository, DoctorRepository doctorRepository, UserRepository userRepository) {
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ResponseEntity<AppointmentResponseDto> bookAppointment(AppointmentRequestDto appointmentRequestDto) {
        Appointment appointment = new Appointment();
        Patient patient = patientRepository.findById(appointmentRequestDto.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + appointmentRequestDto.getPatientId()));
        Doctor doctor = doctorRepository.findById(appointmentRequestDto.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        appointment.setDoctor(doctor);
        appointment.setPatient(patient);
        appointment.setAppointmentDate(appointmentRequestDto.getAppointmentDate());
        appointment.setAppointmentTime(appointmentRequestDto.getAppointmentTime());
        appointment.setAppointmentReason(appointmentRequestDto.getAppointmentReason());
        appointment.setAppointmentStatus(Statuses.PENDING);
        appointment.setAppointmentDescription("Appointment booked");
        LocalDateTime now = LocalDateTime.now();
        appointment.setAppointmentCreatedAt(now);
        appointment.setAppointmentUpdatedAt(now);

        Appointment saved = appointmentRepository.save(appointment);
        return ResponseEntity.ok(AppointmentMapper.toResponse(saved));
    }

    @Transactional
    public ResponseEntity<String> cancelAppointment(Integer appointmentId, AppointmentCancelDto appointmentCancelDto) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + appointmentId));

        appointment.setAppointmentStatus(Statuses.CANCELLED);
        appointment.setAppointmentCancelReason(appointmentCancelDto.getAppointmentCancelReason());
        appointment.setAppointmentUpdatedAt(LocalDateTime.now());
        appointmentRepository.save(appointment);

        return ResponseEntity.ok("Appointment cancelled successfully");
    }

    @Transactional
    public ResponseEntity<AppointmentResponseDto> rescheduleAppointment(Integer appointmentId, AppointmentRequestDto appointmentRequestDto) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + appointmentId));

        appointment.setAppointmentDate(appointmentRequestDto.getAppointmentDate());
        appointment.setAppointmentTime(appointmentRequestDto.getAppointmentTime());
        appointment.setAppointmentStatus(Statuses.RESCHEDULED);
        appointment.setAppointmentUpdatedAt(LocalDateTime.now());
        Appointment updated = appointmentRepository.save(appointment);

        return ResponseEntity.ok(AppointmentMapper.toResponse(updated));
    }

    @Transactional
    public ResponseEntity<AppointmentResponseDto> confirmAppointment(Integer appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + appointmentId));

        appointment.setAppointmentStatus(Statuses.APPROVED);
        appointment.setAppointmentUpdatedAt(LocalDateTime.now());
        return ResponseEntity.ok(AppointmentMapper.toResponse(appointmentRepository.save(appointment)));
    }

    @Transactional
    public ResponseEntity<AppointmentResponseDto> completeAppointment(Integer appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + appointmentId));

        appointment.setAppointmentStatus(Statuses.COMPLETED);
        appointment.setAppointmentUpdatedAt(LocalDateTime.now());
        return ResponseEntity.ok(AppointmentMapper.toResponse(appointmentRepository.save(appointment)));
    }

    @Transactional(readOnly = true)
    public Page<AppointmentResponseDto> getTodaysAppointments(Pageable pageable) {
        User currentUser = userRepository.findByUserEmail(SecurityContextHolder.getContext().getAuthentication().getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        LocalDate today = LocalDate.now();
        Page<Appointment> appointments;

        if (currentUser.getUserRole() == Roles.DOCTOR) {
            Doctor doctor = doctorRepository.findByUser(currentUser)
                    .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found for current user"));
            appointments = appointmentRepository.findByAppointmentDateAndDoctor(pageable, today, doctor);
        } else if (currentUser.getUserRole() == Roles.RECEPTIONIST
                || currentUser.getUserRole() == Roles.ADMIN
                || currentUser.getUserRole() == Roles.SUPER_ADMIN) {
            appointments = appointmentRepository.findByAppointmentDate(pageable, today);
        } else {
            throw new AccessDeniedException("Unauthorized");
        }

        return appointments.map(AppointmentMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<AppointmentResponseDto> getAllAppointments(Pageable pageable) {
        User currentUser = userRepository.findByUserEmail(SecurityContextHolder.getContext().getAuthentication().getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Page<Appointment> appointments;

        if (currentUser.getUserRole() == Roles.DOCTOR) {
            Doctor doctor = doctorRepository.findByUser(currentUser)
                    .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found for current user"));
            appointments = appointmentRepository.findByDoctor(doctor, pageable);
        } else if (currentUser.getUserRole() == Roles.RECEPTIONIST
                || currentUser.getUserRole() == Roles.ADMIN
                || currentUser.getUserRole() == Roles.SUPER_ADMIN) {
            appointments = appointmentRepository.findAll(pageable);
        } else {
            throw new AccessDeniedException("Unauthorized");
        }

        return appointments.map(AppointmentMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public ResponseEntity<AppointmentResponseDto> getAppointmentById(Integer appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + appointmentId));

        return ResponseEntity.ok(AppointmentMapper.toResponse(appointment));
    }

    @Transactional(readOnly = true)
    public Page<AppointmentResponseDto> getAppointmentsByPatient(Integer patientId, Pageable pageable) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + patientId));

        return appointmentRepository.findByPatient(patient, pageable).map(AppointmentMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<AppointmentResponseDto> getAppointmentsByDoctor(Integer doctorId, Pageable pageable) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + doctorId));

        return appointmentRepository.findByDoctor(doctor, pageable).map(AppointmentMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public ResponseEntity<List<LocalDateTime>> getAvailableSlots(Integer doctorId, LocalDate date) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + doctorId));

        List<Appointment> bookedAppointments = appointmentRepository
                .findByAppointmentDateAndDoctorOrderByAppointmentTimeAsc(date, doctor)
                .stream()
                .filter(a -> a.getAppointmentStatus() != Statuses.CANCELLED && a.getAppointmentStatus() != Statuses.REJECTED)
                .collect(Collectors.toList());

        List<LocalTime> slots = List.of(
                LocalTime.of(9, 0), LocalTime.of(10, 0), LocalTime.of(11, 0), LocalTime.of(12, 0),
                LocalTime.of(13, 0), LocalTime.of(14, 0), LocalTime.of(15, 0), LocalTime.of(16, 0)
        );

        List<LocalDateTime> availableSlots = new ArrayList<>();
        for (LocalTime slot : slots) {
            LocalDateTime slotDateTime = LocalDateTime.of(date, slot);
            boolean isBooked = bookedAppointments.stream()
                    .anyMatch(a -> a.getAppointmentTime() != null && a.getAppointmentTime().toLocalTime().equals(slot));
            if (!isBooked) {
                availableSlots.add(slotDateTime);
            }
        }

        return ResponseEntity.ok(availableSlots);
    }
}
