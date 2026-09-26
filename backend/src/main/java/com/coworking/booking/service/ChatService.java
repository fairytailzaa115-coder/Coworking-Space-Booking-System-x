package com.coworking.booking.service;

import com.coworking.booking.domain.model.ChatMessage;
import com.coworking.booking.domain.model.LineSetting;
import com.coworking.booking.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final LineNotificationService lineNotificationService;
    private final RestTemplate restTemplate = new RestTemplate();

    public List<ChatMessage> getMessages(String sessionId) {
        if (sessionId == null || sessionId.isBlank()) {
            return Collections.emptyList();
        }
        return chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);
    }

    /**
     * Customer sends message from Web -> forward to LINE via LINE Messaging API Push/Broadcast
     */
    public ChatMessage sendUserMessage(String sessionId, String senderName, String messageText) {
        String cleanName = (senderName == null || senderName.isBlank()) ? "ลูกค้าบนเว็บไซต์" : senderName.trim();
        ChatMessage msg = new ChatMessage(sessionId, "USER", cleanName, messageText.trim(), "WEB", null);
        ChatMessage saved = chatMessageRepository.save(msg);

        // Forward to LINE
        forwardToLine(sessionId, cleanName, messageText.trim());

        return saved;
    }

    /**
     * Webhook event from LINE -> save message and attribute to target session
     */
    public ChatMessage processLineWebhookMessage(String lineUserId, String replyToken, String text) {
        log.info("[LINE WEBHOOK MESSAGE] From LineUser: {}, Text: {}", lineUserId, text);

        // Check if message format targets a specific session, e.g. "@sess-123 ข้อความ" or reply to latest session
        String targetSession = "GLOBAL_SUPPORT";
        String messageBody = text;

        if (text != null && text.contains(" ")) {
            String[] parts = text.split(" ", 2);
            if (parts[0].startsWith("#") || parts[0].startsWith("@")) {
                targetSession = parts[0].substring(1);
                messageBody = parts[1];
            }
        }

        // If no explicit session tag, find the most recent user session
        if ("GLOBAL_SUPPORT".equals(targetSession)) {
            List<ChatMessage> recent = chatMessageRepository.findTop50ByOrderByCreatedAtDesc();
            for (ChatMessage m : recent) {
                if ("USER".equalsIgnoreCase(m.getSenderType()) && m.getSessionId() != null) {
                    targetSession = m.getSessionId();
                    break;
                }
            }
        }

        ChatMessage lineReply = new ChatMessage(
                targetSession,
                "LINE_AGENT",
                "เจ้าหน้าที่ฝ่ายบริการ (LINE)",
                messageBody,
                "LINE_WEBHOOK",
                lineUserId
        );

        return chatMessageRepository.save(lineReply);
    }

    /**
     * Admin manually replies via Web dashboard
     */
    public ChatMessage sendAdminReply(String sessionId, String adminName, String text) {
        ChatMessage adminMsg = new ChatMessage(
                sessionId,
                "ADMIN",
                adminName != null ? adminName : "แอดมินฝ่ายบริการ",
                text,
                "WEB",
                null
        );
        ChatMessage saved = chatMessageRepository.save(adminMsg);

        // Send confirmation out to LINE
        forwardAdminReplyToLine(sessionId, text);

        return saved;
    }

    private void forwardToLine(String sessionId, String senderName, String messageText) {
        LineSetting settings = lineNotificationService.getSettings();
        if (settings == null || !settings.isEnabled()) {
            return;
        }

        String token = settings.getChannelToken();
        if (token == null || token.isBlank()) {
            return;
        }

        String cleanText = messageText != null ? messageText : "";
        boolean hasImage = false;
        if (cleanText.contains("[IMAGE]")) {
            hasImage = true;
            String[] parts = cleanText.split("\\[IMAGE\\]");
            cleanText = parts.length > 0 ? parts[0].trim() : "";
            if (cleanText.isEmpty()) {
                cleanText = "(ส่งรูปภาพ)";
            }
        }

        String formattedLineMsg = String.format(
                "💬 [ข้อความแชทใหม่จากหน้าเว็บ]\n" +
                "━━━━━━━━━━━━━━━━━━━━\n" +
                "👤 ผู้ติดต่อ: %s\n" +
                "🏷️ ห้องแชท: #%s\n" +
                (hasImage ? "📷 แนบรูปภาพ: [เปิดดูรูปภาพในห้องแชทบนหน้าเว็บ]\n" : "") +
                "📝 ข้อความ: \"%s\"\n" +
                "━━━━━━━━━━━━━━━━━━━━\n" +
                "💡 ตอบกลับลูกค้าได้โดยพิมพ์: #%s ตามด้วยข้อความของคุณ",
                senderName, sessionId, (cleanText.length() > 500 ? cleanText.substring(0, 500) + "..." : cleanText), sessionId
        );

        try {
            if ("PUSH".equalsIgnoreCase(settings.getSendMode()) && settings.getTargetUserIds() != null && !settings.getTargetUserIds().isBlank()) {
                for (String userId : settings.getTargetUserIds().split(",")) {
                    String cleanId = userId.trim();
                    if (!cleanId.isEmpty()) {
                        sendLinePush(token, cleanId, formattedLineMsg);
                    }
                }
            } else {
                sendLineBroadcast(token, formattedLineMsg);
            }
            log.info("[FORWARDED TO LINE] Session: {}, Text: {}", sessionId, messageText);
        } catch (Exception e) {
            log.warn("Failed to forward chat to LINE: {}", e.getMessage());
        }
    }

    private void forwardAdminReplyToLine(String sessionId, String text) {
        LineSetting settings = lineNotificationService.getSettings();
        if (settings == null || !settings.isEnabled() || settings.getChannelToken().isBlank()) return;

        String formatted = String.format("📢 [แอดมินตอบกลับห้อง #%s]\n%s", sessionId, text);
        try {
            if ("PUSH".equalsIgnoreCase(settings.getSendMode()) && !settings.getTargetUserIds().isBlank()) {
                for (String uid : settings.getTargetUserIds().split(",")) {
                    if (!uid.trim().isEmpty()) sendLinePush(settings.getChannelToken(), uid.trim(), formatted);
                }
            } else {
                sendLineBroadcast(settings.getChannelToken(), formatted);
            }
        } catch (Exception e) {
            log.warn("Could not notify LINE of admin reply: {}", e.getMessage());
        }
    }

    private void sendLinePush(String token, String toUserId, String message) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(token);

        Map<String, Object> textMsg = Map.of("type", "text", "text", message);
        Map<String, Object> payload = Map.of("to", toUserId, "messages", List.of(textMsg));

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
        restTemplate.postForEntity("https://api.line.me/v2/bot/message/push", request, String.class);
    }

    private void sendLineBroadcast(String token, String message) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(token);

        Map<String, Object> textMsg = Map.of("type", "text", "text", message);
        Map<String, Object> payload = Map.of("messages", List.of(textMsg));

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
        restTemplate.postForEntity("https://api.line.me/v2/bot/message/broadcast", request, String.class);
    }
}
