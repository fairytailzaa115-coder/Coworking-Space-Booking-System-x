package com.coworking.booking.service;

import com.coworking.booking.domain.model.Booking;
import com.coworking.booking.domain.model.Room;
import com.coworking.booking.domain.model.Workspace;
import com.coworking.booking.dto.*;

import java.util.List;

public interface IBookingService {
    List<Workspace> getAllWorkspaces();
    List<Room> getRoomsByWorkspace(String workspaceId);
    QuoteResponseDTO calculateQuote(QuoteRequestDTO request);
    Booking createBooking(BookingRequestDTO request);
    Booking cancelBooking(String bookingId, String memberId, String reason);
    List<Booking> getMemberBookings(String memberId);
    List<Booking> getAllBookings();
    List<Booking> getPendingBookings(String adminMemberId);
    Booking approveBooking(String bookingId, String adminMemberId);
    Booking rejectBooking(String bookingId, String adminMemberId, String reason);

    // Member Registration & Management
    MemberResponseDTO registerMember(RegisterMemberRequestDTO request);
    MemberResponseDTO getMemberProfile(String memberId);
    MemberResponseDTO updateMemberProfile(String memberId, UpdateMemberRequestDTO request);
    LoginResponseDTO login(LoginRequestDTO request);

    // Room Management
    List<Room> getAllRooms();
    Room createMeetingRoom(java.util.Map<String, Object> payload);
    Room updateRoom(String roomId, java.util.Map<String, Object> payload);

    // Membership Management
    List<com.coworking.booking.domain.model.Membership> getAllMemberships();
    com.coworking.booking.domain.model.Membership updateMembership(String tier, java.util.Map<String, Object> payload);

    // Dealer Management
    java.util.Map<String, Object> getDealerSpace(String memberId);
    java.util.Map<String, Object> updateDealerSpace(String memberId, java.util.Map<String, Object> payload);
    Room addDealerRoom(String memberId, java.util.Map<String, Object> payload);
    void deleteDealerRoom(String memberId, String roomId);
}
