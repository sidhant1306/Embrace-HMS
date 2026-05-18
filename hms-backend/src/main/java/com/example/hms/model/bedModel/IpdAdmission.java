package com.example.hms.model.bedModel;

import com.example.hms.enums.AdmissionStatus;
import com.example.hms.model.profileModel.Patient;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "ipd_admissions")
@NoArgsConstructor
@AllArgsConstructor
public class IpdAdmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer admissionId;

    @ManyToOne(optional = false)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @ManyToOne(optional = false)
    @JoinColumn(name = "bed_id")
    private Bed bed;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AdmissionStatus status = AdmissionStatus.ACTIVE;

    private LocalDateTime admittedAt;

    private LocalDateTime dischargedAt;

    @Column(length = 8000)
    private String dischargeSummary;
}
