package com.example.hms.model.billingModel;

import com.example.hms.enums.ItemTypes;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "bill_items")
public class BillItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "item_id")
    private Integer itemId;

    private String itemName;

    @Enumerated(EnumType.STRING)
    private ItemTypes itemType;

    private Integer quantity;

    private Double unitPrice;

    private Double lineTotal;

    @ManyToOne
    @JoinColumn(name = "bill_id")
    private Bill bill;
}
