package com.example.hms.model.dataModel;

import com.example.hms.enums.Statuses;
import com.example.hms.model.profileModel.Doctor;
import com.example.hms.model.profileModel.Patient;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(
        name = "appointment",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_appointment_doctor_slot",
                columnNames = {"doctor_id", "appointment_date", "appointment_time"}
        )
)
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer appointmentId;
    private String appointmentReason;
    private LocalDate appointmentDate;
    private LocalDateTime appointmentTime;
    @Enumerated(EnumType.STRING)
    private Statuses appointmentStatus;
    private String appointmentDescription;

    private LocalDateTime appointmentCreatedAt;
    private LocalDateTime appointmentUpdatedAt;
    private String appointmentCancelReason;
    // doctor
    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    // patient
    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @OneToOne(mappedBy = "appointment")
    private Consultation consultation;
}
