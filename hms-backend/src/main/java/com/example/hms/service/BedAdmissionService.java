package com.example.hms.service;

import com.example.hms.dao.BedRepository;
import com.example.hms.dao.IpdAdmissionRepository;
import com.example.hms.dao.PatientRepository;
import com.example.hms.exception.AlreadyExistsException;
import com.example.hms.dto.bed_dto.*;
import com.example.hms.enums.AdmissionStatus;
import com.example.hms.enums.BedStatus;
import com.example.hms.enums.Roles;
import com.example.hms.exception.ResourceNotFoundException;
import com.example.hms.model.bedModel.Bed;
import com.example.hms.model.bedModel.IpdAdmission;
import com.example.hms.model.profileModel.Patient;
import com.example.hms.model.profileModel.User;
import com.example.hms.dao.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class BedAdmissionService {

    private final BedRepository bedRepository;
    private final IpdAdmissionRepository ipdAdmissionRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    public BedAdmissionService(BedRepository bedRepository,
            IpdAdmissionRepository ipdAdmissionRepository,
            PatientRepository patientRepository,
            UserRepository userRepository) {
        this.bedRepository = bedRepository;
        this.ipdAdmissionRepository = ipdAdmissionRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public BedResponseDto addBed(BedRequestDto dto) {
        Bed bed = new Bed();
        bed.setBedNumber(dto.getBedNumber());
        bed.setWardName(dto.getWardName());
        bed.setDailyRatePaise(dto.getDailyRatePaise());
        bed.setStatus(BedStatus.AVAILABLE);
        Bed saved = bedRepository.save(bed);
        return toBedDto(saved);
    }

    @Transactional
    public BedResponseDto updateBedStatus(Integer bedId, BedStatusUpdateDto dto) {
        Bed bed = bedRepository.findById(bedId)
                .orElseThrow(() -> new ResourceNotFoundException("Bed not found: " + bedId));
        if (dto.getStatus() == BedStatus.OCCUPIED) {
            throw new IllegalArgumentException("Use the admission flow to occupy a bed");
        }
        if (dto.getStatus() == BedStatus.AVAILABLE
                && ipdAdmissionRepository.existsByBed_BedIdAndStatus(bedId, AdmissionStatus.ACTIVE)) {
            throw new IllegalStateException("Bed has an active admission; discharge the patient first");
        }
        bed.setStatus(dto.getStatus());
        return toBedDto(bedRepository.save(bed));
    }

    @Transactional(readOnly = true)
    public Page<BedResponseDto> getAllBeds(BedStatus status, String ward, Pageable pageable) {
        String wardFilter = (ward != null && !ward.isBlank()) ? ward : null;
        return bedRepository.findFiltered(status, wardFilter, pageable).map(BedAdmissionService::toBedDto);
    }

    @Transactional
    public IpdAdmissionResponseDto admitPatient(AdmitPatientRequestDto dto) {
        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found: " + dto.getPatientId()));
        Bed bed = bedRepository.findById(dto.getBedId())
                .orElseThrow(() -> new ResourceNotFoundException("Bed not found: " + dto.getBedId()));
        if (bed.getStatus() != BedStatus.AVAILABLE) {
            throw new IllegalStateException("Bed is not available");
        }
        if (ipdAdmissionRepository.existsByBed_BedIdAndStatus(bed.getBedId(), AdmissionStatus.ACTIVE)) {
            throw new AlreadyExistsException("Bed already has an active admission");
        }
        if (ipdAdmissionRepository.existsByPatient_PatientIdAndStatus(patient.getPatientId(), AdmissionStatus.ACTIVE)) {
            throw new AlreadyExistsException("Patient already has an active admission");
        }

        IpdAdmission admission = new IpdAdmission();
        admission.setPatient(patient);
        admission.setBed(bed);
        admission.setStatus(AdmissionStatus.ACTIVE);
        admission.setAdmittedAt(LocalDateTime.now());
        IpdAdmission saved = ipdAdmissionRepository.save(admission);

        bed.setStatus(BedStatus.OCCUPIED);
        bedRepository.save(bed);

        return toAdmissionDto(saved);
    }

    @Transactional
    public IpdAdmissionResponseDto dischargePatient(Integer admissionId, DischargePatientRequestDto dto) {
        IpdAdmission admission = ipdAdmissionRepository.findById(admissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Admission not found: " + admissionId));
        if (admission.getStatus() != AdmissionStatus.ACTIVE) {
            throw new IllegalStateException("Admission is not active");
        }
        Bed bed = admission.getBed();
        String summary = dto.getDischargeSummary();
        if (summary == null || summary.isBlank()) {
            summary = buildDefaultDischargeSummary(admission);
        }
        admission.setDischargeSummary(summary);
        admission.setDischargedAt(LocalDateTime.now());
        admission.setStatus(AdmissionStatus.DISCHARGED);
        ipdAdmissionRepository.save(admission);

        bed.setStatus(BedStatus.AVAILABLE);
        bedRepository.save(bed);

        return toAdmissionDto(admission);
    }

    @Transactional(readOnly = true)
    public Page<IpdAdmissionResponseDto> getActiveAdmissions(Pageable pageable) {
        return ipdAdmissionRepository.findByStatus(AdmissionStatus.ACTIVE, pageable)
                .map(BedAdmissionService::toAdmissionDto);
    }

    @Transactional(readOnly = true)
    public Page<IpdAdmissionResponseDto> getAdmissionsByPatient(Integer patientId, Pageable pageable,
            Authentication authentication) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found: " + patientId));
        User user = userRepository.findByUserEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (user.getUserRole() == Roles.PATIENT) {
            Patient userPatient = patientRepository.findByUser(user)
                    .orElse(null);
            if (userPatient == null || !userPatient.getPatientId().equals(patientId)) {
                throw new AccessDeniedException("Patients may only view their own admissions");
            }
        }
        return ipdAdmissionRepository.findByPatient(patient, pageable).map(BedAdmissionService::toAdmissionDto);
    }

    private String buildDefaultDischargeSummary(IpdAdmission admission) {
        String when = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        return "Discharge summary generated on " + when + ". Patient "
                + (admission.getPatient().getUser() != null ? admission.getPatient().getUser().getUserName() : "Unknown")
                + " (ID " + admission.getPatient().getPatientId() + ") discharged from ward "
                + admission.getBed().getWardName() + ", bed " + admission.getBed().getBedNumber() + ".";
    }

    private static BedResponseDto toBedDto(Bed bed) {
        return BedResponseDto.builder()
                .bedId(bed.getBedId())
                .bedNumber(bed.getBedNumber())
                .wardName(bed.getWardName())
                .status(bed.getStatus())
                .dailyRatePaise(bed.getDailyRatePaise())
                .build();
    }

    private static IpdAdmissionResponseDto toAdmissionDto(IpdAdmission a) {
        return IpdAdmissionResponseDto.builder()
                .admissionId(a.getAdmissionId())
                .patientId(a.getPatient().getPatientId())
                .patientName(a.getPatient().getUser() != null ? a.getPatient().getUser().getUserName() : null)
                .bedId(a.getBed().getBedId())
                .bedNumber(a.getBed().getBedNumber())
                .wardName(a.getBed().getWardName())
                .status(a.getStatus())
                .admittedAt(a.getAdmittedAt())
                .dischargedAt(a.getDischargedAt())
                .dischargeSummary(a.getDischargeSummary())
                .build();
    }
}
