package com.example.hms.service;

import com.example.hms.dao.*;
import com.example.hms.dto.appointment_dto.CancelOwnAppointmentDto;
import com.example.hms.dto.appointment_dto.PatientAppointmentRequestDto;
import com.example.hms.dto.appointment_dto.AppointmentResponseDto;
import com.example.hms.dto.billing_dto.BillResponseDto;
import com.example.hms.dto.consultation_dto.ConsultationResponseDto;
import com.example.hms.dto.lab_dto.LabReportResponseDto;
import com.example.hms.dto.patient_dto.PatientDetailResponse;
import com.example.hms.dto.patient_dto.UpdatePatientDto;
import com.example.hms.dto.prescription_dto.PrescriptionResponseDto;
import com.example.hms.enums.Statuses;
import org.springframework.security.access.AccessDeniedException;
import com.example.hms.exception.ResourceNotFoundException;
import com.example.hms.mapper.BillMapper;
import com.example.hms.model.dataModel.Appointment;
import com.example.hms.model.dataModel.Consultation;
import com.example.hms.model.labModel.LabReport;
import com.example.hms.model.prescriptionModel.Prescription;
import com.example.hms.model.profileModel.Doctor;
import com.example.hms.model.profileModel.Patient;
import com.example.hms.model.profileModel.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.Period;

@Service
public class PatientService {
    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final ConsultationRepository consultationRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final LabReportRepository labReportRepository;
    private final BillRepository billRepository;
    private final PatientRepository patientRepository;

    public PatientService(UserRepository userRepository, AppointmentRepository appointmentRepository, DoctorRepository doctorRepository, ConsultationRepository consultationRepository, PrescriptionRepository prescriptionRepository, LabReportRepository labReportRepository, BillRepository billRepository, PatientRepository patientRepository) {
        this.userRepository = userRepository;
        this.appointmentRepository = appointmentRepository;
        this.doctorRepository = doctorRepository;
        this.consultationRepository = consultationRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.labReportRepository = labReportRepository;
        this.billRepository = billRepository;
        this.patientRepository = patientRepository;
    }

    public ResponseEntity<AppointmentResponseDto> bookAppointment(PatientAppointmentRequestDto appointmentRequestDto, UserDetails userDetails) {
        String email = userDetails.getUsername();
        User user = userRepository.findByUserEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        Patient patient = getPatientByUser(user);

        Doctor doctor = doctorRepository.findById(appointmentRequestDto.getDoctorId()).orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + appointmentRequestDto.getDoctorId()));

        Appointment appointment = new Appointment();
        appointment.setAppointmentReason(appointmentRequestDto.getAppointmentReason());
        appointment.setAppointmentDate(appointmentRequestDto.getAppointmentDate());
        appointment.setAppointmentTime(appointmentRequestDto.getAppointmentTime());
        appointment.setAppointmentStatus(Statuses.PENDING);
        appointment.setDoctor(doctor);
        appointment.setPatient(patient);
        appointment.setAppointmentCreatedAt(LocalDateTime.now());
        appointment.setAppointmentUpdatedAt(LocalDateTime.now());
        appointment.setAppointmentDescription("Appointment booked for patient : " + user.getUserName());
        appointmentRepository.save(appointment);

        AppointmentResponseDto appointmentResponseDto = new AppointmentResponseDto();
        appointmentResponseDto.setAppointmentId(appointment.getAppointmentId());
        appointmentResponseDto.setAppointmentDate(appointment.getAppointmentDate());
        appointmentResponseDto.setAppointmentTime(appointment.getAppointmentTime());
        appointmentResponseDto.setAppointmentStatus(appointment.getAppointmentStatus().name());
        appointmentResponseDto.setAppointmentDescription(appointment.getAppointmentDescription());
        appointmentResponseDto.setAppointmentCreatedAt(appointment.getAppointmentCreatedAt());
        appointmentResponseDto.setAppointmentUpdatedAt(appointment.getAppointmentUpdatedAt());
        appointmentResponseDto.setDoctorId(appointment.getDoctor().getDoctorId());
        appointmentResponseDto.setPatientId(appointment.getPatient().getPatientId());
        appointmentResponseDto.setPatientName(user.getUserName());
        return ResponseEntity.ok(appointmentResponseDto);
    }


    public Page<AppointmentResponseDto> viewOwnAppointments(Pageable pageable) {
        User user = userRepository.findByUserEmail(SecurityContextHolder.getContext().getAuthentication().getName()).orElseThrow(() -> new RuntimeException("User not found"));
        Patient patient = getPatientByUser(user);

        return appointmentRepository.findByPatient(patient, pageable)
                .map(this::formAppointmentResponse);

    }

    private AppointmentResponseDto formAppointmentResponse(Appointment appointment) {
        return AppointmentResponseDto.builder()
                .appointmentId(appointment.getAppointmentId())
                .appointmentDate(appointment.getAppointmentDate())
                .appointmentTime(appointment.getAppointmentTime())
                .appointmentStatus(appointment.getAppointmentStatus().name())
                .appointmentDescription(appointment.getAppointmentDescription())
                .appointmentCreatedAt(appointment.getAppointmentCreatedAt())
                .appointmentUpdatedAt(appointment.getAppointmentUpdatedAt())
                .doctorId(appointment.getDoctor().getDoctorId())
                .doctorName(appointment.getDoctor().getUser().getUserName())
                .patientId(appointment.getPatient().getPatientId())
                .patientName(appointment.getPatient().getUser().getUserName())
                .build();
    }

    @Transactional
    public ResponseEntity<String> cancelOwnAppointment(Integer appointmentId, CancelOwnAppointmentDto dto) {
        User user = userRepository.findByUserEmail(SecurityContextHolder.getContext().getAuthentication().getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Patient patient = getPatientByUser(user);
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + appointmentId));
        if (!appointment.getPatient().getPatientId().equals(patient.getPatientId())) {
            throw new AccessDeniedException("You can only cancel your own appointments");
        }
        if (appointment.getAppointmentStatus() == Statuses.CANCELLED) {
            throw new IllegalStateException("Appointment is already cancelled");
        }
        appointment.setAppointmentStatus(Statuses.CANCELLED);
        appointment.setAppointmentCancelReason(dto.getReason());
        appointment.setAppointmentUpdatedAt(LocalDateTime.now());
        appointmentRepository.save(appointment);
        return new ResponseEntity<>("Appointment with id : " + appointmentId + " cancelled successfully", HttpStatus.OK);
    }


    // consultations :


    public Page<ConsultationResponseDto> viewOwnConsultations(Pageable pageable) {
        User user = userRepository.findByUserEmail(SecurityContextHolder.getContext().getAuthentication().getName()).orElseThrow(() -> new RuntimeException("User not found"));
        Patient patient = getPatientByUser(user);

        return consultationRepository.findByPatient(patient, pageable)
                .map(this::formConsultationResponse);
    }

    private ConsultationResponseDto formConsultationResponse(Consultation consultation) {
        return ConsultationResponseDto.builder()
                .consultationId(consultation.getConsultationId())
                .consultationComplaint(consultation.getConsultationComplaint())
                .consultationDiagnosis(consultation.getConsultationDiagnosis())
                .consultationNotes(consultation.getConsultationNotes())
                .consultationStatus(consultation.getConsultationStatus())
                .consultationCreatedAt(consultation.getConsultationCreatedAt())
                .consultationUpdatedAt(consultation.getConsultationUpdatedAt())
                .appointmentId(consultation.getAppointment().getAppointmentId())
                .doctorId(consultation.getDoctor().getDoctorId())
                .doctorName(consultation.getDoctor().getUser().getUserName())
                .patientId(consultation.getPatient().getPatientId())
                .patientName(consultation.getPatient().getUser().getUserName())
                .build();
    }

    //prescription :
    public Page<PrescriptionResponseDto> viewOwnPrescriptions(Pageable pageable) {
        User user = userRepository.findByUserEmail(SecurityContextHolder.getContext().getAuthentication().getName()).orElseThrow(() -> new RuntimeException("User not found"));
        Patient patient = getPatientByUser(user);

        return prescriptionRepository.findByPatient(patient, pageable)
                .map(this::formPrescriptionResponse);
    }

    private PrescriptionResponseDto formPrescriptionResponse(Prescription prescription) {
        return PrescriptionResponseDto.builder()
                .prescriptionNumber(prescription.getPrescriptionNumber())
                .prescriptionId(prescription.getPrescriptionId())
                .prescriptionNotes(prescription.getPrescriptionNotes())
                .prescriptionCreatedAt(prescription.getPrescriptionCreatedAt())
                .prescriptionUpdatedAt(prescription.getPrescriptionUpdatedAt())
                .prescriptionStatus(prescription.getPrescriptionStatus())
                .consultationId(prescription.getConsultation().getConsultationId())
                .patientName(prescription.getPatient().getUser().getUserName())
                .patientId(prescription.getPatient().getPatientId())
                .build();
    }


    // lab report :

    public Page<LabReportResponseDto> viewOwnLabReports(Pageable pageable) {
        User user = userRepository.findByUserEmail(SecurityContextHolder.getContext().getAuthentication().getName()).orElseThrow(() -> new RuntimeException("User not found"));
        Patient patient = getPatientByUser(user);

        return labReportRepository.findByPatient(patient, pageable)
                .map(this::formLabReportResponse);
    }

    private LabReportResponseDto formLabReportResponse(LabReport labReport) {
        return LabReportResponseDto.builder()
                .labReportId(labReport.getLabReportId())
                .reportFilePath(labReport.getReportFilePath())
                .doctorNotes(labReport.getDoctorNotes())
                .isViewedByDoctor(labReport.isViewedByDoctor())
                .isViewedByPatient(labReport.isViewedByPatient())
                .uploadedAt(labReport.getUploadedAt())
                .labOrderId(labReport.getLabOrder().getLabOrderId())
                .patientId(labReport.getPatient().getPatientId())
                .patientName(labReport.getPatient().getUser().getUserName())
                .build();
    }

    // billings :

    @Transactional(readOnly = true)
    public Page<BillResponseDto> viewOwnBills(Pageable pageable) {
        User user = userRepository.findByUserEmail(SecurityContextHolder.getContext().getAuthentication().getName()).orElseThrow(() -> new RuntimeException("User not found"));
        Patient patient = getPatientByUser(user);

        return billRepository.findByPatient(patient, pageable)
                .map(BillMapper::toResponse);
    }


    public PatientDetailResponse viewPatientDetails() {
        User user = userRepository.findByUserEmail(SecurityContextHolder.getContext().getAuthentication().getName()).orElseThrow(() -> new RuntimeException("User not found"));
        Patient patient = getPatientByUser(user);

        return PatientDetailResponse.builder()
                .patientId(patient.getPatientId())
                .patientName(user.getUserName())
                .patientEmail(user.getUserEmail())
                .patientPhone(user.getUserPhone())
                .patientAddress(patient.getPatientAddress())
                .patientAge(String.valueOf(calculateAge(user.getDateOfBirth())))
                .patientGender(user.getUserGender())
                .patientBloodGroup(patient.getBloodGroup() != null ? patient.getBloodGroup().name() : null)
                .patientEmergencyContact(patient.getEmergencyContact())
                .build();
    }

    private int calculateAge(LocalDate dateOfBirth) {
        if (dateOfBirth == null) {
            return 0;
        }
        return Period.between(dateOfBirth, LocalDate.now()).getYears();
    }


    @Transactional
    public ResponseEntity<PatientDetailResponse> updatePatientDetailsById(Integer patientId, UpdatePatientDto updatePatientDto) {
        // Verify ownership
        User currentUser = userRepository.findByUserEmail(
                SecurityContextHolder.getContext().getAuthentication().getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Patient currentPatient = getPatientByUser(currentUser);
        if (!currentPatient.getPatientId().equals(patientId)) {
            throw new org.springframework.security.access.AccessDeniedException("You can only update your own profile");
        }

        Patient existingPatient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + patientId));

        if (updatePatientDto.getPatientAddress() != null) {
            existingPatient.setPatientAddress(updatePatientDto.getPatientAddress());
        }
        if (updatePatientDto.getEmergencyContact() != null) {
            existingPatient.setEmergencyContact(updatePatientDto.getEmergencyContact());
        }
        if (updatePatientDto.getBloodGroup() != null) {
            existingPatient.setBloodGroup(updatePatientDto.getBloodGroup());
        }

        Patient updatedPatient = patientRepository.save(existingPatient);
        User user = updatedPatient.getUser();

        PatientDetailResponse response = PatientDetailResponse.builder()
                .patientId(updatedPatient.getPatientId())
                .patientName(user.getUserName())
                .patientEmail(user.getUserEmail())
                .patientPhone(user.getUserPhone())
                .patientAddress(updatedPatient.getPatientAddress())
                .patientAge(String.valueOf(calculateAge(user.getDateOfBirth())))
                .patientGender(user.getUserGender())
                .patientBloodGroup(updatedPatient.getBloodGroup() != null ? updatedPatient.getBloodGroup().name() : null)
                .patientEmergencyContact(updatedPatient.getEmergencyContact())
                .build();

        return ResponseEntity.ok(response);
    }

    private Patient getPatientByUser(User user) {
        return patientRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found for user: " + user.getUserEmail()));
    }
}
