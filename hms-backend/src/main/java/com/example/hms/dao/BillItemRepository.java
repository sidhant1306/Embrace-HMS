package com.example.hms.dao;

import com.example.hms.model.billingModel.BillItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BillItemRepository extends JpaRepository<BillItem, Integer> {
}
