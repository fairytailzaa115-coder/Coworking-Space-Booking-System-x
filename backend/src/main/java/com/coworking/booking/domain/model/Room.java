package com.coworking.booking.domain.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * ABSTRACTION & INHERITANCE (Base Class for Polymorphism)
 */
@Entity
@Table(name = "rooms")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "room_type", discriminatorType = DiscriminatorType.STRING)
@Getter
@Setter
@NoArgsConstructor
public abstract class Room {

    @Id
    @Column(name = "room_id", length = 50)
    private String roomId;

    @Column(name = "workspace_id", length = 50, nullable = false)
    private String workspaceId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "capacity", nullable = false)
    private Integer capacity;

    @Column(name = "price_per_hour", nullable = false)
    private BigDecimal pricePerHour;

    @Column(name = "status", nullable = false)
    private String status = "AVAILABLE";

    @Column(name = "image_url")
    private String imageUrl;

    public Room(String roomId, String workspaceId, String name, Integer capacity, BigDecimal pricePerHour) {
        if (capacity <= 0) throw new IllegalArgumentException("Room capacity must be > 0");
        if (pricePerHour.compareTo(BigDecimal.ZERO) < 0) throw new IllegalArgumentException("Price cannot be negative");
        this.roomId = roomId;
        this.workspaceId = workspaceId;
        this.name = name;
        this.capacity = capacity;
        this.pricePerHour = pricePerHour;
    }

    /**
     * POLYMORPHIC ABSTRACT METHOD
     * Overridden by each room subclass to apply unique business pricing rules.
     */
    public abstract BigDecimal calculatePrice(BigDecimal durationHours);

    public abstract String getPricingRuleDescription();
}