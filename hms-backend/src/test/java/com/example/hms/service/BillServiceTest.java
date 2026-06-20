package com.example.hms.service;

import com.example.hms.dao.BillRepository;
import com.example.hms.dao.ConsultationRepository;
import com.example.hms.dao.LabOrdersRepository;
import com.example.hms.dao.MedicineInventoryRepository;
import com.example.hms.dao.PatientRepository;
import com.example.hms.dao.PrescriptionRepository;
import com.example.hms.dao.UserRepository;
import com.example.hms.dto.billing_dto.GenerateBillRequestDto;
import com.example.hms.dto.billing_dto.PaymentRequestDto;
import com.example.hms.enums.ItemTypes;
import com.example.hms.enums.PaymentMethod;
import com.example.hms.enums.PaymentStatuses;
import com.example.hms.enums.Statuses;
import com.example.hms.exception.AlreadyExistsException;
import com.example.hms.model.billingModel.Bill;
import com.example.hms.model.billingModel.BillItem;
import com.example.hms.model.dataModel.Consultation;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BillServiceTest {

    @Mock
    private BillRepository billRepository;

    @Mock
    private ConsultationRepository consultationRepository;

    @Mock
    private PrescriptionRepository prescriptionRepository;

    @Mock
    private LabOrdersRepository labOrdersRepository;

    @Mock
    private MedicineInventoryRepository medicineInventoryRepository;

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private BillService billService;

    @Test
    void generateBillThrowsAlreadyExistsExceptionWhenBillAlreadyExistsForConsultation() {
        Consultation consultation = consultation(10, Statuses.COMPLETED);
        when(consultationRepository.findById(10)).thenReturn(Optional.of(consultation));
        when(billRepository.findByConsultation_ConsultationId(10)).thenReturn(Optional.of(new Bill()));

        assertThrows(AlreadyExistsException.class,
                () -> billService.generateBill(new GenerateBillRequestDto(10)));

        verify(billRepository, never()).save(any(Bill.class));
    }

    @Test
    void generateBillThrowsIllegalStateExceptionWhenConsultationIsNotCompleted() {
        Consultation consultation = consultation(11, Statuses.PENDING);
        when(consultationRepository.findById(11)).thenReturn(Optional.of(consultation));

        assertThrows(IllegalStateException.class,
                () -> billService.generateBill(new GenerateBillRequestDto(11)));

        verify(billRepository, never()).findByConsultation_ConsultationId(any());
        verify(billRepository, never()).save(any(Bill.class));
    }

    @Test
    void makePaymentSetsStatusToPaidWhenPaymentCoversFullAmount() {
        Bill bill = billWithTotal("1000.00", "100.00");
        when(billRepository.findWithDetailsById(1)).thenReturn(Optional.of(bill));
        when(billRepository.save(any(Bill.class))).thenAnswer(invocation -> invocation.getArgument(0));

        billService.makePayment(1, new PaymentRequestDto(new BigDecimal("900.00"), PaymentMethod.CASH));

        assertEquals(PaymentStatuses.PAID, bill.getPaymentStatuses());
        assertEquals(new BigDecimal("1000.00"), bill.getAmountPaid());
        assertEquals(BigDecimal.ZERO, bill.getBalanceDue());
    }

    @Test
    void makePaymentSetsStatusToPartiallyPaidWhenPaymentIsPartial() {
        Bill bill = billWithTotal("1000.00", "100.00");
        when(billRepository.findWithDetailsById(1)).thenReturn(Optional.of(bill));
        when(billRepository.save(any(Bill.class))).thenAnswer(invocation -> invocation.getArgument(0));

        billService.makePayment(1, new PaymentRequestDto(new BigDecimal("250.00"), PaymentMethod.UPI));

        assertEquals(PaymentStatuses.PARTIALLY_PAID, bill.getPaymentStatuses());
        assertEquals(new BigDecimal("350.00"), bill.getAmountPaid());
        assertEquals(new BigDecimal("650.00"), bill.getBalanceDue());
    }

    @Test
    void recalculateTotalsCalculatesTaxAndTotalForFivePercentTax() {
        Bill bill = new Bill();
        bill.setTaxPercent("5");
        bill.setAmountPaid(BigDecimal.ZERO);
        bill.setBillItems(new ArrayList<>());
        bill.getBillItems().add(billItem("1000.00"));
        bill.getBillItems().add(billItem("500.00"));

        billService.recalculateTotals(bill);

        assertEquals(new BigDecimal("1500.00"), bill.getSubTotal());
        assertEquals(new BigDecimal("75.00"), bill.getTaxAmount());
        assertEquals(new BigDecimal("1575.00"), bill.getTotalAmount());
        assertEquals(new BigDecimal("1575.00"), bill.getBalanceDue());
        assertEquals(PaymentStatuses.PENDING, bill.getPaymentStatuses());
    }

    private static Consultation consultation(Integer id, Statuses status) {
        Consultation consultation = new Consultation();
        consultation.setConsultationId(id);
        consultation.setConsultationStatus(status);
        return consultation;
    }

    private static Bill billWithTotal(String totalAmount, String amountPaid) {
        Bill bill = new Bill();
        bill.setTotalAmount(new BigDecimal(totalAmount));
        bill.setAmountPaid(new BigDecimal(amountPaid));
        bill.setBillItems(new ArrayList<>());
        return bill;
    }

    private static BillItem billItem(String lineTotal) {
        BillItem item = new BillItem();
        item.setItemName("Test line");
        item.setItemType(ItemTypes.EXTRA);
        item.setQuantity(1);
        item.setUnitPrice(new BigDecimal(lineTotal));
        item.setLineTotal(new BigDecimal(lineTotal));
        return item;
    }
}
