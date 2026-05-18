package com.example.hms.service;

import com.example.hms.dao.AppointmentRepository;
import com.example.hms.dao.ConsultationRepository;
import com.example.hms.dao.DoctorRepository;
import com.example.hms.dao.PatientRepository;
import com.example.hms.dao.UserRepository;
import com.example.hms.dto.consultation_dto.ConsultationRequestDto;
import com.example.hms.dto.consultation_dto.ConsultationResponseDto;
import com.example.hms.enums.Roles;
import com.example.hms.enums.Statuses;
import com.example.hms.exception.ResourceNotFoundException;
import com.example.hms.mapper.ConsultationMapper;
import com.example.hms.model.dataModel.Appointment;
import com.example.hms.model.dataModel.Consultation;
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

import java.time.LocalDateTime;

@Service
public class ConsultationService {

    private final ConsultationRepository consultationRepository;
    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    public ConsultationService(ConsultationRepository consultationRepository, AppointmentRepository appointmentRepository, DoctorRepository doctorRepository, PatientRepository patientRepository, UserRepository userRepository) {
        this.consultationRepository = consultationRepository;
        this.appointmentRepository = appointmentRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ResponseEntity<ConsultationResponseDto> startConsultation(Integer appointmentId, ConsultationRequestDto consultationRequestDto) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + appointmentId));

        Consultation consultation = new Consultation();
        consultation.setAppointment(appointment);
        consultation.setConsultationComplaint(consultationRequestDto.getConsultationComplaint());
        consultation.setConsultationDiagnosis(consultationRequestDto.getConsultationDiagnosis());
        consultation.setConsultationNotes(consultationRequestDto.getConsultationNotes());
        consultation.setConsultationStatus(Statuses.PENDING);
        consultation.setConsultationCreatedAt(LocalDateTime.now());
        consultation.setConsultationUpdatedAt(LocalDateTime.now());

        // Derive doctor and patient from the appointment itself
        Doctor doctor = appointment.getDoctor();
        Patient patient = appointment.getPatient();

        if (consultationRequestDto.getDoctorId() != null) {
            doctor = doctorRepository.findById(consultationRequestDto.getDoctorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + consultationRequestDto.getDoctorId()));
        }
        if (consultationRequestDto.getPatientId() != null) {
            patient = patientRepository.findById(consultationRequestDto.getPatientId())
                    .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + consultationRequestDto.getPatientId()));
        }

        consultation.setDoctor(doctor);
        consultation.setPatient(patient);

        Consultation saved = consultationRepository.save(consultation);
        return ResponseEntity.ok(ConsultationMapper.toResponse(saved));
    }

    @Transactional
    public ResponseEntity<ConsultationResponseDto> updateConsultation(Integer consultationId, ConsultationRequestDto consultationRequestDto) {
        Consultation consultation = consultationRepository.findById(consultationId)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation not found with ID: " + consultationId));

        consultation.setConsultationComplaint(consultationRequestDto.getConsultationComplaint());
        consultation.setConsultationDiagnosis(consultationRequestDto.getConsultationDiagnosis());
        consultation.setConsultationNotes(consultationRequestDto.getConsultationNotes());
        consultation.setConsultationUpdatedAt(LocalDateTime.now());

        return ResponseEntity.ok(ConsultationMapper.toResponse(consultationRepository.save(consultation)));
    }

    @Transactional
    public ResponseEntity<ConsultationResponseDto> completeConsultation(Integer consultationId) {
        Consultation consultation = consultationRepository.findById(consultationId)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation not found with ID: " + consultationId));

        consultation.setConsultationStatus(Statuses.COMPLETED);
        consultation.setConsultationUpdatedAt(LocalDateTime.now());

        return ResponseEntity.ok(ConsultationMapper.toResponse(consultationRepository.save(consultation)));
    }

    @Transactional(readOnly = true)
    public ResponseEntity<ConsultationResponseDto> getConsultationById(Integer consultationId) {
        Consultation consultation = consultationRepository.findById(consultationId)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation not found with ID: " + consultationId));

        return ResponseEntity.ok(ConsultationMapper.toResponse(consultation));
    }

    @Transactional(readOnly = true)
    public ResponseEntity<ConsultationResponseDto> getConsultationByAppointment(Integer appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + appointmentId));

        Consultation consultation = consultationRepository.findByAppointment(appointment)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation not found for appointment ID: " + appointmentId));

        return ResponseEntity.ok(ConsultationMapper.toResponse(consultation));
    }

    @Transactional(readOnly = true)
    public Page<ConsultationResponseDto> getMyConsultations(Pageable pageable) {
        User currentUser = userRepository.findByUserEmail(SecurityContextHolder.getContext().getAuthentication().getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (currentUser.getUserRole() == Roles.DOCTOR) {
            Doctor doctor = doctorRepository.findByUser(currentUser)
                    .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found for current user"));
            return consultationRepository.findByDoctor(doctor, pageable).map(ConsultationMapper::toResponse);
        } else if (currentUser.getUserRole() == Roles.PATIENT) {
            Patient patient = patientRepository.findByUser(currentUser)
                    .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found for current user"));
            return consultationRepository.findByPatient(patient, pageable).map(ConsultationMapper::toResponse);
        } else {
            throw new AccessDeniedException("Only doctors and patients can view their consultations");
        }
    }
}
