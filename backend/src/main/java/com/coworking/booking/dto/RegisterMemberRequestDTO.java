package com.coworking.booking.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterMemberRequestDTO {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    private String phone;

    @NotBlank(message = "Password is required")
    private String password;

    private String tier = "BASIC"; // BASIC, PRO, ENTERPRISE
    private String visaCardNumber;
    private String visaCardHolder;
    private String visaCardExpiry;

    // Dealer Registration fields
    private String memberType = "REGISTERED"; // "REGISTERED" or "DEALER"
    private String spaceName;
    private String spaceLocation;
    private String spaceDescription;
    private java.math.BigDecimal roomPricePerHour;
    private Integer roomCapacity;
    private String roomImageUrl;
}
