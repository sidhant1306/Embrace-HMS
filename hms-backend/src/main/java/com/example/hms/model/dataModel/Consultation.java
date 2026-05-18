package com.example.hms.model.dataModel;

import com.example.hms.enums.Statuses;
import com.example.hms.model.billingModel.Bill;
import com.example.hms.model.labModel.LabOrders;
import com.example.hms.model.prescriptionModel.Prescription;
import com.example.hms.model.profileModel.Doctor;
import com.example.hms.model.profileModel.Patient;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@Entity
@AllArgsConstructor
public class Consultation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer consultationId;

    private String consultationComplaint;

    private String consultationDiagnosis;

    private String consultationNotes;

    @Enumerated(EnumType.STRING)
    private Statuses consultationStatus;

    private LocalDateTime consultationCreatedAt;

    private LocalDateTime consultationUpdatedAt;

    @OneToOne
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;

    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @OneToMany(mappedBy = "consultation")
    private List<Prescription> prescription;

    @OneToMany(mappedBy = "consultation")
    private List<LabOrders> labOrders;

    @OneToOne(mappedBy = "consultation")
    private Bill bill;


}

