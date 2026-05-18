package com.example.hms.dto.doctor_dto;

import com.example.hms.enums.Genders;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorResponseDto {
    private Integer doctorId;
    private String userEmail;
    private String doctorName;
    private String doctorPhone;
    private Genders doctorGender;
    private String doctorImage;
    private String doctorSpecialization;
    private String doctorRoom;
    private String doctorWorkingHours;
}
