package com.example.hms.dto.patient_dto;

import com.example.hms.enums.Genders;
import jakarta.persistence.Column;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
public class CreatePatientDto {
    @NotNull
    private String name;
    @NotNull
    @Column(unique = true)
    private String email;
    @NotNull
    private String password;
    @NotNull
    private Genders gender;
    @NotNull
    private String phone;
    private String image;

    @NotNull
    private String age;
    @NotNull
    private String address;
    @NotNull
    private String emergencyContact;
    private String bloodGroup;
}
