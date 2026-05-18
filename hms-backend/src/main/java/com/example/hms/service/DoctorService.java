package com.example.hms.service;

import com.example.hms.dao.DoctorRepository;
import com.example.hms.dao.UserRepository;
import com.example.hms.dto.doctor_dto.DoctorRequestDto;
import com.example.hms.dto.doctor_dto.DoctorResponseDto;
import com.example.hms.enums.Roles;
import com.example.hms.exception.AlreadyExistsException;
import com.example.hms.exception.ResourceNotFoundException;
import com.example.hms.mapper.DoctorMapper;
import com.example.hms.model.profileModel.Doctor;
import com.example.hms.model.profileModel.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DoctorService(DoctorRepository doctorRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.doctorRepository = doctorRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public ResponseEntity<DoctorResponseDto> createDoctorProfile(DoctorRequestDto dto) {
        if (userRepository.existsByUserEmail(dto.getEmail())) {
            throw new AlreadyExistsException("User with email " + dto.getEmail() + " already exists");
        }

        Doctor doctor = new Doctor();
        doctor.setDoctorSpecialization(dto.getSpecialization());
        doctor.setDoctorRoom(dto.getRoom());
        doctor.setDoctorWorkingHours(dto.getWorkingHours());
        doctor = doctorRepository.save(doctor);

        User user = new User();
        user.setUserName(dto.getName());
        user.setUserEmail(dto.getEmail());
        user.setUserPassword(passwordEncoder.encode(dto.getPassword()));
        user.setUserPhone(dto.getPhone());
        user.setUserGender(dto.getGender());
        user.setUserImage(dto.getImage());
        user.setUserRole(Roles.DOCTOR);
        User savedUser = userRepository.save(user);

        doctor.setUser(savedUser);
        doctor = doctorRepository.save(doctor);

        return ResponseEntity.ok(DoctorMapper.toResponse(doctor));
    }

    @Transactional(readOnly = true)
    public ResponseEntity<DoctorResponseDto> getDoctorById(Integer doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + doctorId));
        return ResponseEntity.ok(DoctorMapper.toResponse(doctor));
    }

    @Transactional(readOnly = true)
    public ResponseEntity<List<DoctorResponseDto>> getAllDoctors() {
        List<DoctorResponseDto> doctors = doctorRepository.findAll()
                .stream()
                .map(DoctorMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(doctors);
    }

    @Transactional(readOnly = true)
    public ResponseEntity<DoctorResponseDto> viewOwnProfile() {
        User user = userRepository.findByUserEmail(SecurityContextHolder.getContext().getAuthentication().getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Doctor doctor = doctorRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found for current user"));
        return ResponseEntity.ok(DoctorMapper.toResponse(doctor));
    }
}
