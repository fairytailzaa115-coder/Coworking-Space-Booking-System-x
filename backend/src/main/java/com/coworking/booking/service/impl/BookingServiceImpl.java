package com.coworking.booking.service.impl;

import com.coworking.booking.domain.model.*;
import com.coworking.booking.dto.*;
import com.coworking.booking.exception.DoubleBookingConflictException;
import com.coworking.booking.repository.BookingRepository;
import com.coworking.booking.repository.MemberRepository;
import com.coworking.booking.repository.MembershipRepository;
import com.coworking.booking.repository.RoomRepository;
import com.coworking.booking.repository.WorkspaceRepository;
import com.coworking.booking.service.IBookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements IBookingService {

    private final WorkspaceRepository workspaceRepository;
    private final RoomRepository roomRepository;
    private final MemberRepository memberRepository;
    private final MembershipRepository membershipRepository;
    private final BookingRepository bookingRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final com.coworking.booking.service.LineNotificationService lineNotificationService;

    @Override
    public List<Workspace> getAllWorkspaces() {
        return workspaceRepository.findAll();
    }

    @Override
    public List<Room> getRoomsByWorkspace(String workspaceId) {
        return roomRepository.findByWorkspaceId(workspaceId);
    }

    @Override
    @Transactional(readOnly = true)
    public QuoteResponseDTO calculateQuote(QuoteRequestDTO request) {
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new IllegalArgumentException("Room not found: " + request.getRoomId()));

        Member member = memberRepository.findById(request.getMemberId())
                .orElseThrow(() -> new IllegalArgumentException("Member not found: " + request.getMemberId()));

        long minutes = Duration.between(request.getStartTime(), request.getEndTime()).toMinutes();
        if (minutes <= 0) throw new IllegalArgumentException("End time must be after start time.");

        BigDecimal hours = new BigDecimal(minutes).divide(new BigDecimal("60"), 2, RoundingMode.HALF_UP);
        
        // Polymorphic Price Calculation
        BigDecimal basePrice = room.calculatePrice(hours);
        
        // Strategy Pattern Discount Calculation
        BigDecimal discount = member.getMembership().calculateDiscount(basePrice);
        BigDecimal totalPrice = basePrice.subtract(discount).max(BigDecimal.ZERO);

        return QuoteResponseDTO.builder()
                .roomId(room.getRoomId())
                .roomName(room.getName())
                .durationHours(hours)
                .basePricePerHour(room.getPricePerHour())
                .basePrice(basePrice)
                .discountRateTier(member.getMembership().getTier())
                .discountRate(member.getMembership().getDiscountRate())
                .discountAmount(discount)
                .totalPrice(totalPrice)
                .build();
    }

    @Override
    @Transactional
    public Booking createBooking(BookingRequestDTO request) {
        // Concurrency Safe Pessimistic Lock on Room
        Room room = roomRepository.findByIdWithPessimisticLock(request.getRoomId())
                .orElseThrow(() -> new IllegalArgumentException("Room not found: " + request.getRoomId()));

        Member member = memberRepository.findById(request.getMemberId())
                .orElseThrow(() -> new IllegalArgumentException("Member not found: " + request.getMemberId()));

        if (!member.canBook()) {
            throw new IllegalArgumentException("Member is not authorized to make bookings.");
        }

        // Conflict Double-Booking Check
        List<Booking> overlapping = bookingRepository.findOverlappingBookings(
                request.getRoomId(), request.getStartTime(), request.getEndTime());
        if (!overlapping.isEmpty()) {
            throw new DoubleBookingConflictException("ห้อง " + room.getName() + " ถูกจองในช่วงเวลาที่เลือกแล้ว");
        }

        QuoteRequestDTO quoteReq = new QuoteRequestDTO();
        quoteReq.setRoomId(request.getRoomId());
        quoteReq.setMemberId(request.getMemberId());
        quoteReq.setStartTime(request.getStartTime());
        quoteReq.setEndTime(request.getEndTime());
        QuoteResponseDTO quote = calculateQuote(quoteReq);

        String bookingId = "BK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        Booking booking = new Booking(
                bookingId,
                member.getMemberId(),
                room.getRoomId(),
                request.getStartTime(),
                request.getEndTime(),
                quote.getDurationHours(),
                quote.getBasePrice(),
                quote.getDiscountAmount(),
                quote.getTotalPrice()
        );

        Booking saved = bookingRepository.save(booking);

        if (member instanceof RegisteredMember reg) {
            reg.addRewardPoints(quote.getTotalPrice().divide(new BigDecimal("10"), RoundingMode.DOWN).intValue());
            memberRepository.save(reg);
        }

        // Real-time notification broadcast
        try {
            messagingTemplate.convertAndSend("/topic/bookings", saved);
        } catch (Exception ignored) {}

        // Send LINE Notification to User
        try {
            lineNotificationService.sendBookingNotification(saved, room, member);
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(BookingServiceImpl.class).warn("LINE notification error: {}", e.getMessage());
        }

        return saved;
    }

    @Override
    @Transactional
    public Booking cancelBooking(String bookingId, String memberId, String reason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found: " + bookingId));

        if (!booking.getMemberId().equals(memberId)) {
            throw new IllegalArgumentException("Unauthorized to cancel this booking.");
        }

        booking.cancel(reason);
        Booking saved = bookingRepository.save(booking);

        try {
            messagingTemplate.convertAndSend("/topic/bookings", saved);
        } catch (Exception ignored) {}

        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Booking> getMemberBookings(String memberId) {
        return bookingRepository.findByMemberIdOrderByCreatedAtDesc(memberId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Booking> getPendingBookings(String adminMemberId) {
        requireAdmin(adminMemberId);
        return bookingRepository.findByStatusOrderByCreatedAtAsc("PENDING");
    }

    @Override
    @Transactional
    public Booking approveBooking(String bookingId, String adminMemberId) {
        requireAdmin(adminMemberId);
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found: " + bookingId));
        if (!"PENDING".equals(booking.getStatus())) {
            throw new IllegalArgumentException("Only pending bookings can be approved.");
        }
        booking.setStatus("CONFIRMED");
        Booking saved = bookingRepository.save(booking);
        try {
            messagingTemplate.convertAndSend("/topic/bookings", saved);
        } catch (Exception ignored) {}
        return saved;
    }

    @Override
    @Transactional
    public Booking rejectBooking(String bookingId, String adminMemberId, String reason) {
        requireAdmin(adminMemberId);
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found: " + bookingId));
        if ("CANCELLED".equals(booking.getStatus())) {
            throw new IllegalStateException("Booking is already cancelled.");
        }
        String cancelReason = (reason != null && !reason.isBlank()) ? reason : "Cancelled by admin";
        booking.cancel(cancelReason);
        Booking saved = bookingRepository.save(booking);
        try {
            messagingTemplate.convertAndSend("/topic/bookings", saved);
        } catch (Exception ignored) {}
        return saved;
    }

    private void requireAdmin(String adminMemberId) {
        if (adminMemberId == null || adminMemberId.isBlank()) {
            throw new IllegalArgumentException("Admin member ID is required.");
        }
        Member member = memberRepository.findById(adminMemberId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found: " + adminMemberId));
        if (!member.isAdmin()) {
            throw new IllegalArgumentException("Only an admin can perform this action.");
        }
    }

    private String hashPassword(String rawPassword) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawPassword.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (Exception ex) {
            throw new IllegalArgumentException("Unable to process password safely");
        }
    }

    @Override
    @Transactional
    public MemberResponseDTO registerMember(RegisterMemberRequestDTO request) {
        // 1. Check if email already exists
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        if (memberRepository.findByEmail(normalizedEmail).isPresent()) {
            throw new IllegalArgumentException("อีเมลนี้ถูกลงทะเบียนในระบบแล้ว: " + normalizedEmail);
        }

        // 2. Fetch or create Membership Tier Entity
        String tierName = (request.getTier() != null && !request.getTier().isBlank())
                ? request.getTier().toUpperCase()
                : "BASIC";

        Membership membership = membershipRepository.findByTier(tierName)
                .orElseGet(() -> {
                    BigDecimal fee = switch (tierName) {
                        case "PRO" -> new BigDecimal("1500.00");
                        case "ENTERPRISE" -> new BigDecimal("4500.00");
                        default -> BigDecimal.ZERO;
                    };
                    Membership newMb = new Membership("MB-" + tierName, tierName, fee);
                    return membershipRepository.save(newMb);
                });

        // 3. Create OOP RegisteredMember Entity
        String memberId = "MEM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        RegisteredMember member = new RegisteredMember(
                memberId,
                request.getName(),
                normalizedEmail,
                request.getPhone(),
                membership,
                50 // Bonus welcome points
        );

        // 4. Store password hash into PostgreSQL members table for login verification
        member.setPasswordHash(hashPassword(request.getPassword()));

        if (request.getVisaCardNumber() != null && !request.getVisaCardNumber().isBlank()) {
            member.setVisaCardNumber(request.getVisaCardNumber().trim());
        }
        if (request.getVisaCardHolder() != null && !request.getVisaCardHolder().isBlank()) {
            member.setVisaCardHolder(request.getVisaCardHolder().trim());
        }
        if (request.getVisaCardExpiry() != null && !request.getVisaCardExpiry().isBlank()) {
            member.setVisaCardExpiry(request.getVisaCardExpiry().trim());
        }

        // 5. Save to PostgreSQL Database
        RegisteredMember saved = memberRepository.save(member);

        return MemberResponseDTO.builder()
                .memberId(saved.getMemberId())
                .name(saved.getName())
                .email(saved.getEmail())
                .phone(saved.getPhone())
                .memberType("REGISTERED")
                .membershipTier(saved.getMembership().getTier())
                .discountRate(saved.getMembership().getDiscountRate())
                .maxMonthlyHours(saved.getMembership().getMaxMonthlyHours())
                .rewardPoints(saved.getRewardPoints())
                .admin(saved.isAdmin())
                .registeredAt(saved.getRegisteredAt())
                .visaCardNumber(saved.getVisaCardNumber())
                .visaCardHolder(saved.getVisaCardHolder())
                .visaCardExpiry(saved.getVisaCardExpiry())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public LoginResponseDTO login(LoginRequestDTO request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        Member member = memberRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException("อีเมลหรือรหัสผ่านไม่ถูกต้อง"));

        String incomingHash = hashPassword(request.getPassword());
        if (!incomingHash.equals(member.getPasswordHash())) {
            throw new IllegalArgumentException("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        }

        return LoginResponseDTO.builder()
                .memberId(member.getMemberId())
                .name(member.getName())
                .email(member.getEmail())
                .memberType(member instanceof RegisteredMember ? "REGISTERED" : "GUEST")
                .membershipTier(member.getMembership().getTier())
                .discountRate(member.getMembership().getDiscountRate())
                .maxMonthlyHours(member.getMembership().getMaxMonthlyHours())
                .rewardPoints(member instanceof RegisteredMember reg ? reg.getRewardPoints() : 0)
                .admin(member.isAdmin())
                .visaCardNumber(member.getVisaCardNumber())
                .visaCardHolder(member.getVisaCardHolder())
                .visaCardExpiry(member.getVisaCardExpiry())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public MemberResponseDTO getMemberProfile(String memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found: " + memberId));

        Integer points = (member instanceof RegisteredMember reg) ? reg.getRewardPoints() : 0;

        return MemberResponseDTO.builder()
                .memberId(member.getMemberId())
                .name(member.getName())
                .email(member.getEmail())
                .phone(member.getPhone())
                .memberType((member instanceof RegisteredMember) ? "REGISTERED" : "GUEST")
                .membershipTier(member.getMembership().getTier())
                .discountRate(member.getMembership().getDiscountRate())
                .maxMonthlyHours(member.getMembership().getMaxMonthlyHours())
                .rewardPoints(points)
                .admin(member.isAdmin())
                .registeredAt(member.getRegisteredAt())
                .visaCardNumber(member.getVisaCardNumber())
                .visaCardHolder(member.getVisaCardHolder())
                .visaCardExpiry(member.getVisaCardExpiry())
                .build();
    }

    @Override
    @Transactional
    public MemberResponseDTO updateMemberProfile(String memberId, UpdateMemberRequestDTO request) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found: " + memberId));

        if (request.getName() != null && !request.getName().isBlank()) {
            member.setName(request.getName().trim());
        }
        if (request.getPhone() != null) {
            member.setPhone(request.getPhone().trim());
        }
        if (request.getVisaCardNumber() != null) {
            member.setVisaCardNumber(request.getVisaCardNumber().trim());
        }
        if (request.getVisaCardHolder() != null) {
            member.setVisaCardHolder(request.getVisaCardHolder().trim());
        }
        if (request.getVisaCardExpiry() != null) {
            member.setVisaCardExpiry(request.getVisaCardExpiry().trim());
        }
        if (request.getTier() != null && !request.getTier().isBlank()) {
            String tierName = request.getTier().toUpperCase();
            Membership membership = membershipRepository.findByTier(tierName)
                    .orElseGet(() -> {
                        BigDecimal fee = switch (tierName) {
                            case "PRO" -> new BigDecimal("1500.00");
                            case "ENTERPRISE" -> new BigDecimal("4500.00");
                            default -> BigDecimal.ZERO;
                        };
                        Membership newMb = new Membership("MB-" + tierName, tierName, fee);
                        return membershipRepository.save(newMb);
                    });
            member.setMembership(membership);
        }

        Member saved = memberRepository.save(member);
        Integer points = (saved instanceof RegisteredMember reg) ? reg.getRewardPoints() : 0;

        return MemberResponseDTO.builder()
                .memberId(saved.getMemberId())
                .name(saved.getName())
                .email(saved.getEmail())
                .phone(saved.getPhone())
                .memberType((saved instanceof RegisteredMember) ? "REGISTERED" : "GUEST")
                .membershipTier(saved.getMembership().getTier())
                .discountRate(saved.getMembership().getDiscountRate())
                .maxMonthlyHours(saved.getMembership().getMaxMonthlyHours())
                .rewardPoints(points)
                .admin(saved.isAdmin())
                .registeredAt(saved.getRegisteredAt())
                .visaCardNumber(saved.getVisaCardNumber())
                .visaCardHolder(saved.getVisaCardHolder())
                .visaCardExpiry(saved.getVisaCardExpiry())
                .build();
    }
}
