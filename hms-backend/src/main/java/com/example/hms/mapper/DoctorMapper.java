package com.example.hms.mapper;

import com.example.hms.dto.doctor_dto.DoctorResponseDto;
import com.example.hms.model.profileModel.Doctor;

public final class DoctorMapper {

    private DoctorMapper() {
    }

    public static DoctorResponseDto toResponse(Doctor d) {
        if (d == null) {
            return null;
        }
        return DoctorResponseDto.builder()
                .doctorId(d.getDoctorId())
                .userEmail(d.getUser() != null ? d.getUser().getUserEmail() : null)
                .doctorName(d.getUser() != null ? d.getUser().getUserName() : null)
                .doctorPhone(d.getUser() != null ? d.getUser().getUserPhone() : null)
                .doctorGender(d.getUser() != null ? d.getUser().getUserGender() : null)
                .doctorImage(d.getUser() != null ? d.getUser().getUserImage() : null)
                .doctorSpecialization(d.getDoctorSpecialization())
                .doctorRoom(d.getDoctorRoom())
                .doctorWorkingHours(d.getDoctorWorkingHours())
                .build();
    }
}
