package com.coworking.booking.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@DiscriminatorValue("DEALER")
@Getter
@Setter
@NoArgsConstructor
public class DealerMember extends Member {

    @Column(name = "dealer_space_name")
    private String spaceName;

    @Column(name = "dealer_space_location")
    private String spaceLocation;

    @Column(name = "dealer_workspace_id", length = 50)
    private String workspaceId;

    @Column(name = "dealer_room_id", length = 50)
    private String roomId;

    public DealerMember(String memberId, String name, String email, String phone, Membership membership,
                        String spaceName, String spaceLocation, String workspaceId, String roomId) {
        super(memberId, name, email, phone, membership);
        this.spaceName = spaceName;
        this.spaceLocation = spaceLocation;
        this.workspaceId = workspaceId;
        this.roomId = roomId;
    }

    @Override
    public boolean canBook() {
        return true;
    }
}
