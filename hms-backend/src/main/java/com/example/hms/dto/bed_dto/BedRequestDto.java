package com.example.hms.dto.bed_dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BedRequestDto {

    @NotBlank
    @Size(max = 32)
    private String bedNumber;

    @NotBlank
    @Size(max = 120)
    private String wardName;

    @PositiveOrZero
    private Integer dailyRatePaise;
}
