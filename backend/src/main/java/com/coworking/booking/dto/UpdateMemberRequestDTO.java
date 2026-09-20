package com.coworking.booking.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateMemberRequestDTO {

    @NotBlank(message = "Name is required")
    private String name;

    private String phone;

    private String tier; // BASIC, PRO, ENTERPRISE
    private String visaCardNumber;
    private String visaCardHolder;
    private String visaCardExpiry;
}
