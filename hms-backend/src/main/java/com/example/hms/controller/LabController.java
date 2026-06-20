package com.example.hms.controller;

import com.example.hms.dto.lab_dto.LabOrderRequestDto;
import com.example.hms.dto.lab_dto.LabOrderResponseDto;
import com.example.hms.dto.lab_dto.LabReportRequestDto;
import com.example.hms.dto.lab_dto.LabReportResponseDto;
import com.example.hms.enums.LabOrderStatuses;
import com.example.hms.service.LabService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/lab")
@Validated
public class LabController {
    private final LabService labService;

    public LabController(LabService labService) {
        this.labService = labService;
    }

    @PostMapping("/order-test")
    public ResponseEntity<LabOrderResponseDto> orderLabTest(@RequestBody @Valid LabOrderRequestDto dto) {
        return labService.orderLabTest(dto);
    }

    @PutMapping("/update-status/{labOrderId}")
    public ResponseEntity<LabOrderResponseDto> updateTestStatus(@PathVariable @NotNull Integer labOrderId,
            @RequestParam @NotNull LabOrderStatuses status) {
        return labService.updateTestStatus(labOrderId, status);
    }

    @PostMapping("/upload-report/{labOrderId}")
    public ResponseEntity<LabReportResponseDto> uploadLabReport(@PathVariable @NotNull Integer labOrderId,
            @RequestBody @Valid LabReportRequestDto dto) {
        return labService.uploadLabReport(labOrderId, dto);
    }

    @GetMapping("/pending-orders")
    public Page<LabOrderResponseDto> getPendingOrders(Pageable pageable) {
        return labService.getPendingOrders(pageable);
    }

    @GetMapping("/all-orders")
    public Page<LabOrderResponseDto> getAllOrders(Pageable pageable) {
        return labService.getAllOrders(pageable);
    }

    @GetMapping("/all-reports")
    public Page<LabReportResponseDto> getAllReports(Pageable pageable) {
        return labService.getAllReports(pageable);
    }

    @GetMapping("/order/{labOrderId}")
    public ResponseEntity<LabOrderResponseDto> getLabOrderById(@PathVariable Integer labOrderId) {
        return labService.getLabOrderById(labOrderId);
    }

    @GetMapping("/reports/patient/{patientId}")
    public Page<LabReportResponseDto> getLabReportsByPatient(@PathVariable Integer patientId, Pageable pageable) {
        return labService.getLabReportsByPatient(patientId, pageable);
    }

    @PutMapping("/add-doctor-notes/{labReportId}")
    public ResponseEntity<LabReportResponseDto> addDoctorNotes(@PathVariable @NotNull Integer labReportId,
            @RequestParam @NotBlank String notes) {
        return labService.addDoctorNotes(labReportId, notes);
    }
}
