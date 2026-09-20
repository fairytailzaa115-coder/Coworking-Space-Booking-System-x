package com.coworking.booking.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.Instant;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DoubleBookingConflictException.class)
    public ResponseEntity<Object> handleConflict(DoubleBookingConflictException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                "error", "DOUBLE_BOOKING_COLLISION",
                "message", ex.getMessage(),
                "timestamp", Instant.now()
        ));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Object> handleValidation(MethodArgumentNotValidException ex) {
        String message = "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
        if (ex.getBindingResult() != null && ex.getBindingResult().getFieldError() != null) {
            String field = ex.getBindingResult().getFieldError().getField();
            if ("email".equalsIgnoreCase(field)) {
                message = "อีเมลไม่ถูกต้อง";
            } else if (ex.getBindingResult().getFieldError().getDefaultMessage() != null) {
                message = ex.getBindingResult().getFieldError().getDefaultMessage();
            }
        }
        return ResponseEntity.badRequest().body(Map.of(
                "error", "INVALID_INPUT",
                "message", message,
                "timestamp", Instant.now()
        ));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Object> handleUnreadable(HttpMessageNotReadableException ex) {
        return ResponseEntity.badRequest().body(Map.of(
                "error", "INVALID_INPUT",
                "message", "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
                "timestamp", Instant.now()
        ));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Object> handleBadRequest(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(Map.of(
                "error", "INVALID_INPUT",
                "message", ex.getMessage(),
                "timestamp", Instant.now()
        ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleGeneral(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "INTERNAL_SERVER_ERROR",
                "message", ex.getMessage(),
                "timestamp", Instant.now()
        ));
    }
}