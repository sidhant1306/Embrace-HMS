package com.example.hms.service;

import com.example.hms.dao.MedicineInventoryRepository;
import com.example.hms.dao.MedicineIssuedRepository;
import com.example.hms.dao.PatientRepository;
import com.example.hms.dao.PrescriptionRepository;
import com.example.hms.dto.pharmacy_dto.MedicineInventoryRequestDto;
import com.example.hms.dto.pharmacy_dto.MedicineInventoryResponseDto;
import com.example.hms.dto.pharmacy_dto.MedicineIssuedRequestDto;
import com.example.hms.dto.pharmacy_dto.MedicineIssuedResponseDto;
import com.example.hms.dto.prescription_dto.PrescriptionResponseDto;
import com.example.hms.enums.PrescriptionStatuses;
import com.example.hms.exception.ResourceNotFoundException;
import com.example.hms.model.pharmacyModel.MedicineInventory;
import com.example.hms.model.pharmacyModel.MedicineIssued;
import com.example.hms.model.prescriptionModel.Prescription;
import jakarta.transaction.Transactional;
import org.jspecify.annotations.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class PharmacyService {
    private final MedicineInventoryRepository medicineInventoryRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final MedicineIssuedRepository medicineIssuedRepository;
    private final PatientRepository patientRepository;

    public PharmacyService(MedicineInventoryRepository medicineInventoryRepository, PrescriptionRepository prescriptionRepository, MedicineIssuedRepository medicineIssuedRepository, PatientRepository patientRepository) {
        this.medicineInventoryRepository = medicineInventoryRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.medicineIssuedRepository = medicineIssuedRepository;
        this.patientRepository = patientRepository;
    }


    private static @NonNull MedicineInventory getMedicineInventory(MedicineInventory medicineInventory, MedicineInventoryRequestDto medicineInventoryRequestDto) {
        medicineInventory.setMedicineName(medicineInventoryRequestDto.getMedicineName());
        medicineInventory.setMedicineCategory(medicineInventoryRequestDto.getMedicineCategory());
        medicineInventory.setMedicineStock(medicineInventoryRequestDto.getMedicineStock());
        medicineInventory.setMedicinePrice(medicineInventoryRequestDto.getMedicinePrice());
        medicineInventory.setMedicineExpiryDate(medicineInventoryRequestDto.getMedicineExpiryDate());
        return medicineInventory;
    }

    private static @NonNull MedicineInventoryResponseDto getMedicineInventoryResponseDto(MedicineInventory medicine) {
        MedicineInventoryResponseDto medicineInventoryResponseDto = new MedicineInventoryResponseDto();
        medicineInventoryResponseDto.setMedicineName(medicine.getMedicineName());
        medicineInventoryResponseDto.setMedicineCategory(medicine.getMedicineCategory());
        medicineInventoryResponseDto.setMedicineStock(medicine.getMedicineStock());
        medicineInventoryResponseDto.setMedicinePrice(medicine.getMedicinePrice());
        medicineInventoryResponseDto.setMedicineExpiryDate(medicine.getMedicineExpiryDate());
        return medicineInventoryResponseDto;
    }

    public ResponseEntity<MedicineInventoryResponseDto> addMedicineToInventory(MedicineInventoryRequestDto medicineInventoryRequestDto) {
        // creating the new medicine which will be saved in the repo :
        MedicineInventory medicineInventory = getMedicineInventory(new MedicineInventory(), medicineInventoryRequestDto);
        medicineInventoryRepository.save(medicineInventory);

        // creating the response dto which will be returned to the user :
        MedicineInventoryResponseDto medicineInventoryResponseDto = getMedicineInventoryResponseDto(medicineInventory);
        return ResponseEntity.ok(medicineInventoryResponseDto);
    }

    public ResponseEntity<List<MedicineInventoryResponseDto>> addMedicineListToInventory(List<MedicineInventoryRequestDto> medicineInventoryRequestDtoList) {
        // going through the list of medicines and saving them in the repo:
        // creating new medicine object for each medicine in the list :
        List<MedicineInventory> medicineInventoryList = medicineInventoryRequestDtoList.stream().map(medicine -> {
            return getMedicineInventory(new MedicineInventory(), medicine);
        }).toList();
        List<MedicineInventory> savedInventory = medicineInventoryRepository.saveAll(medicineInventoryList);

        // creating the response dto which will be returned to the user :
        List<MedicineInventoryResponseDto> medicineInventoryResponseDtos = savedInventory.stream().map(PharmacyService::getMedicineInventoryResponseDto).toList();
        return ResponseEntity.ok(medicineInventoryResponseDtos);
    }

    public ResponseEntity<MedicineInventoryResponseDto> updateMedicineInInventory(Integer medicineId, MedicineInventoryRequestDto medicineInventoryRequestDto) {
        MedicineInventory medicine = getMedicineInventory(medicineInventoryRepository.findById(medicineId).orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id: " + medicineId)), medicineInventoryRequestDto);
        medicineInventoryRepository.save(medicine);

        MedicineInventoryResponseDto medicineInventoryResponseDto = getMedicineInventoryResponseDto(medicine);
        return ResponseEntity.ok(medicineInventoryResponseDto);
    }

    public ResponseEntity<MedicineInventoryResponseDto> getMedicineById(Integer medicineId) {
        MedicineInventory medicine = medicineInventoryRepository.findById(medicineId).orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id: " + medicineId));
        return ResponseEntity.ok(getMedicineInventoryResponseDto(medicine));
    }

    public Page<MedicineInventoryResponseDto> getAllMedicineInInventory(int page, int size) {
        return medicineInventoryRepository.findAll(PageRequest.of(page, size)).map(PharmacyService::getMedicineInventoryResponseDto);
    }

    public Page<MedicineInventoryResponseDto> getLowStockMedicines(Pageable pageable) {
        Page<MedicineInventory> lowStockMedicines = medicineInventoryRepository.getMedicineInventoriesByMedicineStockLessThanEqual(10, pageable);

        //            MedicineInventoryResponseDto medicineInventoryResponseDto = new MedicineInventoryResponseDto();
        //            medicineInventoryResponseDto.setMedicineId(req.getMedicineId());
        //            medicineInventoryResponseDto.setMedicineStock(req.getMedicineStock());
        //            medicineInventoryResponseDto.setMedicinePrice(req.getMedicinePrice());
        //            medicineInventoryResponseDto.setMedicineExpiryDate(req.getMedicineExpiryDate());
        //            medicineInventoryResponseDto.setMedicineCategory(req.getMedicineCategory());
        //            medicineInventoryResponseDto.setMedicineName(req.getMedicineName());
        //            return medicineInventoryResponseDto;
        return lowStockMedicines.map(PharmacyService::getMedicineInventoryResponseDto);
    }

    public Page<MedicineInventoryResponseDto> getExpiringSoonMedicines(Pageable pageable) {
        LocalDate twentyDaysFromNow = LocalDate.now().plusDays(20);
        Page<MedicineInventory> expiringSoonMedicines = medicineInventoryRepository.getMedicineInventoriesByMedicineExpiryDateBefore(pageable, twentyDaysFromNow);

        return expiringSoonMedicines.map(PharmacyService::getMedicineInventoryResponseDto);
    }


    // medicine issuing :

    @Transactional
    public MedicineIssuedResponseDto dispensePrescriptionToPatient(MedicineIssuedRequestDto medicineIssuedRequestDto) {
        Prescription prescription = prescriptionRepository.findById(medicineIssuedRequestDto.getPrescriptionId()).orElseThrow(() -> new ResourceNotFoundException("No prescription found with this id: " +medicineIssuedRequestDto.getPrescriptionId()));
        if(prescription.getPrescriptionStatus() == PrescriptionStatuses.DISPENSED) throw new RuntimeException("This prescription has already been dispensed");
        // for each medicine in the prescription, check if there is enough stock in the inventory, if not, throw an exception
        // if there is enough stock, update the stock in the inventory, and create a new medicine-issued record
        // create a list of all the medicines that need to be dispensed and save them in the database in a single query of saveAll()
        List<MedicineInventory> medicineInventoryList = new ArrayList<>();
        prescription.getPrescriptionItem().forEach(item -> {
            MedicineInventory medicineInventory = medicineInventoryRepository.findByMedicineName(item.getMedicineName());
            if(medicineInventory == null) throw new ResourceNotFoundException("Medicine not found with name: " + item.getMedicineName());
            int totalRequired = item.getMedicineDurationDays() * item.getMedicineFrequency();
            if(medicineInventory.getMedicineStock() < totalRequired) throw new ResourceNotFoundException("Medicine stock is not enough for this prescription");
            medicineInventory.setMedicineStock(medicineInventory.getMedicineStock() - totalRequired);
            medicineInventoryList.add(medicineInventory);
        });
        medicineInventoryRepository.saveAll(medicineInventoryList);

        // create a new medicine-issued record and save it in the database
        MedicineIssued medicineIssued = new MedicineIssued();
        medicineIssued.setPrescription(prescription);
        medicineIssued.setPatient(prescription.getPatient());

        // create the response dto and return it
        MedicineIssued savedMedicineIssued = medicineIssuedRepository.save(medicineIssued);
        prescription.setPrescriptionStatus(PrescriptionStatuses.DISPENSED); // once the prescription is dispensed, set the status to dispensed
        MedicineIssuedResponseDto medicineIssuedResponseDto = new MedicineIssuedResponseDto();
        medicineIssuedResponseDto.setPrescriptionId(prescription.getPrescriptionId());
        medicineIssuedResponseDto.setPrescriptionNumber(prescription.getPrescriptionNumber());
        medicineIssuedResponseDto.setIssuedDate(savedMedicineIssued.getIssuedDate());
        medicineIssuedResponseDto.setIssueId(savedMedicineIssued.getIssueId());
        medicineIssuedResponseDto.setPatientId(prescription.getPatient().getPatientId());

        return medicineIssuedResponseDto;
    }
    @Transactional
    public Page<MedicineIssuedResponseDto> getIssueHistoryByPatient(Integer patientId, Pageable pageable) {
        Page<MedicineIssued> response = medicineIssuedRepository.findByPatientPatientId(patientId, pageable);
        return response.map(medicineIssued -> {
            MedicineIssuedResponseDto medicineIssuedResponseDto = new MedicineIssuedResponseDto();
            medicineIssuedResponseDto.setPrescriptionId(medicineIssued.getPrescription().getPrescriptionId());
            medicineIssuedResponseDto.setPrescriptionNumber(medicineIssued.getPrescription().getPrescriptionNumber());
            medicineIssuedResponseDto.setIssuedDate(medicineIssued.getIssuedDate());
            medicineIssuedResponseDto.setIssueId(medicineIssued.getIssueId());
            return medicineIssuedResponseDto;
        });
    }


    public Page<PrescriptionResponseDto> getPendingDispenses(Pageable pageable) {
        Page<Prescription> pendingDispenses = prescriptionRepository.findByPrescriptionStatus(PrescriptionStatuses.PRINTED, pageable);
        return pendingDispenses.map(prescription -> {
            PrescriptionResponseDto prescriptionResponseDto = new PrescriptionResponseDto();
            prescriptionResponseDto.setPrescriptionId(prescription.getPrescriptionId());
            prescriptionResponseDto.setPrescriptionNumber(prescription.getPrescriptionNumber());
            prescriptionResponseDto.setPatientId(prescription.getPatient().getPatientId());
            prescriptionResponseDto.setPatientName(
                    prescription.getPatient().getUser() != null
                            ? prescription.getPatient().getUser().getUserName() : null);
            prescriptionResponseDto.setPrescriptionCreatedAt(prescription.getPrescriptionCreatedAt());
            prescriptionResponseDto.setPrescriptionUpdatedAt(prescription.getPrescriptionUpdatedAt());
            prescriptionResponseDto.setPrescriptionStatus(prescription.getPrescriptionStatus());
            return prescriptionResponseDto;
        });
    }
}
