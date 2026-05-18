package com.example.hms.model.prescriptionModel;

import com.example.hms.enums.PrescriptionStatuses;
import com.example.hms.model.dataModel.Appointment;
import com.example.hms.model.dataModel.Consultation;
import com.example.hms.model.pharmacyModel.MedicineIssued;
import com.example.hms.model.profileModel.Patient;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer prescriptionId;

    private String prescriptionNumber;

    @Enumerated(EnumType.STRING)
    private PrescriptionStatuses prescriptionStatus;

    private String prescriptionNotes;

    @CreationTimestamp
    private LocalDateTime prescriptionCreatedAt;

    private LocalDateTime prescriptionUpdatedAt;

    @JoinColumn(name = "consultation_id")
    @ManyToOne
    private Consultation consultation;

    @JoinColumn(name = "patient_id")
    @ManyToOne
    private Patient patient;

    @OneToMany(mappedBy = "prescription")
    private List<PrescriptionItem> prescriptionItem;

    @OneToMany(mappedBy = "prescription")
    private List<MedicineIssued> medicineIssued;


}
