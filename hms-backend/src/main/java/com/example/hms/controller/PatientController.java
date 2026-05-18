package com.example.hms.controller;

import com.example.hms.dto.appointment_dto.CancelOwnAppointmentDto;
import com.example.hms.dto.appointment_dto.PatientAppointmentRequestDto;
import com.example.hms.dto.appointment_dto.AppointmentResponseDto;
import com.example.hms.dto.billing_dto.BillResponseDto;
import com.example.hms.dto.consultation_dto.ConsultationResponseDto;
import com.example.hms.dto.lab_dto.LabReportResponseDto;
import com.example.hms.dto.patient_dto.PatientDetailResponse;
import com.example.hms.dto.patient_dto.UpdatePatientDto;
import com.example.hms.dto.prescription_dto.PrescriptionResponseDto;
import com.example.hms.service.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {
    private final PatientService patientService;

    // appointments :

    // book own appointment

    @PostMapping("/book-own-appointment")
    public ResponseEntity<AppointmentResponseDto> bookAppointment(@RequestBody @Valid PatientAppointmentRequestDto appointmentRequestDto, @AuthenticationPrincipal UserDetails userDetails) {
        return patientService.bookAppointment(appointmentRequestDto, userDetails);
    }

    @GetMapping("/view-own-appointment")
    public Page<AppointmentResponseDto> viewOwnAppointments(Pageable pageable) {
        return patientService.viewOwnAppointments(pageable);
    }

    @PutMapping("/cancel-own-appointment/{appointmentId}")
    public ResponseEntity<String> cancelOwnAppointment(@PathVariable Integer appointmentId, @RequestBody @Valid CancelOwnAppointmentDto dto) {
        return patientService.cancelOwnAppointment(appointmentId, dto);
    }


    // consultations :


    @GetMapping("/view-own-consultation")
    public Page<ConsultationResponseDto> viewOwnConsultations(Pageable pageable) {
        return patientService.viewOwnConsultations(pageable);
    }


    // prescriptions:

    @GetMapping("/view-own-prescriptions")
    public Page<PrescriptionResponseDto> viewOwnPrescriptions(Pageable pageable) {
        return patientService.viewOwnPrescriptions(pageable);
    }

    // download prescription pdf :


    // lab reports :

    @GetMapping("/view-own-lab-reports")
    public Page<LabReportResponseDto> viewOwnLabReports(Pageable pageable) {
        return patientService.viewOwnLabReports(pageable);
    }

    // download lab reports :


    // billing :
    @GetMapping("/view-own-bills")
    public Page<BillResponseDto> viewOwnBills(Pageable pageable) {
        return patientService.viewOwnBills(pageable);
    }
    // download bill pdf :


    // patient details :
    @GetMapping("/view-own-details")
    public PatientDetailResponse viewPatientDetails() {
        return patientService.viewPatientDetails();
    }

    @PutMapping("/update-own-profile/{patientId}")
    public ResponseEntity<PatientDetailResponse> updatePatientDetailsById(@PathVariable Integer patientId, @RequestBody @Valid UpdatePatientDto updatePatientDto) {
        return patientService.updatePatientDetailsById(patientId, updatePatientDto);
    }
}
