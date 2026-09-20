package com.coworking.booking.service;

import com.coworking.booking.domain.model.Booking;
import com.coworking.booking.domain.model.LineSetting;
import com.coworking.booking.domain.model.Member;
import com.coworking.booking.domain.model.Room;
import com.coworking.booking.repository.LineSettingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class LineNotificationService {

    private final LineSettingRepository lineSettingRepository;

    @Value("${line.channel.token:}")
    private String defaultChannelToken;

    @Value("${line.notify.token:}")
    private String defaultLineNotifyToken;

    private final RestTemplate restTemplate = new RestTemplate();

    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm น.")
            .withZone(ZoneId.of("Asia/Bangkok"));

    public LineSetting getSettings() {
        return lineSettingRepository.findById("DEFAULT").orElseGet(() -> {
            LineSetting initial = new LineSetting();
            initial.setChannelToken(defaultChannelToken != null ? defaultChannelToken : "");
            initial.setNotifyToken(defaultLineNotifyToken != null ? defaultLineNotifyToken : "");
            initial.setSendMode("BROADCAST");
            initial.setEnabled(true);
            initial.setNotifyOnNewBooking(true);
            return lineSettingRepository.save(initial);
        });
    }

    public LineSetting updateSettings(LineSetting updated) {
        LineSetting existing = getSettings();
        if (updated.getChannelToken() != null) existing.setChannelToken(updated.getChannelToken().trim());
        if (updated.getNotifyToken() != null) existing.setNotifyToken(updated.getNotifyToken().trim());
        if (updated.getSendMode() != null) existing.setSendMode(updated.getSendMode().trim());
        if (updated.getTargetUserIds() != null) existing.setTargetUserIds(updated.getTargetUserIds().trim());
        existing.setEnabled(updated.isEnabled());
        existing.setNotifyOnNewBooking(updated.isNotifyOnNewBooking());
        existing.setNotifyOnStatusChange(updated.isNotifyOnStatusChange());
        existing.setUpdatedAt(Instant.now());
        return lineSettingRepository.save(existing);
    }

    public void sendBookingNotification(Booking booking, Room room, Member member) {
        LineSetting settings = getSettings();
        if (!settings.isEnabled() || !settings.isNotifyOnNewBooking()) {
            log.info("LINE Notification is disabled in settings. Skipping notification for booking: {}", booking.getBookingId());
            return;
        }

        String formattedStart = formatter.format(booking.getStartTime());
        String formattedEnd = formatter.format(booking.getEndTime());
        String priceText = String.format("%,.2f บาท", booking.getTotalPrice());

        String message = String.format(
                "\n🎉 ยืนยันการจองห้องสำเร็จ!\n" +
                "━━━━━━━━━━━━━━━━━━━━\n" +
                "🔖 รหัสการจอง: %s\n" +
                "🚪 ห้อง: %s\n" +
                "👤 ผู้จอง: %s (%s)\n" +
                "⏰ เวลาเริ่มต้น: %s\n" +
                "⏰ เวลาสิ้นสุด: %s\n" +
                "⏳ ระยะเวลา: %s ชม.\n" +
                "💰 ยอดรวม: %s\n" +
                "━━━━━━━━━━━━━━━━━━━━\n" +
                "ขอบคุณที่ใช้บริการ GreenSpace Coworking!",
                booking.getBookingId(),
                room.getName(),
                member.getName(),
                member.getMemberId(),
                formattedStart,
                formattedEnd,
                booking.getDurationHours(),
                priceText
        );

        log.info("[LINE NOTIFICATION DISPATCH - Mode: {}]\n{}", settings.getSendMode(), message);

        String channelToken = settings.getChannelToken().isBlank() ? defaultChannelToken : settings.getChannelToken();
        String notifyToken = settings.getNotifyToken().isBlank() ? defaultLineNotifyToken : settings.getNotifyToken();

        // 1. LINE Notify fallback
        if (notifyToken != null && !notifyToken.isBlank()) {
            try {
                sendLineNotify(notifyToken, message);
                log.info("LINE Notify sent successfully for booking: {}", booking.getBookingId());
            } catch (Exception e) {
                log.warn("LINE Notify failed: {}", e.getMessage());
            }
        }

        // 2. LINE Messaging API (Broadcast or Push)
        if (channelToken != null && !channelToken.isBlank()) {
            if ("BROADCAST".equalsIgnoreCase(settings.getSendMode())) {
                // ส่งให้ทุกคนที่เป็นเพื่อนกับ Bot
                try {
                    sendLineBroadcast(channelToken, message);
                    log.info("LINE Broadcast sent successfully to all bot followers!");
                } catch (Exception e) {
                    log.warn("LINE Broadcast failed: {}", e.getMessage());
                }
            } else {
                // PUSH mode: ส่งให้ User IDs ที่ระบุใน Settings หรือใน Member Phone (ถ้าเป็น Line ID)
                List<String> targetIds = new ArrayList<>();
                if (!settings.getTargetUserIds().isBlank()) {
                    for (String id : settings.getTargetUserIds().split(",")) {
                        String trimmed = id.trim();
                        if (!trimmed.isEmpty()) targetIds.add(trimmed);
                    }
                }
                if (member.getPhone() != null && member.getPhone().startsWith("U") && !targetIds.contains(member.getPhone())) {
                    targetIds.add(member.getPhone());
                }

                for (String userId : targetIds) {
                    try {
                        sendLineMessagingPush(channelToken, userId, message);
                        log.info("LINE Push sent to user: {}", userId);
                    } catch (Exception e) {
                        log.warn("LINE Push failed for user {}: {}", userId, e.getMessage());
                    }
                }
            }
        }
    }

    private void sendLineNotify(String token, String message) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.setBearerAuth(token);
        String body = "message=" + URLEncoder.encode(message, StandardCharsets.UTF_8);
        HttpEntity<String> request = new HttpEntity<>(body, headers);
        restTemplate.postForEntity("https://notify-api.line.me/api/notify", request, String.class);
    }

    private void sendLineBroadcast(String token, String message) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(token);

        Map<String, Object> textMsg = new HashMap<>();
        textMsg.put("type", "text");
        textMsg.put("text", message);

        Map<String, Object> payload = new HashMap<>();
        payload.put("messages", List.of(textMsg));

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
        restTemplate.postForEntity("https://api.line.me/v2/bot/message/broadcast", request, String.class);
    }

    private void sendLineMessagingPush(String token, String toUserId, String message) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(token);

        Map<String, Object> textMsg = new HashMap<>();
        textMsg.put("type", "text");
        textMsg.put("text", message);

        Map<String, Object> payload = new HashMap<>();
        payload.put("to", toUserId);
        payload.put("messages", List.of(textMsg));

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
        restTemplate.postForEntity("https://api.line.me/v2/bot/message/push", request, String.class);
    }
}
