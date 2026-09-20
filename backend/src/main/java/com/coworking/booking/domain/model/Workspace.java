package com.coworking.booking.domain.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * COMPOSITION (1 Workspace has many Rooms)
 */
@Entity
@Table(name = "workspaces")
@Getter
@Setter
@NoArgsConstructor
public class Workspace {

    @Id
    @Column(name = "workspace_id", length = 50)
    private String workspaceId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "type", nullable = false)
    private String type = "COWORKING_SPACE";

    @Column(name = "location", nullable = false)
    private String location;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "opening_hours", nullable = false)
    private String openingHours = "07:00 - 23:00";

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();
}