package com.example.hms.controller;

import com.example.hms.dto.billing_dto.ExtraChargeRequestDto;
import com.example.hms.dto.billing_dto.GenerateBillRequestDto;
import com.example.hms.dto.billing_dto.PaymentRequestDto;
import com.example.hms.dto.billing_dto.BillResponseDto;
import com.example.hms.service.BillService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bills")
@RequiredArgsConstructor
@Validated
public class BillController {

    private final BillService billService;

    @PostMapping("/generate")
    @PreAuthorize("hasAnyRole('RECEPTIONIST','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<BillResponseDto> generateBill(@RequestBody @Valid GenerateBillRequestDto request) {
        return ResponseEntity.ok(billService.generateBill(request));
    }

    @PostMapping("/{billId}/extra-charges")
    @PreAuthorize("hasAnyRole('RECEPTIONIST','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<BillResponseDto> addExtraCharge(@PathVariable @Positive Integer billId,
                                                        @RequestBody @Valid ExtraChargeRequestDto request) {
        return ResponseEntity.ok(billService.addExtraCharge(billId, request));
    }

    @PostMapping("/{billId}/payments")
    @PreAuthorize("hasAnyRole('RECEPTIONIST','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<BillResponseDto> makePayment(@PathVariable @Positive Integer billId,
                                                       @RequestBody @Valid PaymentRequestDto request) {
        return ResponseEntity.ok(billService.makePayment(billId, request));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('RECEPTIONIST','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<Page<BillResponseDto>> getPendingBills(Pageable pageable) {
        return ResponseEntity.ok(billService.getPendingBills(pageable));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST','PATIENT','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<Page<BillResponseDto>> getBillsByPatient(@PathVariable @Positive Integer patientId,
                                                                   Pageable pageable,
                                                                   Authentication authentication) {
        return ResponseEntity.ok(billService.getBillsByPatient(patientId, pageable, authentication));
    }

// bill pdf download:

    @GetMapping("/{billId}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST','PATIENT','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<BillResponseDto> getBillById(@PathVariable @Positive Integer billId,
                                                      Authentication authentication) {
        return ResponseEntity.ok(billService.getBillById(billId, authentication));
    }

    @GetMapping(value = "/{billId}/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    @PreAuthorize("hasAnyRole('RECEPTIONIST','PATIENT','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<byte[]> downloadBillPdf(@PathVariable @Positive Integer billId,
                                                  Authentication authentication) {
        return billService.downloadBillPdf(billId, authentication);
    }
}
