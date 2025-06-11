package com.example.demo.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDateTime;

@Entity
@Table(name = "milk")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Milk {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler", "password", "roles" })
    private User user;

    @NotBlank
    @Column(name = "milk_type")
    private String milkType;

    @NotNull
    @Positive
    private Integer quantity;

    @NotNull
    @Positive
    private Double rate;

    @NotNull
    @Positive
    private Double amount;

    @Column(name = "entry_date")
    private LocalDateTime entryDate;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (entryDate == null) {
            entryDate = LocalDateTime.now();
        }
        // Calculate amount if not set
        if (amount == null && rate != null && quantity != null) {
            amount = rate * quantity;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        // Recalculate amount on update
        if (rate != null && quantity != null) {
            amount = rate * quantity;
        }
    }
}