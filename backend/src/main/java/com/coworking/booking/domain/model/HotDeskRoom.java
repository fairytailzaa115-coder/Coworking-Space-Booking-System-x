package com.coworking.booking.domain.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Entity
@DiscriminatorValue("HOT_DESK")
@Getter
@Setter
@NoArgsConstructor
public class HotDeskRoom extends Room {

    private Boolean hasDualMonitors = false;

    public HotDeskRoom(String roomId, String workspaceId, String name, Integer capacity, BigDecimal pricePerHour, Boolean hasDualMonitors) {
        super(roomId, workspaceId, name, capacity, pricePerHour);
        this.hasDualMonitors = hasDualMonitors;
    }

    @Override
    public BigDecimal calculatePrice(BigDecimal durationHours) {
        BigDecimal raw = getPricePerHour().multiply(durationHours);
        // Full day discount: 20% off for 8+ hours
        if (durationHours.compareTo(new BigDecimal("8.0")) >= 0) {
            return raw.multiply(new BigDecimal("0.80")).setScale(2, RoundingMode.HALF_UP);
        }
        return raw.setScale(2, RoundingMode.HALF_UP);
    }

    @Override
    public String getPricingRuleDescription() {
        return "Standard hourly rate. 20% discount on bookings >= 8 hours.";
    }
}