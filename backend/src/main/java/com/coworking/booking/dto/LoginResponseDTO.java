package com.coworking.booking.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginResponseDTO {
    private String memberId;
    private String name;
    private String email;
    private String memberType;
    private String membershipTier;
    private java.math.BigDecimal discountRate;
    private Integer maxMonthlyHours;
    private Integer rewardPoints;
    private boolean admin;
    private String visaCardNumber;
    private String visaCardHolder;
    private String visaCardExpiry;
}
