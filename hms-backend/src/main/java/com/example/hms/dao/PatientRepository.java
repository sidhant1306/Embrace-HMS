package com.example.hms.dao;

import com.example.hms.model.profileModel.Patient;
import com.example.hms.model.profileModel.User;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient, Integer> {
    Optional<Patient> findByUser_UserEmail(String userEmail);
    Optional<Patient> findByUser(User user);

    @Query("SELECT p FROM Patient p JOIN p.user u WHERE " +
           "LOWER(u.userName) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "u.userEmail LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "u.userPhone LIKE CONCAT('%', :q, '%')")
    List<Patient> searchPatients(@Param("q") String query);
}
