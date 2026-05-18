package com.example.hms.dao;

import com.example.hms.enums.BedStatus;
import com.example.hms.model.bedModel.Bed;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BedRepository extends JpaRepository<Bed, Integer> {

    @Query("""
            SELECT b FROM Bed b
            WHERE (:status IS NULL OR b.status = :status)
            AND (:ward IS NULL OR :ward = '' OR LOWER(b.wardName) = LOWER(:ward))
            """)
    Page<Bed> findFiltered(@Param("status") BedStatus status, @Param("ward") String ward, Pageable pageable);
}
