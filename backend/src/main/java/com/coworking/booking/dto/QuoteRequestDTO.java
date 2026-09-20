package com.coworking.booking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.Instant;

@Data
public class QuoteRequestDTO {
    @NotBlank
    private String roomId;
    @NotBlank
    private String memberId;
    @NotNull
    private Instant startTime;
    @NotNull
    private Instant endTime;
}