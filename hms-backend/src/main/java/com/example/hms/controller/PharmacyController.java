package com.example.hms.controller;

import com.example.hms.dto.pharmacy_dto.MedicineInventoryRequestDto;
import com.example.hms.dto.pharmacy_dto.MedicineInventoryResponseDto;
import com.example.hms.dto.pharmacy_dto.MedicineIssuedRequestDto;
import com.example.hms.dto.pharmacy_dto.MedicineIssuedResponseDto;
import com.example.hms.dto.prescription_dto.PrescriptionResponseDto;
import com.example.hms.service.PharmacyService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pharmacy")
@RequiredArgsConstructor
public class PharmacyController {

    private final PharmacyService pharmacyService;

    @PostMapping("/add-medicine")
    public ResponseEntity<MedicineInventoryResponseDto> addMedicineToInventory(@RequestBody @Valid MedicineInventoryRequestDto medicineInventoryRequestDto) {
        return pharmacyService.addMedicineToInventory(medicineInventoryRequestDto);
    }

    @PostMapping("/add-medicine-list")
    public ResponseEntity<List<MedicineInventoryResponseDto>> addMedicineListToInventory(@RequestBody @NotEmpty @Valid List<MedicineInventoryRequestDto> medicineInventoryRequestDtoList) {
        return pharmacyService.addMedicineListToInventory(medicineInventoryRequestDtoList);
    }

    @PutMapping("/update-medicine/{medicineId}")
    public ResponseEntity<MedicineInventoryResponseDto> updateMedicineInInventory(@PathVariable Integer medicineId, @RequestBody @Valid MedicineInventoryRequestDto medicineInventoryRequestDto) {
        return pharmacyService.updateMedicineInInventory(medicineId, medicineInventoryRequestDto);
    }

    @GetMapping("/get-all-medicine")
    public Page<MedicineInventoryResponseDto> getAllMedicineInInventory(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        return pharmacyService.getAllMedicineInInventory(page, size);
    }

    @GetMapping("/get-medicine/{medicineId}")
    public ResponseEntity<MedicineInventoryResponseDto> getMedicineById(@PathVariable Integer medicineId) {
        return pharmacyService.getMedicineById(medicineId);
    }

    @GetMapping("/get-low-stock")
    public Page<MedicineInventoryResponseDto> getLowStockMedicines(Pageable pageable) {
        return pharmacyService.getLowStockMedicines(pageable);
    }

    @GetMapping("/get-expiring-medicines")
    public Page<MedicineInventoryResponseDto> getExpiringSoonMedicines(Pageable pageable) {
        return pharmacyService.getExpiringSoonMedicines(pageable);
    }

    @PostMapping("/dispense-prescription")
    public MedicineIssuedResponseDto dispenseMedicine(@RequestBody @Valid MedicineIssuedRequestDto requestDto) {
        return pharmacyService.dispensePrescriptionToPatient(requestDto);
    }

    @GetMapping("/medicine-issues-history/{patientId}")
    public Page<MedicineIssuedResponseDto> issueHistoryByPatient(@PathVariable Integer patientId, Pageable pageable) {
        return pharmacyService.getIssueHistoryByPatient(patientId, pageable);
    }

    @GetMapping("/get-pending-dispenses")
    public Page<PrescriptionResponseDto> getPendingDispenses(Pageable pageable) {
        return pharmacyService.getPendingDispenses(pageable);
    }
}
