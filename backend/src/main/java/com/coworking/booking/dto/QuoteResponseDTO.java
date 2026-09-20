package com.coworking.booking.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class QuoteResponseDTO {
    private String roomId;
    private String roomName;
    private BigDecimal durationHours;
    private BigDecimal basePricePerHour;
    private BigDecimal basePrice;
    private String discountRateTier;
    private BigDecimal discountRate;
    private BigDecimal discountAmount;
    private BigDecimal totalPrice;
}