package com.example.hms.service;

import com.example.hms.dao.ConsultationRepository;
import com.example.hms.dao.LabOrdersRepository;
import com.example.hms.dao.LabReportRepository;
import com.example.hms.dao.PatientRepository;
import com.example.hms.dto.lab_dto.LabOrderRequestDto;
import com.example.hms.dto.lab_dto.LabOrderResponseDto;
import com.example.hms.dto.lab_dto.LabReportResponseDto;
import com.example.hms.enums.LabOrderStatuses;
import com.example.hms.exception.ResourceNotFoundException;
import com.example.hms.mapper.LabMapper;
import com.example.hms.model.dataModel.Consultation;
import com.example.hms.model.labModel.LabOrders;
import com.example.hms.model.labModel.LabReport;
import com.example.hms.model.profileModel.Patient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class LabService {
    private final LabOrdersRepository labOrdersRepository;
    private final LabReportRepository labReportRepository;
    private final ConsultationRepository consultationRepository;
    private final PatientRepository patientRepository;
    private final Path uploadDir;

    public LabService(LabOrdersRepository labOrdersRepository, LabReportRepository labReportRepository,
                      ConsultationRepository consultationRepository, PatientRepository patientRepository,
                      @Value("${app.upload.dir:uploads/lab-reports}") String uploadDirStr) {
        this.labOrdersRepository = labOrdersRepository;
        this.labReportRepository = labReportRepository;
        this.consultationRepository = consultationRepository;
        this.patientRepository = patientRepository;
        this.uploadDir = Paths.get(uploadDirStr).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadDir);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory: " + this.uploadDir, e);
        }
    }

    @Transactional
    public ResponseEntity<LabOrderResponseDto> orderLabTest(LabOrderRequestDto dto) {
        Consultation consultation = consultationRepository.findById(dto.getConsultationId())
                .orElseThrow(() -> new ResourceNotFoundException("Consultation not found with ID: " + dto.getConsultationId()));
        LabOrders order = new LabOrders();
        order.setLabOrderNumber(dto.getLabOrderNumber());
        order.setLabOrderTestName(dto.getLabOrderTestName());
        order.setLabOrderTestUrgency(dto.getLabOrderTestUrgency());
        order.setLabOrderStatus(LabOrderStatuses.ORDERED);
        order.setLabOrderNotes(dto.getLabOrderNotes());
        order.setLabOrderCreatedAt(LocalDateTime.now());
        order.setLabOrderUpdatedAt(LocalDateTime.now());
        order.setConsultation(consultation);
        LabOrders saved = labOrdersRepository.save(order);
        return ResponseEntity.ok(LabMapper.toOrderResponse(saved));
    }

    @Transactional
    public ResponseEntity<LabOrderResponseDto> updateTestStatus(Integer labOrderId, LabOrderStatuses status) {
        LabOrders order = labOrdersRepository.findById(labOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("Lab order not found with ID: " + labOrderId));
        order.setLabOrderStatus(status);
        order.setLabOrderUpdatedAt(LocalDateTime.now());
        return ResponseEntity.ok(LabMapper.toOrderResponse(labOrdersRepository.save(order)));
    }

    @Transactional
    public ResponseEntity<LabReportResponseDto> uploadLabReport(Integer labOrderId, MultipartFile file,
                                                                 Integer patientId, String labNotes) {
        LabOrders order = labOrdersRepository.findById(labOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("Lab order not found with ID: " + labOrderId));

        // Resolve patient – use explicit patientId if given, otherwise derive from consultation
        Patient patient;
        if (patientId != null && patientId > 0) {
            patient = patientRepository.findById(patientId)
                    .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + patientId));
        } else if (order.getConsultation() != null && order.getConsultation().getPatient() != null) {
            patient = order.getConsultation().getPatient();
        } else {
            throw new ResourceNotFoundException("No patient could be determined for this lab order");
        }

        // Save file to disk
        String savedFilePath;
        if (file != null && !file.isEmpty()) {
            try {
                String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "report";
                String extension = originalFilename.contains(".")
                        ? originalFilename.substring(originalFilename.lastIndexOf("."))
                        : "";
                String uniqueName = "report-" + labOrderId + "-" + UUID.randomUUID().toString().substring(0, 8) + extension;
                Path targetPath = uploadDir.resolve(uniqueName);
                Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
                savedFilePath = uniqueName;
            } catch (IOException e) {
                throw new RuntimeException("Failed to store uploaded file", e);
            }
        } else {
            savedFilePath = "no-file-uploaded";
        }

        LabReport report = new LabReport();
        report.setLabOrder(order);
        report.setPatient(patient);
        report.setReportFilePath(savedFilePath);
        report.setDoctorNotes(labNotes);
        report.setViewedByDoctor(false);
        report.setViewedByPatient(false);
        report.setUploadedAt(LocalDateTime.now());
        LabReport savedReport = labReportRepository.save(report);
        order.setLabOrderStatus(LabOrderStatuses.COMPLETED);
        labOrdersRepository.save(order);
        return ResponseEntity.ok(LabMapper.toReportResponse(savedReport));
    }

    @Transactional(readOnly = true)
    public ResponseEntity<Resource> downloadReport(Integer labReportId) {
        LabReport report = labReportRepository.findById(labReportId)
                .orElseThrow(() -> new ResourceNotFoundException("Lab report not found with ID: " + labReportId));
        try {
            Path filePath = uploadDir.resolve(report.getReportFilePath()).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists()) {
                throw new ResourceNotFoundException("File not found: " + report.getReportFilePath());
            }
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) contentType = "application/octet-stream";
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + report.getReportFilePath() + "\"")
                    .body(resource);
        } catch (MalformedURLException e) {
            throw new RuntimeException("File path error", e);
        } catch (IOException e) {
            throw new RuntimeException("Could not determine file type", e);
        }
    }

    @Transactional(readOnly = true)
    public Page<LabOrderResponseDto> getPendingOrders(Pageable pageable) {
        return labOrdersRepository.findByLabOrderStatus(LabOrderStatuses.ORDERED, pageable)
                .map(LabMapper::toOrderResponse);
    }

    @Transactional(readOnly = true)
    public Page<LabOrderResponseDto> getAllOrders(Pageable pageable) {
        return labOrdersRepository.findAll(pageable)
                .map(LabMapper::toOrderResponse);
    }

    @Transactional(readOnly = true)
    public ResponseEntity<LabOrderResponseDto> getLabOrderById(Integer labOrderId) {
        LabOrders order = labOrdersRepository.findById(labOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("Lab order not found with ID: " + labOrderId));
        return ResponseEntity.ok(LabMapper.toOrderResponse(order));
    }

    @Transactional(readOnly = true)
    public Page<LabReportResponseDto> getLabReportsByPatient(Integer patientId, Pageable pageable) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + patientId));
        return labReportRepository.findByPatient(patient, pageable).map(LabMapper::toReportResponse);
    }

    @Transactional
    public ResponseEntity<LabReportResponseDto> addDoctorNotes(Integer labReportId, String notes) {
        LabReport report = labReportRepository.findById(labReportId)
                .orElseThrow(() -> new ResourceNotFoundException("Lab report not found with ID: " + labReportId));
        report.setDoctorNotes(notes);
        return ResponseEntity.ok(LabMapper.toReportResponse(labReportRepository.save(report)));
    }
}
