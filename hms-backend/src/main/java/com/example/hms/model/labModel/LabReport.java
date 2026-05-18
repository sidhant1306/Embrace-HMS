package com.example.hms.model.labModel;

import com.example.hms.model.profileModel.Patient;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
public class LabReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer labReportId;

    private String reportFilePath;
    private String doctorNotes;
    private boolean isViewedByDoctor;
    private boolean isViewedByPatient;
    private LocalDateTime uploadedAt;

    @OneToOne
    @JoinColumn(name = "lab_order_id")
    private LabOrders labOrder;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;
}
