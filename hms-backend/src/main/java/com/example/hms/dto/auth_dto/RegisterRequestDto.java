package com.example.hms.dto.auth_dto;

import com.example.hms.enums.Genders;
import com.example.hms.enums.Roles;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequestDto {

    @NotBlank
    @Size(max = 120)
    private String userName;

    @NotBlank
    @Email
    @Size(max = 255)
    private String userEmail;

    @NotBlank
    @Size(min = 8, max = 128)
    private String userPassword;

    @Size(max = 20)
    private String userPhone;

    private LocalDate dateOfBirth;

    private Genders userGender;
    private Roles userRole;
}
