package com.example.hms.service;

import com.example.hms.dao.ConsultationRepository;
import com.example.hms.dao.DoctorRepository;
import com.example.hms.dao.PatientRepository;
import com.example.hms.dao.PrescriptionItemRepository;
import com.example.hms.dao.PrescriptionRepository;
import com.example.hms.dao.UserRepository;
import com.example.hms.dto.prescription_dto.PrescriptionRequestDto;
import com.example.hms.dto.prescription_dto.PrescriptionResponseDto;
import com.example.hms.enums.PrescriptionStatuses;
import com.example.hms.exception.ResourceNotFoundException;
import com.example.hms.mapper.PrescriptionMapper;
import com.example.hms.model.dataModel.Consultation;
import com.example.hms.model.prescriptionModel.Prescription;
import com.example.hms.model.prescriptionModel.PrescriptionItem;
import com.example.hms.model.profileModel.Doctor;
import com.example.hms.model.profileModel.Patient;
import com.example.hms.model.profileModel.User;
import com.example.hms.util.PrescriptionPdfGenerator;
import com.lowagie.text.DocumentException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PrescriptionService {
    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionItemRepository prescriptionItemRepository;
    private final ConsultationRepository consultationRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;

    public PrescriptionService(PrescriptionRepository prescriptionRepository, PrescriptionItemRepository prescriptionItemRepository, ConsultationRepository consultationRepository, PatientRepository patientRepository, DoctorRepository doctorRepository, UserRepository userRepository) {
        this.prescriptionRepository = prescriptionRepository;
        this.prescriptionItemRepository = prescriptionItemRepository;
        this.consultationRepository = consultationRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ResponseEntity<PrescriptionResponseDto> createPrescription(PrescriptionRequestDto dto) {
        Consultation consultation = consultationRepository.findById(dto.getConsultationId())
                .orElseThrow(() -> new ResourceNotFoundException("Consultation not found with ID: " + dto.getConsultationId()));
        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + dto.getPatientId()));

        Prescription prescription = new Prescription();
        prescription.setPrescriptionNumber(dto.getPrescriptionNumber());
        prescription.setPrescriptionStatus(PrescriptionStatuses.WRITTEN);
        prescription.setPrescriptionNotes(dto.getPrescriptionNotes());
        prescription.setConsultation(consultation);
        prescription.setPatient(patient);
        prescription.setPrescriptionCreatedAt(LocalDateTime.now());
        prescription.setPrescriptionUpdatedAt(LocalDateTime.now());
        Prescription savedPrescription = prescriptionRepository.save(prescription);

        List<PrescriptionItem> items = dto.getPrescriptionItems().stream().map(itemDto -> {
            PrescriptionItem item = new PrescriptionItem();
            item.setMedicineName(itemDto.getMedicineName());
            item.setMedicineDosage(itemDto.getMedicineDosage());
            item.setMedicineDurationDays(itemDto.getMedicineDurationDays());
            item.setMedicineFrequency(itemDto.getMedicineFrequency());
            item.setMedicineInstructions(itemDto.getMedicineInstructions());
            item.setPrescription(savedPrescription);
            return item;
        }).collect(Collectors.toList());
        prescriptionItemRepository.saveAll(items);
        savedPrescription.setPrescriptionItem(items);
        return ResponseEntity.ok(PrescriptionMapper.toResponse(savedPrescription));
    }

    @Transactional
    public ResponseEntity<PrescriptionResponseDto> sendToReceptionist(Integer prescriptionId) {
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found with ID: " + prescriptionId));
        prescription.setPrescriptionStatus(PrescriptionStatuses.SENT_TO_RECEPTIONIST);
        prescription.setPrescriptionUpdatedAt(LocalDateTime.now());
        return ResponseEntity.ok(PrescriptionMapper.toResponse(prescriptionRepository.save(prescription)));
    }

    @Transactional
    public ResponseEntity<PrescriptionResponseDto> markAsPrinted(Integer prescriptionId) {
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found with ID: " + prescriptionId));
        prescription.setPrescriptionStatus(PrescriptionStatuses.PRINTED);
        prescription.setPrescriptionUpdatedAt(LocalDateTime.now());
        return ResponseEntity.ok(PrescriptionMapper.toResponse(prescriptionRepository.save(prescription)));
    }

    @Transactional
    public ResponseEntity<PrescriptionResponseDto> sendToLabTechnician(Integer prescriptionId) {
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found with ID: " + prescriptionId));
        prescription.setPrescriptionStatus(PrescriptionStatuses.SENT_TO_LAB_TECHNICIAN);
        prescription.setPrescriptionUpdatedAt(LocalDateTime.now());
        return ResponseEntity.ok(PrescriptionMapper.toResponse(prescriptionRepository.save(prescription)));
    }

    @Transactional(readOnly = true)
    public ResponseEntity<PrescriptionResponseDto> getPrescriptionById(Integer prescriptionId) {
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found with ID: " + prescriptionId));
        return ResponseEntity.ok(PrescriptionMapper.toResponse(prescription));
    }

    @Transactional(readOnly = true)
    public Page<PrescriptionResponseDto> getPrescriptionsByPatient(Integer patientId, Pageable pageable) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + patientId));
        return prescriptionRepository.findByPatient(patient, pageable).map(PrescriptionMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<PrescriptionResponseDto> getDoctorPrescriptions(Pageable pageable) {
        User user = userRepository.findByUserEmail(SecurityContextHolder.getContext().getAuthentication().getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Doctor doctor = doctorRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));
        return prescriptionRepository.findByConsultation_Doctor(doctor, pageable).map(PrescriptionMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<PrescriptionResponseDto> getIncomingPrescriptions(Pageable pageable) {
        return prescriptionRepository.findByPrescriptionStatus(PrescriptionStatuses.SENT_TO_RECEPTIONIST, pageable)
                .map(PrescriptionMapper::toResponse);
    }
    @Transactional(readOnly = true)
    public ResponseEntity<byte[]> downloadPrescriptionPdf(Integer prescriptionId) {
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found with ID: " + prescriptionId));
        try {
            byte[] pdfBytes = PrescriptionPdfGenerator.generate(prescription);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "prescription-" + prescriptionId + ".pdf");
            headers.setContentLength(pdfBytes.length);
            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (IOException | DocumentException e) {
            throw new RuntimeException("Failed to generate prescription PDF", e);
        }
    }
}
