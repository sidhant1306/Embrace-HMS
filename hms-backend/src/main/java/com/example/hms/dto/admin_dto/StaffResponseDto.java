package com.example.hms.dto.admin_dto;

import com.example.hms.enums.Genders;
import com.example.hms.enums.Roles;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffResponseDto {
    private Integer userId;
    private String userName;
    private String userEmail;
    private String userPhone;
    private Genders userGender;
    private Roles userRole;
    private LocalDate dateOfBirth;

    // only populated if user is a DOCTOR
    private Integer doctorId;
    private String doctorSpecialization;
    private String doctorRoom;
    private String doctorWorkingHours;
}
