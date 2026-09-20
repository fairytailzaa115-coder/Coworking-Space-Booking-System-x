package com.coworking.booking.domain.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Entity
@DiscriminatorValue("PRIVATE_OFFICE")
@Getter
@Setter
@NoArgsConstructor
public class PrivateOfficeRoom extends Room {

    private Integer dedicatedDesks = 4;
    private Boolean hasLocker = true;

    public PrivateOfficeRoom(String roomId, String workspaceId, String name, Integer capacity, BigDecimal pricePerHour, Integer dedicatedDesks) {
        super(roomId, workspaceId, name, capacity, pricePerHour);
        this.dedicatedDesks = dedicatedDesks;
    }

    @Override
    public BigDecimal calculatePrice(BigDecimal durationHours) {
        BigDecimal billedHours = durationHours.max(new BigDecimal("2.0")); // Minimum 2 hours
        BigDecimal raw = getPricePerHour().multiply(billedHours);
        if (durationHours.compareTo(new BigDecimal("24.0")) >= 0) {
            return raw.multiply(new BigDecimal("0.75")).setScale(2, RoundingMode.HALF_UP); // 25% off multi-day
        } else if (durationHours.compareTo(new BigDecimal("8.0")) >= 0) {
            return raw.multiply(new BigDecimal("0.80")).setScale(2, RoundingMode.HALF_UP); // 20% off full day
        }
        return raw.setScale(2, RoundingMode.HALF_UP);
    }

    @Override
    public String getPricingRuleDescription() {
        return "Minimum 2 hours billing. 20% discount for 8+ hours, 25% for 24+ hours.";
    }
}