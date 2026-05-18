package com.example.hms.model.bedModel;

import com.example.hms.enums.BedStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "beds", uniqueConstraints = {
        @UniqueConstraint(name = "uk_bed_ward_number", columnNames = {"ward_name", "bed_number"})
})
@NoArgsConstructor
@AllArgsConstructor
public class Bed {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer bedId;

    @Column(nullable = false)
    private String bedNumber;

    @Column(nullable = false)
    private String wardName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BedStatus status = BedStatus.AVAILABLE;

    /** Daily bed charge in paise (for reference / future billing) */
    private Integer dailyRatePaise;
}
