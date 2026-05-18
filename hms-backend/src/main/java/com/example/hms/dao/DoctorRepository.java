package com.example.hms.dao;

import com.example.hms.model.profileModel.Doctor;
import com.example.hms.model.profileModel.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DoctorRepository extends JpaRepository<Doctor, Integer> {
    Optional<Doctor> findByUser(User user);
}
