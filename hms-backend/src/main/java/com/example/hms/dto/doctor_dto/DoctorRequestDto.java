package com.example.hms.dto.doctor_dto;

import com.example.hms.enums.Genders;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorRequestDto {

    @NotBlank
    @Size(max = 120)
    private String name;

    @NotBlank
    @Email
    @Size(max = 255)
    private String email;

    @NotBlank
    @Size(min = 8, max = 128)
    private String password;

    @NotBlank
    @Size(max = 20)
    private String phone;

    @NotNull
    private Genders gender;

    @Size(max = 2000)
    private String image;

    @NotBlank
    @Size(max = 255)
    private String specialization;

    @NotBlank
    @Size(max = 64)
    private String room;

    @NotBlank
    @Size(max = 255)
    private String workingHours;
}
