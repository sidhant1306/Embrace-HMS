package com.example.hms.dto.bed_dto;

import com.example.hms.enums.BedStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BedStatusUpdateDto {

    @NotNull
    private BedStatus status;
}
