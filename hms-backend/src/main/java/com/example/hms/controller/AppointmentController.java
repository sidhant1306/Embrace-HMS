package com.example.hms.controller;

import com.example.hms.dto.appointment_dto.AppointmentCancelDto;
import com.example.hms.dto.appointment_dto.AppointmentRequestDto;
import com.example.hms.dto.appointment_dto.AppointmentResponseDto;
import com.example.hms.service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @PostMapping("/book-appointment")
    public ResponseEntity<AppointmentResponseDto> bookAppointment(@RequestBody @Valid AppointmentRequestDto appointmentRequestDto) {
        return appointmentService.bookAppointment(appointmentRequestDto);
    }

    @PutMapping("/cancel-appointment/{appointmentId}")
    public ResponseEntity<String> cancelAppointment(@PathVariable Integer appointmentId, @RequestBody @Valid AppointmentCancelDto appointmentRequestDto) {
        return appointmentService.cancelAppointment(appointmentId, appointmentRequestDto);
    }

    @PutMapping("/reschedule-appointment/{appointmentId}")
    public ResponseEntity<AppointmentResponseDto> rescheduleAppointment(@PathVariable Integer appointmentId, @RequestBody @Valid AppointmentRequestDto appointmentRequestDto) {
        return appointmentService.rescheduleAppointment(appointmentId, appointmentRequestDto);
    }

    @PutMapping("/confirm-appointment/{appointmentId}")
    public ResponseEntity<AppointmentResponseDto> confirmAppointment(@PathVariable Integer appointmentId) {
        return appointmentService.confirmAppointment(appointmentId);
    }

    @PutMapping("/complete-appointment/{appointmentId}")
    public ResponseEntity<AppointmentResponseDto> completeAppointment(@PathVariable Integer appointmentId) {
        return appointmentService.completeAppointment(appointmentId);
    }

    @GetMapping("/today")
    public Page<AppointmentResponseDto> getTodaysAppointments(Pageable pageable) {
        return appointmentService.getTodaysAppointments(pageable);
    }

    @GetMapping("/all")
    public Page<AppointmentResponseDto> getAllAppointments(Pageable pageable) {
        return appointmentService.getAllAppointments(pageable);
    }

    @GetMapping("/{appointmentId}")
    public ResponseEntity<AppointmentResponseDto> getAppointmentById(@PathVariable Integer appointmentId) {
        return appointmentService.getAppointmentById(appointmentId);
    }

    @GetMapping("/patient/{patientId}")
    public Page<AppointmentResponseDto> getAppointmentsByPatient(@PathVariable Integer patientId, Pageable pageable) {
        return appointmentService.getAppointmentsByPatient(patientId, pageable);
    }

    @GetMapping("/doctor/{doctorId}")
    public Page<AppointmentResponseDto> getAppointmentsByDoctor(@PathVariable Integer doctorId, Pageable pageable) {
        return appointmentService.getAppointmentsByDoctor(doctorId, pageable);
    }

    @GetMapping("/available-slots/{doctorId}")
    public ResponseEntity<List<LocalDateTime>> getAvailableSlots(@PathVariable Integer doctorId, @RequestParam LocalDate date) {
        return appointmentService.getAvailableSlots(doctorId, date);
    }
}
