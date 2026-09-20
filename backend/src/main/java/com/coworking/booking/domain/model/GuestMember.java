package com.coworking.booking.domain.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@DiscriminatorValue("GUEST")
@Getter
@Setter
@NoArgsConstructor
public class GuestMember extends Member {

    private String temporaryToken;

    public GuestMember(String memberId, String name, String email, String phone, Membership membership, String temporaryToken) {
        super(memberId, name, email, phone, membership);
        this.temporaryToken = temporaryToken;
    }

    @Override
    public boolean canBook() {
        return temporaryToken != null && !temporaryToken.isBlank();
    }
}