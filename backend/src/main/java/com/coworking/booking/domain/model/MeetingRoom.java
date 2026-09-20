package com.coworking.booking.domain.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Entity
@DiscriminatorValue("MEETING_ROOM")
@Getter
@Setter
@NoArgsConstructor
public class MeetingRoom extends Room {

    private Boolean hasVideoConference = true;
    private Boolean hasWhiteboard = true;
    private BigDecimal equipmentFee = new BigDecimal("150.00");

    public MeetingRoom(String roomId, String workspaceId, String name, Integer capacity, BigDecimal pricePerHour, BigDecimal equipmentFee) {
        super(roomId, workspaceId, name, capacity, pricePerHour);
        this.equipmentFee = equipmentFee != null ? equipmentFee : new BigDecimal("150.00");
    }

    @Override
    public BigDecimal calculatePrice(BigDecimal durationHours) {
        BigDecimal base = getPricePerHour().multiply(durationHours);
        if (durationHours.compareTo(new BigDecimal("8.0")) >= 0) {
            base = base.multiply(new BigDecimal("0.80"));
        }
        return base.add(this.equipmentFee).setScale(2, RoundingMode.HALF_UP);
    }

    @Override
    public String getPricingRuleDescription() {
        return "Hourly rate (20% off for 8+ hours) + fixed 150 THB AV Equipment & Setup Fee.";
    }
}