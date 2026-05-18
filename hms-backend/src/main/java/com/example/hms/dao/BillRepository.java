package com.example.hms.dao;

import com.example.hms.enums.PaymentStatuses;
import com.example.hms.model.billingModel.Bill;
import com.example.hms.model.profileModel.Patient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.Optional;

public interface BillRepository extends JpaRepository<Bill, Integer> {

    @EntityGraph(attributePaths = {"billItems", "patient", "consultation"})
    @Query("SELECT b FROM Bill b WHERE b.billId = :id")
    Optional<Bill> findWithDetailsById(@Param("id") Integer id);

    Page<Bill> findByPatient(Patient patient, Pageable pageable);

    Optional<Bill> findByConsultation_ConsultationId(Integer consultationId);

    Page<Bill> findByPaymentStatuses(PaymentStatuses paymentStatuses, Pageable pageable);

    Page<Bill> findByPaymentStatusesIn(Collection<PaymentStatuses> paymentStatuses, Pageable pageable);
}