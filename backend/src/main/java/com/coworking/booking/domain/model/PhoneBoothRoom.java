package com.coworking.booking.domain.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Entity
@DiscriminatorValue("PHONE_BOOTH")
@Getter
@Setter
@NoArgsConstructor
public class PhoneBoothRoom extends Room {

    private Boolean soundproofCertified = true;

    public PhoneBoothRoom(String roomId, String workspaceId, String name, Integer capacity, BigDecimal pricePerHour) {
        super(roomId, workspaceId, name, capacity, pricePerHour);
    }

    @Override
    public BigDecimal calculatePrice(BigDecimal durationHours) {
        BigDecimal base = getPricePerHour().multiply(durationHours);
        if (durationHours.compareTo(new BigDecimal("8.0")) >= 0) {
            base = base.multiply(new BigDecimal("0.80"));
        }
        return base.setScale(2, RoundingMode.HALF_UP);
    }

    @Override
    public String getPricingRuleDescription() {
        return "Acoustic private booth (20% discount on bookings >= 8 hours).";
    }
}