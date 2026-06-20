package com.example.hms.model.billingModel;

import com.example.hms.enums.ItemTypes;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

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

    private BigDecimal unitPrice;

    private BigDecimal lineTotal;

    @ManyToOne
    @JoinColumn(name = "bill_id")
    private Bill bill;
}
