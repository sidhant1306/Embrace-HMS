package com.example.hms.controller;

import com.example.hms.dao.*;
import com.example.hms.exception.ResourceNotFoundException;
import com.example.hms.model.profileModel.Patient;
import com.example.hms.mapper.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/patient-lookup")
@RequiredArgsConstructor
public class PatientLookupController {

    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final ConsultationRepository consultationRepository;
    private final LabOrdersRepository labOrdersRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final BillRepository billRepository;

    /**
     * Search patients by name, email, or phone.
     * GET /api/patient-lookup/search?q=john
     */
    @GetMapping("/search")
    public List<Map<String, Object>> searchPatients(@RequestParam String q) {
        if (q == null || q.trim().length() < 2) {
            return List.of();
        }
        return patientRepository.searchPatients(q.trim()).stream()
                .map(p -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("patientId", p.getPatientId());
                    m.put("userId", p.getUser() != null ? p.getUser().getUserId() : null);
                    m.put("name", p.getUser() != null ? p.getUser().getUserName() : "Unknown");
                    m.put("email", p.getUser() != null ? p.getUser().getUserEmail() : null);
                    m.put("phone", p.getUser() != null ? p.getUser().getUserPhone() : null);
                    m.put("gender", p.getUser() != null ? p.getUser().getUserGender() : null);
                    return m;
                })
                .collect(Collectors.toList());
    }

    /**
     * Get full details of a patient, with all linked records.
     * GET /api/patient-lookup/{patientId}/details
     */
    @GetMapping("/{patientId}/details")
    public ResponseEntity<Map<String, Object>> getPatientDetails(@PathVariable Integer patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + patientId));

        Map<String, Object> result = new LinkedHashMap<>();

        // Patient info
        Map<String, Object> info = new LinkedHashMap<>();
        info.put("patientId", patient.getPatientId());
        if (patient.getUser() != null) {
            info.put("userId", patient.getUser().getUserId());
            info.put("name", patient.getUser().getUserName());
            info.put("email", patient.getUser().getUserEmail());
            info.put("phone", patient.getUser().getUserPhone());
            info.put("gender", patient.getUser().getUserGender());
        }
        result.put("patient", info);

        // Appointments
        var appointments = appointmentRepository.findByPatient(patient,
                PageRequest.of(0, 50, Sort.by(Sort.Direction.DESC, "appointmentCreatedAt")));
        result.put("appointments", appointments.getContent().stream().map(a -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("appointmentId", a.getAppointmentId());
            m.put("date", a.getAppointmentDate());
            m.put("time", a.getAppointmentTime());
            m.put("status", a.getAppointmentStatus());
            m.put("description", a.getAppointmentDescription());
            m.put("doctorName", a.getDoctor() != null && a.getDoctor().getUser() != null
                    ? a.getDoctor().getUser().getUserName() : null);
            m.put("doctorId", a.getDoctor() != null ? a.getDoctor().getDoctorId() : null);
            return m;
        }).toList());

        // Consultations
        var consultations = consultationRepository.findByPatient(patient,
                PageRequest.of(0, 50, Sort.by(Sort.Direction.DESC, "consultationCreatedAt")));
        result.put("consultations", consultations.getContent().stream().map(c -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("consultationId", c.getConsultationId());
            m.put("complaint", c.getConsultationComplaint());
            m.put("diagnosis", c.getConsultationDiagnosis());
            m.put("status", c.getConsultationStatus());
            m.put("createdAt", c.getConsultationCreatedAt());
            m.put("doctorName", c.getDoctor() != null && c.getDoctor().getUser() != null
                    ? c.getDoctor().getUser().getUserName() : null);
            m.put("appointmentId", c.getAppointment() != null ? c.getAppointment().getAppointmentId() : null);
            return m;
        }).toList());

        // Lab Orders
        var labOrders = labOrdersRepository.findAll().stream()
                .filter(lo -> lo.getConsultation() != null
                        && lo.getConsultation().getPatient() != null
                        && lo.getConsultation().getPatient().getPatientId().equals(patientId))
                .map(lo -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("labOrderId", lo.getLabOrderId());
                    m.put("testName", lo.getLabOrderTestName());
                    m.put("status", lo.getLabOrderStatus());
                    m.put("urgency", lo.getLabOrderTestUrgency());
                    m.put("createdAt", lo.getLabOrderCreatedAt());
                    m.put("consultationId", lo.getConsultation() != null ? lo.getConsultation().getConsultationId() : null);
                    return m;
                }).toList();
        result.put("labOrders", labOrders);

        // Prescriptions
        var prescriptions = prescriptionRepository.findByPatient(patient,
                PageRequest.of(0, 50, Sort.by(Sort.Direction.DESC, "prescriptionCreatedAt")));
        result.put("prescriptions", prescriptions.getContent().stream().map(rx -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("prescriptionId", rx.getPrescriptionId());
            m.put("prescriptionNumber", rx.getPrescriptionNumber());
            m.put("status", rx.getPrescriptionStatus());
            m.put("createdAt", rx.getPrescriptionCreatedAt());
            m.put("consultationId", rx.getConsultation() != null ? rx.getConsultation().getConsultationId() : null);
            return m;
        }).toList());

        // Bills
        var bills = billRepository.findByPatient(patient,
                PageRequest.of(0, 50, Sort.by(Sort.Direction.DESC, "createdAt")));
        result.put("bills", bills.getContent().stream().map(b -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("billId", b.getBillId());
            m.put("totalAmount", b.getTotalAmount());
            m.put("paidAmount", b.getAmountPaid());
            m.put("status", b.getPaymentStatuses());
            m.put("createdAt", b.getCreatedAt());
            m.put("consultationId", b.getConsultation() != null ? b.getConsultation().getConsultationId() : null);
            return m;
        }).toList());

        return ResponseEntity.ok(result);
    }
}
