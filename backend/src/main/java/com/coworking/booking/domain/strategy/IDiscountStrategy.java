package com.coworking.booking.domain.strategy;

import java.math.BigDecimal;

/**
 * STRATEGY PATTERN (Abstraction)
 * Defines standard contract for membership pricing & quota calculations.
 */
public interface IDiscountStrategy {
    BigDecimal getDiscountRate();
    int getMaxMonthlyHours();
    BigDecimal calculateDiscount(BigDecimal rawAmount);
}
