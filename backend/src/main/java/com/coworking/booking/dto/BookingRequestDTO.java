package com.coworking.booking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.Instant;

@Data
public class BookingRequestDTO {
    @NotBlank
    private String memberId;
    @NotBlank
    private String roomId;
    @NotNull
    private Instant startTime;
    @NotNull
    private Instant endTime;
}