package com.example.hms.model.profileModel;

import com.example.hms.enums.BloodGroups;
import com.example.hms.model.billingModel.Bill;
import com.example.hms.model.dataModel.Appointment;
import com.example.hms.model.dataModel.Consultation;
import com.example.hms.model.labModel.LabReport;
import com.example.hms.model.pharmacyModel.MedicineIssued;
import com.example.hms.model.prescriptionModel.Prescription;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer patientId;

    @Enumerated(EnumType.STRING)
    private BloodGroups bloodGroup;

    private String patientAddress;

    private String emergencyContact;

    // user
    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "patient")
    private List<Appointment> appointmentList;

    @OneToMany(mappedBy = "patient")
    private List<Consultation> consultationList;

    @OneToMany(mappedBy = "patient")
    private List<Bill> patientBills;

    @OneToMany(mappedBy = "patient")
    private List<Prescription> prescriptionList;

    @OneToMany(mappedBy = "patient")
    private List<LabReport> labReportList;

    @OneToMany(mappedBy = "patient")
    private List<MedicineIssued> medicineIssued;
}
