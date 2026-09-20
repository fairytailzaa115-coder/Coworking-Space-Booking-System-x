package com.coworking.booking.domain.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "line_settings")
@Getter
@Setter
@NoArgsConstructor
public class LineSetting {

    @Id
    @Column(name = "setting_key", length = 50)
    private String settingKey = "DEFAULT";

    @Column(name = "channel_token", length = 1000)
    private String channelToken = "";

    @Column(name = "notify_token", length = 500)
    private String notifyToken = "";

    @Column(name = "send_mode", length = 50)
    private String sendMode = "BROADCAST"; // BROADCAST (ส่งทุกคนที่เป็นเพื่อน), PUSH (ส่ง user/group ที่ระบุ)

    @Column(name = "target_user_ids", length = 2000)
    private String targetUserIds = ""; // comma separated user IDs

    @Column(name = "enabled")
    private boolean enabled = true;

    @Column(name = "notify_on_new_booking")
    private boolean notifyOnNewBooking = true;

    @Column(name = "notify_on_status_change")
    private boolean notifyOnStatusChange = true;

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();
}
