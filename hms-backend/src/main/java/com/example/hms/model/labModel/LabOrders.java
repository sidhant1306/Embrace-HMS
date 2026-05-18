package com.example.hms.model.labModel;

import com.example.hms.enums.LabOrderStatuses;
import com.example.hms.enums.LabOrderUrgency;
import com.example.hms.model.dataModel.Consultation;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
public class LabOrders {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer labOrderId;

    private String labOrderNumber;
    private String labOrderTestName;
    @Enumerated(EnumType.STRING)
    private LabOrderUrgency labOrderTestUrgency;
    @Enumerated(EnumType.STRING)
    private LabOrderStatuses labOrderStatus;
    private String labOrderNotes;
    private LocalDateTime labOrderCreatedAt;
    private LocalDateTime labOrderUpdatedAt;

    /** Price in paise; if null, billing uses default from configuration */
    private Integer pricePaise;

    @JoinColumn(name = "consultation_id")
    @ManyToOne
    private Consultation consultation;

    @OneToOne(mappedBy = "labOrder")
    private LabReport labReport;
}
