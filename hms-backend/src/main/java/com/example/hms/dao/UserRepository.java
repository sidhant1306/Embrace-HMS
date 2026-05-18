package com.example.hms.dao;

import com.example.hms.enums.Roles;
import com.example.hms.model.profileModel.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByUserEmail(String userEmail);
    boolean existsByUserEmail(String userEmail);
    boolean existsByUserPhone(String userPhone);

    // admin staff management queries
    Page<User> findByUserRoleNot(Roles role, Pageable pageable);
    Page<User> findByUserRole(Roles role, Pageable pageable);
    Page<User> findByUserRoleNotAndUserNameContainingIgnoreCase(Roles role, String name, Pageable pageable);
    Page<User> findByUserRoleAndUserNameContainingIgnoreCase(Roles role, String name, Pageable pageable);
}

