package com.example.hms.controller;

import com.example.hms.dto.doctor_dto.DoctorRequestDto;
import com.example.hms.dto.doctor_dto.DoctorResponseDto;
import com.example.hms.service.DoctorService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
@Validated
public class DoctorController {

    private final DoctorService doctorService;

    @GetMapping
    public ResponseEntity<java.util.List<DoctorResponseDto>> getAllDoctors() {
        return doctorService.getAllDoctors();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<DoctorResponseDto> createDoctor(@RequestBody @Valid DoctorRequestDto request) {
        return doctorService.createDoctorProfile(request);
    }

    @GetMapping("/{doctorId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<DoctorResponseDto> getDoctorById(@PathVariable @Positive Integer doctorId) {
        return doctorService.getDoctorById(doctorId);
    }

    @GetMapping("/view-own-profile")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<DoctorResponseDto> viewOwnProfile() {
        return doctorService.viewOwnProfile();
    }
}
