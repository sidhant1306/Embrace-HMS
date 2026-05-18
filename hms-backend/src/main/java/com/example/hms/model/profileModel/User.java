package com.example.hms.model.profileModel;

import com.example.hms.enums.Genders;
import com.example.hms.enums.Roles;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Data
@Entity
@Table(name = "users")
public class User {
    // receptionist, doctor, patient, admin, pharmacist

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer userId;

    private String userName;

    @Column(unique = true, nullable = false)
    private String userEmail;

    private String userPassword;

    @Column(unique = true)
    private String userPhone;

    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    private Genders userGender;

    private String userImage;

    @Enumerated(EnumType.STRING)
    private Roles userRole;
}
