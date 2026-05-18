package com.example.hms.dao;

import com.example.hms.enums.LabOrderStatuses;
import com.example.hms.model.labModel.LabOrders;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LabOrdersRepository extends JpaRepository<LabOrders, Integer> {
    Page<LabOrders> findByLabOrderStatus(LabOrderStatuses status, Pageable pageable);

    List<LabOrders> findByConsultation_ConsultationId(Integer consultationId);
}
