package com.example.hms.controller;

import com.example.hms.dto.bed_dto.BedRequestDto;
import com.example.hms.dto.bed_dto.BedResponseDto;
import com.example.hms.dto.bed_dto.BedStatusUpdateDto;
import com.example.hms.enums.BedStatus;
import com.example.hms.service.BedAdmissionService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/beds")
@RequiredArgsConstructor
@Validated
public class BedController {

    private final BedAdmissionService bedAdmissionService;

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<BedResponseDto> addBed(@RequestBody @Valid BedRequestDto request) {
        return ResponseEntity.ok(bedAdmissionService.addBed(request));
    }

    @PutMapping("/{bedId}/status")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','RECEPTIONIST')")
    public ResponseEntity<BedResponseDto> updateBedStatus(@PathVariable @Positive Integer bedId,
                                                            @RequestBody @Valid BedStatusUpdateDto request) {
        return ResponseEntity.ok(bedAdmissionService.updateBedStatus(bedId, request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('RECEPTIONIST','SUPER_ADMIN','NURSE','ADMIN')")
    public ResponseEntity<Page<BedResponseDto>> getAllBeds(
            @RequestParam(required = false) BedStatus status,
            @RequestParam(required = false) String ward,
            Pageable pageable) {
        return ResponseEntity.ok(bedAdmissionService.getAllBeds(status, ward, pageable));
    }
}
