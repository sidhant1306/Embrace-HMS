package com.example.hms.controller;

import com.example.hms.dto.prescription_dto.PrescriptionRequestDto;
import com.example.hms.dto.prescription_dto.PrescriptionResponseDto;
import com.example.hms.service.PrescriptionService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/prescriptions")
public class PrescriptionController {
    private final PrescriptionService prescriptionService;

    public PrescriptionController(PrescriptionService prescriptionService) {
        this.prescriptionService = prescriptionService;
    }

    @PostMapping("/create")
    public ResponseEntity<PrescriptionResponseDto> createPrescription(@RequestBody @Valid PrescriptionRequestDto dto) {
        return prescriptionService.createPrescription(dto);
    }

    @PutMapping("/send-to-receptionist/{prescriptionId}")
    public ResponseEntity<PrescriptionResponseDto> sendToReceptionist(@PathVariable Integer prescriptionId) {
        return prescriptionService.sendToReceptionist(prescriptionId);
    }

    @PutMapping("/mark-as-printed/{prescriptionId}")
    public ResponseEntity<PrescriptionResponseDto> markAsPrinted(@PathVariable Integer prescriptionId) {
        return prescriptionService.markAsPrinted(prescriptionId);
    }

    @PutMapping("/send-to-lab-technician/{prescriptionId}")
    public ResponseEntity<PrescriptionResponseDto> sendToLabTechnician(@PathVariable Integer prescriptionId) {
        return prescriptionService.sendToLabTechnician(prescriptionId);
    }

    @GetMapping("/{prescriptionId}")
    public ResponseEntity<PrescriptionResponseDto> getPrescriptionById(@PathVariable Integer prescriptionId) {
        return prescriptionService.getPrescriptionById(prescriptionId);
    }

    @GetMapping("/patient/{patientId}")
    public Page<PrescriptionResponseDto> getPrescriptionsByPatient(@PathVariable Integer patientId, Pageable pageable) {
        return prescriptionService.getPrescriptionsByPatient(patientId, pageable);
    }

    @GetMapping("/my-prescriptions")
    public Page<PrescriptionResponseDto> getDoctorPrescriptions(Pageable pageable) {
        return prescriptionService.getDoctorPrescriptions(pageable);
    }

    @GetMapping("/my")
    public Page<PrescriptionResponseDto> getMyPrescriptions(Pageable pageable) {
        return prescriptionService.getDoctorPrescriptions(pageable);
    }

    @GetMapping("/incoming")
    public Page<PrescriptionResponseDto> getIncomingPrescriptions(Pageable pageable) {
        return prescriptionService.getIncomingPrescriptions(pageable);
    }

    @GetMapping(value = "/{prescriptionId}/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> downloadPrescriptionPdf(@PathVariable Integer prescriptionId) {
        return prescriptionService.downloadPrescriptionPdf(prescriptionId);
    }
}
