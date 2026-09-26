package com.coworking.booking.domain.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "chat_messages")
@Getter
@Setter
@NoArgsConstructor
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "session_id", nullable = false, length = 100)
    private String sessionId;

    @Column(name = "sender_type", nullable = false, length = 20)
    private String senderType; // USER, ADMIN, LINE_AGENT, BOT

    @Column(name = "sender_name", length = 100)
    private String senderName;

    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "source", length = 20)
    private String source; // WEB, LINE_WEBHOOK

    @Column(name = "line_user_id", length = 100)
    private String lineUserId;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    public ChatMessage(String sessionId, String senderType, String senderName, String message, String source, String lineUserId) {
        this.sessionId = sessionId;
        this.senderType = senderType;
        this.senderName = senderName;
        this.message = message;
        this.source = source;
        this.lineUserId = lineUserId;
        this.createdAt = Instant.now();
    }
}
