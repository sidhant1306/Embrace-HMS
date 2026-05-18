package com.example.hms.dto.bed_dto;

import com.example.hms.enums.BedStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BedResponseDto {
    private Integer bedId;
    private String bedNumber;
    private String wardName;
    private BedStatus status;
    private Integer dailyRatePaise;
}
