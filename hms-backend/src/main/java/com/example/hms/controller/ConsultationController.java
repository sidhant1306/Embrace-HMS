package com.example.hms.controller;

import com.example.hms.dto.consultation_dto.ConsultationRequestDto;
import com.example.hms.dto.consultation_dto.ConsultationResponseDto;
import com.example.hms.service.ConsultationService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/consultations")
public class ConsultationController {

    private final ConsultationService consultationService;

    public ConsultationController(ConsultationService consultationService) {
        this.consultationService = consultationService;
    }

    @PostMapping("/start/{appointmentId}")
    public ResponseEntity<ConsultationResponseDto> startConsultation(@PathVariable Integer appointmentId, @RequestBody @Valid ConsultationRequestDto consultationRequestDto) {
        return consultationService.startConsultation(appointmentId, consultationRequestDto);
    }

    @PutMapping("/update/{consultationId}")
    public ResponseEntity<ConsultationResponseDto> updateConsultation(@PathVariable Integer consultationId, @RequestBody @Valid ConsultationRequestDto consultationRequestDto) {
        return consultationService.updateConsultation(consultationId, consultationRequestDto);
    }

    @PutMapping("/complete/{consultationId}")
    public ResponseEntity<ConsultationResponseDto> completeConsultation(@PathVariable Integer consultationId) {
        return consultationService.completeConsultation(consultationId);
    }

    @GetMapping("/{consultationId}")
    public ResponseEntity<ConsultationResponseDto> getConsultationById(@PathVariable Integer consultationId) {
        return consultationService.getConsultationById(consultationId);
    }

    @GetMapping("/by-appointment/{appointmentId}")
    public ResponseEntity<ConsultationResponseDto> getConsultationByAppointment(@PathVariable Integer appointmentId) {
        return consultationService.getConsultationByAppointment(appointmentId);
    }

    @GetMapping("/my")
    public Page<ConsultationResponseDto> getMyConsultations(Pageable pageable) {
        return consultationService.getMyConsultations(pageable);
    }
}
