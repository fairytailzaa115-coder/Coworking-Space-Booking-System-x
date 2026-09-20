package com.coworking.booking.controller;

import com.coworking.booking.domain.model.Booking;
import com.coworking.booking.domain.model.Room;
import com.coworking.booking.domain.model.Workspace;
import com.coworking.booking.dto.*;
import com.coworking.booking.service.IBookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class BookingController {

    private final IBookingService bookingService;
    private final com.coworking.booking.service.LineNotificationService lineNotificationService;

    // --- Workspaces & Rooms ---
    @GetMapping("/workspaces")
    public ResponseEntity<List<Workspace>> getWorkspaces() {
        return ResponseEntity.ok(bookingService.getAllWorkspaces());
    }

    @GetMapping("/workspaces/{workspaceId}/rooms")
    public ResponseEntity<List<Room>> getRooms(@PathVariable String workspaceId) {
        return ResponseEntity.ok(bookingService.getRoomsByWorkspace(workspaceId));
    }

    // --- Quotations & Dynamic Pricing ---
    @PostMapping("/bookings/quote")
    public ResponseEntity<QuoteResponseDTO> getQuote(@Valid @RequestBody QuoteRequestDTO request) {
        return ResponseEntity.ok(bookingService.calculateQuote(request));
    }

    // --- Bookings Management ---
    @PostMapping("/bookings")
    public ResponseEntity<Booking> createBooking(@Valid @RequestBody BookingRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bookingService.createBooking(request));
    }

    @PostMapping("/bookings/{bookingId}/cancel")
    public ResponseEntity<Booking> cancelBooking(@PathVariable String bookingId,
                                                @RequestBody Map<String, String> body) {
        String memberId = body.getOrDefault("memberId", "MEM-001");
        String reason = body.getOrDefault("reason", "Cancelled by user");
        return ResponseEntity.ok(bookingService.cancelBooking(bookingId, memberId, reason));
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/members/{memberId}/bookings")
    public ResponseEntity<List<Booking>> getMemberBookings(@PathVariable String memberId) {
        return ResponseEntity.ok(bookingService.getMemberBookings(memberId));
    }

    @GetMapping("/admin/{adminMemberId}/bookings/pending")
    public ResponseEntity<List<Booking>> getPendingBookings(@PathVariable String adminMemberId) {
        return ResponseEntity.ok(bookingService.getPendingBookings(adminMemberId));
    }

    @PostMapping("/bookings/{bookingId}/approve")
    public ResponseEntity<Booking> approveBooking(@PathVariable String bookingId,
                                                  @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(bookingService.approveBooking(bookingId, body.get("adminMemberId")));
    }

    @PostMapping("/bookings/{bookingId}/reject")
    public ResponseEntity<Booking> rejectBooking(@PathVariable String bookingId,
                                                 @RequestBody Map<String, String> body) {
        String adminMemberId = body.get("adminMemberId");
        String reason = body.getOrDefault("reason", "Cancelled by admin");
        return ResponseEntity.ok(bookingService.rejectBooking(bookingId, adminMemberId, reason));
    }

    // --- Member Registration & Profiles (PostgreSQL Persistence) ---
    @PostMapping("/members/register")
    public ResponseEntity<MemberResponseDTO> registerMember(@Valid @RequestBody RegisterMemberRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bookingService.registerMember(request));
    }

    @PostMapping("/members/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        return ResponseEntity.ok(bookingService.login(request));
    }

    @GetMapping("/members/{memberId}")
    public ResponseEntity<MemberResponseDTO> getMemberProfile(@PathVariable String memberId) {
        return ResponseEntity.ok(bookingService.getMemberProfile(memberId));
    }

    @PutMapping("/members/{memberId}")
    public ResponseEntity<MemberResponseDTO> updateMemberProfile(@PathVariable String memberId,
                                                                @Valid @RequestBody UpdateMemberRequestDTO request) {
        return ResponseEntity.ok(bookingService.updateMemberProfile(memberId, request));
    }

    // --- LINE Notification Settings (Admin Only) ---
    @GetMapping("/admin/settings/line")
    public ResponseEntity<com.coworking.booking.domain.model.LineSetting> getLineSettings() {
        return ResponseEntity.ok(lineNotificationService.getSettings());
    }

    @PutMapping("/admin/settings/line")
    public ResponseEntity<com.coworking.booking.domain.model.LineSetting> updateLineSettings(
            @RequestBody com.coworking.booking.domain.model.LineSetting settings) {
        return ResponseEntity.ok(lineNotificationService.updateSettings(settings));
    }

    @PostMapping("/admin/settings/line/test")
    public ResponseEntity<Map<String, Object>> testLineNotification() {
        com.coworking.booking.domain.model.LineSetting s = lineNotificationService.getSettings();
        return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "message", "ทดสอบส่งข้อมูลการตั้งค่า LINE เรียบร้อยแล้ว",
                "sendMode", s.getSendMode(),
                "enabled", s.isEnabled()
        ));
    }
}
