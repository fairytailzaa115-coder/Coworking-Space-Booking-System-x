package com.coworking.booking.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
public class MemberResponseDTO {
    private String memberId;
    private String name;
    private String email;
    private String phone;
    private String memberType;
    private String membershipTier;
    private BigDecimal discountRate;
    private Integer maxMonthlyHours;
    private Integer rewardPoints;
    private Instant registeredAt;
    private boolean admin;
    private String visaCardNumber;
    private String visaCardHolder;
    private String visaCardExpiry;
    private String spaceName;
    private String spaceLocation;
    private String dealerWorkspaceId;
    private String dealerRoomId;
}
