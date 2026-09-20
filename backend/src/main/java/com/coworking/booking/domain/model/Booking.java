package com.coworking.booking.domain.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
public class Booking {

    @Id
    @Column(name = "booking_id", length = 50)
    private String bookingId;

    @Column(name = "member_id", length = 50, nullable = false)
    private String memberId;

    @Column(name = "room_id", length = 50, nullable = false)
    private String roomId;

    @Column(name = "start_time", nullable = false)
    private Instant startTime;

    @Column(name = "end_time", nullable = false)
    private Instant endTime;

    @Column(name = "duration_hours", nullable = false)
    private BigDecimal durationHours;

    @Column(name = "status", nullable = false)
    private String status = "CONFIRMED";

    @Column(name = "base_price", nullable = false)
    private BigDecimal basePrice;

    @Column(name = "discount_amount", nullable = false)
    private BigDecimal discountAmount;

    @Column(name = "total_price", nullable = false)
    private BigDecimal totalPrice;

    @Column(name = "cancellation_reason")
    private String cancellationReason;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    public Booking(String bookingId, String memberId, String roomId, Instant startTime, Instant endTime,
                   BigDecimal durationHours, BigDecimal basePrice, BigDecimal discountAmount, BigDecimal totalPrice) {
        if (endTime.isBefore(startTime) || endTime.equals(startTime)) {
            throw new IllegalArgumentException("Booking endTime must be strictly after startTime");
        }
        this.bookingId = bookingId;
        this.memberId = memberId;
        this.roomId = roomId;
        this.startTime = startTime;
        this.endTime = endTime;
        this.durationHours = durationHours;
        this.basePrice = basePrice;
        this.discountAmount = discountAmount;
        this.totalPrice = totalPrice;
        this.status = "PENDING";
    }

    public void cancel(String reason) {
        if ("CANCELLED".equals(this.status)) {
            throw new IllegalStateException("Booking is already cancelled.");
        }
        this.status = "CANCELLED";
        this.cancellationReason = reason;
    }

    public boolean overlapsWith(Instant otherStart, Instant otherEnd) {
        return this.startTime.isBefore(otherEnd) && this.endTime.isAfter(otherStart);
    }
}