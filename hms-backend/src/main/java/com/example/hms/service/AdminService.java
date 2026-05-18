package com.example.hms.service;

import com.example.hms.dao.DoctorRepository;
import com.example.hms.dao.UserRepository;
import com.example.hms.dto.admin_dto.StaffResponseDto;
import com.example.hms.dto.auth_dto.AuthResponseDto;
import com.example.hms.dto.auth_dto.RegisterRequestDto;
import com.example.hms.dto.doctor_dto.DoctorRequestDto;
import com.example.hms.dto.doctor_dto.DoctorResponseDto;
import com.example.hms.enums.Roles;
import com.example.hms.exception.ResourceNotFoundException;
import com.example.hms.model.profileModel.Doctor;
import com.example.hms.model.profileModel.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final AuthService authService;
    private final DoctorService doctorService;

    public AdminService(UserRepository userRepository, DoctorRepository doctorRepository,
                        AuthService authService, DoctorService doctorService) {
        this.userRepository = userRepository;
        this.doctorRepository = doctorRepository;
        this.authService = authService;
        this.doctorService = doctorService;
    }

    // ── list all staff (everyone except PATIENT) ──
    @Transactional(readOnly = true)
    public Page<StaffResponseDto> getAllStaff(String role, String search, Pageable pageable) {
        Page<User> users;

        if (role != null && !role.isBlank() && !role.equalsIgnoreCase("ALL")) {
            Roles filterRole = Roles.valueOf(role.toUpperCase());
            if (search != null && !search.isBlank()) {
                users = userRepository.findByUserRoleAndUserNameContainingIgnoreCase(filterRole, search, pageable);
            } else {
                users = userRepository.findByUserRole(filterRole, pageable);
            }
        } else {
            if (search != null && !search.isBlank()) {
                users = userRepository.findByUserRoleNotAndUserNameContainingIgnoreCase(Roles.PATIENT, search, pageable);
            } else {
                users = userRepository.findByUserRoleNot(Roles.PATIENT, pageable);
            }
        }

        return users.map(this::toStaffDto);
    }

    // ── get single staff member ──
    @Transactional(readOnly = true)
    public StaffResponseDto getStaffById(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff member not found with ID: " + userId));
        if (user.getUserRole() == Roles.PATIENT) {
            throw new IllegalArgumentException("This user is a patient, not a staff member.");
        }
        return toStaffDto(user);
    }

    // ── register new staff (non-doctor) ──
    @Transactional
    public AuthResponseDto registerStaff(RegisterRequestDto request) {
        if (request.getUserRole() == null || request.getUserRole() == Roles.PATIENT) {
            throw new IllegalArgumentException("Cannot register a patient through admin. Use public registration.");
        }
        if (request.getUserRole() == Roles.DOCTOR) {
            throw new IllegalArgumentException("Use the 'Register Doctor' option for doctor accounts.");
        }
        return authService.registerStaff(request);
    }

    // ── register new doctor ──
    @Transactional
    public ResponseEntity<DoctorResponseDto> registerDoctor(DoctorRequestDto request) {
        return doctorService.createDoctorProfile(request);
    }

    // ── remove a staff member ──
    @Transactional
    public void removeStaff(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff member not found with ID: " + userId));

        // prevent removing patients
        if (user.getUserRole() == Roles.PATIENT) {
            throw new IllegalArgumentException("Cannot remove a patient through admin staff management.");
        }

        // prevent removing yourself
        String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        if (user.getUserEmail().equalsIgnoreCase(currentEmail)) {
            throw new IllegalArgumentException("You cannot remove your own account.");
        }

        // if user is a doctor, delete the doctor profile first
        if (user.getUserRole() == Roles.DOCTOR) {
            doctorRepository.findByUser(user).ifPresent(doctor -> {
                // clear the linked lists to avoid FK constraint violations
                doctor.setAppointmentList(null);
                doctor.setConsultationList(null);
                doctor.setMedicineIssued(null);
                doctorRepository.delete(doctor);
            });
        }

        userRepository.delete(user);
    }

    // ── helper: map User entity to StaffResponseDto ──
    private StaffResponseDto toStaffDto(User user) {
        StaffResponseDto.StaffResponseDtoBuilder builder = StaffResponseDto.builder()
                .userId(user.getUserId())
                .userName(user.getUserName())
                .userEmail(user.getUserEmail())
                .userPhone(user.getUserPhone())
                .userGender(user.getUserGender())
                .userRole(user.getUserRole())
                .dateOfBirth(user.getDateOfBirth());

        // attach doctor details if the user is a doctor
        if (user.getUserRole() == Roles.DOCTOR) {
            doctorRepository.findByUser(user).ifPresent(doctor -> {
                builder.doctorId(doctor.getDoctorId())
                        .doctorSpecialization(doctor.getDoctorSpecialization())
                        .doctorRoom(doctor.getDoctorRoom())
                        .doctorWorkingHours(doctor.getDoctorWorkingHours());
            });
        }

        return builder.build();
    }
}
