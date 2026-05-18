package com.example.hms.controller;

import com.example.hms.dto.admin_dto.StaffResponseDto;
import com.example.hms.dto.auth_dto.AuthResponseDto;
import com.example.hms.dto.auth_dto.RegisterRequestDto;
import com.example.hms.dto.doctor_dto.DoctorRequestDto;
import com.example.hms.dto.doctor_dto.DoctorResponseDto;
import com.example.hms.service.AdminService;
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
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Validated
@PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
public class AdminController {

    private final AdminService adminService;

    // list all staff (excludes patients), with optional role filter and search
    @GetMapping("/all-staff")
    public Page<StaffResponseDto> getAllStaff(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return adminService.getAllStaff(role, search, pageable);
    }

    // get a single staff member's details
    @GetMapping("/staff/{userId}")
    public StaffResponseDto getStaffById(@PathVariable @Positive Integer userId) {
        return adminService.getStaffById(userId);
    }

    // register a new staff member (non-doctor roles)
    @PostMapping("/register-staff")
    public ResponseEntity<AuthResponseDto> registerStaff(@RequestBody @Valid RegisterRequestDto request) {
        return ResponseEntity.ok(adminService.registerStaff(request));
    }

    // register a new doctor (includes specialization, room, hours)
    @PostMapping("/register-doctor")
    public ResponseEntity<DoctorResponseDto> registerDoctor(@RequestBody @Valid DoctorRequestDto request) {
        return adminService.registerDoctor(request);
    }

    // remove a staff member
    @DeleteMapping("/remove-staff/{userId}")
    public ResponseEntity<String> removeStaff(@PathVariable @Positive Integer userId) {
        adminService.removeStaff(userId);
        return ResponseEntity.ok("Staff member removed successfully.");
    }
}
