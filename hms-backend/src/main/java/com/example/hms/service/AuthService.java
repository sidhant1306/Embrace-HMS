package com.example.hms.service;

import com.example.hms.dao.DoctorRepository;
import com.example.hms.dao.PatientRepository;
import com.example.hms.dao.UserRepository;
import com.example.hms.dto.auth_dto.AuthResponseDto;
import com.example.hms.dto.auth_dto.LoginRequestDto;
import com.example.hms.dto.auth_dto.RegisterRequestDto;
import com.example.hms.exception.AlreadyExistsException;
import com.example.hms.enums.Roles;
import com.example.hms.model.profileModel.Doctor;
import com.example.hms.model.profileModel.Patient;
import com.example.hms.model.profileModel.User;
import com.example.hms.security.JwtService;
import com.example.hms.security.UserPrincipal;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.hms.dao.NotificationRepository;
import com.example.hms.model.Notification;
import java.time.LocalDateTime;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final NotificationRepository notificationRepository;

    public AuthService(UserRepository userRepository, PatientRepository patientRepository,
                       DoctorRepository doctorRepository, PasswordEncoder passwordEncoder,
                       JwtService jwtService, AuthenticationManager authenticationManager,
                       NotificationRepository notificationRepository) {
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public AuthResponseDto register(RegisterRequestDto request) {
        if (userRepository.existsByUserEmail(request.getUserEmail())) {
            throw new AlreadyExistsException("A user with email '" + request.getUserEmail() + "' already exists. Please use a different email.");
        }
        if (request.getUserPhone() != null && !request.getUserPhone().isBlank() && userRepository.existsByUserPhone(request.getUserPhone())) {
            throw new AlreadyExistsException("A user with phone number '" + request.getUserPhone() + "' already exists. Please use a different phone number.");
        }

        Roles role = request.getUserRole() != null ? request.getUserRole() : Roles.PATIENT;
        if (role != Roles.PATIENT) {
            throw new IllegalArgumentException("Public registration is only allowed for the PATIENT role");
        }

        User user = new User();
        user.setUserName(request.getUserName());
        user.setUserEmail(request.getUserEmail());
        user.setUserPassword(passwordEncoder.encode(request.getUserPassword()));
        user.setUserPhone(request.getUserPhone());
        user.setUserGender(request.getUserGender());
        user.setDateOfBirth(request.getDateOfBirth());
        user.setUserRole(role);

        User savedUser = userRepository.save(user);

        // Create Patient entity linked to User
        Patient patient = new Patient();
        patient.setUser(savedUser);
        patientRepository.save(patient);

        // Welcome notification
        try {
            notificationRepository.save(Notification.builder()
                    .targetUserId(savedUser.getUserId())
                    .title("Welcome to Embrace Hospital! \uD83C\uDFE5")
                    .message("Hello " + savedUser.getUserName() + "! Your patient account has been created. You can book appointments, view prescriptions, and manage your health records.")
                    .type("success")
                    .senderName("System")
                    .createdAt(LocalDateTime.now())
                    .build());
        } catch (Exception ignored) {}

        UserPrincipal userPrincipal = new UserPrincipal(savedUser);
        String token = jwtService.generateToken(userPrincipal);

        return AuthResponseDto.builder()
                .token(token)
                .userName(savedUser.getUserName())
                .userEmail(savedUser.getUserEmail())
                .userRole(savedUser.getUserRole().name())
                .build();
    }

    @Transactional
    public AuthResponseDto registerStaff(RegisterRequestDto request) {
        if (userRepository.existsByUserEmail(request.getUserEmail())) {
            throw new AlreadyExistsException("A user with email '" + request.getUserEmail() + "' already exists. Please use a different email.");
        }
        if (request.getUserPhone() != null && !request.getUserPhone().isBlank() && userRepository.existsByUserPhone(request.getUserPhone())) {
            throw new AlreadyExistsException("A user with phone number '" + request.getUserPhone() + "' already exists. Please use a different phone number.");
        }
        if (request.getUserRole() == null) {
            throw new IllegalArgumentException("userRole is required for staff registration");
        }
        if (request.getUserRole() == Roles.PATIENT) {
            throw new IllegalArgumentException("Use /api/auth/register for patient accounts");
        }

        User user = new User();
        user.setUserName(request.getUserName());
        user.setUserEmail(request.getUserEmail());
        user.setUserPassword(passwordEncoder.encode(request.getUserPassword()));
        user.setUserPhone(request.getUserPhone());
        user.setUserGender(request.getUserGender());
        user.setDateOfBirth(request.getDateOfBirth());
        user.setUserRole(request.getUserRole());

        User savedUser = userRepository.save(user);

        // Create Doctor entity if registering a doctor
        if (request.getUserRole() == Roles.DOCTOR) {
            Doctor doctor = new Doctor();
            doctor.setUser(savedUser);
            doctorRepository.save(doctor);
        }

        UserPrincipal userPrincipal = new UserPrincipal(savedUser);
        String token = jwtService.generateToken(userPrincipal);

        return AuthResponseDto.builder()
                .token(token)
                .userName(savedUser.getUserName())
                .userEmail(savedUser.getUserEmail())
                .userRole(savedUser.getUserRole().name())
                .build();
    }

    public AuthResponseDto login(LoginRequestDto request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUserEmail(), request.getUserPassword())
        );

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        String token = jwtService.generateToken(userPrincipal);
        User user = userPrincipal.getUser();

        return AuthResponseDto.builder()
                .token(token)
                .userName(user.getUserName())
                .userEmail(user.getUserEmail())
                .userRole(user.getUserRole().name())
                .build();
    }
}
