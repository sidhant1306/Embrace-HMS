package com.example.hms.model.profileModel;
import com.example.hms.model.dataModel.Appointment;
import com.example.hms.model.dataModel.Consultation;
import com.example.hms.model.pharmacyModel.MedicineIssued;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
public class Doctor {
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Id
    private Integer doctorId;

    private String doctorSpecialization;

    private String doctorRoom;

    private String doctorWorkingHours;

    // user
    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "doctor")
    private List<Appointment> appointmentList;

    @OneToMany(mappedBy = "doctor")
    private List<Consultation> consultationList;

    @OneToMany(mappedBy = "doctor")
    private List<MedicineIssued> medicineIssued;
}

