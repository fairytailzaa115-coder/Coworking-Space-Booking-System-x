package com.coworking.booking.domain.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@DiscriminatorValue("REGISTERED")
@Getter
@Setter
@NoArgsConstructor
public class RegisteredMember extends Member {

    private Integer rewardPoints = 0;

    public RegisteredMember(String memberId, String name, String email, String phone, Membership membership, Integer rewardPoints) {
        super(memberId, name, email, phone, membership);
        this.rewardPoints = rewardPoints != null ? rewardPoints : 0;
    }

    @Override
    public boolean canBook() {
        return true;
    }

    public void addRewardPoints(int points) {
        this.rewardPoints += Math.max(0, points);
    }
}