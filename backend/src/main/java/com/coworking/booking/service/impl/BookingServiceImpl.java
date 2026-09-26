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
import java.util.Map;
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
    public List<Room> getAllRooms() {
        return roomRepository.findAll();
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

        String memberId = "MEM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        boolean isDealer = "DEALER".equalsIgnoreCase(request.getMemberType());

        if (isDealer) {
            // DEALER REGISTRATION: Create Dealer Workspace + Primary Room + DealerMember Entity
            String randomCode = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
            String dealerSpaceName = (request.getSpaceName() != null && !request.getSpaceName().isBlank())
                    ? request.getSpaceName().trim()
                    : request.getName() + " Space";
            String dealerLocation = (request.getSpaceLocation() != null && !request.getSpaceLocation().isBlank())
                    ? request.getSpaceLocation().trim()
                    : "กรุงเทพมหานคร";

            String workspaceId = "WS-DLR-" + randomCode;
            Workspace ws = new Workspace();
            ws.setWorkspaceId(workspaceId);
            ws.setName(dealerSpaceName);
            ws.setType("DEALER_SPACE");
            ws.setLocation(dealerLocation);
            ws.setDescription(request.getSpaceDescription() != null && !request.getSpaceDescription().isBlank()
                    ? request.getSpaceDescription().trim()
                    : "ห้องประชุมระดับพรีเมียม ปล่อยเช่าโดย " + request.getName());
            ws.setOpeningHours("08:00 - 22:00");
            workspaceRepository.save(ws);

            String roomId = "RM-DLR-" + randomCode;
            BigDecimal price = request.getRoomPricePerHour() != null
                    ? request.getRoomPricePerHour()
                    : new BigDecimal("550.00");
            Integer capacity = request.getRoomCapacity() != null
                    ? request.getRoomCapacity()
                    : 10;
            String img = request.getRoomImageUrl() != null && !request.getRoomImageUrl().isBlank()
                    ? request.getRoomImageUrl().trim()
                    : "/images/meeting-room.jpg";

            MeetingRoom room = new MeetingRoom(roomId, workspaceId, dealerSpaceName + " Meeting Room", capacity, price, BigDecimal.ZERO);
            room.setImageUrl(img);
            room.setStatus("AVAILABLE");
            roomRepository.save(room);

            DealerMember dealer = new DealerMember(
                    memberId,
                    request.getName(),
                    normalizedEmail,
                    request.getPhone(),
                    membership,
                    dealerSpaceName,
                    dealerLocation,
                    workspaceId,
                    roomId
            );
            dealer.setPasswordHash(hashPassword(request.getPassword()));
            if (request.getVisaCardNumber() != null) dealer.setVisaCardNumber(request.getVisaCardNumber().trim());
            if (request.getVisaCardHolder() != null) dealer.setVisaCardHolder(request.getVisaCardHolder().trim());
            if (request.getVisaCardExpiry() != null) dealer.setVisaCardExpiry(request.getVisaCardExpiry().trim());

            DealerMember saved = memberRepository.save(dealer);

            return MemberResponseDTO.builder()
                    .memberId(saved.getMemberId())
                    .name(saved.getName())
                    .email(saved.getEmail())
                    .phone(saved.getPhone())
                    .memberType("DEALER")
                    .membershipTier(saved.getMembership().getTier())
                    .discountRate(saved.getMembership().getDiscountRate())
                    .maxMonthlyHours(saved.getMembership().getMaxMonthlyHours())
                    .rewardPoints(0)
                    .admin(false)
                    .registeredAt(saved.getRegisteredAt())
                    .spaceName(saved.getSpaceName())
                    .spaceLocation(saved.getSpaceLocation())
                    .dealerWorkspaceId(saved.getWorkspaceId())
                    .dealerRoomId(saved.getRoomId())
                    .build();
        }

        // 3. Regular REGISTERED Member Entity
        RegisteredMember member = new RegisteredMember(
                memberId,
                request.getName(),
                normalizedEmail,
                request.getPhone(),
                membership,
                50 // Bonus welcome points
        );

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

        String memberType = "GUEST";
        String spaceName = null;
        String spaceLocation = null;
        String dealerWorkspaceId = null;
        String dealerRoomId = null;

        if (member instanceof DealerMember dl) {
            memberType = "DEALER";
            spaceName = dl.getSpaceName();
            spaceLocation = dl.getSpaceLocation();
            dealerWorkspaceId = dl.getWorkspaceId();
            dealerRoomId = dl.getRoomId();
        } else if (member instanceof RegisteredMember) {
            memberType = "REGISTERED";
        }

        return LoginResponseDTO.builder()
                .memberId(member.getMemberId())
                .name(member.getName())
                .email(member.getEmail())
                .memberType(memberType)
                .membershipTier(member.getMembership().getTier())
                .discountRate(member.getMembership().getDiscountRate())
                .maxMonthlyHours(member.getMembership().getMaxMonthlyHours())
                .rewardPoints(member instanceof RegisteredMember reg ? reg.getRewardPoints() : 0)
                .admin(member.isAdmin())
                .visaCardNumber(member.getVisaCardNumber())
                .visaCardHolder(member.getVisaCardHolder())
                .visaCardExpiry(member.getVisaCardExpiry())
                .spaceName(spaceName)
                .spaceLocation(spaceLocation)
                .dealerWorkspaceId(dealerWorkspaceId)
                .dealerRoomId(dealerRoomId)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public MemberResponseDTO getMemberProfile(String memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found: " + memberId));

        Integer points = (member instanceof RegisteredMember reg) ? reg.getRewardPoints() : 0;
        String memberType = (member instanceof DealerMember) ? "DEALER" : (member instanceof RegisteredMember) ? "REGISTERED" : "GUEST";
        String spaceName = (member instanceof DealerMember dl) ? dl.getSpaceName() : null;
        String spaceLocation = (member instanceof DealerMember dl) ? dl.getSpaceLocation() : null;
        String dealerWsId = (member instanceof DealerMember dl) ? dl.getWorkspaceId() : null;
        String dealerRmId = (member instanceof DealerMember dl) ? dl.getRoomId() : null;

        return MemberResponseDTO.builder()
                .memberId(member.getMemberId())
                .name(member.getName())
                .email(member.getEmail())
                .phone(member.getPhone())
                .memberType(memberType)
                .membershipTier(member.getMembership().getTier())
                .discountRate(member.getMembership().getDiscountRate())
                .maxMonthlyHours(member.getMembership().getMaxMonthlyHours())
                .rewardPoints(points)
                .admin(member.isAdmin())
                .registeredAt(member.getRegisteredAt())
                .visaCardNumber(member.getVisaCardNumber())
                .visaCardHolder(member.getVisaCardHolder())
                .visaCardExpiry(member.getVisaCardExpiry())
                .spaceName(spaceName)
                .spaceLocation(spaceLocation)
                .dealerWorkspaceId(dealerWsId)
                .dealerRoomId(dealerRmId)
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

    @Override
    @Transactional
    public Room createMeetingRoom(java.util.Map<String, Object> payload) {
        String adminMemberId = (String) payload.get("adminMemberId");
        if (adminMemberId != null && !adminMemberId.isBlank()) {
            requireAdmin(adminMemberId);
        }

        String rawName = (String) payload.get("name");
        if (rawName == null || rawName.isBlank()) {
            throw new IllegalArgumentException("Room name cannot be empty");
        }
        String name = rawName.trim();

        String rawId = (String) payload.get("roomId");
        String roomId = (rawId != null && !rawId.isBlank())
                ? rawId.trim().toUpperCase()
                : "RM-MTG-" + (System.currentTimeMillis() % 100000);

        String rawWorkspaceId = (String) payload.get("workspaceId");
        String workspaceId = (rawWorkspaceId != null && !rawWorkspaceId.isBlank())
                ? rawWorkspaceId.trim()
                : "WS-ASOKE";

        Integer capacity = payload.get("capacity") != null
                ? Integer.valueOf(payload.get("capacity").toString())
                : 6;

        BigDecimal pricePerHour = payload.get("pricePerHour") != null
                ? new BigDecimal(payload.get("pricePerHour").toString())
                : new BigDecimal("350.00");

        BigDecimal equipmentFee = payload.get("equipmentFee") != null
                ? new BigDecimal(payload.get("equipmentFee").toString())
                : new BigDecimal("100.00");

        String imageUrl = (String) payload.getOrDefault("imageUrl", "/images/meeting-room.jpg");
        Boolean hasVideo = payload.get("hasVideoConference") != null
                ? Boolean.valueOf(payload.get("hasVideoConference").toString())
                : true;
        Boolean hasWhiteboard = payload.get("hasWhiteboard") != null
                ? Boolean.valueOf(payload.get("hasWhiteboard").toString())
                : true;

        MeetingRoom mr = new MeetingRoom(roomId, workspaceId, name, capacity, pricePerHour, equipmentFee);
        mr.setHasVideoConference(hasVideo);
        mr.setHasWhiteboard(hasWhiteboard);
        mr.setImageUrl(imageUrl);
        mr.setStatus("AVAILABLE");

        return roomRepository.save(mr);
    }

    @Override
    @Transactional
    public Room updateRoom(String roomId, java.util.Map<String, Object> payload) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found: " + roomId));

        // Authorization check: Only Admin or the owning Dealer can modify room details
        String callerMemberId = (String) payload.get("callerMemberId");
        if (callerMemberId == null || callerMemberId.isBlank()) {
            throw new IllegalArgumentException("เฉพาะผู้ดูแลระบบหรือ Dealer เจ้าของพื้นที่เท่านั้นที่สามารถแก้ไขข้อมูลห้องประชุมได้ (ผู้ใช้ทั่วไปมีสิทธิ์จองห้องเท่านั้น)");
        }
        Member caller = memberRepository.findById(callerMemberId)
                .orElseThrow(() -> new IllegalArgumentException("Caller member not found: " + callerMemberId));
        if (!caller.isAdmin()) {
            if (caller instanceof DealerMember dealer) {
                boolean ownsRoom = roomId.equalsIgnoreCase(dealer.getRoomId())
                        || (dealer.getWorkspaceId() != null && dealer.getWorkspaceId().equalsIgnoreCase(room.getWorkspaceId()));
                if (!ownsRoom) {
                    throw new IllegalArgumentException("คุณสามารถแก้ไขได้เฉพาะห้องประชุมในพื้นที่ของคุณเท่านั้น (ไม่มีสิทธิ์แก้ไขห้องของผู้อื่น)");
                }
            } else {
                throw new IllegalArgumentException("เฉพาะผู้ดูแลระบบหรือ Dealer เจ้าของพื้นที่เท่านั้นที่สามารถแก้ไขข้อมูลห้องประชุมได้ (ผู้ใช้ทั่วไปมีสิทธิ์จองห้องเท่านั้น)");
            }
        }

        if (payload.containsKey("pricePerHour")) {
            room.setPricePerHour(new BigDecimal(payload.get("pricePerHour").toString()));
        } else if (payload.containsKey("price")) {
            room.setPricePerHour(new BigDecimal(payload.get("price").toString()));
        }

        if (payload.containsKey("imageUrl")) {
            room.setImageUrl(payload.get("imageUrl") != null ? payload.get("imageUrl").toString() : null);
        } else if (payload.containsKey("image")) {
            room.setImageUrl(payload.get("image") != null ? payload.get("image").toString() : null);
        }

        if (payload.containsKey("name")) {
            room.setName(payload.get("name").toString());
        }

        if (payload.containsKey("capacity")) {
            room.setCapacity(Integer.parseInt(payload.get("capacity").toString()));
        }

        if (payload.containsKey("status")) {
            room.setStatus(payload.get("status").toString());
        }

        return roomRepository.save(room);
    }

    @Override
    public List<Membership> getAllMemberships() {
        return membershipRepository.findAll();
    }

    @Override
    @Transactional
    public Membership updateMembership(String tier, java.util.Map<String, Object> payload) {
        String cleanTier = tier.trim().toUpperCase();
        Membership membership = membershipRepository.findByTier(cleanTier)
                .orElseGet(() -> {
                    Membership m = new Membership("MB-" + cleanTier, cleanTier, BigDecimal.ZERO);
                    return membershipRepository.save(m);
                });

        if (payload.containsKey("priceMonthly")) {
            membership.setPriceMonthly(new BigDecimal(payload.get("priceMonthly").toString()));
        } else if (payload.containsKey("price")) {
            membership.setPriceMonthly(new BigDecimal(payload.get("price").toString()));
        }

        if (payload.containsKey("discountRate")) {
            membership.setDiscountRate(new BigDecimal(payload.get("discountRate").toString()));
        }

        if (payload.containsKey("maxMonthlyHours")) {
            membership.setMaxMonthlyHours(Integer.parseInt(payload.get("maxMonthlyHours").toString()));
        }

        return membershipRepository.save(membership);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getDealerSpace(String memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found: " + memberId));

        if (!(member instanceof DealerMember dealer)) {
            throw new IllegalArgumentException("Member is not a dealer: " + memberId);
        }

        Workspace ws = null;
        if (dealer.getWorkspaceId() != null) {
            ws = workspaceRepository.findById(dealer.getWorkspaceId()).orElse(null);
        }

        List<Room> rooms = dealer.getWorkspaceId() != null
                ? roomRepository.findByWorkspaceId(dealer.getWorkspaceId())
                : List.of();

        Room primaryRoom = null;
        if (dealer.getRoomId() != null) {
            primaryRoom = roomRepository.findById(dealer.getRoomId()).orElse(null);
        }
        if (primaryRoom == null && !rooms.isEmpty()) {
            primaryRoom = rooms.get(0);
        }

        Map<String, Object> result = new java.util.HashMap<>();
        result.put("memberId", dealer.getMemberId());
        result.put("dealerName", dealer.getName());
        result.put("email", dealer.getEmail());
        result.put("phone", dealer.getPhone() != null ? dealer.getPhone() : "");
        result.put("spaceName", dealer.getSpaceName() != null ? dealer.getSpaceName() : "");
        result.put("spaceLocation", dealer.getSpaceLocation() != null ? dealer.getSpaceLocation() : "");
        result.put("workspaceId", dealer.getWorkspaceId());
        result.put("roomId", dealer.getRoomId());
        result.put("workspace", ws);
        result.put("rooms", rooms);
        result.put("primaryRoom", primaryRoom);

        return result;
    }

    @Override
    @Transactional
    public Map<String, Object> updateDealerSpace(String memberId, Map<String, Object> payload) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found: " + memberId));

        if (!(member instanceof DealerMember dealer)) {
            throw new IllegalArgumentException("Member is not a dealer: " + memberId);
        }

        if (payload.containsKey("spaceName") && payload.get("spaceName") != null) {
            String newSpaceName = payload.get("spaceName").toString().trim();
            dealer.setSpaceName(newSpaceName);
            if (dealer.getWorkspaceId() != null) {
                workspaceRepository.findById(dealer.getWorkspaceId()).ifPresent(ws -> {
                    ws.setName(newSpaceName);
                    workspaceRepository.save(ws);
                });
            }
        }

        if (payload.containsKey("spaceLocation") && payload.get("spaceLocation") != null) {
            String newLoc = payload.get("spaceLocation").toString().trim();
            dealer.setSpaceLocation(newLoc);
            if (dealer.getWorkspaceId() != null) {
                workspaceRepository.findById(dealer.getWorkspaceId()).ifPresent(ws -> {
                    ws.setLocation(newLoc);
                    workspaceRepository.save(ws);
                });
            }
        }

        if (payload.containsKey("phone") && payload.get("phone") != null) {
            dealer.setPhone(payload.get("phone").toString().trim());
        }

        memberRepository.save(dealer);

        if (dealer.getRoomId() != null) {
            roomRepository.findById(dealer.getRoomId()).ifPresent(room -> {
                boolean modified = false;
                if (payload.containsKey("roomName") && payload.get("roomName") != null) {
                    room.setName(payload.get("roomName").toString().trim());
                    modified = true;
                }
                if (payload.containsKey("pricePerHour") && payload.get("pricePerHour") != null) {
                    room.setPricePerHour(new BigDecimal(payload.get("pricePerHour").toString()));
                    modified = true;
                }
                if (payload.containsKey("capacity") && payload.get("capacity") != null) {
                    room.setCapacity(Integer.parseInt(payload.get("capacity").toString()));
                    modified = true;
                }
                if (payload.containsKey("imageUrl") && payload.get("imageUrl") != null) {
                    room.setImageUrl(payload.get("imageUrl").toString().trim());
                    modified = true;
                }
                if (payload.containsKey("status") && payload.get("status") != null) {
                    room.setStatus(payload.get("status").toString().trim());
                    modified = true;
                }
                if (modified) {
                    roomRepository.save(room);
                }
            });
        }

        return getDealerSpace(memberId);
    }

    @Override
    @Transactional
    public Room addDealerRoom(String memberId, Map<String, Object> payload) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found: " + memberId));

        if (!(member instanceof DealerMember dealer)) {
            throw new IllegalArgumentException("Member is not a dealer: " + memberId);
        }

        String workspaceId = dealer.getWorkspaceId();
        if (workspaceId == null || workspaceId.isBlank()) {
            throw new IllegalArgumentException("Dealer does not have a registered workspace");
        }

        String randomCode = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        String roomId = "RM-DLR-" + randomCode;

        String name = payload.get("name") != null && !payload.get("name").toString().isBlank()
                ? payload.get("name").toString().trim()
                : (dealer.getSpaceName() != null ? dealer.getSpaceName() : "Dealer") + " Meeting Room " + randomCode;

        Integer capacity = payload.get("capacity") != null
                ? Integer.valueOf(payload.get("capacity").toString())
                : 6;

        BigDecimal pricePerHour = payload.get("pricePerHour") != null
                ? new BigDecimal(payload.get("pricePerHour").toString())
                : new BigDecimal("350.00");

        BigDecimal equipmentFee = payload.get("equipmentFee") != null
                ? new BigDecimal(payload.get("equipmentFee").toString())
                : BigDecimal.ZERO;

        String imageUrl = payload.get("imageUrl") != null && !payload.get("imageUrl").toString().isBlank()
                ? payload.get("imageUrl").toString().trim()
                : "/images/meeting-room.jpg";

        MeetingRoom mr = new MeetingRoom(roomId, workspaceId, name, capacity, pricePerHour, equipmentFee);
        mr.setImageUrl(imageUrl);
        mr.setStatus(payload.get("status") != null ? payload.get("status").toString().trim() : "AVAILABLE");
        mr.setHasVideoConference(true);
        mr.setHasWhiteboard(true);

        Room saved = roomRepository.save(mr);

        if (dealer.getRoomId() == null || dealer.getRoomId().isBlank()) {
            dealer.setRoomId(saved.getRoomId());
            memberRepository.save(dealer);
        }

        return saved;
    }

    @Override
    @Transactional
    public void deleteDealerRoom(String memberId, String roomId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found: " + memberId));

        if (!(member instanceof DealerMember dealer)) {
            throw new IllegalArgumentException("Member is not a dealer: " + memberId);
        }

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found: " + roomId));

        if (dealer.getWorkspaceId() == null || !dealer.getWorkspaceId().equalsIgnoreCase(room.getWorkspaceId())) {
            throw new IllegalArgumentException("คุณสามารถลบได้เฉพาะห้องประชุมในพื้นที่ของคุณเท่านั้น");
        }

        if (roomId.equalsIgnoreCase(dealer.getRoomId())) {
            List<Room> remaining = roomRepository.findByWorkspaceId(dealer.getWorkspaceId());
            String newPrimaryId = null;
            for (Room r : remaining) {
                if (!r.getRoomId().equalsIgnoreCase(roomId)) {
                    newPrimaryId = r.getRoomId();
                    break;
                }
            }
            dealer.setRoomId(newPrimaryId);
            memberRepository.save(dealer);
        }

        roomRepository.delete(room);
    }
}
