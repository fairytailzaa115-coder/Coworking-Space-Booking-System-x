package com.coworking.booking.domain.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "members")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "member_type", discriminatorType = DiscriminatorType.STRING)
@Getter
@Setter
@NoArgsConstructor
public abstract class Member {

    @Id
    @Column(name = "member_id", length = 50)
    private String memberId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "email", unique = true, nullable = false)
    private String email;

    @Column(name = "phone")
    private String phone;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "is_admin", nullable = false)
    private boolean admin;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "membership_id", nullable = false)
    private Membership membership;

    @Column(name = "registered_at")
    private Instant registeredAt = Instant.now();

    @Column(name = "visa_card_number")
    private String visaCardNumber;

    @Column(name = "visa_card_holder")
    private String visaCardHolder;

    @Column(name = "visa_card_expiry")
    private String visaCardExpiry;

    public Member(String memberId, String name, String email, String phone, Membership membership) {
        this.memberId = memberId;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.membership = membership;
    }

    public abstract boolean canBook();
}