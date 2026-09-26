package com.coworking.booking.controller;

import com.coworking.booking.domain.model.ChatMessage;
import com.coworking.booking.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class LineWebhookController {

    private final ChatService chatService;

    /**
     * Webhook endpoint called by LINE Platform when a user/admin sends a message to the bot
     * URL: POST /api/v1/line/webhook
     */
    @PostMapping("/line/webhook")
    public ResponseEntity<String> handleLineWebhook(@RequestBody Map<String, Object> payload) {
        log.info("[LINE WEBHOOK RECEIVED]: {}", payload);

        try {
            List<Map<String, Object>> events = (List<Map<String, Object>>) payload.get("events");
            if (events != null) {
                for (Map<String, Object> event : events) {
                    String type = (String) event.get("type");
                    if ("message".equalsIgnoreCase(type)) {
                        Map<String, Object> message = (Map<String, Object>) event.get("message");
                        Map<String, Object> source = (Map<String, Object>) event.get("source");
                        String replyToken = (String) event.get("replyToken");

                        String msgType = message != null ? (String) message.get("type") : null;
                        String text = message != null ? (String) message.get("text") : null;
                        String userId = source != null ? (String) source.get("userId") : null;

                        if ("text".equalsIgnoreCase(msgType) && text != null) {
                            chatService.processLineWebhookMessage(userId, replyToken, text);
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error processing LINE webhook event: {}", e.getMessage(), e);
        }

        return ResponseEntity.ok("OK");
    }

    /**
     * Customer retrieves conversation history
     */
    @GetMapping("/chat/messages")
    public ResponseEntity<List<ChatMessage>> getMessages(@RequestParam("sessionId") String sessionId) {
        return ResponseEntity.ok(chatService.getMessages(sessionId));
    }

    /**
     * Customer sends a message from web chat
     */
    @PostMapping("/chat/send")
    public ResponseEntity<ChatMessage> sendUserMessage(@RequestBody Map<String, String> body) {
        String sessionId = body.get("sessionId");
        String senderName = body.getOrDefault("senderName", "ผู้ใช้ทั่วไป");
        String message = body.get("message");

        if (sessionId == null || sessionId.isBlank() || message == null || message.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        ChatMessage saved = chatService.sendUserMessage(sessionId, senderName, message);
        return ResponseEntity.ok(saved);
    }

    /**
     * Simulator / Admin reply endpoint for testing 2-way Webhook without external tunnel
     */
    @PostMapping("/chat/simulate-line-reply")
    public ResponseEntity<ChatMessage> simulateLineReply(@RequestBody Map<String, String> body) {
        String text = body.get("text");
        String lineUserId = body.getOrDefault("lineUserId", "U_SIMULATED_ADMIN");

        if (text == null || text.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        ChatMessage saved = chatService.processLineWebhookMessage(lineUserId, null, text);
        return ResponseEntity.ok(saved);
    }
}
