package com.example.hms.dto.appointment_dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CancelOwnAppointmentDto {

    @NotBlank
    @Size(max = 2000)
    private String reason;
}
