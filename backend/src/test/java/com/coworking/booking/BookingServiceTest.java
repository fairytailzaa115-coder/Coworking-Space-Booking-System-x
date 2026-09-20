package com.coworking.booking;

import com.coworking.booking.domain.model.*;
import com.coworking.booking.domain.strategy.EnterpriseDiscountStrategy;
import com.coworking.booking.domain.strategy.ProDiscountStrategy;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class BookingServiceTest {

    @Test
    @DisplayName("Polymorphism: HotDesk room gives 20% discount on 8+ hours")
    void testHotDeskPricing() {
        HotDeskRoom room = new HotDeskRoom("RM-1", "WS-1", "Desk 1", 1, new BigDecimal("80.00"), true);
        assertEquals(new BigDecimal("160.00"), room.calculatePrice(new BigDecimal("2.0")));
        assertEquals(new BigDecimal("512.00"), room.calculatePrice(new BigDecimal("8.0"))); // 80 * 8 * 0.8
    }

    @Test
    @DisplayName("Polymorphism: MeetingRoom adds fixed 150 THB AV Fee")
    void testMeetingRoomPricing() {
        MeetingRoom room = new MeetingRoom("RM-2", "WS-1", "Boardroom", 8, new BigDecimal("450.00"), new BigDecimal("150.00"));
        assertEquals(new BigDecimal("1050.00"), room.calculatePrice(new BigDecimal("2.0"))); // (450 * 2) + 150
    }

    @Test
    @DisplayName("Strategy Pattern: Membership discounts match tier rates")
    void testMembershipStrategies() {
        ProDiscountStrategy pro = new ProDiscountStrategy();
        assertEquals(new BigDecimal("15.00"), pro.calculateDiscount(new BigDecimal("100.00")));

        EnterpriseDiscountStrategy ent = new EnterpriseDiscountStrategy();
        assertEquals(new BigDecimal("30.00"), ent.calculateDiscount(new BigDecimal("100.00")));
    }
}
