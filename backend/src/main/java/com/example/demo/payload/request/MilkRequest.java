package com.example.demo.payload.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MilkRequest {
    @NotBlank(message = "Milk type is required")
    private String milkType;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private Integer quantity;

    @NotNull(message = "Rate is required")
    @Positive(message = "Rate must be positive")
    private Double rate;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private Double amount;

    private LocalDateTime entryDate;

    @NotNull(message = "User ID is required")
    private Long userId;
}