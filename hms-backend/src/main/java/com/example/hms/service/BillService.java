package com.example.hms.service;

import com.example.hms.dao.*;
import com.example.hms.dto.billing_dto.ExtraChargeRequestDto;
import com.example.hms.dto.billing_dto.GenerateBillRequestDto;
import com.example.hms.dto.billing_dto.PaymentRequestDto;
import com.example.hms.dto.billing_dto.BillResponseDto;
import com.example.hms.enums.ItemTypes;
import com.example.hms.enums.PaymentStatuses;
import com.example.hms.enums.Roles;
import com.example.hms.enums.Statuses;
import com.example.hms.exception.AlreadyExistsException;
import com.example.hms.exception.ResourceNotFoundException;
import com.example.hms.mapper.BillMapper;
import com.example.hms.model.billingModel.Bill;
import com.example.hms.model.billingModel.BillItem;
import com.example.hms.model.dataModel.Consultation;
import com.example.hms.model.labModel.LabOrders;
import com.example.hms.model.pharmacyModel.MedicineInventory;
import com.example.hms.model.prescriptionModel.Prescription;
import com.example.hms.model.prescriptionModel.PrescriptionItem;
import com.example.hms.model.profileModel.Patient;
import com.example.hms.model.profileModel.User;
import com.example.hms.util.BillPdfGenerator;
import com.lowagie.text.DocumentException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.List;

@Service
public class BillService {

    private static final BigDecimal ONE_HUNDRED = BigDecimal.valueOf(100);
    private static final BigDecimal ZERO = BigDecimal.ZERO;

    private final BillRepository billRepository;
    private final ConsultationRepository consultationRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final LabOrdersRepository labOrdersRepository;
    private final MedicineInventoryRepository medicineInventoryRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Value("${billing.consultation-fee-paise:50000}")
    private BigDecimal consultationFee;

    @Value("${billing.tax-percent:5}")
    private String taxPercent;

    @Value("${billing.default-lab-test-paise:150000}")
    private BigDecimal defaultLabTestFee;

    public BillService(BillRepository billRepository,
                       ConsultationRepository consultationRepository,
                       PrescriptionRepository prescriptionRepository,
                       LabOrdersRepository labOrdersRepository,
                       MedicineInventoryRepository medicineInventoryRepository,
                       PatientRepository patientRepository,
                       UserRepository userRepository,
                       NotificationService notificationService) {
        this.billRepository = billRepository;
        this.consultationRepository = consultationRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.labOrdersRepository = labOrdersRepository;
        this.medicineInventoryRepository = medicineInventoryRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public BillResponseDto generateBill(GenerateBillRequestDto request) {
        Consultation consultation = consultationRepository.findById(request.getConsultationId())
                .orElseThrow(() -> new ResourceNotFoundException("Consultation not found: " + request.getConsultationId()));
        if (consultation.getConsultationStatus() != Statuses.COMPLETED) {
            throw new IllegalStateException("Consultation must be COMPLETED before generating a bill");
        }

        // if you find that a consultation was made for this patient, create a bill for that :
        billRepository.findByConsultation_ConsultationId(consultation.getConsultationId())
                .ifPresent(b -> {
                    throw new AlreadyExistsException("Bill already exists for consultation " + consultation.getConsultationId());
                });

        Patient patient = consultation.getPatient();
        Bill bill = new Bill();
        bill.setPatient(patient);
        bill.setConsultation(consultation);
        bill.setPaymentStatuses(PaymentStatuses.PENDING);
        bill.setAmountPaid(ZERO);
        bill.setTaxPercent(taxPercent);
        bill.setCreatedAt(LocalDateTime.now());
        bill.setUpdatedAt(LocalDateTime.now());
        // creating bill for consultation :
        BillItem consultLine = new BillItem();
        consultLine.setItemName("Consultation fee");
        consultLine.setItemType(ItemTypes.CONSULTATION);
        consultLine.setQuantity(1);
        consultLine.setUnitPrice(consultationFee);
        consultLine.setLineTotal(consultationFee);
        consultLine.setBill(bill);
        bill.getBillItems().add(consultLine);

        // if you find any lab order attached to the consultation id create a bill for that :
        List<LabOrders> labs = labOrdersRepository.findByConsultation_ConsultationId(consultation.getConsultationId());
        for (LabOrders lab : labs) {
            BigDecimal price = lab.getPricePaise() != null ? BigDecimal.valueOf(lab.getPricePaise()) : defaultLabTestFee;
            BillItem line = new BillItem();
            line.setItemName("Lab: " + lab.getLabOrderTestName());
            line.setItemType(ItemTypes.LAB);
            line.setQuantity(1);
            line.setUnitPrice(price);
            line.setLineTotal(price);
            line.setBill(bill);
            bill.getBillItems().add(line);
        }

        // if you find any prescription, make a bill for that too :
        List<Prescription> prescriptions = prescriptionRepository.findByConsultation_ConsultationId(consultation.getConsultationId());
        for (Prescription prescription : prescriptions) {
            if (prescription.getPrescriptionItem() == null) {
                continue;
            }
            for (PrescriptionItem item : prescription.getPrescriptionItem()) {
                MedicineInventory inv = medicineInventoryRepository.findByMedicineName(item.getMedicineName());
                if (inv == null) {
                    throw new ResourceNotFoundException("Medicine not in inventory for billing: " + item.getMedicineName());
                }
                Integer qty = item.getMedicineDurationDays() * item.getMedicineFrequency();
                BigDecimal unitPrice = parseInventoryPrice(inv.getMedicinePrice());
                BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(qty));
                BillItem line = new BillItem();
                line.setItemName("Medicine: " + item.getMedicineName());
                line.setItemType(ItemTypes.MEDICINE);
                line.setQuantity(qty);
                line.setUnitPrice(unitPrice);
                line.setLineTotal(lineTotal);
                line.setBill(bill);
                bill.getBillItems().add(line);
            }
        }

        recalculateTotals(bill);
        Bill saved = billRepository.save(bill);

        // Auto-notify patient about new bill
        try {
            if (patient.getUser() != null) {
                String totalFormatted = "₹" + saved.getTotalAmount().divide(ONE_HUNDRED, 2, RoundingMode.HALF_UP);
                notificationService.notifyUser(
                    patient.getUser().getUserId(),
                    "New Bill Generated",
                    "A bill of " + totalFormatted + " has been generated for your consultation. Please check your Bills section for details.",
                    "info"
                );
            }
        } catch (Exception ignored) {
            // Don't fail bill generation if notification fails
        }

        return BillMapper.toResponse(saved);
    }

    @Transactional
    public BillResponseDto addExtraCharge(Integer billId, ExtraChargeRequestDto dto) {
        Bill bill = billRepository.findWithDetailsById(billId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found: " + billId));
        if (bill.getPaymentStatuses() == PaymentStatuses.PAID) {
            throw new IllegalStateException("Cannot add charges to a fully paid bill");
        }
        if (dto.getItemType() != ItemTypes.EXTRA) {
            throw new IllegalArgumentException("Extra charges must use itemType EXTRA");
        }
        Integer qty = dto.getQuantity() != null ? Math.max(1, dto.getQuantity()) : 1;
        BigDecimal lineTotal = dto.getUnitPrice().multiply(BigDecimal.valueOf(qty));
        BillItem line = new BillItem();
        line.setItemName(dto.getItemName());
        line.setItemType(ItemTypes.EXTRA);
        line.setQuantity(qty);
        line.setUnitPrice(dto.getUnitPrice());
        line.setLineTotal(lineTotal);
        line.setBill(bill);
        bill.getBillItems().add(line);
        bill.setUpdatedAt(LocalDateTime.now());
        recalculateTotals(bill);
        return BillMapper.toResponse(billRepository.save(bill));
    }

    @Transactional
    public BillResponseDto makePayment(Integer billId, PaymentRequestDto dto) {
        Bill bill = billRepository.findWithDetailsById(billId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found: " + billId));
        if (dto.getPaymentAmount() == null || dto.getPaymentAmount().compareTo(ZERO) <= 0) {
            throw new IllegalArgumentException("Payment amount must be positive");
        }
        BigDecimal currentPaid = bill.getAmountPaid() != null ? bill.getAmountPaid() : ZERO;
        BigDecimal totalAmount = bill.getTotalAmount() != null ? bill.getTotalAmount() : ZERO;
        BigDecimal newPaid = currentPaid.add(dto.getPaymentAmount());
        bill.setPaymentMethod(dto.getPaymentMethod());
        if (newPaid.compareTo(totalAmount) >= 0) {
            bill.setAmountPaid(totalAmount);
            bill.setBalanceDue(ZERO);
            bill.setPaymentStatuses(PaymentStatuses.PAID);
        } else {
            bill.setAmountPaid(newPaid);
            bill.setBalanceDue(totalAmount.subtract(newPaid));
            bill.setPaymentStatuses(PaymentStatuses.PARTIALLY_PAID);
        }
        bill.setUpdatedAt(LocalDateTime.now());
        return BillMapper.toResponse(billRepository.save(bill));
    }

    @Transactional(readOnly = true)
    public BillResponseDto getBillById(Integer billId, Authentication authentication) {
        Bill bill = billRepository.findWithDetailsById(billId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found: " + billId));
        assertCanAccessBill(bill, authentication);
        return BillMapper.toResponse(bill);
    }

    @Transactional(readOnly = true)
    public Page<BillResponseDto> getBillsByPatient(Integer patientId, Pageable pageable, Authentication authentication) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found: " + patientId));
        User user = userRepository.findByUserEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (user.getUserRole() == Roles.PATIENT) {
            // For patients, check if the patient they're accessing belongs to them by finding their own patient record
            Patient ownPatient = patientRepository.findById(patientId).orElse(null);
            if (ownPatient == null || !ownPatient.getUser().getUserId().equals(user.getUserId())) {
                throw new AccessDeniedException("Patients may only view their own billing history");
            }
        }
        return billRepository.findByPatient(patient, pageable).map(BillMapper::toResponse);
    }

    //download bill pdf :

    @Transactional(readOnly = true)
    public ResponseEntity<byte[]> downloadBillPdf(Integer billId, Authentication authentication) {
        Bill bill = billRepository.findWithDetailsById(billId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found: " + billId));
        assertCanAccessBill(bill, authentication);
        try {
            byte[] pdfBytes = BillPdfGenerator.generate(bill);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "bill-" + billId + ".pdf");
            headers.setContentLength(pdfBytes.length);
            return new ResponseEntity<>(pdfBytes, headers, org.springframework.http.HttpStatus.OK);
        } catch (IOException | DocumentException e) {
            throw new RuntimeException("Failed to generate bill PDF", e);
        }
    }

    @Transactional(readOnly = true)
    public Page<BillResponseDto> getPendingBills(Pageable pageable) {
        return billRepository.findByPaymentStatusesIn(EnumSet.of(PaymentStatuses.PENDING, PaymentStatuses.PARTIALLY_PAID), pageable)
                .map(BillMapper::toResponse);
    }

    private void assertCanAccessBill(Bill bill, Authentication authentication) {
        User user = userRepository.findByUserEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (user.getUserRole() == Roles.PATIENT) {
            if (bill.getPatient() == null || bill.getPatient().getUser() == null
                    || !bill.getPatient().getUser().getUserId().equals(user.getUserId())) {
                throw new AccessDeniedException("You may only access your own bills");
            }
        }
    }

    void recalculateTotals(Bill bill) {
        BigDecimal sub = bill.getBillItems().stream()
                .map(BillItem::getLineTotal)
                .filter(amount -> amount != null)
                .reduce(ZERO, BigDecimal::add);
        bill.setSubTotal(sub); // total without tax
        BigDecimal pct = parseTaxPercent(bill.getTaxPercent());
        BigDecimal tax = sub.multiply(pct).divide(ONE_HUNDRED, 2, RoundingMode.HALF_UP);
        bill.setTaxAmount(tax);
        bill.setTotalAmount(sub.add(tax));
        // check if any amount is paid :
        BigDecimal paid = bill.getAmountPaid() != null ? bill.getAmountPaid() : ZERO;
        BigDecimal balanceDue = bill.getTotalAmount().subtract(paid).max(ZERO);
        bill.setBalanceDue(balanceDue);
        if (paid.compareTo(bill.getTotalAmount()) >= 0 && bill.getTotalAmount().compareTo(ZERO) > 0) {
            bill.setPaymentStatuses(PaymentStatuses.PAID);
            bill.setBalanceDue(ZERO);
        } else if (paid.compareTo(ZERO) > 0) {
            bill.setPaymentStatuses(PaymentStatuses.PARTIALLY_PAID);
        } else {
            bill.setPaymentStatuses(PaymentStatuses.PENDING);
        }
    }

    private BigDecimal parseTaxPercent(String percent) {
        try {
            return new BigDecimal(percent.trim().replace("%", ""));
        } catch (Exception e) {
            return ZERO;
        }
    }

    private static BigDecimal parseInventoryPrice(String price) {
        if (price == null || price.isBlank()) {
            return ZERO;
        }
        try {
            return new BigDecimal(price.trim());
        } catch (NumberFormatException e) {
            return ZERO;
        }
    }
}
