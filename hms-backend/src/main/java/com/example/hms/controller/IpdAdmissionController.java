package com.example.hms.controller;

import com.example.hms.dto.bed_dto.AdmitPatientRequestDto;
import com.example.hms.dto.bed_dto.DischargePatientRequestDto;
import com.example.hms.dto.bed_dto.IpdAdmissionResponseDto;
import com.example.hms.service.BedAdmissionService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admissions")
@RequiredArgsConstructor
@Validated
public class IpdAdmissionController {

    private final BedAdmissionService bedAdmissionService;

    @PostMapping("/admit")
    @PreAuthorize("hasRole('RECEPTIONIST')")
    public ResponseEntity<IpdAdmissionResponseDto> admitPatient(@RequestBody @Valid AdmitPatientRequestDto request) {
        return ResponseEntity.ok(bedAdmissionService.admitPatient(request));
    }

    @PutMapping("/{admissionId}/discharge")
    @PreAuthorize("hasRole('RECEPTIONIST')")
    public ResponseEntity<IpdAdmissionResponseDto> dischargePatient(@PathVariable @Positive Integer admissionId,
                                                                    @RequestBody(required = false) @Valid DischargePatientRequestDto request) {
        if (request == null) {
            request = new DischargePatientRequestDto();
        }
        return ResponseEntity.ok(bedAdmissionService.dischargePatient(admissionId, request));
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('RECEPTIONIST','SUPER_ADMIN')")
    public ResponseEntity<Page<IpdAdmissionResponseDto>> getActiveAdmissions(Pageable pageable) {
        return ResponseEntity.ok(bedAdmissionService.getActiveAdmissions(pageable));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST','SUPER_ADMIN','PATIENT')")
    public ResponseEntity<Page<IpdAdmissionResponseDto>> getAdmissionsByPatient(@PathVariable @Positive Integer patientId,
                                                                              Pageable pageable,
                                                                              Authentication authentication) {
        return ResponseEntity.ok(bedAdmissionService.getAdmissionsByPatient(patientId, pageable, authentication));
    }
}
